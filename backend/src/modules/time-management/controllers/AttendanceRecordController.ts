import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AttendanceRecordService } from '../services/AttendanceRecordService';

@Controller('attendance-records')
export class AttendanceRecordController {
    constructor(private readonly attendanceRecordService: AttendanceRecordService) {}

    @Post()
    async create(@Body() createDto: any) {
        return this.attendanceRecordService.create(createDto);
    }

    @Get()
    async findAll() {
        return this.attendanceRecordService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.attendanceRecordService.findById(id);
    }

    @Get('employee/:employeeId')
    async findByEmployee(@Param('employeeId') employeeId: string) {
        return this.attendanceRecordService.findByEmployee(employeeId);
    }

    @Get('employee/:employeeId/range')
    async findByDateRange(
        @Param('employeeId') employeeId: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this.attendanceRecordService.findByDateRange(
            employeeId,
            new Date(startDate),
            new Date(endDate)
        );
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        return this.attendanceRecordService.update(id, updateDto);
    }

    @Put(':id/status')
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.attendanceRecordService.updateStatus(id, body.status);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.attendanceRecordService.delete(id);
    }
}