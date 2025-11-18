import { Injectable } from '@nestjs/common';
import { VacationPackage } from '../models/VacationPackage';

@Injectable()
export class VacationPackageService {
    // Dummy in-memory vacation packages
    private packages: Partial<VacationPackage>[] = [
        {
            name: 'Standard Annual Leave',
            annualEntitlement: 21,
            accrualRate: 1.75,
            maxCarryOver: 5,
            validityPeriod: 12,
            isActive: true,
            createdBy: 'user001' as any,
            auditTrail: [],
        },
        {
            name: 'Executive Package',
            annualEntitlement: 30,
            accrualRate: 2.5,
            maxCarryOver: 10,
            validityPeriod: 12,
            isActive: true,
            createdBy: 'user002' as any,
            auditTrail: [],
        },
        {
            name: 'Temporary Contract Package',
            annualEntitlement: 10,
            accrualRate: 0.8,
            maxCarryOver: 0,
            validityPeriod: 6,
            isActive: false,
            createdBy: 'user003' as any,
            auditTrail: [],
        },
    ];

    async create(pkg: Partial<VacationPackage>): Promise<Partial<VacationPackage>> {
        this.packages.push(pkg);
        return pkg;
    }

    async findAll(): Promise<Partial<VacationPackage>[]> {
        return this.packages;
    }

    async findOne(name: string): Promise<Partial<VacationPackage> | undefined> {
        return this.packages.find(p => p.name === name);
    }

    async update(name: string, updateData: Partial<VacationPackage>): Promise<Partial<VacationPackage> | undefined> {
        const idx = this.packages.findIndex(p => p.name === name);
        if (idx > -1) {
            this.packages[idx] = { ...this.packages[idx], ...updateData };
            return this.packages[idx];
        }
        return undefined;
    }

    async delete(name: string): Promise<boolean> {
        const idx = this.packages.findIndex(p => p.name === name);
        if (idx > -1) {
            this.packages.splice(idx, 1);
            return true;
        }
        return false;
    }
}
