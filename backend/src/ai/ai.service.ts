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

  /** Generate personalized message using OpenAI */
  async generateLeadMessage(lead: any, clientOffer: string) {
    const prompt = `Write a short, friendly sales message to ${lead.firstname} ${lead.lastname} about ${clientOffer}.
Keep it professional, persuasive, and polite.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0].message.content;
  }

  /** Send message and save to Supabase */
  async sendMessageToLead(clientId: string, leadId: string, offer: string, userId: string) {
    const client = await this.clientsService.getClientById(clientId, userId);
    if (!client) throw new Error(`Client ${clientId} not found`);
  
    // TypeScript now knows client is not undefined
    const lead = await this.crmService.getLeadById(client.crm_provider, leadId, 'mock-token');
  
    const messageText = await this.generateLeadMessage(lead, offer);
  
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

