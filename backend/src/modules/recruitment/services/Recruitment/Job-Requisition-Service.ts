import { Injectable } from '@nestjs/common';

@Injectable()
export class JobRequisitionService {
    async create(createDto: any) {
        return {
            id: '1',
            title: 'Senior Software Engineer',
            department: 'Engineering',
            location: 'Remote',
            status: 'open',
            postedDate: new Date(),
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                title: 'Senior Software Engineer',
                department: 'Engineering',
                location: 'Remote',
                status: 'open',
                postedDate: new Date()
            },
            {
                id: '2',
                title: 'Product Manager',
                department: 'Product',
                location: 'New York',
                status: 'open',
                postedDate: new Date()
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            title: 'Senior Software Engineer',
            department: 'Engineering',
            location: 'Remote',
            status: 'open',
            postedDate: new Date()
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            title: 'Senior Software Engineer',
            department: 'Engineering',
            location: 'Remote',
            status: 'closed',
            postedDate: new Date(),
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `Job Requisition ${id} deleted successfully` };
    }
}
