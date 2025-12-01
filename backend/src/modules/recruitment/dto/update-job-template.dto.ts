export class UpdateJobTemplateDto {
  title?: string;
  description?: string;
  responsibilities?: string[];
  qualifications?: string[];
  salaryRange?: { min: number; max: number };
}

