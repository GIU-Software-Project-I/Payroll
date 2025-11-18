import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PunchRecordService } from '../services/PunchRecordService';

@Controller('punch-records')
export class PunchRecordController {
    constructor(private readonly punchRecordService: PunchRecordService) {}

    @Post()
    create(@Body() body: any) {
        return this.punchRecordService.create(body);
    }

    @Get()
    findAll() {
        return this.punchRecordService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.punchRecordService.findOne(id);
    }

    @Get('employee/:employeeId')
    findByEmployee(@Param('employeeId') employeeId: string) {
        return this.punchRecordService.findByEmployee(employeeId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.punchRecordService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.punchRecordService.delete(id);
    }
}