export interface PayrollExceptionDto {
  id?: string;
  employeeId: string;
  payrollRunId?: string;
  code: string;
  message: string;
  field?: string; // e.g., 'bankAccount', 'netPay'
  resolved?: boolean;
  createdAt?: string;
  resolvedAt?: string | null;
}
