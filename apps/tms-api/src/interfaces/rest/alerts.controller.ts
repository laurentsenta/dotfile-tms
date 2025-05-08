import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { AppService } from '../../app/app.service';
import { Alert } from '@dotfile-tms/database';

@Controller('/v1/alerts')
export class AlertsController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<Alert[]> {
    return this.appService.listAllAlerts();
  }

  @Get('transaction/:id')
  @HttpCode(HttpStatus.OK)
  getByTransactionId(@Param('id') id: string): Promise<Alert[]> {
    return this.appService.getAlertsByTransactionId(id);
  }
}
