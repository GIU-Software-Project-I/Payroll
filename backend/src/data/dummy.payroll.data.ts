// backend/src/data/dummy.payroll.data.ts - SIMPLER VERSION
export const DummyPayrollRuns = [
  {
    runId: 'run-001',
    payrollPeriod: {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      month: 1,
      year: 2025,
    },
    status: 'draft',
    employees: [
      {
        employeeId: 'emp-001',
        hrEvent: 'normal',
        signingBonus: 0,
        terminationBenefits: 0,
        grossSalary: 5000,
        deductions: {
          taxes: 750,
          insurance: 450,
          penalties: 100,
        },
        netSalary: 3800,
        finalSalary: 3700,
      },
    ],
    irregularities: [], // EMPTY ARRAY FOR NOW
    approvals: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DummyExternalData = [
  {
    employeeId: 'emp-001',
    employeeData: {
      employmentType: 'full_time',
      baseSalary: 5000,
      department: 'Engineering',
      contractStatus: 'active',
    },
    timeData: {
      workedHours: 160,
      overtimeHours: 10,
      absentDays: 2,
    },
    leaveData: {
      unpaidLeaveDays: 2,
    },
    lastSynced: new Date(),
  },
];
