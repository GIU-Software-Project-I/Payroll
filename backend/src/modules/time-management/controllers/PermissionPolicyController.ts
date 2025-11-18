import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PermissionPolicyService } from '../services/PermissionPolicyService';

@Controller('permission-policies')
export class PermissionPolicyController {
    constructor(private readonly permissionPolicyService: PermissionPolicyService) {}

    @Post()
    create(@Body() body: any) {
        return this.permissionPolicyService.create(body);
    }

    @Get()
    findAll() {
        return this.permissionPolicyService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.permissionPolicyService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: any) {
        return this.permissionPolicyService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.permissionPolicyService.delete(id);
    }
}