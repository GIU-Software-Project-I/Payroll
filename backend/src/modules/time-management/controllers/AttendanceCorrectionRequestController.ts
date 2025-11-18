import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { Types } from 'mongoose';
import {AttendanceCorrectionRequestService} from "../services/AttendanceCorrectionRequestService";

@Controller('attendance-correction-requests')
export class AttendanceCorrectionRequestController {
    constructor(private readonly correctionRequestService: AttendanceCorrectionRequestService) {}

    // CREATE
    @Post()
    async create(@Body() createDto: {
        employeeId: string;
        attendanceRecordId?: string;
        requestDate: Date;
        requestedClockIn?: Date;
        requestedClockOut?: Date;
        reason: string;
        currentApprover: string;
    }) {
        return this.correctionRequestService.create({
            ...createDto,
            employeeId: new Types.ObjectId(createDto.employeeId),
            attendanceRecordId: createDto.attendanceRecordId ? new Types.ObjectId(createDto.attendanceRecordId) : undefined,
            currentApprover: new Types.ObjectId(createDto.currentApprover)
        });
    }

    // READ - Get all
    @Get()
    async findAll() {
        return this.correctionRequestService.findAll();
    }

    // READ - Get by ID
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.correctionRequestService.findById(id);
    }

    // READ - Get by Employee
    @Get('employee/:employeeId')
    async findByEmployee(@Param('employeeId') employeeId: string) {
        return this.correctionRequestService.findByEmployee(employeeId);
    }

    // UPDATE - Approve
    @Put(':id/approve')
    async approve(@Param('id') id: string, @Body() body: { reviewedBy: string }) {
        return this.correctionRequestService.approve(id, new Types.ObjectId(body.reviewedBy));
    }

    // UPDATE - Reject
    @Put(':id/reject')
    async reject(@Param('id') id: string, @Body() body: { reviewedBy: string; rejectionReason: string }) {
        return this.correctionRequestService.reject(id, new Types.ObjectId(body.reviewedBy), body.rejectionReason);
    }

    // DELETE
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.correctionRequestService.delete(id);
    }
}