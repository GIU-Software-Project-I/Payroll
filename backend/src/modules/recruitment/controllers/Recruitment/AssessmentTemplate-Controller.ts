import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {AssessmentTemplateService} from "../../services/Recruitment/AssesemntTemplate-Service";


@Controller('assessment-templates')
export class AssessmentTemplateController {
    constructor(private readonly assessmentTemplateService: AssessmentTemplateService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.assessmentTemplateService.create(createDto);
    }

    @Get()
    findAll() {
        return this.assessmentTemplateService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.assessmentTemplateService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.assessmentTemplateService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.assessmentTemplateService.delete(id);
    }
}
