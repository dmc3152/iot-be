import { Module } from '@nestjs/common';
import { OrientDBModule } from "src/orientdb/orientdb.module";
import { clientProviders } from "src/orientdb/client.providers"
import { EasyconfigModule } from 'nestjs-easyconfig';

@Module({
    imports: [
        OrientDBModule,
        EasyconfigModule.register({ path: './config/.env', safe: true }),
    ],
    providers: [...clientProviders],
    exports: [...clientProviders],
})
export class ClientModule {}