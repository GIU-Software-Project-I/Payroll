import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

import { ShortTimePolicy } from '../models/ShortTimePolicy';
import {ShortTimePolicyService} from "../services/ShortTimePolicyService";

@Controller('short-time-policies')
export class ShortTimePolicyController {
    constructor(private readonly shortTimePolicyService: ShortTimePolicyService) {}

    @Get()
    async getAll() {
        return this.shortTimePolicyService.findAll();
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.shortTimePolicyService.findOne(id);
    }

    @Post()
    async create(@Body() policy: Partial<ShortTimePolicy>) {
        return this.shortTimePolicyService.create(policy);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateData: Partial<ShortTimePolicy>) {
        return this.shortTimePolicyService.update(id, updateData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const deleted = await this.shortTimePolicyService.delete(id);
        return { deleted };
    }
}
