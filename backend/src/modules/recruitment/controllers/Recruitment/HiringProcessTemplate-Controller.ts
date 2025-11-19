import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { HiringProcessTemplateService } from '../../services/Recruitment/Hiring-Template-Service';

@Controller('hiring-process-templates')
export class HiringProcessTemplateController {
    constructor(private readonly hiringProcessTemplateService: HiringProcessTemplateService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.hiringProcessTemplateService.create(createDto);
    }

    @Get()
    findAll() {
        return this.hiringProcessTemplateService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.hiringProcessTemplateService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.hiringProcessTemplateService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.hiringProcessTemplateService.delete(id);
    }
}
