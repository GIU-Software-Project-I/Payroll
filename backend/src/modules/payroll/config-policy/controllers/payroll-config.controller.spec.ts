import { expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PayrollConfigController } from '../controllers/payroll-config.controller';

describe('PayrollConfigController', () => {
  let controller: PayrollConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollConfigController],
    }).compile();

    controller = module.get<PayrollConfigController>(PayrollConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
