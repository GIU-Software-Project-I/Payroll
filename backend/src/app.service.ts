import { Injectable } from '@nestjs/common';

@Injectable()
export class PayrollService {

  // ----- POLICIES -----
  createPolicy(policyDto: any): string {
    return 'createPolicy';
  }

  getAllPolicies(): string {
    return 'getAllPolicies';
  }

  updatePolicy(id: string, policyDto: any): string {
    return 'updatePolicy';
  }

  deletePolicy(id: string): string {
    return 'deletePolicy';
  }


  // ----- PAY GRADES -----
  createPayGrade(payGradeDto: any): string {
    return 'createPayGrade';
  }

  getAllPayGrades(): string {
    return 'getAllPayGrades';
  }

  updatePayGrade(id: string, payGradeDto: any): string {
    return 'updatePayGrade';
  }

  deletePayGrade(id: string): string {
    return 'deletePayGrade';
  }


  // ----- PAY TYPES -----
  createPayType(payTypeDto: any): string {
    return 'createPayType';
  }

  getAllPayTypes(): string {
    return 'getAllPayTypes';
  }

  updatePayType(id: string, payTypeDto: any): string {
    return 'updatePayType';
  }

  deletePayType(id: string): string {
    return 'deletePayType';
  }


  // ----- ALLOWANCES -----
  createAllowance(allowanceDto: any): string {
    return 'createAllowance';
  }

  getAllAllowances(): string {
    return 'getAllAllowances';
  }

  updateAllowance(id: string, allowanceDto: any): string {
    return 'updateAllowance';
  }

  deleteAllowance(id: string): string {
    return 'deleteAllowance';
  }


  // ----- SIGNING BONUSES -----
  createSigningBonus(bonusDto: any): string {
    return 'createSigningBonus';
  }

  getAllSigningBonuses(): string {
    return 'getAllSigningBonuses';
  }

  updateSigningBonus(id: string, bonusDto: any): string {
    return 'updateSigningBonus';
  }

  deleteSigningBonus(id: string): string {
    return 'deleteSigningBonus';
  }


  // ----- RESIGNATION / TERMINATION BENEFITS -----
  createTerminationBenefit(benefitDto: any): string {
    return 'createTerminationBenefit';
  }

  getAllTerminationBenefits(): string {
    return 'getAllTerminationBenefits';
  }

  updateTerminationBenefit(id: string, benefitDto: any): string {
    return 'updateTerminationBenefit';
  }

  deleteTerminationBenefit(id: string): string {
    return 'deleteTerminationBenefit';
  }

}
