import { Injectable } from '@nestjs/common';

@Injectable()
export class PayrollInitialService {
    async create(createDto: any) {
        return {
            id: '1',
            employeeId: 'EMP001',
            bankAccountNumber: '****1234',
            bankName: 'Chase Bank',
            taxWithholding: 22,
            status: 'pending',
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                employeeId: 'EMP001',
                bankAccountNumber: '****1234',
                bankName: 'Chase Bank',
                taxWithholding: 22,
                status: 'pending'
            },
            {
                id: '2',
                employeeId: 'EMP002',
                bankAccountNumber: '****5678',
                bankName: 'Wells Fargo',
                taxWithholding: 24,
                status: 'approved'
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            employeeId: 'EMP001',
            bankAccountNumber: '****1234',
            bankName: 'Chase Bank',
            taxWithholding: 22,
            status: 'pending'
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            employeeId: 'EMP001',
            bankAccountNumber: '****1234',
            bankName: 'Chase Bank',
            taxWithholding: 22,
            status: 'approved',
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `Payroll Initial ${id} deleted successfully` };
    }
}
