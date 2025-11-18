import { Injectable } from '@nestjs/common';

@Injectable()
export class AssessmentTemplateService {
    async create(createDto: any) {
        return {
            id: '1',
            name: 'Technical Assessment',
            type: 'technical',
            duration: 60,
            questions: ['Question 1', 'Question 2'],
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                name: 'Technical Assessment',
                type: 'technical',
                duration: 60,
                questions: ['Question 1', 'Question 2']
            },
            {
                id: '2',
                name: 'Behavioral Assessment',
                type: 'behavioral',
                duration: 45,
                questions: ['Question A', 'Question B']
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            name: 'Technical Assessment',
            type: 'technical',
            duration: 60,
            questions: ['Question 1', 'Question 2']
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            name: 'Updated Assessment',
            type: 'technical',
            duration: 90,
            questions: ['Question 1', 'Question 2'],
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `Assessment Template ${id} deleted successfully` };
    }
}
