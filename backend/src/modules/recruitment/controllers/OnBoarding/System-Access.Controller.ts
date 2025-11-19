import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {SystemAccessService} from "../../services/OnBoarding/System-Access.Service";


@Controller('system-accesses')
export class SystemAccessController {
    constructor(private readonly systemAccessService: SystemAccessService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.systemAccessService.create(createDto);
    }

    @Get()
    findAll() {
        return this.systemAccessService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.systemAccessService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.systemAccessService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.systemAccessService.delete(id);
    }
}
