import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController, TransactionsController } from './app.controller';
import { AppService } from './app.service';
import { Transaction } from '@dotfile-tms/database';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
  ],
  controllers: [AppController, TransactionsController],
  providers: [AppService],
})
export class AppModule {}
