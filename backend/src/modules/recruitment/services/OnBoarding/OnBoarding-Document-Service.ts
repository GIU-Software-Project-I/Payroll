import { Injectable } from '@nestjs/common';

@Injectable()
export class OnBoardingDocumentService {
    async create(createDto: any) {
        return {
            id: '1',
            employeeId: 'EMP001',
            documentType: 'ID Proof',
            documentName: 'Passport',
            status: 'pending',
            uploadedDate: new Date(),
            ...createDto
        };
    }

    async findAll() {
        return [
            {
                id: '1',
                employeeId: 'EMP001',
                documentType: 'ID Proof',
                documentName: 'Passport',
                status: 'pending',
                uploadedDate: new Date()
            },
            {
                id: '2',
                employeeId: 'EMP002',
                documentType: 'Tax Form',
                documentName: 'W-4',
                status: 'approved',
                uploadedDate: new Date()
            }
        ];
    }

    async findOne(id: string) {
        return {
            id,
            employeeId: 'EMP001',
            documentType: 'ID Proof',
            documentName: 'Passport',
            status: 'pending',
            uploadedDate: new Date()
        };
    }

    async update(id: string, updateDto: any) {
        return {
            id,
            employeeId: 'EMP001',
            documentType: 'ID Proof',
            documentName: 'Passport',
            status: 'approved',
            uploadedDate: new Date(),
            ...updateDto
        };
    }

    async delete(id: string) {
        return { message: `OnBoarding Document ${id} deleted successfully` };
    }
}
