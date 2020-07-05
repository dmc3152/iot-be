// import { OrientDBClient, OrientDB } from "orientjs";
import { EasyconfigService } from 'nestjs-easyconfig';
import { constants } from "../constants";
import OrientDB = require('orientjs');

export const databaseProviders = [
    {
        provide: constants.DATABASE_CONNECTION,
        useFactory: async (config: EasyconfigService) => {
            let client;
            try {
                client = await OrientDB({
                    host: config.get('DATABASE_HOST'),
                    port: config.get('DATABASE_PORT'),
                    username: config.get('DATABASE_USERNAME'),
                    password: config.get('DATABASE_PASSWORD')
                });
            } catch(error) {
                return false;
            }

            return client;
        },
        inject: [EasyconfigService]
    },
];