import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GmailService } from '../integrations/gmail.service';
import { AiService } from '../ai/ai.service';
import { CalendarService } from '../integrations/calendar.service';
import { SmsService } from '../integrations/sms.service';
import { WhatsappService } from '../integrations/whatsapp.service';

interface StartSequenceDto {
  clientId: string;
  campaignId: string;
  leadId?: string;
  leadEmail?: string;
  channel?: 'email' | 'sms' | 'whatsapp';
  tone?: 'friendly' | 'professional' | 'casual';
}

@Injectable()
export class SequencesService {
  constructor(
    private readonly db: SupabaseService,
    private readonly gmail: GmailService,
    private readonly calendar: CalendarService,
    private readonly sms: SmsService,
    private readonly whatsapp: WhatsappService,
    private readonly ai: AiService,
  ) {}

  // Insert three basic steps spaced over 0d, +2d, +5d (+ optional booking)
  async startSequence({ clientId, leadId, leadEmail, campaignId, channel = 'email', tone = 'friendly' }: StartSequenceDto) {
    const now = new Date();
    const step1 = new Date(now);
    const step2 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const step3 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    // Fetch lead details
    let lead: any = null;
    try {
      if (leadId) {
        lead = await this.db.findOne('leads', { id: leadId });
      } else if (leadEmail) {
        lead = await this.db.findOne('leads', { email: leadEmail });
        leadId = lead?.id;
      }
    } catch {}

    const firstName = lead?.first_name || 'there';

    // Pull campaign details
    let campaign: any = null;
    try {
      const { data: camp } = await this.db.client
        .from('campaigns')
        .select('id,name,description,tone')
        .eq('id', campaignId)
        .maybeSingle();
      campaign = camp || null;
    } catch {}

    // Load client industry
    let clientIndustry: string | undefined = undefined;
    try {
      const { data: cli } = await this.db.client
        .from('clients')
        .select('industry')
        .eq('id', clientId)
        .maybeSingle();
      clientIndustry = (cli as any)?.industry || undefined;
    } catch {}

    // Subject/body variants
    const subjects: Array<() => string> = [
      () => `Quick question about ${lead?.company || campaign?.name || 'your goals'}`,
      () => `${campaign?.name || 'An idea'} for ${lead?.company || 'you'}`,
      () => `Thoughts on ${campaign?.description ? String(campaign.description).slice(0, 40) + '…' : (clientIndustry ? `${clientIndustry} results?` : 'improving results?')}`,
    ];
    const openers: Array<(name: string) => string> = tone === 'professional'
      ? [ (n) => `Hello ${n},`, (n) => `Good day ${n},` ]
      : tone === 'casual'
      ? [ (n) => `Hey ${n},`, (n) => `Hi ${n}!` ]
      : [ (n) => `Hi ${n},`, (n) => `Hello ${n},` ];

    const valueLines: Array<() => string> = tone === 'professional'
      ? [
          () => `We help ${lead?.company || 'teams'} in ${clientIndustry || 'your industry'} improve pipeline efficiency — ${campaign?.description || 'driving higher reply and meeting rates'}.`,
          () => `Clients report measurable lift in qualified responses and booked calls.`,
        ]
      : tone === 'casual'
      ? [
          () => `We’ve been helping ${clientIndustry || 'teams'} like ${lead?.company || 'yours'} get more replies + meetings.`,
          () => `${campaign?.description || 'Short version: better targeting, clearer copy, faster follow-ups.'}`,
        ]
      : [
          () => `We’re helping ${clientIndustry || 'similar'} teams like ${lead?.company || 'yours'} with ${campaign?.description || 'streamlining outreach and booking more meetings'}.`,
          () => `We can likely boost your reply rates and qualified meetings.`,
        ];

    const ctaLines: Array<() => string> = tone === 'professional'
      ? [ () => `Would you be open to a brief 10–15 minute discussion this week?`, () => `Happy to share a concise overview — is there a time that suits you?` ]
      : tone === 'casual'
      ? [ () => `Worth a quick 10–15 min chat to see if this fits?`, () => `If helpful, I can share examples — have 15 mins later this week?` ]
      : [ () => `Open to a quick 10–15 min chat this week?`, () => `Happy to share examples — is your calendar open later this week?` ];

    const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * Math.max(1, arr.length))];

    const rows = [
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId || (lead?.id ?? ''),
        channel,
        type: 'email',
        subject: rand(subjects)(),
        content: `${rand(openers)(firstName)}\n\n${rand(valueLines)()}\n\n${rand(ctaLines)()}`,
        due_at: step1.toISOString(),
        status: 'pending',
      },
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId || (lead?.id ?? ''),
        channel,
        type: 'email',
        subject: `Following up — ${campaign?.name || 'quick check'}`,
        content: `${rand(openers)(firstName)}\n\nJust circling back in case this slipped. ${rand(valueLines)()}\n\n${rand(ctaLines)()}`,
        due_at: step2.toISOString(),
        status: 'pending',
      },
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId || (lead?.id ?? ''),
        channel,
        type: 'email',
        subject: `Should I close the loop?`,
        content: `${rand(openers)(firstName)}\n\nIf now’s not the right time, no problem — I can circle back later. ${rand(ctaLines)()}`,
        due_at: step3.toISOString(),
        status: 'pending',
      },
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId || (lead?.id ?? ''),
        channel,
        type: 'book',
        subject: `Intro call`,
        content: `Auto-book intro call for ${firstName}`,
        due_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
      },
    ];

    for (const row of rows) {
      await this.db.insert('sequence_queue', row);
    }
    return { created: rows.length };
  }

  // Enqueue a sequence for many leads
  async startSequenceForAllLeads({ clientId, campaignId, channel = 'email', tone = 'friendly', limit = 1000 }: { clientId: string; campaignId: string; channel?: 'email' | 'sms' | 'whatsapp'; tone?: 'friendly' | 'professional' | 'casual'; limit?: number }) {
    if (!tone) {
      try {
        const { data: camp } = await this.db.client.from('campaigns').select('tone').eq('id', campaignId).maybeSingle();
        tone = (camp?.tone as any) || 'friendly';
      } catch {}
    }
    const { data: leads, error } = await this.db.client
      .from('leads')
      .select('id,email,first_name,last_name,phone,status,do_not_contact')
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    const eligible = (leads || []).filter((l: any) => {
      if (l.do_not_contact) return false;
      if (channel === 'email') return !!(l.email && String(l.email).trim());
      return true;
    });

    let enqueuedLeads = 0; let totalSteps = 0;
    for (const lead of eligible) {
      const { data: hasQueue } = await this.db.client
        .from('sequence_queue')
        .select('id')
        .eq('lead_id', lead.id)
        .eq('campaign_id', campaignId)
        .limit(1);
      if (Array.isArray(hasQueue) && hasQueue.length) continue;
      const res = await this.startSequence({ clientId, campaignId, leadId: lead.id, channel, tone });
      enqueuedLeads += 1; totalSteps += res.created || 0;
    }
    return { leads_found: eligible.length, enqueued: enqueuedLeads, steps_created: totalSteps };
  }

  // Process pending items
  async tick(limit = 10, opts?: { force?: boolean }) {
    // Respect send window (business hours) unless disabled or forced
    const windowEnabled = !(/^false$/i.test(process.env.SEND_WINDOW_ENABLED || '') || /^0$/.test(process.env.SEND_WINDOW_ENABLED || ''));
    if (windowEnabled && !opts?.force) {
      const start = (process.env.SEND_WINDOW_START || '08:00').split(':');
      const end = (process.env.SEND_WINDOW_END || '18:00').split(':');
      const nowLocal = new Date();
      const minutesNow = nowLocal.getHours() * 60 + nowLocal.getMinutes();
      const startMin = (parseInt(start[0] || '8') * 60) + parseInt(start[1] || '0');
      const endMin = (parseInt(end[0] || '18') * 60) + parseInt(end[1] || '0');
      const withinWindow = minutesNow >= startMin && minutesNow <= endMin;
      if (!withinWindow) {
        return { processed: 0, results: [], window: { start: process.env.SEND_WINDOW_START || '08:00', end: process.env.SEND_WINDOW_END || '18:00' } };
      }
    }

    const nowIso = new Date().toISOString();
    const dueItems = await this.db.findAll('sequence_queue', { status: 'pending' });
    const toProcess = (dueItems || []).filter((i: any) => i.due_at <= nowIso).slice(0, limit);

    const results: any[] = [];
    const minGapMinutes = parseInt(process.env.MIN_LEAD_SEND_GAP_MINUTES || '1440', 10);
    const nowEpoch = Date.now();

    for (const item of toProcess) {
      try {
        let lead: any = null;
        try { lead = await this.db.findOne('leads', { id: item.lead_id }); } catch {}
        const leadStatus = lead?.status || 'new';
        if (lead?.do_not_contact || ['replied','meeting_scheduled','unsubscribed','closed_won','closed_lost'].includes(leadStatus)) {
          await this.db.update('sequence_queue', { id: item.id }, { status: 'cancelled', updated_at: new Date().toISOString() });
          results.push({ id: item.id, status: 'cancelled' });
          continue;
        }

        if (item.type === 'book') {
          const startTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
          try {
            await this.calendar.createEventForClient(item.client_id, {
              summary: item.subject || 'Intro call',
              description: item.content || 'Automated booking from sequence',
              startTime,
              attendees: lead?.email ? [{ email: lead.email }] : [],
            });
            await this.db.update('sequence_queue', { id: item.id }, { status: 'sent', sent_at: new Date().toISOString() });
            if (lead?.id) await this.db.update('leads', { id: lead.id }, { status: 'meeting_scheduled' });
            results.push({ id: item.id, status: 'sent', action: 'booked' });
          } catch (e: any) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: e.message || 'calendar_failed', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: e.message });
          }
          continue;
        }

        if (item.channel === 'email') {
          const toEmail = lead?.email;
          if (!toEmail) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'missing_email', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: 'missing_email' });
            continue;
          }
          // Per-lead throttling: skip if last outbound too recent
          try {
            const cutoff = new Date(nowEpoch - minGapMinutes * 60 * 1000).toISOString();
            const { data: recent } = await this.db.client
              .from('messages')
              .select('id,created_at')
              .eq('lead_id', item.lead_id)
              .eq('direction', 'outbound')
              .gte('created_at', cutoff)
              .limit(1);
            if (Array.isArray(recent) && recent.length) {
              results.push({ id: item.id, status: 'skipped', reason: 'throttled' });
              continue;
            }
          } catch {}

          try {
            // Cache campaign+industry
            const campKey = item.campaign_id;
            if (!(global as any)._campCache) (global as any)._campCache = {};
            const cache: any = (global as any)._campCache;
            let camp = cache[campKey];
            if (!camp) {
              const { data: c } = await this.db.client
                .from('campaigns')
                .select('id,name,description,tone,client_id')
                .eq('id', item.campaign_id)
                .maybeSingle();
              let industry: string | undefined;
              if (c?.client_id) {
                const { data: cli } = await this.db.client
                  .from('clients')
                  .select('industry')
                  .eq('id', c.client_id)
                  .maybeSingle();
                industry = (cli as any)?.industry || undefined;
              }
              camp = { ...(c || {}), industry };
              cache[campKey] = camp;
            }

            const aiText = await this.ai.generateLeadMessage(lead, camp.description || camp.name || 'your needs', {
              campaignName: camp.name,
              campaignDescription: camp.description,
              tone: (camp.tone as any) || 'friendly',
              industry: camp.industry,
            });
            const subject = item.subject || `About ${camp.name || 'your inquiry'}`;

            await this.gmail.sendEmail({ to: toEmail, subject, text: aiText || '' });

            await this.db.insert('messages', {
              campaign_id: item.campaign_id,
              lead_id: item.lead_id,
              lead_name: `${lead?.first_name || ''} ${lead?.last_name || ''}`.trim() || 'Unknown Lead',
              lead_email: toEmail,
              lead_phone: lead?.phone || null,
              channel: 'email',
              content: aiText || item.content || '',
              status: 'sent',
              direction: 'outbound',
            });

            try {
              if (lead?.id) {
                await this.db.update('leads', { id: lead.id }, {
                  status: ['replied','meeting_scheduled','unsubscribed','closed_won','closed_lost'].includes(lead.status || '') ? lead.status : 'contacted',
                  last_contacted: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              }
            } catch {}

            await this.db.update('sequence_queue', { id: item.id }, { status: 'sent', sent_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'sent' });
          } catch (e: any) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: e.message || 'send_failed', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: e.message });
          }
          continue;
        }

        if (item.channel === 'sms') {
          const toPhone = lead?.phone;
          if (!toPhone) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'missing_phone', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: 'missing_phone' });
            continue;
          }
          try { await this.sms.send(toPhone, item.content || ''); await this.db.update('sequence_queue', { id: item.id }, { status: 'sent', sent_at: new Date().toISOString() }); results.push({ id: item.id, status: 'sent' }); }
          catch (e: any) { await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: e.message || 'sms_failed', updated_at: new Date().toISOString() }); results.push({ id: item.id, status: 'failed', error: e.message }); }
          continue;
        }

        if (item.channel === 'whatsapp') {
          const toPhone = lead?.phone;
          if (!toPhone) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'missing_phone', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: 'missing_phone' });
            continue;
          }
          try { await this.whatsapp.send(toPhone, item.content || ''); await this.db.update('sequence_queue', { id: item.id }, { status: 'sent', sent_at: new Date().toISOString() }); results.push({ id: item.id, status: 'sent' }); }
          catch (e: any) { await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: e.message || 'whatsapp_failed', updated_at: new Date().toISOString() }); results.push({ id: item.id, status: 'failed', error: e.message }); }
          continue;
        }

        await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'unsupported_channel', updated_at: new Date().toISOString() });
        results.push({ id: item.id, status: 'failed', error: 'unsupported_channel' });
      } catch (e: any) {
        results.push({ id: item.id, status: 'error', error: e.message });
      }
    }

    return { processed: results.length, results };
  }

  async listQueueByCampaign(campaignId: string, limit = 5) {
    const { data, error } = await this.db.client
      .from('sequence_queue')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('due_at', { ascending: true })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data || [];
  }
}


