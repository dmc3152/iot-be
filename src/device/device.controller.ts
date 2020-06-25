import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { DeviceService } from './device.service';
import CreateDeviceDto from './dto/createDevice.dto';
import UpdateDeviceDto from './dto/updateDevice.dto';
import JwtAuthenticationGuard from 'src/auth/jwt-authentication.guard';
import RequestWithUser from 'src/auth/requestWithUser.interface';

@Controller('device')
export class DeviceController {
    constructor(private deviceService: DeviceService) { }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    async getDevices(@Req() request: RequestWithUser) {
        const userId = request.user.id;
        return await this.deviceService.getDevices(userId);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get(':id')
    async getDevice(@Param('id') id) {
        return await this.deviceService.getDeviceById(id);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post()
    async addDevice(@Body() device: CreateDeviceDto, @Req() request: RequestWithUser) {
        const userId = request.user.id;
        return await this.deviceService.addDevice(device, userId);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Put()
    async updateDevice(@Body() device: UpdateDeviceDto) {
        return await this.deviceService.updateDevice(device);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Delete(':rid')
    async deleteDevice(@Param('rid') rid) {
        return await this.deviceService.deleteDevice(rid);
    }
}
