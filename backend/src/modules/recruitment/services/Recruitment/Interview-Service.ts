import { Injectable } from '@nestjs/common';

@Injectable()
export class InterviewService {
    async create(createDto: any) {
        return {
            id: '1',
            applicationId: 'APP001',
            type: 'technical',
            scheduledDate: new Date(),
            interviewer: 'Jane Manager',
            status: 'scheduled',
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                applicationId: 'APP001',
                type: 'technical',
                scheduledDate: new Date(),
                interviewer: 'Jane Manager',
                status: 'scheduled'
            },
            {
                id: '2',
                applicationId: 'APP002',
                type: 'behavioral',
                scheduledDate: new Date(),
                interviewer: 'Bob Director',
                status: 'completed'
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            applicationId: 'APP001',
            type: 'technical',
            scheduledDate: new Date(),
            interviewer: 'Jane Manager',
            status: 'scheduled'
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            applicationId: 'APP001',
            type: 'technical',
            scheduledDate: new Date(),
            interviewer: 'Jane Manager',
            status: 'completed',
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `Interview ${id} deleted successfully` };
    }
}
