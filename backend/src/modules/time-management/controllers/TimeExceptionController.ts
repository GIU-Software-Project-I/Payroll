import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

import { TimeException } from '../models/TimeException';
import {TimeExceptionService} from "../services/TimeExceptionService";

@Controller('time-exceptions')
export class TimeExceptionController {
    constructor(private readonly timeExceptionService: TimeExceptionService) {}

    @Get()
    async getAll() {
        return this.timeExceptionService.findAll();
    }

    @Get(':index')
    async getOne(@Param('index') index: number) {
        return this.timeExceptionService.findOne(index);
    }

    @Post()
    async create(@Body() exception: Partial<TimeException>) {
        return this.timeExceptionService.create(exception);
    }

    @Put(':index')
    async update(@Param('index') index: number, @Body() updateData: Partial<TimeException>) {
        return this.timeExceptionService.update(index, updateData);
    }

    @Delete(':index')
    async remove(@Param('index') index: number) {
        const deleted = await this.timeExceptionService.delete(index);
        return { deleted };
    }
}
