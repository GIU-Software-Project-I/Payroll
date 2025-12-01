import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';

import {
    RequestCorrectionDto,
    ReviewCorrectionDto,
} from '../dto/AttendanceCorrectionDtos';
import {AttendanceCorrectionService} from "../services/AttendanceCorrectionService";

@Controller('attendance-correction')
export class AttendanceCorrectionController {
    constructor(
        private readonly correctionService: AttendanceCorrectionService,
    ) {}

    // Employee submits correction
    @Post('request')
    async request(@Body() dto: RequestCorrectionDto) {
        return this.correctionService.requestCorrection(dto);
    }

    // Manager reviews (approve/reject)
    @Put('review')
    async review(@Body() dto: ReviewCorrectionDto) {
        return this.correctionService.reviewCorrection(dto);
    }

    // Employee sees all his requests
    @Get(':employeeId')
    async employeeRequests(@Param('employeeId') id: string) {
        return this.correctionService.getEmployeeCorrections(id);
    }

    // Manager sees all pending
    @Get()
    async pending() {
        return this.correctionService.getPendingCorrections();
    }
}
