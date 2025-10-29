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
  ) {}

  // Insert three basic steps spaced over 0d, +2d, +5d
  async startSequence({ clientId, leadId, leadEmail, campaignId, channel = 'email', tone = 'friendly' }: StartSequenceDto) {
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

    // Pull campaign details for better personalization
    let campaign: any = null;
    try {
      const { data: camp } = await this.db.client
        .from('campaigns')
        .select('id,name,description')
        .eq('id', campaignId)
        .maybeSingle();
      campaign = camp || null;
    } catch {}

    // Subject and body variants to add diversity
    const subjects = [
      () => `Quick question about ${lead?.company || campaign?.name || 'your goals'}`,
      () => `${campaign?.name || 'An idea'} for ${lead?.company || 'you'}`,
      () => `Thoughts on ${campaign?.description ? (campaign.description as string).slice(0, 40) + '…' : 'improving results?'}`,
    ];
    const openers = tone === 'professional'
      ? [
          (name: string) => `Hello ${name},`,
          (name: string) => `Good day ${name},`,
        ]
      : tone === 'casual'
      ? [
          (name: string) => `Hey ${name},`,
          (name: string) => `Hi ${name}!`,
        ]
      : [
          (name: string) => `Hi ${name},`,
          (name: string) => `Hello ${name},`,
        ];

    const valueLines = tone === 'professional'
      ? [
          () => `We help ${lead?.company || 'teams'} improve pipeline efficiency — ${campaign?.description || 'driving higher reply and meeting rates'}.`,
          () => `Clients report measurable lift in qualified responses and booked calls.`,
        ]
      : tone === 'casual'
      ? [
          () => `We’ve been helping folks like ${lead?.company || 'you'} get more replies + meetings.`,
          () => `${campaign?.description || 'Short version: better targeting, clearer copy, faster follow-ups.'}`,
        ]
      : [
          () => `We’re helping teams like ${lead?.company || 'yours'} with ${campaign?.description || 'streamlining outreach and booking more meetings'}.`,
          () => `We can likely boost your reply rates and qualified meetings.`,
        ];

    const ctaLines = tone === 'professional'
      ? [
          () => `Would you be open to a brief 10–15 minute discussion this week?`,
          () => `Happy to share a concise overview — is there a time that suits you?`,
        ]
      : tone === 'casual'
      ? [
          () => `Worth a quick 10–15 min chat to see if this fits?`,
          () => `If helpful, I can share examples — have 15 mins later this week?`,
        ]
      : [
          () => `Open to a quick 10–15 min chat this week?`,
          () => `Happy to share examples — is your calendar open later this week?`,
        ];
    const pick = <T,>(arr: Array<() => T>) => arr[Math.floor(Math.random() * arr.length)]();

    const rows = [
      {
        campaign_id: campaignId,
        client_id: clientId,
        lead_id: leadId || (lead?.id ?? ''),
        channel,
        type: 'email',
        subject: pick(subjects),
        content: `${pick(openers)(firstName)}\n\n${pick(valueLines)}\n\n${pick(ctaLines)}`,
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
        content: `${pick(openers)(firstName)}\n\nJust circling back in case this slipped. ${pick(valueLines)}\n\n${pick(ctaLines)}`,
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
        content: `${pick(openers)(firstName)}\n\nIf now’s not the right time, no problem — I can circle back later. ${pick(ctaLines)}`,
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

  // Enqueue a sequence for all eligible leads for the given campaign/client
  async startSequenceForAllLeads({ clientId, campaignId, channel = 'email', tone = 'friendly', limit = 1000 }: { clientId: string; campaignId: string; channel?: 'email' | 'sms' | 'whatsapp'; tone?: 'friendly' | 'professional' | 'casual'; limit?: number }) {
    // Load leads from DB. For email channel, require a non-empty email.
    const query = this.db.client
      .from('leads')
      .select('id,email,first_name,last_name,phone')
      .order('updated_at', { ascending: false })
      .limit(limit);
    const { data: leads, error } = await query;
    if (error) throw new Error(error.message);

    const eligible = (leads || []).filter((l: any) => channel === 'email' ? !!(l.email && l.email.trim()) : true);
    let enqueuedLeads = 0;
    let totalSteps = 0;

    for (const lead of eligible) {
      // Skip if already queued for this campaign+lead
      const { data: hasQueue } = await this.db.client
        .from('sequence_queue')
        .select('id')
        .eq('lead_id', lead.id)
        .eq('campaign_id', campaignId)
        .limit(1);
      if (Array.isArray(hasQueue) && hasQueue.length) continue;

      const res = await this.startSequence({ clientId, campaignId, leadId: lead.id, channel, tone });
      enqueuedLeads += 1;
      totalSteps += res.created || 0;
    }

    return { leads_found: eligible.length, enqueued: enqueuedLeads, steps_created: totalSteps };
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
