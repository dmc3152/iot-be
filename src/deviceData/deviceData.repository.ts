import { Injectable, Inject, HttpException, HttpStatus, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { constants } from "../constants";
import DeviceData from 'src/deviceData/deviceData';

@Injectable()
export class DeviceDataRepository {

  constructor(@Inject(constants.DATABASE_CLIENT) private db: any) { }

  async getDeviceDataById(id): Promise<DeviceData> {
    const params = { '@rid': id };

    // make request
    try {
      const deviceData = await this.db.select().from('DeviceData').where(params).one();
      return deviceData ? new DeviceData(deviceData) : null;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDeviceDataByDevice(guid): Promise<DeviceData[]> {
    const params = { guid };

    // make request
    try {
      const deviceData = await this.db.select('expand(out("Stored"))').from('Device').where(params).one();
      return Array.isArray(deviceData) ? deviceData.map(data => new DeviceData(data)) : null;
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addDeviceData(deviceData, deviceGuid): Promise<DeviceData> {
    if (!deviceGuid)
      throw new BadRequestException();

    deviceData = new DeviceData(deviceData);

    try {
      return this.db
        .let('deviceData', function (dd) {
          dd.create('vertex', 'DeviceData')
            .set(deviceData)
        })
        .let('device', function (d) {
          d.select()
            .from('Device')
            .where({ guid: deviceGuid })
        })
        .let('owns', function (o) {
          o.create('edge', 'Stored')
            .from('$device').to('$deviceData')
        })
        .commit().return('$deviceData').one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateDeviceData(deviceData): Promise<DeviceData> {
    try {
      return this.db.update(deviceData.id).set(deviceData).one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteDeviceData(rid): Promise<any> {
    if (!rid)
      throw new BadRequestException();

    try {
      return this.db.delete("VERTEX", 'DeviceData')
        .where('@rid = ' + rid)
        .one();
    } catch (error) {
      throw error.code === 10 ? new ServiceUnavailableException() : new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
