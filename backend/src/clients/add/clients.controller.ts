import { Controller, Post, Body } from '@nestjs/common';
import { ClientsService } from '../clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post('add')
  addClient(@Body() body: any) {
    const { id, name, email, crm, crm_provider, token } = body;
    return this.clientsService.addClient({ id, name, email, crm, crm_provider, token });
  }
}
