import { Injectable } from '@nestjs/common';

@Injectable()
export class HiringProcessTemplateService {
    async create(createDto: any) {
        return {
            id: '1',
            name: 'Standard Hiring Process',
            stages: ['Application Review', 'Phone Screen', 'Technical Interview', 'Final Interview'],
            duration: 30,
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                name: 'Standard Hiring Process',
                stages: ['Application Review', 'Phone Screen', 'Technical Interview', 'Final Interview'],
                duration: 30
            },
            {
                id: '2',
                name: 'Fast Track Process',
                stages: ['Application Review', 'Final Interview'],
                duration: 7
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            name: 'Standard Hiring Process',
            stages: ['Application Review', 'Phone Screen', 'Technical Interview', 'Final Interview'],
            duration: 30
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            name: 'Updated Hiring Process',
            stages: ['Application Review', 'Interview'],
            duration: 15,
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `Hiring Process Template ${id} deleted successfully` };
    }
}
