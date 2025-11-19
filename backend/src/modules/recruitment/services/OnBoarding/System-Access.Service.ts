import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemAccessService {
    async create(createDto: any) {
        return {
            id: '1',
            employeeId: 'EMP001',
            systemName: 'JIRA',
            accessLevel: 'user',
            status: 'pending',
            requestedDate: new Date(),
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                employeeId: 'EMP001',
                systemName: 'JIRA',
                accessLevel: 'user',
                status: 'pending',
                requestedDate: new Date()
            },
            {
                id: '2',
                employeeId: 'EMP002',
                systemName: 'GitHub',
                accessLevel: 'developer',
                status: 'granted',
                requestedDate: new Date()
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            employeeId: 'EMP001',
            systemName: 'JIRA',
            accessLevel: 'user',
            status: 'pending',
            requestedDate: new Date()
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            employeeId: 'EMP001',
            systemName: 'JIRA',
            accessLevel: 'user',
            status: 'granted',
            requestedDate: new Date(),
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `System Access ${id} deleted successfully` };
    }
}
