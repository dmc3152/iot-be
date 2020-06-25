import { Injectable, Inject, HttpException, HttpStatus, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { Device } from "./device";
import { constants } from "../constants";

@Injectable()
export class DeviceRepository {

  constructor(@Inject(constants.DATABASE_CLIENT) private pool: any) { }

  async getDevices(userId): Promise<Array<Device>> {
    let session;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    const params = { userId };

    // make request
    try {
      const result = await session.query('SELECT *, schema:{*} FROM (SELECT expand(devices) FROM User WHERE @rid = :userId)', {params}).all();
      const devices = result.map(device => {
          return new Device(device);
      });

      await session.close();
      return devices;
    } catch (error) {
      await session.close();
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDeviceByGuid(guid: string): Promise<Device> {
    let session;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    const params = { guid };

    // make request
    try {
      const result = await session.query('SELECT *, schema:{*} FROM Device WHERE guid = :guid', {params}).one();

      await session.close();
      return result ? new Device(result) : null;
    } catch (error) {
      await session.close();
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDeviceById(id: string): Promise<Device> {
    let session;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    const params = { id };

    // make request
    try {
      const result = await session.query('SELECT *, schema:{*} FROM Device WHERE @rid = :id', {params}).one();

      await session.close();
      return result ? new Device(result) : null;
    } catch (error) {
      await session.close();
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addDevice(device: Device, userId: string): Promise<any> {
    let session, result, exception: HttpException;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    const schema = device.schema.map(function (schema) {
      return schema.id;
    });
    delete device.schema;

    const params = { userId, ...device, schema };

    try {
      const batch = `begin;
            let $schema = (SELECT @rid FROM DataSchema WHERE @rid IN :schema);
            let $result = UPDATE User SET devices = devices || (INSERT INTO Device SET guid = uuid(), name = :name, data = :data, schema = $schema) WHERE @rid = :userId;
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

  async updateDevice(device: Device): Promise<Device> {
    let session, result, exception: HttpException;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    if (!device.guid)
      throw new BadRequestException();

    const params = { ...device };
    delete params.id;

    try {
      result = await session.update(device.id)
        .set(params)
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

  async deleteDevice(rid): Promise<any> {
    let session, result, exception: HttpException;

    // get session
    try {
      session = await this.pool.acquire();
    } catch(error) {
      throw new ServiceUnavailableException();
    }

    if (!rid)
      throw new BadRequestException();

    try {
      result = session.delete("VERTEX", 'Device')
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
