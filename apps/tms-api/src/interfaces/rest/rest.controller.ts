import { Controller, Get } from '@nestjs/common';

@Controller('/v1/health')
export class RestController {
  @Get()
  getMessage() {
    return { message: 'OK' };
  }
}
