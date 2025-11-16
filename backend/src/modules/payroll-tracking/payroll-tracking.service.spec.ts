// backend/src/modules/payroll-config/payroll-config.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PayrollConfigService } from './payroll-tracking.service';

describe('PayrollConfigService', () => {
  let service: PayrollConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollConfigService],
    }).compile();

    service = module.get<PayrollConfigService>(PayrollConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
