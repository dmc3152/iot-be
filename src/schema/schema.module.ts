import { Module } from '@nestjs/common';
import { SchemaController } from './schema.controller';
import { SchemaService } from './schema.service';
import { SchemaRepository } from './schema.repository';
import { ClientModule } from 'src/orientdb/client.module';

@Module({
  imports: [ClientModule],
  controllers: [SchemaController],
  providers: [SchemaService, SchemaRepository]
})
export class SchemaModule {}
