import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import {PayrollInitialService} from "../../services/OnBoarding/Payroll-Initial.Service";


@Controller('payroll-initials')
export class PayrollInitialController {
    constructor(private readonly payrollInitialService: PayrollInitialService) {}

    @Post()
    create(@Body() createDto: any) {
        return this.payrollInitialService.create(createDto);
    }

    @Get()
    findAll() {
        return this.payrollInitialService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.payrollInitialService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return this.payrollInitialService.update(id, updateDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.payrollInitialService.delete(id);
    }
}
