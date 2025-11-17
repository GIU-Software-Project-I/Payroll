import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PayrollWorkflowService } from './payroll-workflow.service';
import { ApprovalResult } from '../payroll-process/approval.result.dto';
import { ReviewNoteDto } from '../payroll-process/review.note.dto';

@Controller('payroll-workflow')
export class PayrollWorkflowController {
  constructor(private svc: PayrollWorkflowService) {}

  @Post(':id/create')
  create(@Param('id') id: string, @Body() body: { exceptions?: any[] }) {
    return this.svc.createRun(id, body.exceptions ?? []);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.svc.publishForReview(id);
  }

  @Post(':id/manager')
  managerDecision(@Param('id') id: string, @Body() body: { result: ApprovalResult; note?: ReviewNoteDto }) {
    return this.svc.managerDecision(id, body.result, body.note);
  }

  @Post(':id/finance')
  financeDecision(@Param('id') id: string, @Body() body: { result: ApprovalResult; note?: ReviewNoteDto }) {
    return this.svc.financeDecision(id, body.result, body.note);
  }

  @Post(':id/unfreeze')
  unfreeze(@Param('id') id: string, @Body() body: { justification: string }) {
    return this.svc.unfreezeRun(id, body.justification);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.getRun(id);
  }
}
