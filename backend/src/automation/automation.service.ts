import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ClientsService } from '../clients/clients.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { CrmService } from '../crm/crm.service';
import { SequencesService } from '../sequences/sequences.service';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    private readonly clients: ClientsService,
    private readonly campaigns: CampaignsService,
    private readonly crm: CrmService,
    private readonly sequences: SequencesService,
  ) {}

  async enable(clientId: string, enabled: boolean) {
    const { data, error } = await this.supabase
      .from('client_automation')
      .upsert({ client_id: clientId, enabled, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  async pause(clientId: string, paused: boolean) {
    const { error } = await this.supabase
      .from('client_automation')
      .upsert({ client_id: clientId, paused, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  async runOnce(userId: string) {
    // Fetch clients for the user
    const clients = await this.clients.getAllClients(userId);
    let enqueued = 0;
    for (const c of clients) {
      // Check automation settings
      const { data: auto } = await this.supabase
        .from('client_automation')
        .select('*')
        .eq('client_id', c.id)
        .maybeSingle();
      if (auto && (auto.paused || auto.enabled === false)) continue;
      const preferredChannel = (auto?.preferred_channel as 'email'|'sms'|'whatsapp') || 'email';

      // Choose campaign: use first active for this client; otherwise skip
      let { data: campList } = await this.supabase
        .from('campaigns')
        .select('*')
        .eq('client_id', c.id)
        .eq('user_id', userId)
        .eq('status', 'active');
      let campaign = Array.isArray(campList) && campList[0];
      if (!campaign) {
        // Create a default email campaign and activate it
        try {
          const created = await this.campaigns.addCampaign({
            client_id: c.id,
            name: 'Auto Outreach',
            description: 'Automated outreach campaign',
            channel: 'email',
            user_id: userId,
          } as any);
          if (created?.id) {
            campaign = await this.campaigns.startCampaign(created.id, userId) as any;
          }
        } catch (e) {
          this.logger.warn(`Failed to create default campaign for ${c.name}: ${e}`);
          continue;
        }
      }

      // Pull leads from CRM and upsert
      const leads = await this.crm.getLeads(c.crm_provider);
      for (const lead of leads) {
        try {
          // Upsert into leads table (by email or id)
          const key = lead.email ? { email: lead.email } : { id: lead.id };
          let existing: any = null;
          try { const { data } = await this.supabase.from('leads').select('*').match(key).single(); existing = data; } catch {}
          const payload = {
            id: lead.id,
            first_name: lead.firstname || '',
            last_name: lead.lastname || '',
            email: lead.email || '',
            phone: lead.phone || '',
            status: existing?.status || 'new',
            updated_at: new Date().toISOString(),
            created_at: existing?.created_at || new Date().toISOString(),
          };
          if (existing) await this.supabase.from('leads').update(payload).match(key);
          else await this.supabase.from('leads').insert(payload);

          // Skip if we already have messages or queued items for this lead + campaign
          const { data: hasMsg } = await this.supabase
            .from('messages')
            .select('id')
            .eq('lead_id', payload.id)
            .eq('campaign_id', campaign.id)
            .limit(1);
          if (hasMsg && hasMsg.length) continue;
          const { data: hasQueue } = await this.supabase
            .from('sequence_queue')
            .select('id')
            .eq('lead_id', payload.id)
            .eq('campaign_id', campaign.id)
            .limit(1);
          if (hasQueue && hasQueue.length) continue;

          // Enqueue sequence for this lead
          await this.sequences.startSequence({
            clientId: c.id,
            campaignId: campaign.id,
            leadEmail: payload.email,
            channel: preferredChannel,
          });
          enqueued++;
        } catch (e) {
          this.logger.warn(`enqueue failed for ${lead.email || lead.id}: ${e}`);
        }
      }

      await this.supabase
        .from('client_automation')
        .upsert({ client_id: c.id, enabled: true, last_run_at: new Date().toISOString() });
    }
    return { ok: true, enqueued };
  }
}
