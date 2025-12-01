export class SubmitResignationDto {
  employeeId: string;
  reason: string;
  employeeComments?: string;
  contractId?: string;
}
