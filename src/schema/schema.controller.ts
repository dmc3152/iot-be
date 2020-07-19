import { Controller, UseGuards, Get, Req, Param, Post, Body, Put, Delete } from '@nestjs/common';
import JwtAuthenticationGuard from 'src/auth/jwt-authentication.guard';
import { SchemaService } from './schema.service';
import RequestWithUser from 'src/auth/requestWithUser.interface';
import CreateDataSchemaDto from './dto/createDataSchema.dto';
import UpdateDataSchemaDto from './dto/updateDataSchema.dto';

@Controller('schema')
export class SchemaController {
    constructor(private schemaService: SchemaService) { }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    async getDataSchemas(@Req() request: RequestWithUser) {
        const userId = request.user.id;
        return await this.schemaService.getDataSchemas(userId);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get(':id')
    async getDataSchemaById(@Param('id') id) {
        return await this.schemaService.getDataSchemaById(id);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post()
    async addDataSchema(@Body() dataSchema: CreateDataSchemaDto, @Req() request: RequestWithUser) {
        const userId = request.user.id;
        return await this.schemaService.addDataSchema(dataSchema, userId);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Put()
    async updateDataSchema(@Body() dataSchema: UpdateDataSchemaDto, @Req() request: RequestWithUser) {
        const userId = request.user.id;
        return await this.schemaService.updateDataSchema(dataSchema, userId);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Delete(':rid')
    async deleteDataSchema(@Param('rid') rid) {
        return await this.schemaService.deleteDataSchema(rid);
    }
}
