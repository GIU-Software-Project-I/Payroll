import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ClearanceDepartmentSignoffService } from '../../services/offboarding/clearance-department-signoff.service';

@Controller('clearance-department-signoffs')
export class ClearanceDepartmentSignoffController {
  constructor(private readonly clearanceDepartmentSignoffService: ClearanceDepartmentSignoffService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.clearanceDepartmentSignoffService.create(createDto);
  }

  @Get()
  findAll() {
    return this.clearanceDepartmentSignoffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clearanceDepartmentSignoffService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.clearanceDepartmentSignoffService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.clearanceDepartmentSignoffService.delete(id);
  }
}

