export class CreateOfferDto {
  applicationId: string;
  candidateId: string;
  hrEmployeeId?: string;
  role: string;
  grossSalary: number;
  signingBonus?: number;
  benefits: string[];
  insurances: string[];
  conditions: string[];
  content: string;
  deadline: string;
  approvers: Array<{ employeeId: string; role: string }>;
}

