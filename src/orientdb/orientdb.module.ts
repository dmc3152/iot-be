import { Module } from '@nestjs/common';
import { databaseProviders } from './orientdb.providers';

@Module({
    providers: [...databaseProviders],
    exports: [...databaseProviders],
})
export class DatabaseModule {}