import { Injectable } from '@nestjs/common';
import { SchemaRepository } from './schema.repository';
import DataSchema from './dataSchema';
import CreateDataSchemaDto from './dto/createDataSchema.dto';
import UpdateDataSchemaDto from './dto/updateDataSchema.dto';

@Injectable()
export class SchemaService {
    constructor(private schemaRepository: SchemaRepository) { }

    public async getDataSchemas(userId: string): Promise<DataSchema[]> {
        return this.schemaRepository.getDataSchemas(userId);
    }

    public async getDataSchemaById(id: string): Promise<DataSchema> {
        return this.schemaRepository.getDataSchemaById(id);
    }

    public async addDataSchema(data: CreateDataSchemaDto, id: string): Promise<any> {
        const dataSchema = new DataSchema(data);
        return this.schemaRepository.addDataSchema(dataSchema, id);
    }

    public async updateDataSchema(data: UpdateDataSchemaDto): Promise<DataSchema> {
        const dataSchema = new DataSchema(data);
        return this.schemaRepository.updateDataSchema(dataSchema);
    }

    public async deleteDataSchema(rid: string): Promise<any> {
        return this.schemaRepository.deleteDataSchema(rid);
    }
}
