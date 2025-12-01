import { Types } from 'mongoose';

export class InitiateOnboardingDto {
  candidateId: string;
  contractId: string;
  signedContractPath: string;
  requiredForms: Array<{
    filePath: string;
    uploadedAt?: Date;
  }>;
  requiredTemplates: Array<{
    filePath: string;
    uploadedAt?: Date;
  }>;
}

export class CreateOnboardingChecklistDto {
  employeeId: string;
  contractId: string;
  tasks: Array<{
    name: string;
    department: string;
    status?: string;
    deadline?: Date;
    notes?: string;
  }>;
}

export class AccessContractDetailsDto {
  employeeId: string;
  contractId: string;
}

export class GetOnboardingTrackerDto {
  employeeId: string;
}

export class UploadDocumentDto {
  employeeId: string;
  type: string;
  filePath: string;
  fileName?: string;
}

export class ProvisionSystemAccessDto {
  employeeId: string;
  systems: string[];
  credentials?: Record<string, any>;
}

export class ReserveEquipmentDto {
  employeeId: string;
  equipment: string[];
  deskNumber: string;
  accessCardNumber: string;
}

export class ScheduleAccountProvisioningDto {
  employeeId: string;
  startDate: Date;
  exitDate?: Date;
  accounts: Array<{
    accountType: string;
    username?: string;
  }>;
}

export class InitiatePayrollDto {
  employeeId: string;
  contractId: string;
  startDate: Date;
}

export class ProcessSigningBonusDto {
  employeeId: string;
  contractId: string;
}

export class UpdateOnboardingTaskDto {
  onboardingId: string;
  taskName: string;
  status: string;
  notes?: string;
  documentId?: Types.ObjectId;
}

