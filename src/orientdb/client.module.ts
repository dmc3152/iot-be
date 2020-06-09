import { Module } from '@nestjs/common';
import { DatabaseModule } from "src/orientdb/orientdb.module";
import { clientProviders } from "src/orientdb/client.providers"

@Module({
    imports: [DatabaseModule],
    providers: [...clientProviders],
    exports: [...clientProviders],
})
export class ClientModule {}