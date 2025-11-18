import { Injectable } from '@nestjs/common';

@Injectable()
export class ResourceReservationService {
    async create(createDto: any) {
        return {
            id: '1',
            employeeId: 'EMP001',
            resourceType: 'Laptop',
            resourceName: 'MacBook Pro 16"',
            reservationDate: new Date(),
            status: 'reserved',
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                employeeId: 'EMP001',
                resourceType: 'Laptop',
                resourceName: 'MacBook Pro 16"',
                reservationDate: new Date(),
                status: 'reserved'
            },
            {
                id: '2',
                employeeId: 'EMP002',
                resourceType: 'Monitor',
                resourceName: 'Dell UltraSharp 27"',
                reservationDate: new Date(),
                status: 'delivered'
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            employeeId: 'EMP001',
            resourceType: 'Laptop',
            resourceName: 'MacBook Pro 16"',
            reservationDate: new Date(),
            status: 'reserved'
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            employeeId: 'EMP001',
            resourceType: 'Laptop',
            resourceName: 'MacBook Pro 16"',
            reservationDate: new Date(),
            status: 'delivered',
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `Resource Reservation ${id} deleted successfully` };
    }
}
