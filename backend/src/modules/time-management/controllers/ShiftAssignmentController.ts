import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ShiftAssignmentService } from '../services/ShiftAssignmentService';

@Controller('shift-assignments')
export class ShiftAssignmentController {
    constructor(private readonly shiftAssignmentService: ShiftAssignmentService) {}

    @Post()
    create(@Body() body: any) {
        return this.shiftAssignmentService.create(body);
    }

    @Get()
    findAll() {
        return this.shiftAssignmentService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.shiftAssignmentService.findOne(id);
    }

    @Get('employee/:employeeId')
    findByEmployee(@Param('employeeId') employeeId: string) {
        return this.shiftAssignmentService.findByEmployee(employeeId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.shiftAssignmentService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.shiftAssignmentService.delete(id);
    }
}