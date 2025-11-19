import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {ApplicationService} from "../../services/Recruitment/Application-Service";

@Controller('applications')
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.applicationService.create(createDto);
    }

    @Get()
    findAll() {
        return this.applicationService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.applicationService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.applicationService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.applicationService.delete(id);
    }
}
