import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EasyconfigModule } from 'nestjs-easyconfig';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DeviceModule } from './device/device.module';
import { SchemaModule } from './schema/schema.module';
import { DeviceDataModule } from "./deviceData/deviceData.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    EasyconfigModule.register({ path: '.env', safe: true }),
    AuthModule,
    UserModule,
    DeviceModule,
    SchemaModule,
    DeviceDataModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
