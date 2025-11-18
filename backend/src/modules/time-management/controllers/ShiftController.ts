import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

import { Shift } from '../models/Shift';
import {ShiftService} from "../services/ShiftService";

@Controller('shifts')
export class ShiftController {
    constructor(private readonly shiftService: ShiftService) {}

    @Get()
    async getAll() {
        return this.shiftService.findAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.shiftService.findOne(id);
    }

    @Post()
    async create(@Body() shift: Partial<Shift>) {
        return this.shiftService.create(shift);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateData: Partial<Shift>) {
        return this.shiftService.update(id, updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const deleted = await this.shiftService.delete(id);
        return { deleted };
    }
}
