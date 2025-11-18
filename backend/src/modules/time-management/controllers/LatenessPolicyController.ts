import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { LatenessPolicyService } from '../services/LatenessPolicyService';

@Controller('lateness-policies')
export class LatenessPolicyController {
    constructor(private readonly latenessPolicyService: LatenessPolicyService) {}

    @Post()
    create(@Body() body: any) {
        return this.latenessPolicyService.create(body);
    }

    @Get()
    findAll() {
        return this.latenessPolicyService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.latenessPolicyService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.latenessPolicyService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.latenessPolicyService.delete(id);
    }
}
