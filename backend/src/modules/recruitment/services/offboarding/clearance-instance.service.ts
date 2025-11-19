import { Injectable } from '@nestjs/common';

@Injectable()
export class ClearanceInstanceService {
  async create(createDto: any) {
    return {
      id: '1',
      offboardingRequestId: 'OBR001',
      employeeId: 'EMP001',
      templateId: 'TPL001',
      status: 'in_progress',
      checklistItems: [
        {
          code: 'IT_LAPTOP',
          title: 'Return Laptop',
          department: 'IT',
          status: 'pending',
          completedBy: null,
          completedAt: null
        }
      ],
      departmentSignoffs: [],
      ...createDto
    };
  }

  async findAll() {
    return [
      {
        id: '1',
        offboardingRequestId: 'OBR001',
        employeeId: 'EMP001',
        templateId: 'TPL001',
        status: 'in_progress',
        checklistItems: [
          {
            code: 'IT_LAPTOP',
            title: 'Return Laptop',
            department: 'IT',
            status: 'pending',
            completedBy: null,
            completedAt: null
          }
        ],
        departmentSignoffs: []
      },
      {
        id: '2',
        offboardingRequestId: 'OBR002',
        employeeId: 'EMP002',
        templateId: 'TPL001',
        status: 'fully_cleared',
        checklistItems: [
          {
            code: 'IT_LAPTOP',
            title: 'Return Laptop',
            department: 'IT',
            status: 'completed',
            completedBy: 'USER001',
            completedAt: new Date()
          }
        ],
        departmentSignoffs: [
          {
            department: 'IT',
            status: 'approved',
            signedBy: 'USER001',
            signedAt: new Date()
          }
        ]
      }
    ];
  }

  async findOne(id: string) {
    return {
      id,
      offboardingRequestId: 'OBR001',
      employeeId: 'EMP001',
      templateId: 'TPL001',
      status: 'in_progress',
      checklistItems: [
        {
          code: 'IT_LAPTOP',
          title: 'Return Laptop',
          department: 'IT',
          status: 'pending',
          completedBy: null,
          completedAt: null
        }
      ],
      departmentSignoffs: []
    };
  }

  async update(id: string, updateDto: any) {
    return {
      id,
      offboardingRequestId: 'OBR001',
      employeeId: 'EMP001',
      templateId: 'TPL001',
      status: 'partially_cleared',
      checklistItems: [
        {
          code: 'IT_LAPTOP',
          title: 'Return Laptop',
          department: 'IT',
          status: 'completed',
          completedBy: 'USER001',
          completedAt: new Date()
        }
      ],
      departmentSignoffs: [],
      ...updateDto
    };
  }

  async delete(id: string) {
    return { message: `Clearance Instance ${id} deleted successfully` };
  }
}

