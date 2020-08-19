import { Injectable } from '@nestjs/common';
import { DeviceDataRepository } from './deviceData.repository';
import { SchemaService } from '../schema/schema.service';
import DeviceData from './deviceData';

@Injectable()
export class DeviceDataService {
    constructor(
        private deviceDataRepository: DeviceDataRepository,
        private schemaService: SchemaService
    ) { }
    
    public async getDeviceDataById(id: string): Promise<DeviceData> {
        return this.deviceDataRepository.getDeviceDataById(id);
    }

    public async getDeviceDataByDevice(guid: string): Promise<DeviceData[]> {
        return this.deviceDataRepository.getDeviceDataByDevice(guid);
    }

    public async addDeviceData(deviceData: DeviceData, guid: string): Promise<DeviceData> {
        return this.deviceDataRepository.addDeviceData(deviceData, guid);
    }

    public async updateDeviceData(deviceData: DeviceData): Promise<DeviceData> {
        return this.deviceDataRepository.updateDeviceData(deviceData);
    }

    public async deleteDeviceData(rid: string): Promise<any> {
        return this.deviceDataRepository.deleteDeviceData(rid);
    }
}
