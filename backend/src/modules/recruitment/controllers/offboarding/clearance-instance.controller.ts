import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ClearanceInstanceService } from '../../services/offboarding/clearance-instance.service';

@Controller('clearance-instances')
export class ClearanceInstanceController {
  constructor(private readonly clearanceInstanceService: ClearanceInstanceService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.clearanceInstanceService.create(createDto);
  }

  @Get()
  findAll() {
    return this.clearanceInstanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clearanceInstanceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.clearanceInstanceService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.clearanceInstanceService.delete(id);
  }
}

