import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { OvertimePolicyService } from '../services/OvertimePolicyService';

@Controller('overtime-policies')
export class OvertimePolicyController {
    constructor(private readonly overtimePolicyService: OvertimePolicyService) {}

    @Post()
    create(@Body() body: any) {
        return this.overtimePolicyService.create(body);
    }

    @Get()
    findAll() {
        return this.overtimePolicyService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.overtimePolicyService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.overtimePolicyService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.overtimePolicyService.delete(id);
    }
}