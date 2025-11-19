import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AssetReturnRecordService } from '../../services/offboarding/asset-return-record.service';

@Controller('asset-return-records')
export class AssetReturnRecordController {
  constructor(private readonly assetReturnRecordService: AssetReturnRecordService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.assetReturnRecordService.create(createDto);
  }

  @Get()
  findAll() {
    return this.assetReturnRecordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetReturnRecordService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.assetReturnRecordService.update(id, updateDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.assetReturnRecordService.delete(id);
  }
}

