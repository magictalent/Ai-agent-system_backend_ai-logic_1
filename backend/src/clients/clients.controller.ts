import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Get()
  getAllClients() {
    return this.clientsService.getAllClients();
  }

  @Get(':id')
  getClientById(@Param('id') id: string) {
    return this.clientsService.getClientById(id);
  }

  @Post('add')
  async addClient(@Body() body: any) {
    const { id, name, email, crm, crm_provider, token } = body;
    return this.clientsService.addClient({ id, name, email, crm, crm_provider, token });
  }


  // @Put('update')
  // updateClient(@Body() body: { id: string; data: any }) {
  //   return this.clientsService.updateClient(body.id, body.data);
  // }
}
