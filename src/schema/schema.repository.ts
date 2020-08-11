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
      const data = await this.db.select('*, out("Applies") as schema').from('DataSchema').where(params).one();

      if (data) {
        for (let i in data.schema)
          data.schema[i] = await this.getDataSchemaById(data.schema[i]);
      }
      
      return data ? new DataSchema(data) : null;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addDataSchema(dataSchema: DataSchema, userId: string): Promise<any> {
    const schema = dataSchema.schema.reduce(function (schemas, schema) {
      if (schema.id)
        schemas.push(schema.id);
        
      return schemas;
    }, []);

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
    let schemaChildLookup;

    try {
      const originalSchema = await this.getDataSchemaById(dataSchema.id);
      schemaChildLookup = originalSchema.schema.reduce((lookup, schema) => {
        lookup[schema.id] = true;
        return lookup;
      }, {});
    } catch(error) {
      schemaChildLookup = {};
    }

    const schema = dataSchema.schema.reduce(function (schemas, schema) {
      if (schema.id && !schemaChildLookup[schema.id])
        schemas.push(schema.id);
      else if (schemaChildLookup[schema.id])
        delete schemaChildLookup[schema.id];

      return schemas;
    }, []);
    
    const schemaChildIds = Object.keys(schemaChildLookup);

    if (!dataSchema.id)
      throw new BadRequestException();

    try {
      return this.db
        .let('deleteSchema', function (r) {
          if (schemaChildIds.length > 0) {
            schemaChildIds.forEach(id => {
              r.delete("VERTEX", 'DataSchema')
              .where('@rid = ' + id);
            })
          } else {
            r.select().from(dataSchema.id); // placeholder... I don't know how to return null
          }
        })
        .let('schema', function (s) {
          if (schema.length) {
            s.create('edge', 'Applies')
              .from(dataSchema.id).to(schema)
          } else {
            s.select().from(dataSchema.id); // placeholder... I don't know how to return null
          }
        })
        .let('dataSchema', function (d) {
          d.update(dataSchema.id)
            .set({
              unit: dataSchema.unit,
              name: dataSchema.name,
              key: dataSchema.key
            });
        })
        .commit().return('$dataSchema').one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDataSchema(rid): Promise<any> {
    if (!rid)
      throw new BadRequestException();

    try {
      const schemas = await this.db.query(`SELECT FROM (TRAVERSE out("Applies") FROM ${rid})`);
      schemas.forEach(schema => {
        this.db.delete("VERTEX", 'DataSchema')
          .where('@rid = ' + schema['@rid'])
          .one();
      });
      return true;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
