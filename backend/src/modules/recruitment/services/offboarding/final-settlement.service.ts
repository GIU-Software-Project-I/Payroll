import { Injectable } from '@nestjs/common';

@Injectable()
export class FinalSettlementService {
  async create(createDto: any) {
    return {
      id: '1',
      offboardingRequestId: 'OBR001',
      employeeId: 'EMP001',
      grossAmount: 50000,
      totalDeductions: 5000,
      netPayable: 45000,
      status: 'draft',
      details: {
        salary: 40000,
        bonus: 5000,
        leaveEncashment: 5000,
        deductions: [
          { type: 'loan', amount: 3000 },
          { type: 'tax', amount: 2000 }
        ]
      },
      ...createDto
    };
  }

  async findAll() {
    return [
      {
        id: '1',
        offboardingRequestId: 'OBR001',
        employeeId: 'EMP001',
        grossAmount: 50000,
        totalDeductions: 5000,
        netPayable: 45000,
        status: 'draft',
        details: {
          salary: 40000,
          bonus: 5000,
          leaveEncashment: 5000
        }
      },
      {
        id: '2',
        offboardingRequestId: 'OBR002',
        employeeId: 'EMP002',
        grossAmount: 60000,
        totalDeductions: 6000,
        netPayable: 54000,
        status: 'processed',
        details: {
          salary: 50000,
          bonus: 10000
        }
      }
    ];
  }

  async findOne(id: string) {
    return {
      id,
      offboardingRequestId: 'OBR001',
      employeeId: 'EMP001',
      grossAmount: 50000,
      totalDeductions: 5000,
      netPayable: 45000,
      status: 'draft',
      details: {
        salary: 40000,
        bonus: 5000,
        leaveEncashment: 5000,
        deductions: [
          { type: 'loan', amount: 3000 },
          { type: 'tax', amount: 2000 }
        ]
      }
    };
  }

  async update(id: string, updateDto: any) {
    return {
      id,
      offboardingRequestId: 'OBR001',
      employeeId: 'EMP001',
      grossAmount: 50000,
      totalDeductions: 5000,
      netPayable: 45000,
      status: 'approved',
      details: {
        salary: 40000,
        bonus: 5000,
        leaveEncashment: 5000
      },
      ...updateDto
    };
  }

  async delete(id: string) {
    return { message: `Final Settlement ${id} deleted successfully` };
  }
}

