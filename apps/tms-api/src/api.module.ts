import { Module } from '@nestjs/common';
import { GraphqlModule } from './interfaces/graphql/graphql.module';
import { RestModule } from './interfaces/rest/rest.module';

@Module({
  imports: [RestModule, GraphqlModule],
})
export class ApiModule {}
