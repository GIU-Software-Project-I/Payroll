import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SchedulingRuleService } from '../services/SchedulingRuleService';

@Controller('scheduling-rules')
export class SchedulingRuleController {
    constructor(private readonly schedulingRuleService: SchedulingRuleService) {}

    @Post()
    create(@Body() body: any) {
        return this.schedulingRuleService.create(body);
    }

    @Get()
    findAll() {
        return this.schedulingRuleService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.schedulingRuleService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.schedulingRuleService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.schedulingRuleService.delete(id);
    }
}