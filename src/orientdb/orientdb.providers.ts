import { OrientDBClient } from "orientjs";
import { EasyconfigService } from 'nestjs-easyconfig';
import { constants } from "../constants";

export const databaseProviders = [
    {
        provide: constants.DATABASE_CONNECTION,
        useFactory: async (config: EasyconfigService) => {
            let client;
            try {
                client = await OrientDBClient.connect({
                    host: config.get('DATABASE_HOST'),
                    port: config.get('DATABASE_PORT')
                });
            } catch(error) {
                return false;
            }

            return client;
        },
        inject: [EasyconfigService]
    },
];