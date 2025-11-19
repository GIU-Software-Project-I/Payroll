import { Injectable } from '@nestjs/common';

@Injectable()
export class ApplicationService {
    async create(createDto: any) {
        return {
            id: '1',
            jobRequisitionId: 'JR001',
            candidateName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            status: 'pending',
            appliedDate: new Date(),
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                jobRequisitionId: 'JR001',
                candidateName: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                status: 'pending',
                appliedDate: new Date()
            },
            {
                id: '2',
                jobRequisitionId: 'JR002',
                candidateName: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '+0987654321',
                status: 'interview',
                appliedDate: new Date()
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            jobRequisitionId: 'JR001',
            candidateName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            status: 'pending',
            appliedDate: new Date()
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            jobRequisitionId: 'JR001',
            candidateName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            status: 'interview',
            appliedDate: new Date(),
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `Application ${id} deleted successfully` };
    }
}
