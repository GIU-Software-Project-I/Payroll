/* eslint-disable prettier/prettier */
// src/modules/payroll-config/payroll-config.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

// Schemas
import { PayGrade, PayGradeSchema } from "../config-policy/entities/payroll-config.pay-grade.schema";
import { PayType, PayTypeSchema } from "../config-policy/entities/payroll-config.pay-type.schema";
import { Allowance, AllowanceSchema } from "../config-policy/entities/payroll-config.allowance.schema";
import { Bonus, BonusSchema } from "../config-policy/entities/payroll-config.bonus.schema";
import { TerminationBenefit, TerminationBenefitSchema } from "../config-policy/entities/payroll-config.termination-benfit.schema";
import { CompanySettings, CompanySettingsSchema } from "../config-policy/entities/payroll-config.company-settings.schema";
import { Deduction, DeductionSchema } from "../config-policy/entities/payroll-config.deduction.schema";
import { InsuranceBracket, InsuranceBracketSchema } from "../config-policy/entities/payroll-config.insurance-bracket.schema";
import { ResignationCompensation, ResignationCompensationSchema } from "../config-policy/entities/payroll-config.resignation-compensation.schema";
import { TaxRule,TaxRuleSchema} from "../config-policy/entities/payroll-config.tax-rule.schema";
import { Approval,ApprovalSchema} from "../config-policy/entities/payroll-config.approval.schema";

// Service & Controller
import { PayrollConfigService } from "../config-policy/services/payroll-config.service";
import { PayrollConfigController } from "../config-policy/controllers/payroll-config.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PayGrade.name, schema: PayGradeSchema },
      { name: PayType.name, schema: PayTypeSchema },
      { name: Allowance.name, schema: AllowanceSchema },
      { name: Bonus.name, schema: BonusSchema },
      { name: TerminationBenefit.name, schema: TerminationBenefitSchema },
      { name: CompanySettings.name, schema: CompanySettingsSchema},
      { name: Deduction.name, schema: DeductionSchema},
      { name: InsuranceBracket.name, schema: InsuranceBracketSchema},
      { name: ResignationCompensation.name, schema: ResignationCompensationSchema},
      { name: TaxRule.name, schema: TaxRuleSchema},
      { name: Approval.name, schema: ApprovalSchema}
    ])
  ],
  controllers: [PayrollConfigController],
  providers: [PayrollConfigService],
  exports: [PayrollConfigService],
})
export class PayrollConfigModule {}
