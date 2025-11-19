import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ClearanceChecklistTemplateService } from '../../services/offboarding/clearance-checklist-template.service';

@Controller('clearance-checklist-templates')
export class ClearanceChecklistTemplateController {
  constructor(private readonly clearanceChecklistTemplateService: ClearanceChecklistTemplateService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.clearanceChecklistTemplateService.create(createDto);
  }

  @Get()
  findAll() {
    return this.clearanceChecklistTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clearanceChecklistTemplateService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.clearanceChecklistTemplateService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.clearanceChecklistTemplateService.delete(id);
  }
}

