import { Body, Controller, Get, Param, Post, Query, Patch } from '@nestjs/common';
import { PayrollProcessingService } from './payroll.processing.service';
import { ApprovePreRunAdjustmentDto, CreatePreRunAdjustmentDto, RejectPreRunAdjustmentDto, UpdatePreRunAdjustmentDto, PreRunAdjustmentType } from '../../dto/payroll-process/pre.run.adjustment.dto';

@Controller('payroll.processing')
export class PayrollProcessingController {
  constructor(private readonly service: PayrollProcessingService) {}

  @Get('pre-run/pending')
  listPending(@Query('departmentId') departmentId?: string, @Query('type') type?: PreRunAdjustmentType) {
    return this.service.listPendingAdjustments(departmentId, type);
  }

  @Post('pre-run/seed-demo')
  async seedDemo() {
    const created = await this.service.seedDemoAdjustments();
    return { created };
  }

  @Post('pre-run')
  create(@Body() dto: CreatePreRunAdjustmentDto) {
    return this.service.createAdjustment(dto);
  }

  @Post('pre-run/:id/approve')
  approve(@Param('id') id: string, @Body() dto: ApprovePreRunAdjustmentDto) {
    return this.service.approveAdjustment(id, dto.actorId);
  }

  @Post('pre-run/:id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectPreRunAdjustmentDto) {
    return this.service.rejectAdjustment(id, dto.reason, dto.actorId);
  }

  @Patch('pre-run/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePreRunAdjustmentDto) {
    return this.service.updateAdjustment(id, dto);
  }
}
