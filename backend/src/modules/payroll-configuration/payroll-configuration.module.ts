import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PayrollConfigurationController } from './payroll-configuration.controller';
import { PayrollConfigurationService } from './payroll-configuration.service';

import { CompanyWideSettings, CompanyWideSettingsSchema } from '../../schemas/payroll-configuration/CompanyWideSettings.schema';
import { allowance, allowanceSchema } from '../../schemas/payroll-configuration/allowance.schema';
import { insuranceBrackets, insuranceBracketsSchema } from '../../schemas/payroll-configuration/insuranceBrackets.schema';
import { payrollPolicies, payrollPoliciesSchema } from '../../schemas/payroll-configuration/payrollPolicies.schema';
import { payType, payTypeSchema } from '../../schemas/payroll-configuration/payType.schema';
import { signingBonus, signingBonusSchema } from '../../schemas/payroll-configuration/signingBonus.schema';
import { taxRules, taxRulesSchema } from '../../schemas/payroll-configuration/taxRules.schema';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from '../../schemas/payroll-configuration/terminationAndResignationBenefits';
import { payGrade } from '../../schemas/payroll-configuration/payGrades.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: allowance.name, schema: allowanceSchema },
      { name: signingBonus.name, schema: signingBonusSchema },
      { name: taxRules.name, schema: taxRulesSchema },
      { name: insuranceBrackets.name, schema: insuranceBracketsSchema },
      { name: payType.name, schema: payTypeSchema },
      { name: payrollPolicies.name, schema: payrollPoliciesSchema },
      { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
      { name: CompanyWideSettings.name, schema: CompanyWideSettingsSchema },
      { name: payGrade.name, schema: payTypeSchema }
    ]),
  ],
  controllers: [PayrollConfigurationController],
  providers: [PayrollConfigurationService],
  exports:[PayrollConfigurationService]
})
export class PayrollConfigurationModule { }
