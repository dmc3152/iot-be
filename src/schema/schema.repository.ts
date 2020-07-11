import { Injectable, Inject, HttpException, HttpStatus, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { DataSchema } from "./dataSchema";
import { constants } from "../constants";

@Injectable()
export class SchemaRepository {

    constructor(@Inject(constants.DATABASE_CLIENT) private db: any) { }

    async getDataSchemas(userId): Promise<Array<DataSchema>> {
        try {
            const result = await this.db.select('expand(out("Created"))').from('User').where({ '@rid': userId }).all();
            return result.map(dataSchema => new DataSchema(dataSchema));
        } catch (error) {
            throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getDataSchemaById(id: string): Promise<DataSchema> {
        const params = { '@rid': id };

        // make request
        try {
            const schema = await this.db.select('*, out("Applies") as schema').from('DataSchema').where(params).one();
            return schema ? new DataSchema(schema) : null;
        } catch (error) {
            throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async addDataSchema(dataSchema: DataSchema, userId: string): Promise<any> {
        const schema = dataSchema.schema.map(function (schema) {
            return schema.id;
        });

        try {
            return this.db.let('dataSchema', function (d) {
                d.create('vertex', 'DataSchema')
                  .set({
                    unit: dataSchema.unit,
                    name: dataSchema.name,
                    key: dataSchema.key
                  })
              })
                .let('owns', function (o) {
                  o.create('edge', 'Created')
                    .from(userId).to('$dataSchema')
                })
                .let('schema', function (s) {
                  if (schema.length) {
                    s.create('edge', 'Applies')
                      .from('$dataSchema').to(schema)
                  } else {
                    s.select().from('$dataSchema'); // placeholder... I don't know how to return null
                  }
                })
                .commit().return('$dataSchema').one();
        } catch (error) {
            throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // TODO: determine how to handle updating child schema associations on update
    async updateDataSchema(dataSchema: DataSchema): Promise<DataSchema> {
        if (!dataSchema.id)
            throw new BadRequestException();

        const params = { ...dataSchema };
        delete params.id;
        
        try {
            return await this.db.update(dataSchema.id)
              .set(params)
              .one();
          } catch (error) {
            throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }

    async deleteDataSchema(rid): Promise<any> {
        if (!rid)
            throw new BadRequestException();
            
        try {
            return this.db.delete("VERTEX", 'DataSchema')
              .where('@rid = ' + rid)
              .one();
          } catch (error) {
            throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
          }
    }
}
