import { Injectable } from '@nestjs/common';

@Injectable()
export class OnboardingTaskTemplateService {
    async create(createDto: any) {
        return {
            id: '1',
            taskName: 'Complete Tax Forms',
            description: 'Fill out W-4 and state tax forms',
            dueInDays: 3,
            priority: 'high',
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                taskName: 'Complete Tax Forms',
                description: 'Fill out W-4 and state tax forms',
                dueInDays: 3,
                priority: 'high'
            },
            {
                id: '2',
                taskName: 'Setup Workstation',
                description: 'Configure laptop and software',
                dueInDays: 1,
                priority: 'medium'
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            taskName: 'Complete Tax Forms',
            description: 'Fill out W-4 and state tax forms',
            dueInDays: 3,
            priority: 'high'
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            taskName: 'Updated Task',
            description: 'Updated description',
            dueInDays: 5,
            priority: 'low',
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `Onboarding Task Template ${id} deleted successfully` };
    }
}
