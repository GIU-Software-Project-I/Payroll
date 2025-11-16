// src/payroll/payroll.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Updated paths
import { PayGrade, PayGradeSchema } from '../../schemas/pay-grade.schema';
import { PayType, PayTypeSchema } from '../../schemas/pay-type.schema';
import { Allowance, AllowanceSchema } from '../../schemas/allowance.schema';
import { Bonus, BonusSchema } from '../../schemas/bonus.schema';
import { TerminationBenefit, TerminationBenefitSchema } from '../../schemas/termination-benfit.schema';

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
