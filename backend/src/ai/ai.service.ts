import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ClientsService } from '../clients/clients.service';
import { CrmService } from '../crm/crm.service';
import { GmailService } from '../integrations/gmail.service';
import { CalendarService } from '../integrations/calendar.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Client } from '../clients/client.interface';

@Injectable()
export class AiService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(
    private readonly clientsService: ClientsService,
    private readonly crmService: CrmService,
    private readonly gmailService: GmailService,
    private readonly calendarService: CalendarService,
    private readonly supabase: SupabaseService, // 👈 Add Supabase
  ) {}

  /** Fetch leads from the client's CRM */
  async getClientLeads(clientId: string, userId: string) {
    const client = await this.clientsService.getClientById(clientId, userId);
    if (!client) throw new Error(`Client with ID ${clientId} not found`);

    const leads = await this.crmService.getLeads(client.crm_provider, 'mock-token');
    return { client: client.name, crm: client.crm_provider, total: leads.length, leads };
  }

  /** Generate a personalized outbound message for a lead.
   * Includes campaign/offer context and varies tone/phrasing to avoid duplicates.
   */
  async generateLeadMessage(lead: any, clientOffer: string, opts?: { campaignName?: string; campaignDescription?: string; tone?: 'friendly' | 'professional' | 'casual' }) {
    const first = (lead?.firstname || lead?.first_name || '').trim();
    const last = (lead?.lastname || lead?.last_name || '').trim();
    const fullName = [first, last].filter(Boolean).join(' ') || 'there';
    const company = (lead?.company || '').trim();

    const styleOptions = opts?.tone === 'professional'
      ? ['professional and concise', 'formal and to-the-point']
      : opts?.tone === 'casual'
      ? ['conversational and upbeat', 'friendly and relaxed']
      : ['friendly and value-focused', 'concise and curious'];
    const style = styleOptions[Math.floor(Math.random() * styleOptions.length)];

    const system = `You are a B2B sales assistant. Write short, personalized outreach emails (3-6 sentences). Avoid repeating phrasing across messages. Vary tone and word choice naturally. Keep it human, specific, and relevant.`;

    const details: string[] = [];
    if (opts?.campaignName) details.push(`Campaign: ${opts.campaignName}`);
    if (opts?.campaignDescription) details.push(`Campaign description: ${opts.campaignDescription}`);
    if (company) details.push(`Lead company: ${company}`);

    const user = `Write an initial email to ${fullName} about: ${clientOffer}.
Style: ${style}.
${details.length ? details.join('\n') : ''}
Constraints:
- Keep under 120 words.
- Include one specific benefit relevant to their role/company.
- End with a simple scheduling CTA in one sentence.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: opts?.tone === 'professional' ? 0.6 : 0.85,
      top_p: 0.95,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    return completion.choices[0].message.content || '';
  }

  /** Generate an on-thread reply to an inbound message from a lead */
  async generateReplyMessage(params: { leadName?: string; campaignName?: string; campaignDescription?: string; lastInbound: string; tone?: 'friendly' | 'professional' | 'casual' }) {
    const { leadName = 'there', campaignName, campaignDescription, lastInbound, tone } = params;
    const system = tone === 'professional'
      ? `You are a professional sales agent. Be concise (2-4 sentences), courteous, and focus on next steps.`
      : tone === 'casual'
      ? `You are a casual, friendly sales agent. Sound natural, keep it brief (2-4 sentences), and propose the next step.`
      : `You are a helpful sales agent. Reply concisely (2-5 sentences), answer the question, and move the thread toward a call if appropriate.`;
    const user = `Lead (${leadName}) wrote:\n"""${lastInbound}"""\n
Context:\n- Campaign: ${campaignName || 'N/A'}\n- Description: ${campaignDescription || 'N/A'}\n
Write a natural reply that acknowledges their message and proposes a next step when relevant.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: tone === 'professional' ? 0.6 : 0.8,
      top_p: 0.95,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    return completion.choices[0].message.content || '';
  }

  /** Send message and save to Supabase */
  async sendMessageToLead(clientId: string, leadId: string, offer: string, userId: string, opts?: { tone?: 'friendly' | 'professional' | 'casual' }) {
    const client = await this.clientsService.getClientById(clientId, userId);
    if (!client) throw new Error(`Client ${clientId} not found`);
  
    // TypeScript now knows client is not undefined
    const lead = await this.crmService.getLeadById(client.crm_provider, leadId, 'mock-token');
  
    const messageText = await this.generateLeadMessage(lead, offer, { tone: opts?.tone });
  
    await this.gmailService.sendEmail({
      to: lead.email,
      subject: `Regarding your interest in ${offer}`,
      text: messageText ?? '',
    });
    await this.supabase.insert('messages', {
      client_id: client.id,
      lead_id: leadId,
      channel: 'email',
      content: messageText,
      status: 'sent',
    });
  
    await this.supabase.update('leads', { id: leadId }, {
      status: 'contacted',
      last_contacted: new Date().toISOString(),
    });
  
    return { success: true, message: 'Email sent and logged', content: messageText };
  }
  

  /** Schedule meeting and save to Supabase */
  async bookMeeting(clientId: string, leadId: string, time: string, userId: string) {
    const client = await this.clientsService.getClientById(clientId, userId);
    if (!client) throw new Error(`Client ${clientId} not found`);
  
    const lead = await this.crmService.getLeadById(client.crm_provider, leadId, 'mock-token');
  
    const event = await this.calendarService.createEvent({
      summary: `Meeting with ${lead.firstname} ${lead.lastname}`,
      description: `Follow-up for ${client.name}`, // 👈 safe now
      startTime: time,
      attendees: [{ email: lead.email }],
    });
  
    await this.supabase.insert('meetings', {
      client_id: client.id,
      lead_id: leadId,
      google_event_id: event.id,
      summary: event.summary,
      start_time: time,
      status: 'scheduled',
    });
  
    await this.supabase.update('leads', { id: leadId }, { status: 'meeting_scheduled' });
  
    return { success: true, event };
  }
  
}
