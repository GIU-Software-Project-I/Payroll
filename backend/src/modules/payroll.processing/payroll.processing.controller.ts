// backend/src/modules/payroll.processing/payroll.processing.controller.ts
import { Controller, Get, Post } from '@nestjs/common';
import { PayrollProcessingService } from './payroll.processing.service';

@Controller('payroll-processing')
export class PayrollProcessingController {
  constructor(private readonly payrollProcessingService: PayrollProcessingService) {}

  // ADD THIS ENDPOINT:
  @Post('seed-dummy-data')
  async seedDummyData() {
    return this.payrollProcessingService.seedDummyData();
  }

  // Your existing endpoints...
  @Get()
  async getAllPayrollRuns() {
    return this.payrollProcessingService.getAllPayrollRuns();
  }
}
