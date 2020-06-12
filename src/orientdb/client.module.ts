import { Module } from '@nestjs/common';
import { OrientDBModule } from "src/orientdb/orientdb.module";
import { clientProviders } from "src/orientdb/client.providers"

@Module({
    imports: [OrientDBModule],
    providers: [...clientProviders],
    exports: [...clientProviders],
})
export class ClientModule {}