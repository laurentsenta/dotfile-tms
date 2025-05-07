import { Module } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { ApiDatabaseModule } from './database/database.module';
import { RulesWorkerModule } from './rules/rules-worker.module';

@Module({
  imports: [ApiDatabaseModule, AppModule, RulesWorkerModule],
})
export class ApiModule {}
