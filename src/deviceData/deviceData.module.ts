import { Module } from '@nestjs/common';
import { DeviceDataService } from './deviceData.service';
import { DeviceDataController } from './deviceData.controller';
import { ClientModule } from 'src/orientdb/client.module';
import { DeviceDataRepository } from './deviceData.repository';
import { SchemaModule } from "../schema/schema.module";

@Module({
  imports: [ClientModule, SchemaModule],
  providers: [DeviceDataService, DeviceDataRepository],
  controllers: [DeviceDataController]
})
export class DeviceDataModule {}
