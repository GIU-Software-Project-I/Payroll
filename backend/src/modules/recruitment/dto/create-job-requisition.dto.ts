export class CreateJobRequisitionDto {
  templateId?: string;
  openings: number;
  location: string;
  hiringManagerId: string;
  expiryDate?: string;
}

