import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollProcessingController } from './payroll.processing.controller';
import { PayrollProcessingService } from './payroll.processing.service';
import { ApprovalAction } from '../../schemas/payroll-processing/approval.action.schema';
import { PayrollItem } from '../../schemas/payroll-processing/payroll.item.schema';
import { PayrollRun } from '../../schemas/payroll-processing/payroll.run.schema';

describe('PayrollProcessingController', () => {
  let controller: PayrollProcessingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollProcessingController],
      providers: [
        PayrollProcessingService,
        { provide: getModelToken(ApprovalAction.name), useValue: {} },
        { provide: getModelToken(PayrollItem.name), useValue: {} },
        { provide: getModelToken(PayrollRun.name), useValue: {} },
      ],
    }).compile();

    controller = module.get<PayrollProcessingController>(PayrollProcessingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
