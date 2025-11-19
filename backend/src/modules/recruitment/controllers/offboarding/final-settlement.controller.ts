import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { FinalSettlementService } from '../../services/offboarding/final-settlement.service';

@Controller('final-settlements')
export class FinalSettlementController {
  constructor(private readonly finalSettlementService: FinalSettlementService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.finalSettlementService.create(createDto);
  }

  @Get()
  findAll() {
    return this.finalSettlementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.finalSettlementService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.finalSettlementService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.finalSettlementService.delete(id);
  }
}

