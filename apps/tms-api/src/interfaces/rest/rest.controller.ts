import {
  Controller,
  Get,
} from '@nestjs/common';
import { AppService } from '../../app/app.service';

@Controller('/v1/health')
export class RestController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getMessage() {
    return { message: 'OK' };
  }
}
