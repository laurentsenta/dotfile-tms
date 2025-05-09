import { Alert } from '@dotfile-tms/database';
import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { AlertAggregateService } from '../../data/alert-aggregate.service';

@Controller('/v1/alerts')
export class AlertsController {
  constructor(private readonly alertService: AlertAggregateService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<Alert[]> {
    return this.alertService.listAllAlerts();
  }

  @Get('transaction/:id')
  @HttpCode(HttpStatus.OK)
  getByTransactionId(@Param('id') id: string): Promise<Alert[]> {
    return this.alertService.getAlertsByTransactionId(id);
  }
}
