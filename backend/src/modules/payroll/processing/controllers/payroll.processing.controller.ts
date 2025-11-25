// backend/src/module/payroll.processing/payroll.processing.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { PayrollProcessingService } from '../services/payroll.processing.service';

@Controller('payroll-processing')
export class PayrollProcessingController {
  constructor(private readonly payrollProcessingService: PayrollProcessingService) {}

  @Post('seed-dummy-data')
  async seedDummyData() {
    return this.payrollProcessingService.seedDummyData();
  }

  @Get()
  async getAllPayrollRuns() {
    return this.payrollProcessingService.getAllPayrollRuns();
  }
}
