import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

import { Report } from '../models/TimeReport';
import {ReportService} from "../services/ReportService";

@Controller('reports')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @Get()
    async getAll() {
        return this.reportService.findAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.reportService.findOne(id);
    }

    @Post()
    async create(@Body() report: Partial<Report>) {
        return this.reportService.create(report);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateData: Partial<Report>) {
        return this.reportService.update(id, updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const deleted = await this.reportService.delete(id);
        return { deleted };
    }
}
