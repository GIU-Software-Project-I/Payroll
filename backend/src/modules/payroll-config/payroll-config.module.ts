// src/modules/payroll-config/payroll-config.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

// Phase 1 schemas
import { PayGrade, PayGradeSchema } from "../../schemas/payroll-config.pay-grade.schema";
import { PayType, PayTypeSchema } from "../../schemas/payroll-config.pay-type.schema";
import { Allowance, AllowanceSchema } from "../../schemas/payroll-config.allowance.schema";
import { Bonus, BonusSchema } from "../../schemas/payroll-config.bonus.schema";
import { TerminationBenefit, TerminationBenefitSchema } from "../../schemas/payroll-config.termination-benfit.schema";

// Phase 2 & 3 schemas
import { TaxRule } from "../../schemas/payroll-config.TaxRuleSchema";
import { InsuranceBracket } from "../../schemas/payroll-config.InsuranceBracketSchema";
import { LegalUpdate } from "../../schemas/payroll-config.LegalUpdateSchema";
import { SystemSetting } from "../../schemas/payroll-config.SystemSettingSchema";
import { BackupRoutine } from "../../schemas/payroll-config.BackupRoutineSchema";

// Service & Controller
import { PayrollConfigService } from "./payroll-config/payroll-config.service";
import { PayrollConfigController } from "./payroll-config/payroll-config.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      // Phase 1
      { name: PayGrade.name, schema: PayGradeSchema },
      { name: PayType.name, schema: PayTypeSchema },
      { name: Allowance.name, schema: AllowanceSchema },
      { name: Bonus.name, schema: BonusSchema },
      { name: TerminationBenefit.name, schema: TerminationBenefitSchema },

      // Phase 2 & 3
      { name: "TaxRule", schema: TaxRule.schema },
      { name: "InsuranceBracket", schema: InsuranceBracket.schema },
      { name: "LegalUpdate", schema: LegalUpdate.schema },
      { name: "SystemSetting", schema: SystemSetting.schema },
      { name: "BackupRoutine", schema: BackupRoutine.schema },
    ])
  ],
  controllers: [PayrollConfigController],
  providers: [PayrollConfigService],
  exports: [PayrollConfigService],
})
export class PayrollConfigModule {}
