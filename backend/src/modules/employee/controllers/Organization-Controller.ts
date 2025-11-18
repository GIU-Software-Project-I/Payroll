import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { OrganizationService } from '../services/Organization-Service';

@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {}

    @Get('departments')
    getAllDepartments() {
        return this.organizationService.getAllDepartments();
    }

    @Get('departments/:id')
    getDepartmentById(@Param('id') id: string) {
        return this.organizationService.getDepartmentById(id);
    }

    @Post('departments')
    createDepartment(@Body() data: any) {
        return this.organizationService.createDepartment(data);
    }

    @Put('departments/:id')
    updateDepartment(@Param('id') id: string, @Body() data: any) {
        return this.organizationService.updateDepartment(id, data);
    }

    @Delete('departments/:id')
    deleteDepartment(@Param('id') id: string) {
        return this.organizationService.deleteDepartment(id);
    }

    @Get('positions')
    getAllPositions() {
        return this.organizationService.getAllPositions();
    }

    @Get('positions/:id')
    getPositionById(@Param('id') id: string) {
        return this.organizationService.getPositionById(id);
    }

    @Post('positions')
    createPosition(@Body() data: any) {
        return this.organizationService.createPosition(data);
    }

    @Put('positions/:id')
    updatePosition(@Param('id') id: string, @Body() data: any) {
        return this.organizationService.updatePosition(id, data);
    }

    @Delete('positions/:id')
    deletePosition(@Param('id') id: string) {
        return this.organizationService.deletePosition(id);
    }
}
