import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GmailService } from '../integrations/gmail.service';
import { CalendarService } from '../integrations/calendar.service';
import { SmsService } from '../integrations/sms.service';
import { WhatsappService } from '../integrations/whatsapp.service';

interface StartSequenceDto {
  clientId: string;
  campaignId: string;
  leadId?: string;
  leadEmail?: string;
  channel?: 'email' | 'sms' | 'whatsapp';
}

@Injectable()
export class SequencesService {
  constructor(
    private readonly db: SupabaseService,
    private readonly gmail: GmailService,
    private readonly calendar: CalendarService,
    private readonly sms: SmsService,
    private readonly whatsapp: WhatsappService,
  ) {}

  // Insert three basic steps spaced over 0d, +2d, +5d
  async startSequence({ clientId, leadId, leadEmail, campaignId, channel = 'email' }: StartSequenceDto) {
    const now = new Date();
    const step1 = new Date(now);
    const step2 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const step3 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    // Fetch lead details (from Supabase leads table) for templating
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

    const rows = [
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId || (lead?.id ?? ''),
        channel,
        type: 'email',
        subject: `Quick question about ${lead?.company || 'your needs'}`,
        content: `Hi ${firstName},\n\nWanted to share something that could help you hit your goals faster. Would 10 minutes this week be okay?`,
        due_at: step1.toISOString(),
        status: 'pending',
      },
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId || (lead?.id ?? ''),
        channel,
        type: 'email',
        subject: `Following up — any thoughts?`,
        content: `Hi ${firstName},\n\nJust following up in case this got buried. Happy to share examples and results.`,
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
        content: `Hi ${firstName},\n\nIf now’s not the right time, no problem — I can circle back later. If interested, a quick call is easiest.`,
        due_at: step3.toISOString(),
        status: 'pending',
      },
      // Optional booking step (+7d)
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

        if (item.type === 'book') {
          // Attempt to create a calendar event for the client
          const start = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
          try {
            await this.calendar.createEventForClient(item.client_id, {
              summary: item.subject || 'Intro call',
              description: item.content || 'Automated booking from sequence',
              startTime: start,
              attendees: lead?.email ? [{ email: lead.email }] : [],
            });
            await this.db.update('sequence_queue', { id: item.id }, { status: 'sent', sent_at: new Date().toISOString() });
            // Mark lead as scheduled
            if (lead?.id) await this.db.update('leads', { id: lead.id }, { status: 'meeting_scheduled' });
            results.push({ id: item.id, status: 'sent', action: 'booked' });
          } catch (e: any) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: e.message || 'calendar_failed', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: e.message });
          }
        } else if (item.channel === 'email') {
          const toEmail = lead?.email;
          if (!toEmail) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'missing_email', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: 'missing_email' });
            continue;
          }

          // Attempt to send email via Gmail
          try {
            await this.gmail.sendEmail({
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
        } else if (item.channel === 'sms') {
          const toPhone = lead?.phone;
          if (!toPhone) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'missing_phone', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: 'missing_phone' });
            continue;
          }
          try {
            await this.sms.send(toPhone, item.content || '');
            await this.db.update('sequence_queue', { id: item.id }, { status: 'sent', sent_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'sent' });
          } catch (e: any) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: e.message || 'sms_failed', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: e.message });
          }
        } else if (item.channel === 'whatsapp') {
          const toPhone = lead?.phone;
          if (!toPhone) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'missing_phone', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: 'missing_phone' });
            continue;
          }
          try {
            await this.whatsapp.send(toPhone, item.content || '');
            await this.db.update('sequence_queue', { id: item.id }, { status: 'sent', sent_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'sent' });
          } catch (e: any) {
            await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: e.message || 'whatsapp_failed', updated_at: new Date().toISOString() });
            results.push({ id: item.id, status: 'failed', error: e.message });
          }
        } else {
          await this.db.update('sequence_queue', { id: item.id }, { status: 'failed', last_error: 'unsupported_channel', updated_at: new Date().toISOString() });
          results.push({ id: item.id, status: 'failed', error: 'unsupported_channel' });
        }
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
