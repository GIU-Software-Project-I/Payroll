import { Body, Controller, Param, Post } from '@nestjs/common';
import { PayrollProcessingService } from './payroll.processing.service';
import {
  SigningBonusReviewDto,
  TerminationBenefitsReviewDto,
  ResignationBenefitsReviewDto,
  SigningBonusEditDto,
  TerminationBenefitsEditDto,
  ResignationBenefitsEditDto,
} from '../../dto/payroll-process/approval.action.dto';

@Controller('payroll-processing')
export class PayrollProcessingController {
  constructor(private readonly payrollProcessingService: PayrollProcessingService) {}

  // ============== REVIEW / APPROVAL ==============

  @Post('runs/:runId/signing-bonus/review')
  reviewSigningBonus(@Param('runId') runId: string, @Body() dto: SigningBonusReviewDto) {
    return this.payrollProcessingService.reviewSigningBonus(runId, dto);
  }

  @Post('runs/:runId/termination-benefits/review')
  reviewTerminationBenefits(
    @Param('runId') runId: string,
    @Body() dto: TerminationBenefitsReviewDto,
  ) {
    return this.payrollProcessingService.reviewTerminationBenefits(runId, dto);
  }

  @Post('runs/:runId/resignation-benefits/review')
  reviewResignationBenefits(
    @Param('runId') runId: string,
    @Body() dto: ResignationBenefitsReviewDto,
  ) {
    return this.payrollProcessingService.reviewResignationBenefits(runId, dto);
  }

  // ============== EDIT AMOUNTS ==============

  @Post('items/:itemId/signing-bonus/edit')
  editSigningBonus(@Param('itemId') itemId: string, @Body() dto: SigningBonusEditDto) {
    return this.payrollProcessingService.editSigningBonus(itemId, dto);
  }

  @Post('items/:itemId/termination-benefits/edit')
  editTerminationBenefits(
    @Param('itemId') itemId: string,
    @Body() dto: TerminationBenefitsEditDto,
  ) {
    return this.payrollProcessingService.editTerminationBenefits(itemId, dto);
  }

  @Post('items/:itemId/resignation-benefits/edit')
  editResignationBenefits(
    @Param('itemId') itemId: string,
    @Body() dto: ResignationBenefitsEditDto,
  ) {
    return this.payrollProcessingService.editResignationBenefits(itemId, dto);
  }

  // ============== INITIATE RUN ==============

  @Post('runs/:runId/initiate')
  initiatePayrollRun(@Param('runId') runId: string) {
    return this.payrollProcessingService.initiatePayrollRun(runId);
  }
}
