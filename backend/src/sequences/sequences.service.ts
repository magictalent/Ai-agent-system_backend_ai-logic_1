import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GmailService } from '../integrations/gmail.service';

interface StartSequenceDto {
  clientId: string;
  leadId: string;
  campaignId: string;
  channel?: 'email';
}

@Injectable()
export class SequencesService {
  constructor(
    private readonly db: SupabaseService,
    private readonly gmail: GmailService,
  ) {}

  // Insert three basic steps spaced over 0d, +2d, +5d
  async startSequence({ clientId, leadId, campaignId, channel = 'email' }: StartSequenceDto) {
    const now = new Date();
    const step1 = new Date(now);
    const step2 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const step3 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    // Fetch lead details (from Supabase leads table) for templating
    let lead: any = null;
    try {
      lead = await this.db.findOne('leads', { id: leadId });
    } catch {}

    const firstName = lead?.first_name || 'there';

    const rows = [
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId,
        channel,
        subject: `Quick question about ${lead?.company || 'your needs'}`,
        content: `Hi ${firstName},\n\nWanted to share something that could help you hit your goals faster. Would 10 minutes this week be okay?`,
        due_at: step1.toISOString(),
        status: 'pending',
      },
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId,
        channel,
        subject: `Following up — any thoughts?`,
        content: `Hi ${firstName},\n\nJust following up in case this got buried. Happy to share examples and results.`,
        due_at: step2.toISOString(),
        status: 'pending',
      },
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId,
        channel,
        subject: `Should I close the loop?`,
        content: `Hi ${firstName},\n\nIf now’s not the right time, no problem — I can circle back later. If interested, a quick call is easiest.`,
        due_at: step3.toISOString(),
        status: 'pending',
      },
    ];

    for (const row of rows) {
      await this.db.insert('sequence_queue', row);
    }

    return { created: rows.length };
  }

  // Process up to N pending items past due
  async tick(limit = 10) {
    // Fetch due items
    const nowIso = new Date().toISOString();
    const dueItems = await this.db.findAll('sequence_queue', { status: 'pending' });
    const toProcess = (dueItems || []).filter((i: any) => i.due_at <= nowIso).slice(0, limit);

    const results: any[] = [];

    for (const item of toProcess) {
      try {
        // Stop rules: if lead status indicates stop, cancel
        let lead: any = null;
        try { lead = await this.db.findOne('leads', { id: item.lead_id }); } catch {}
        const leadStatus = lead?.status || 'new';
        if (['meeting_scheduled', 'unsubscribed', 'closed_won', 'closed_lost'].includes(leadStatus)) {
          await this.db.update('sequence_queue', { id: item.id }, { status: 'cancelled', updated_at: new Date().toISOString() });
          results.push({ id: item.id, status: 'cancelled' });
          continue;
        }

        if (item.channel === 'email') {
          const toEmail = lead?.email;
          if (!toEmail) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'missing_email', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: 'missing_email' });
            continue;
          }

          // Attempt to send email via Gmail
          try {
            await this.gmail.sendEmail({
              clientId: item.client_id,
              to: toEmail,
              subject: item.subject || 'Hello',
              text: item.content || '',
            });

            // Record in messages table for the campaign
            await this.db.insert('messages', {
              campaign_id: item.campaign_id,
              lead_id: item.lead_id,
              lead_name: `${lead?.first_name || ''} ${lead?.last_name || ''}`.trim() || 'Unknown Lead',
              lead_email: toEmail,
              lead_phone: lead?.phone || null,
              channel: 'email',
              content: item.content || '',
              status: 'sent',
              direction: 'outbound',
            });

            await this.db.update('sequence_queue', { id: item.id }, { status: 'sent', sent_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'sent' });
          } catch (e: any) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: e.message || 'send_failed', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: e.message });
          }
        } else {
          // Future channels (whatsapp/sms)
          await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'unsupported_channel', updated_at: new Date().toISOString() });
          results.push({ id: item.id, status: 'failed', error: 'unsupported_channel' });
        }
      } catch (e: any) {
        results.push({ id: item.id, status: 'error', error: e.message });
      }
    }

    return { processed: results.length, results };
  }
}

