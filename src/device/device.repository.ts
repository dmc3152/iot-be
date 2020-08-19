import { Injectable, Inject, HttpException, HttpStatus, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { Device } from "./device";
import { constants } from "../constants";

@Injectable()
export class DeviceRepository {

  constructor(@Inject(constants.DATABASE_CLIENT) private db: any) { }

  async getDevices(userId): Promise<Array<Device>> {
    try {
      const result = await this.db.select('expand(out("Owns"))').from('User').where({ '@rid': userId }).all();
      const devices = result.map(device => {
        return new Device(device);
      });
      return devices;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDeviceByGuid(guid: string): Promise<Device> {
    const params = { guid };

    // make request
    try {
      // const result = await this.db.query('SELECT *, schema:{*} FROM Device WHERE guid = :guid', { params }).one();
      const device = await this.db.select('*, out("Uses") as schema').from('Device').where(params).one();
      device.schema = await this.db.select().from(device.schema).all();
      return device ? new Device(device) : null;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDeviceById(id: string): Promise<Device> {
    const params = { '@rid': id };

    // make request
    try {
      const device = await this.db.select('*, out("Uses") as schema').from('Device').where(params).one();
      device.schema = await this.db.select().from(device.schema).all();
      device.data = await this.db.select('expand(out("Stored"))').from('Device').where(params).all();
      return device ? new Device(device) : null;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // TODO: double check assigning DataSchema to Device
  async addDevice(device: Device, userId: string): Promise<any> {
    var db = this.db;
    const schema = device.schema.map(function (schema) {
      return schema.id;
    });

    try {
      return this.db.let('device', function (d) {
        d.create('vertex', 'Device')
          .set({
            guid: db.rawExpression("format('%s',uuid())"),
            name: device.name
          })
      })
        .let('owns', function (o) {
          o.create('edge', 'Owns')
            .from(userId).to('$device')
        })
        .let('schema', function (s) {
          if (schema.length) {
            s.create('edge', 'Uses')
              .from('$device').to(schema)
          } else {
            s.select().from('$device'); // placeholder... I don't know how to return null
          }
        })
        .commit().return('$device').one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDevice(device: Device): Promise<Device> {
    if (!device.guid || !device.id)
      throw new BadRequestException();

    let schemaChildLookup;

    try {
      const originalDevice = await this.getDeviceById(device.id);
      schemaChildLookup = originalDevice.schema.reduce((lookup, schema) => {
        lookup[schema.id] = true;
        return lookup;
      }, {});
    } catch(error) {
      schemaChildLookup = {};
    }

    const schema = device.schema.reduce(function (schemas, schema) {
      if (schema.id && !schemaChildLookup[schema.id])
        schemas.push(schema.id);
      else if (schemaChildLookup[schema.id])
        delete schemaChildLookup[schema.id];

      return schemas;
    }, []);
    
    const schemaChildIds = Object.keys(schemaChildLookup);

    try {
      return this.db.let('device', function (d) {
          d.update(device.id)
          .set({
            guid: device.guid,
            name: device.name
          })
        })
        .let('schema', function (s) {
          if (schema.length) {
            s.create('edge', 'Uses')
              .from(device.id).to(schema)
          } else {
            s.select().from('$device'); // placeholder... I don't know how to return null
          }
        })
        .let('deleteSchema', function (r) {
          if (schemaChildIds.length > 0) {
            schemaChildIds.forEach(id => {
              r.delete("EDGE", 'Uses')
              .from(device.id).to(id);
            })
          } else {
            r.select().from(device.id); // placeholder... I don't know how to return null
          }
        })
        .commit().return('$device').one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDevice(rid): Promise<any> {
    if (!rid)
      throw new BadRequestException();

    try {
      return this.db.delete("VERTEX", 'Device')
        .where('@rid = ' + rid)
        .one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
