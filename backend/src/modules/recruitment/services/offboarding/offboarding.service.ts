import { Injectable } from '@nestjs/common';

@Injectable()
export class OffboardingService {
  async create(createDto: any) {
    return {
      id: '1',
      employeeId: 'EMP001',
      type: 'resignation',
      status: 'pending_approval',
      effectiveDate: new Date(),
      reason: 'Better opportunity',
      initiatedBy: 'EMP001',
      initiatedAt: new Date(),
      ...createDto
    };
  }

  async findAll() {
    return [
      {
        id: '1',
        employeeId: 'EMP001',
        type: 'resignation',
        status: 'pending_approval',
        effectiveDate: new Date(),
        reason: 'Better opportunity',
        initiatedBy: 'EMP001',
        initiatedAt: new Date()
      },
      {
        id: '2',
        employeeId: 'EMP002',
        type: 'termination',
        status: 'under_review',
        effectiveDate: new Date(),
        reason: 'Performance issues',
        initiatedBy: 'MGR001',
        initiatedAt: new Date()
      },
      {
        id: '3',
        employeeId: 'EMP003',
        type: 'retirement',
        status: 'completed',
        effectiveDate: new Date(),
        reason: 'Retirement age reached',
        initiatedBy: 'EMP003',
        initiatedAt: new Date()
      }
    ];
  }

  async findOne(id: string) {
    return {
      id,
      employeeId: 'EMP001',
      type: 'resignation',
      status: 'pending_approval',
      effectiveDate: new Date(),
      reason: 'Better opportunity',
      initiatedBy: 'EMP001',
      initiatedAt: new Date()
    };
  }

  async update(id: string, updateDto: any) {
    return {
      id,
      employeeId: 'EMP001',
      type: 'resignation',
      status: 'approved',
      effectiveDate: new Date(),
      reason: 'Better opportunity',
      initiatedBy: 'EMP001',
      initiatedAt: new Date(),
      approvedBy: 'MGR001',
      approvedAt: new Date(),
      ...updateDto
    };
  }

  async delete(id: string) {
    return { message: `Offboarding Request ${id} deleted successfully` };
  }
}

