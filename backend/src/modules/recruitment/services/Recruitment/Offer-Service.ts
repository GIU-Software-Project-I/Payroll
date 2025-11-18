import { Injectable } from '@nestjs/common';

@Injectable()
export class OfferService {
    async create(createDto: any) {
        return {
            id: '1',
            applicationId: 'APP001',
            position: 'Senior Software Engineer',
            salary: 120000,
            startDate: new Date(),
            status: 'pending',
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                applicationId: 'APP001',
                position: 'Senior Software Engineer',
                salary: 120000,
                startDate: new Date(),
                status: 'pending'
            },
            {
                id: '2',
                applicationId: 'APP002',
                position: 'Product Manager',
                salary: 130000,
                startDate: new Date(),
                status: 'accepted'
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            applicationId: 'APP001',
            position: 'Senior Software Engineer',
            salary: 120000,
            startDate: new Date(),
            status: 'pending'
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            applicationId: 'APP001',
            position: 'Senior Software Engineer',
            salary: 120000,
            startDate: new Date(),
            status: 'accepted',
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `Offer ${id} deleted successfully` };
    }
}
