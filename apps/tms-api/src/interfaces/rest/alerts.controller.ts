import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { AlertAggregate } from '../../data/alert.aggregate';
import { AlertType } from '../dto/alert.type';

@Controller('/v1/alerts')
export class AlertsController {
  constructor(private readonly alertService: AlertAggregate) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  listAll(): Promise<AlertType[]> {
    return this.alertService.listAllAlerts();
  }

  @Get('transaction/:id')
  @HttpCode(HttpStatus.OK)
  getByTransactionId(@Param('id') id: string): Promise<AlertType[]> {
    return this.alertService.getAlertsByTransactionId(id);
  }
}
