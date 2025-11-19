import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {InterviewService} from "../../services/Recruitment/Interview-Service";


@Controller('interviews')
export class InterviewController {
    constructor(private readonly interviewService: InterviewService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.interviewService.create(createDto);
    }

    @Get()
    findAll() {
        return this.interviewService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.interviewService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.interviewService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.interviewService.delete(id);
    }
}
