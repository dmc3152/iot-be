import { Injectable, Inject, HttpException, HttpStatus, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { DataSchema } from "./dataSchema";
import { constants } from "../constants";

@Injectable()
export class SchemaRepository {

    constructor(@Inject(constants.DATABASE_CLIENT) private pool: any) { }

    async getDataSchemas(userId): Promise<Array<DataSchema>> {
        let session;

        // get session
        try {
            session = await this.pool.acquire();
        } catch (error) {
            throw new ServiceUnavailableException();
        }

        const params = { userId };

        // make request
        try {
            const result = await session.query('SELECT expand(dataSchemas) FROM User WHERE @rid = :userId', { params }).all();
            const dataSchemas = result.map(dataSchema => new DataSchema(dataSchema));

            await session.close();
            return dataSchemas;
        } catch (error) {
            console.log('error', error);
            await session.close();
            throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDataSchemaById(id: string): Promise<DataSchema> {
        let session;

        // get session
        try {
            session = await this.pool.acquire();
        } catch (error) {
            throw new ServiceUnavailableException();
        }

        const params = { id };

        // make request
        try {
            const result = await session.query('SELECT * FROM DataSchema WHERE @rid = :id', { params }).one();

            await session.close();
            return result ? new DataSchema(result) : null;
        } catch (error) {
            await session.close();
            throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addDataSchema(dataSchema: DataSchema, userId: string): Promise<any> {
        let session, result, exception: HttpException;

        // get session
        try {
            session = await this.pool.acquire();
        } catch (error) {
            throw new ServiceUnavailableException();
        }

        const params = { userId, ...dataSchema };

        try {
            const batch = `begin;
            let $result = UPDATE User SET dataSchemas = dataSchemas || (INSERT INTO DataSchema SET unit = :unit, name = :name, key = :key, schema = :schema) WHERE @rid = :userId;
            commit;
            return $result;`;

            result = await session.batch(batch, { params }).all();
        } catch (error) {
            exception = error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await session.close();

        if (exception)
            throw exception;

        return result;
    }

    async updateDataSchema(dataSchema: DataSchema): Promise<DataSchema> {
        let session, result, exception: HttpException;

        // get session
        try {
            session = await this.pool.acquire();
        } catch (error) {
            throw new ServiceUnavailableException();
        }

        if (!dataSchema.id)
            throw new BadRequestException();

        const params = { ...dataSchema };
        delete params.id;

        try {
            result = await session.update(dataSchema.id)
                .set(params)
                .one();

            result = new DataSchema(result);
            await session.close();
        } catch (error) {
            exception = error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await session.close();

        if (exception)
            throw exception;

        return result;
    }

    async deleteDataSchema(rid): Promise<any> {
        let session, result, exception: HttpException;

        // get session
        try {
            session = await this.pool.acquire();
        } catch (error) {
            throw new ServiceUnavailableException();
        }

        if (!rid)
            throw new BadRequestException();

        try {
            result = session.delete("VERTEX", 'DataSchema')
                .where('@rid = ' + rid)
                .one();
            await session.close();
        } catch (error) {
            exception = error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await session.close();

        if (exception)
            throw exception;

        return result;
    }
}
