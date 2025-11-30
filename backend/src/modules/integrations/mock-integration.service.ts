import { Injectable } from '@nestjs/common';

@Injectable()
export class MockIntegrationService {
  // Employee contract / profile
  getEmployeeContract(employeeId: string) {
    // Dummy contract data
    return Promise.resolve({
      employeeId,
      baseSalary: 3000,
      employmentType: 'full-time',
      payFrequency: 'monthly',
      jobTitle: 'Software Engineer',
      contractStart: new Date('2023-01-01'),
    });
  }

  // Leaves encashment
  getEncashment(employeeId: string, payrollCycle: Date) {
    return Promise.resolve({
      employeeId,
      payrollCycle,
      encashmentAmount: 0,
      details: [],
    });
  }

  // Unpaid leave status
  getUnpaidLeaveStatus(employeeId: string, payrollCycle: Date) {
    return Promise.resolve({
      employeeId,
      payrollCycle,
      unpaidDays: 0,
      deductionAmount: 0,
    });
  }

  // Absenteeism records
  getAbsenteeism(employeeId: string, from: Date, to: Date) {
    return Promise.resolve([
      // example record referencing inputs so linter sees them used
      { employeeId, from, to, records: [] },
    ]);
  }
}
