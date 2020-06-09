import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EasyconfigModule } from 'nestjs-easyconfig';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    EasyconfigModule.register({ path: './config/.env', safe: true })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
