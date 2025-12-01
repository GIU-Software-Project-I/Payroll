export class CreateApplicationDto {
  candidateId: string;
  requisitionId: string;
  documents?: Array<{ filename: string; url: string }>;
  dataProcessingConsent: boolean;
}

