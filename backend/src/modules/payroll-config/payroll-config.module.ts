// src/payroll/payroll.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Updated paths
import { PayGrade, PayGradeSchema } from '../../schemas/payroll-config.pay-grade.schema';
import { PayType, PayTypeSchema } from '../../schemas/payroll-config.pay-type.schema';
import { Allowance, AllowanceSchema } from '../../schemas/payroll-config.allowance.schema';
import { Bonus, BonusSchema } from '../../schemas/payroll-config.bonus.schema';
import { TerminationBenefit, TerminationBenefitSchema } from '../../schemas/payroll-config.termination-benfit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PayGrade.name, schema: PayGradeSchema },
      { name: PayType.name, schema: PayTypeSchema },
      { name: Allowance.name, schema: AllowanceSchema },
      { name: Bonus.name, schema: BonusSchema },
      { name: TerminationBenefit.name, schema: TerminationBenefitSchema },
    ]),
  ],
  exports: [
    MongooseModule,
  ],
})
export class PayrollConfigModule {}
