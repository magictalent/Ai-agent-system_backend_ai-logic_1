import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HubspotService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.hubapi.com';

  constructor() {
    const apiKey = process.env.HUBSPOT_API_KEY;
    if (!apiKey) {
      throw new Error('HUBSPOT_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async getLeads() {
    try {
      console.log('🔍 HubSpot: Fetching contacts...');
      
      const response = await axios.get(
        `${this.baseUrl}/crm/v3/objects/contacts`,
        {
          headers: this.getHeaders(),
          params: {
            limit: 100,
            properties: 'firstname,lastname,email,phone'
          }
        }
      );

      console.log(`📊 HubSpot: Found ${response.data.results.length} contacts`);

      return response.data.results.map(contact => ({
        id: contact.id,
        firstname: contact.properties.firstname || '',
        lastname: contact.properties.lastname || '',
        email: contact.properties.email || '',
        phone: contact.properties.phone || ''
      }));
    } catch (error) {
      console.error('❌ HubSpot API Error:', error.response?.data || error.message);
      throw new HttpException('Failed to fetch leads from HubSpot', HttpStatus.BAD_GATEWAY);
    }
  }

  async getLeadById(id: string) {
    try {
      console.log(`🔍 HubSpot: Fetching contact ${id}...`);
      
      const response = await axios.get(
        `${this.baseUrl}/crm/v3/objects/contacts/${id}`,
        {
          headers: this.getHeaders(),
          params: {
            properties: 'firstname,lastname,email,phone'
          }
        }
      );

      const contact = response.data;
      return {
        id: contact.id,
        firstname: contact.properties.firstname || '',
        lastname: contact.properties.lastname || '',
        email: contact.properties.email || '',
        phone: contact.properties.phone || ''
      };
    } catch (error) {
      console.error('❌ HubSpot API Error:', error.response?.data || error.message);
      throw new HttpException('Failed to fetch lead from HubSpot', HttpStatus.BAD_GATEWAY);
    }
  }

  async createLead(data: any) {
    try {
      console.log('🔍 HubSpot: Creating contact...', data);
      
      const response = await axios.post(
        `${this.baseUrl}/crm/v3/objects/contacts`,
        {
          properties: {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            phone: data.phone
          }
        },
        { headers: this.getHeaders() }
      );

      console.log('✅ HubSpot: Contact created:', response.data.id);
      
      return {
        id: response.data.id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone
      };
    } catch (error) {
      console.error('❌ HubSpot API Error:', error.response?.data || error.message);
      throw new HttpException('Failed to create lead in HubSpot', HttpStatus.BAD_GATEWAY);
    }
  }

  async updateLead(id: string, data: any) {
    try {
      console.log(`🔍 HubSpot: Updating contact ${id}...`, data);
      
      const response = await axios.patch(
        `${this.baseUrl}/crm/v3/objects/contacts/${id}`,
        {
          properties: {
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            phone: data.phone
          }
        },
        { headers: this.getHeaders() }
      );

      console.log('✅ HubSpot: Contact updated');
      
      return {
        id: response.data.id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone
      };
    } catch (error) {
      console.error('❌ HubSpot API Error:', error.response?.data || error.message);
      throw new HttpException('Failed to update lead in HubSpot', HttpStatus.BAD_GATEWAY);
    }
  }
}