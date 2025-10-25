import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Get()
  async getAllClients(@CurrentUser() user: any) {
    console.log('🔍 Getting clients for user:', user.id);
    try {
      const clients = await this.clientsService.getAllClients(user.id);
      console.log('✅ Found clients:', clients.length);
      return clients;
    } catch (error) {
      console.error('❌ Error getting clients:', error);
      throw error;
    }
  }

  @Get('test')
  async testConnection() {
    console.log('🧪 Testing database connection...');
    try {
      const { data, error } = await this.clientsService.testConnection();
      return { success: true, data, error };
    } catch (error) {
      console.error('❌ Test connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  @Get('verify/:id')
  async verifyClient(@Param('id') id: string, @CurrentUser() user: any) {
    console.log('🔍 Verifying client exists:', id);
    try {
      const client = await this.clientsService.getClientById(id, user.id);
      return { 
        exists: !!client, 
        client: client,
        message: client ? 'Client found' : 'Client not found'
      };
    } catch (error) {
      console.error('❌ Error verifying client:', error);
      return { exists: false, error: error.message };
    }
  }

  @Get(':id')
  getClientById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.clientsService.getClientById(id, user.id);
  }

  @Post('add')
  async addClient(@Body() body: any, @CurrentUser() user: any) {
    console.log('🔍 ClientsController: Adding client for user:', user.id);
    console.log('📝 ClientsController: Request body:', body);
    
    try {
      // Validate user
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      // Validate required fields
      if (!body.name || !body.email) {
        throw new Error('Name and email are required');
      }
      
      const clientData = {
        name: body.name,
        email: body.email,
        phone: body.phone,
        industry: body.industry,
        crm_provider: body.crm_provider || 'mock',
        user_id: user.id
      };
      
      console.log('📋 ClientsController: Prepared client data:', clientData);
      
      const result = await this.clientsService.addClient(clientData);
      console.log('✅ ClientsController: Client added successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ ClientsController: Error adding client:', error);
      throw error;
    }
  }

  @Put(':id')
  async updateClient(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.clientsService.updateClient(id, body, user.id);
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string, @CurrentUser() user: any) {
    return this.clientsService.deleteClient(id, user.id);
  }
}
