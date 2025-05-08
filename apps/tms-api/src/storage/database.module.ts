import { Module } from '@nestjs/common';

import { DatabaseModule } from '@dotfile-tms/database';
import { migrations } from '@dotfile-tms/migrations';

// @NOTE migrations will run at this API startup
@Module({
  imports: [DatabaseModule.register({ migrations })],
})
export class ApiDatabaseModule {}
