// src/time-management/time-exception/time-exception.controller.ts

import { Controller, Post, Body, Get, Param, Query, Put } from '@nestjs/common';

import { CreateExceptionDto, AssignExceptionDto, UpdateExceptionStatusDto, ExceptionQueryDto } from '../dto/TimeExceptionDtos';
import {TimeExceptionService} from "../services/TimeExceptionService";

@Controller('time-exceptions')
export class TimeExceptionController {
    constructor(private readonly svc: TimeExceptionService) {}

    @Post()
    async create(@Body() dto: CreateExceptionDto) {
        return this.svc.createException(dto);
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.svc.getException(id);
    }

    @Get()
    async list(@Query() query: ExceptionQueryDto) {
        return this.svc.listExceptions(query);
    }

    @Put('assign')
    async assign(@Body() dto: AssignExceptionDto) {
        return this.svc.assignException(dto);
    }

    @Put('status')
    async updateStatus(@Body() dto: UpdateExceptionStatusDto) {
        return this.svc.updateStatus(dto);
    }
}
