import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import {EmployeeService} from "../services/Employee-Service";


@Controller('employees')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) {}

    @Get()
    getAll() {
        return this.employeeService.getAll();
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.employeeService.getById(id);
    }

    @Post()
    create(@Body() data: any) {
        return this.employeeService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.employeeService.update(id, data);
    }


}
