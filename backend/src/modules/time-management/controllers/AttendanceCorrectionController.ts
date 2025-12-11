import { Controller, Post, Body, Get, Param, Put, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

import {
    RequestCorrectionDto,
    ReviewCorrectionDto,
} from '../dto/AttendanceCorrectionDtos';
import { AttendanceCorrectionService } from "../services/AttendanceCorrectionService";

@ApiExtraModels(RequestCorrectionDto)
@Controller('attendance-correction')
export class AttendanceCorrectionController {
    constructor(
        private readonly correctionService: AttendanceCorrectionService,
    ) {}

    // Employee submits incorrect-punch correction only
    @Post('request')
    @ApiOperation({ summary: 'Create an INCORRECT_PUNCH attendance correction request' })
    @ApiBody({ schema: { $ref: getSchemaPath(RequestCorrectionDto) }, examples: {
        'IncorrectPunch': { summary: 'Incorrect punch request', value: {
            employeeId: '674c1a1b2c3d4e5f6a7b8c9d',
            attendanceRecordId: '674c1a1b2c3d4e5f6a7b8d01',
            // correctedPunchDate (dd/MM/yyyy) + correctedPunchLocalTime (HH:mm)
            correctedPunchDate: '10/12/2025',
            correctedPunchLocalTime: '17:00',
            reason: 'Wrong timestamp recorded'
        } }
    } })
    @ApiResponse({ status: 201, description: 'Request created' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    async request(@Body() dto: RequestCorrectionDto) {
        // This endpoint only handles INCORRECT_PUNCH requests (represented by providing correctedPunchDate/local time)

        if (!dto.attendanceRecordId) throw new BadRequestException('attendanceRecordId required for punch-related requests');

        // Require correctedPunchDate and correctedPunchLocalTime per schema
        if (!dto.correctedPunchDate || !dto.correctedPunchLocalTime) {
            throw new BadRequestException('Provide correctedPunchDate (dd/MM/yyyy) and correctedPunchLocalTime (HH:mm)');
        }

        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dto.correctedPunchDate)) throw new BadRequestException('correctedPunchDate must be in dd/MM/yyyy format');
        if (!/^\d{2}:\d{2}$/.test(dto.correctedPunchLocalTime)) throw new BadRequestException('correctedPunchLocalTime must be in HH:mm format');
        const [cDay, cMonth, cYear] = dto.correctedPunchDate.split('/').map(s => parseInt(s, 10));
        const [cHour, cMinute] = dto.correctedPunchLocalTime.split(':').map(s => parseInt(s, 10));
        const ct = new Date(cYear, cMonth - 1, cDay, cHour, cMinute, 0, 0);
        if (isNaN(ct.getTime())) throw new BadRequestException('Invalid corrected punch date/time');
        const correctedIso = ct.toISOString();

        // Check the attendance record via service helper
        const check = await this.correctionService.checkIncorrectPunch(dto.attendanceRecordId, correctedIso);
        if (!check.ok) {
            if (check.reason === 'ATTENDANCE_NOT_FOUND') throw new BadRequestException('Attendance record not found');
            if (check.reason === 'NO_OUT_PUNCH') return { ok: false, message: 'No punch OUT found on this attendance record. Consider using Missing Punch request.' };
            if (check.reason === 'INVALID_CORRECTED_TIME') throw new BadRequestException('correctedPunchTime must be a valid ISO 8601 timestamp');
            return { ok: false, message: 'Unable to process request' };
        }

        // If recorded out equals corrected time (within tolerance), report redundant
        if (check.same) {
            return {
                ok: false,
                message: 'Redundant correction: entered correctedPunchTime equals the recorded OUT time',
                recordedOut: check.recordedOut,
                correctedTime: check.correctedTime,
            };
        }

        // Otherwise create correction request
        const created = await this.correctionService.requestCorrection({ employeeId: dto.employeeId, attendanceRecordId: dto.attendanceRecordId, reason: dto.reason || 'Incorrect punch submitted' });
        await this.correctionService.recordCorrectionDetails((created as any)._id?.toString() || String((created as any)._id), {
            type: 'INCORRECT_PUNCH',
            correctedIso,
            correctedPunchDate: dto.correctedPunchDate || null,
            correctedPunchLocalTime: dto.correctedPunchLocalTime || null,
            recordedOut: check.recordedOut,
        });

        return created;
    }

    // Manager reviews (approve/reject)
    @Put('review')
    @ApiOperation({ summary: 'Review Correction Request (Approve/Reject)' })
    @ApiResponse({ status: 200, description: 'Updated correction request' })
    async review(@Body() dto: ReviewCorrectionDto) {
        return this.correctionService.reviewCorrection(dto);
    }

    // Employee sees all his requests
    @Get(':employeeId')
    @ApiOperation({ summary: "Get all correction requests for an employee" })
    @ApiResponse({ status: 200, description: 'List of correction requests' })
    async employeeRequests(@Param('employeeId') id: string) {
        return this.correctionService.getEmployeeCorrections(id);
    }

    // Manager sees all pending
    @Get()
    @ApiOperation({ summary: 'Get all pending correction requests' })
    @ApiResponse({ status: 200, description: 'List of pending corrections' })
    async pending() {
        return this.correctionService.getPendingCorrections();
    }
}
