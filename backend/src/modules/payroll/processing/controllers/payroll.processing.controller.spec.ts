import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollProcessingController } from '../controllers/payroll.processing.controller';
import { PayrollProcessingService } from '../services/payroll.processing.service';
import { PayrollRun } from '../entities/payroll.run.schema';
import { expect } from '@jest/globals';

describe('PayrollProcessingController', () => {
  let controller: PayrollProcessingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollProcessingController],
      providers: [
        PayrollProcessingService,
        { provide: getModelToken(PayrollRun.name), useValue: {} },
      ],
    }).compile();

    controller = module.get<PayrollProcessingController>(PayrollProcessingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

