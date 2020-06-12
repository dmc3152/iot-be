import { Module } from '@nestjs/common';
import { databaseProviders } from './orientdb.providers';
import { EasyconfigModule } from 'nestjs-easyconfig';

@Module({
    imports: [EasyconfigModule.register({ path: './config/.env', safe: true })],
    providers: [...databaseProviders],
    exports: [...databaseProviders],
})
export class OrientDBModule {}