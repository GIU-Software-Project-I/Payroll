import { Injectable } from '@nestjs/common';

@Injectable()
export class OnBoardingService {
    async create(createDto: any) {
        return {
            id: '1',
            employeeId: 'EMP001',
            employeeName: 'John Doe',
            startDate: new Date(),
            status: 'in-progress',
            completionPercentage: 30,
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                employeeId: 'EMP001',
                employeeName: 'John Doe',
                startDate: new Date(),
                status: 'in-progress',
                completionPercentage: 30
            },
            {
                id: '2',
                employeeId: 'EMP002',
                employeeName: 'Jane Smith',
                startDate: new Date(),
                status: 'completed',
                completionPercentage: 100
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            employeeId: 'EMP001',
            employeeName: 'John Doe',
            startDate: new Date(),
            status: 'in-progress',
            completionPercentage: 30
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            employeeId: 'EMP001',
            employeeName: 'John Doe',
            startDate: new Date(),
            status: 'completed',
            completionPercentage: 100,
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `OnBoarding ${id} deleted successfully` };
    }
}
