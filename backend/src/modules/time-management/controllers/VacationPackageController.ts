import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

import { VacationPackage } from '../models/VacationPackage';
import {VacationPackageService} from "../services/VacationPackageService";

@Controller('vacation-packages')
export class VacationPackageController {
    constructor(private readonly vacationPackageService: VacationPackageService) {}

    @Get()
    async getAll() {
        return this.vacationPackageService.findAll();
    }

    @Get(':name')
    async getOne(@Param('name') name: string) {
        return this.vacationPackageService.findOne(name);
    }

    @Post()
    async create(@Body() pkg: Partial<VacationPackage>) {
        return this.vacationPackageService.create(pkg);
    }

    @Put(':name')
    async update(@Param('name') name: string, @Body() updateData: Partial<VacationPackage>) {
        return this.vacationPackageService.update(name, updateData);
    }

    @Delete(':name')
    async remove(@Param('name') name: string) {
        const deleted = await this.vacationPackageService.delete(name);
        return { deleted };
    }
}
