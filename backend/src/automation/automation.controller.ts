import { Body, Controller, Post, Request } from '@nestjs/common';
import { AutomationService } from './automation.service';

@Controller('automation')
export class AutomationController {
  constructor(private readonly automation: AutomationService) {}

  @Post('enable')
  async enable(@Body() body: { clientId: string; enabled: boolean }) {
    return this.automation.enable(body.clientId, body.enabled);
  }

  @Post('pause')
  async pause(@Body() body: { clientId: string; paused: boolean }) {
    return this.automation.pause(body.clientId, body.paused);
  }

  // Run one sync + enqueue pass for current user's clients
  @Post('run')
  async run(@Request() req: any) {
    const userId = req.user?.id;
    return this.automation.runOnce(userId);
  }
}

