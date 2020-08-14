import { Injectable } from '@nestjs/common';
import { SchemaRepository } from './schema.repository';
import DataSchema from './dataSchema';
import CreateDataSchemaDto from './dto/createDataSchema.dto';
import UpdateDataSchemaDto from './dto/updateDataSchema.dto';

@Injectable()
export class SchemaService {
    constructor(private schemaRepository: SchemaRepository) { }

    public async getDataSchemas(userId: string): Promise<DataSchema[]> {
        const dataSchemas = await this.schemaRepository.getDataSchemas(userId);

        for (let i in dataSchemas)
            dataSchemas[i] = await this.getDataSchemaById(dataSchemas[i].id);

        return dataSchemas;
    }

    public async getDataSchemaById(id: string): Promise<DataSchema> {
        return this.schemaRepository.getDataSchemaById(id);
    }

    public async addDataSchema(data: CreateDataSchemaDto, id: string): Promise<any> {
        const dataSchema = new DataSchema(data);
        dataSchema.schema = await addDataSchemaRecursive(dataSchema.schema, this.schemaRepository);
        return this.schemaRepository.addDataSchema(dataSchema, id);

        async function addDataSchemaRecursive(schemas: Array<DataSchema>, schemaRepository: SchemaRepository) {
            for (let i in schemas) {
                if (schemas[i].schema.length)
                    schemas[i].schema = await addDataSchemaRecursive(schemas[i].schema, schemaRepository);

                schemas[i] = new DataSchema(await schemaRepository.addDataSchema(schemas[i], id));
            }

            return schemas;
        }
    }

    public async updateDataSchema(data: UpdateDataSchemaDto, id: string): Promise<DataSchema> {
        const dataSchema = new DataSchema(data);
        dataSchema.schema = await updateDataSchemaRecursive(dataSchema.schema, this.schemaRepository);
        await this.schemaRepository.updateDataSchema(dataSchema);
        return dataSchema;

        async function updateDataSchemaRecursive(schemas: Array<DataSchema>, schemaRepository: SchemaRepository) {
            for (let i in schemas) {
                if (schemas[i].schema.length)
                    schemas[i].schema = await updateDataSchemaRecursive(schemas[i].schema, schemaRepository);

                if (schemas[i].id)
                    await schemaRepository.updateDataSchema(schemas[i]);
                else
                    schemas[i] = new DataSchema(await schemaRepository.addDataSchema(schemas[i], id));
            }
            
            return schemas;
        }
    }

    public async deleteDataSchema(rid: string): Promise<any> {
        return this.schemaRepository.deleteDataSchema(rid);
    }
}
