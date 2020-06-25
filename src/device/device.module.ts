import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { ClientModule } from 'src/orientdb/client.module';
import { DeviceRepository } from './device.repository';

@Module({
  imports: [ClientModule],
  providers: [DeviceService, DeviceRepository],
  controllers: [DeviceController]
})
export class DeviceModule {}
