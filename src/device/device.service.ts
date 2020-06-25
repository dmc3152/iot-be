import { Injectable } from '@nestjs/common';
import { DeviceRepository } from './device.repository';
import Device from './device';
import UpdateDeviceDto from './dto/updateDevice.dto';
import CreateDeviceDto from './dto/createDevice.dto';

@Injectable()
export class DeviceService {
    constructor(private deviceRepository: DeviceRepository) { }

    public async getDevices(userId: string): Promise<Device[]> {
        return this.deviceRepository.getDevices(userId);
    }

    public async getDeviceByGuid(guid: string) {
        return this.deviceRepository.getDeviceByGuid(guid);
    }

    public async getDeviceById(id: string) {
        return this.deviceRepository.getDeviceById(id);
    }

    public async addDevice(data: CreateDeviceDto, userId: string): Promise<any> {
        const device = new Device(data);
        return this.deviceRepository.addDevice(device, userId);
    }

    public async updateDevice(data: UpdateDeviceDto): Promise<any> {
        const device = new Device(data);
        return this.deviceRepository.updateDevice(device);
    }

    public async deleteDevice(rid: string): Promise<any> {
        return this.deviceRepository.deleteDevice(rid);
    }
}
