export interface PayrollExceptionDto {
  id?: string;
  employeeId: string;
  payrollRunId?: string;
  code: string;
  message: string;
  field?: string; 
  resolved?: boolean;
  createdAt?: string;
  resolvedAt?: string | null;
}
