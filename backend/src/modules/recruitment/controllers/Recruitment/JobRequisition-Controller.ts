import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {JobRequisitionService} from "../../services/Recruitment/Job-Requisition-Service";


@Controller('job-requisitions')
export class JobRequisitionController {
    constructor(private readonly jobRequisitionService: JobRequisitionService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.jobRequisitionService.create(createDto);
    }

    @Get()
    findAll() {
        return this.jobRequisitionService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.jobRequisitionService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.jobRequisitionService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.jobRequisitionService.delete(id);
    }
}
