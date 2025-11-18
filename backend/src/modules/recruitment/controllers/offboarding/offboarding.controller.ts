import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { OffboardingService } from '../../services/offboarding/offboarding.service';

@Controller('offboarding-requests')
export class OffboardingController {
  constructor(private readonly offboardingService: OffboardingService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.offboardingService.create(createDto);
  }

  @Get()
  findAll() {
    return this.offboardingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offboardingService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.offboardingService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.offboardingService.delete(id);
  }
}

