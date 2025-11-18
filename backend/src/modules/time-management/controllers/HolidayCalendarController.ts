import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { HolidayCalendarService } from '../services/HolidayCalendarService';

@Controller('holidays')
export class HolidayCalendarController {
    constructor(private readonly holidayService: HolidayCalendarService) {}

    @Post()
    create(@Body() body: any) {
        return this.holidayService.create(body);
    }

    @Get()
    findAll() {
        return this.holidayService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.holidayService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.holidayService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.holidayService.delete(id);
    }
}