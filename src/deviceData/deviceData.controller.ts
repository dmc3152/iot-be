import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { DeviceDataService } from './deviceData.service';
import JwtAuthenticationGuard from 'src/auth/jwt-authentication.guard';
import DeviceData from './deviceData';

@Controller('deviceData')
export class DeviceDataController {
    constructor(private deviceDataService: DeviceDataService) { }

    @UseGuards(JwtAuthenticationGuard)
    @Get(':id')
    async getDeviceData(@Param('id') id) {
        return await this.deviceDataService.getDeviceDataById(id);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get('/device/:guid')
    async getDeviceDataByDevice(@Param('guid') guid) {
        return await this.deviceDataService.getDeviceDataByDevice(guid);
    }

    @Post('/device/:guid')
    async addDevice(@Body() deviceData: DeviceData, @Param('guid') guid) {
        return await this.deviceDataService.addDeviceData(deviceData, guid);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Put()
    async updateDevice(@Body() deviceData: DeviceData) {
        return await this.deviceDataService.updateDeviceData(deviceData);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Delete(':rid')
    async deleteDevice(@Param('rid') rid) {
        return await this.deviceDataService.deleteDeviceData(rid);
    }
}
