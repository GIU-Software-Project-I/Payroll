import { Injectable } from '@nestjs/common';

@Injectable()
export class ClearanceChecklistTemplateService {
  async create(createDto: any) {
    return {
      id: '1',
      name: 'Standard Offboarding Checklist',
      description: 'Default checklist for full-time employees',
      items: [
        {
          code: 'IT_LAPTOP',
          title: 'Return Laptop',
          instructions: 'Return company laptop to IT department',
          required: true,
          department: 'IT'
        },
        {
          code: 'ID_CARD',
          title: 'Return ID Card',
          instructions: 'Return employee ID card to HR',
          required: true,
          department: 'HR'
        }
      ],
      ...createDto
    };
  }

  async findAll() {
    return [
      {
        id: '1',
        name: 'Standard Offboarding Checklist',
        description: 'Default checklist for full-time employees',
        items: [
          {
            code: 'IT_LAPTOP',
            title: 'Return Laptop',
            instructions: 'Return company laptop to IT department',
            required: true,
            department: 'IT'
          }
        ]
      },
      {
        id: '2',
        name: 'Executive Offboarding Checklist',
        description: 'Checklist for executive level employees',
        items: [
          {
            code: 'IT_LAPTOP',
            title: 'Return Laptop',
            instructions: 'Return company laptop to IT department',
            required: true,
            department: 'IT'
          },
          {
            code: 'COMPANY_CAR',
            title: 'Return Company Car',
            instructions: 'Return company vehicle',
            required: true,
            department: 'Facilities'
          }
        ]
      }
    ];
  }

  async findOne(id: string) {
    return {
      id,
      name: 'Standard Offboarding Checklist',
      description: 'Default checklist for full-time employees',
      items: [
        {
          code: 'IT_LAPTOP',
          title: 'Return Laptop',
          instructions: 'Return company laptop to IT department',
          required: true,
          department: 'IT'
        }
      ]
    };
  }

  async update(id: string, updateDto: any) {
    return {
      id,
      name: 'Updated Offboarding Checklist',
      description: 'Updated description',
      items: [
        {
          code: 'IT_LAPTOP',
          title: 'Return Laptop',
          instructions: 'Return company laptop to IT department',
          required: true,
          department: 'IT'
        }
      ],
      ...updateDto
    };
  }

  async delete(id: string) {
    return { message: `Clearance Checklist Template ${id} deleted successfully` };
  }
}

