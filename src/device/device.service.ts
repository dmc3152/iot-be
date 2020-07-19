import { Injectable } from '@nestjs/common';
import { DeviceRepository } from './device.repository';
import Device from './device';
import UpdateDeviceDto from './dto/updateDevice.dto';
import CreateDeviceDto from './dto/createDevice.dto';
import { SchemaService } from '../schema/schema.service';
import { DataSchema } from 'src/schema/dataSchema';
import UpdateDataSchemaDto from 'src/schema/dto/updateDataSchema.dto';

@Injectable()
export class DeviceService {
    constructor(
        private deviceRepository: DeviceRepository,
        private schemaService: SchemaService
    ) { }

    public async getDevices(userId: string): Promise<Device[]> {
        return this.deviceRepository.getDevices(userId);
    }

    public async getDeviceByGuid(guid: string) {
        const device = await this.deviceRepository.getDeviceByGuid(guid);

        for (let i in device.schema)
            device.schema[i] = await this.schemaService.getDataSchemaById(device.schema[i].id);

        return device;
    }

    public async getDeviceById(id: string) {
        const device = await this.deviceRepository.getDeviceById(id);

        for (let i in device.schema)
            device.schema[i] = await this.schemaService.getDataSchemaById(device.schema[i].id);

        return device;
    }

    public async addDevice(data: CreateDeviceDto, userId: string): Promise<any> {
        const device = new Device(data);
        device.schema = await addDataSchemas(device.schema, this.schemaService);
        return this.deviceRepository.addDevice(device, userId);

        async function addDataSchemas(schemas: Array<DataSchema>, schemaService: SchemaService) {
            for (let i in schemas) {
                if (!schemas[i].id)
                    schemas[i] = await schemaService.addDataSchema(schemas[i], userId);
            }

            return schemas;
        }
    }

    public async updateDevice(data: UpdateDeviceDto, userId: string): Promise<any> {
        const device = new Device(data);
        device.schema = await updateDataSchemas(device.schema, this.schemaService);
        return this.deviceRepository.updateDevice(device);

        async function updateDataSchemas(schemas: Array<DataSchema>, schemaService: SchemaService) {
            for (let i in schemas) {
                if (!schemas[i].id)
                    schemas[i] = await schemaService.addDataSchema(schemas[i], userId);
                else {
                    const schemaDto = <UpdateDataSchemaDto> {
                        '@rid': schemas[i].id,
                        'name': schemas[i].name,
                        'key': schemas[i].key,
                        'unit': schemas[i].unit,
                        'schema': schemas[i].schema
                    };
                    schemas[i] = await schemaService.updateDataSchema(schemaDto, userId);
                }
            }

            return schemas;
        }
    }

    public async deleteDevice(rid: string): Promise<any> {
        return this.deviceRepository.deleteDevice(rid);
    }
}
