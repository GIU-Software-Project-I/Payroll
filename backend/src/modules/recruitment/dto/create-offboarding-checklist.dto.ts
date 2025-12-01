export class CreateOffboardingChecklistDto {
  terminationId: string;
  equipmentList: Array<{
    equipmentId: string;
    name: string;
    returned?: boolean;
    condition?: string;
  }>;
}

