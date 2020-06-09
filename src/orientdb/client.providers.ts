import { EasyconfigService } from 'nestjs-easyconfig';
import { constants } from "../constants";

export const clientProviders = [
    {
        provide: constants.DATABASE_CLIENT,
        useFactory: async (client: any, config: EasyconfigService) => {
            return await client.sessions({
                name: config.get('DATABASE_NAME'),
                username: config.get('DATABASE_USERNAME'),
                password: config.get('DATABASE_PASSWORD'),
                pool: { max: config.get('DATABASE_POOL') }
            });
        },
        inject: [constants.DATABASE_CONNECTION, EasyconfigService]
    },
];