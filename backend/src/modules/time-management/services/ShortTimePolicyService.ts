import { Injectable } from '@nestjs/common';
import { ShortTimePolicy } from '../models/ShortTimePolicy';

@Injectable()
export class ShortTimePolicyService {
    // Dummy in-memory short time policies
    private policies: Partial<ShortTimePolicy>[] = [
        {
            id: 'policy001',
            reducedHours: 2,
            effectiveFrom: new Date('2025-01-01'),
            effectiveTo: new Date('2025-06-30'),
            auditTrail: [],
        },
        {
            id: 'policy002',
            reducedHours: 1,
            effectiveFrom: new Date('2025-03-01'),
            effectiveTo: new Date('2025-12-31'),
            auditTrail: [],
        },
        {
            id: 'policy003',
            reducedHours: 3,
            effectiveFrom: new Date('2025-05-01'),
            auditTrail: [],
        },
    ];

    async create(policy: Partial<ShortTimePolicy>): Promise<Partial<ShortTimePolicy>> {
        this.policies.push(policy);
        return policy;
    }

    async findAll(): Promise<Partial<ShortTimePolicy>[]> {
        return this.policies;
    }

    async findOne(id: string): Promise<Partial<ShortTimePolicy> | undefined> {
        return this.policies.find(p => p.id === id);
    }

    async update(id: string, updateData: Partial<ShortTimePolicy>): Promise<Partial<ShortTimePolicy> | undefined> {
        const idx = this.policies.findIndex(p => p.id === id);
        if (idx > -1) {
            this.policies[idx] = { ...this.policies[idx], ...updateData };
            return this.policies[idx];
        }
        return undefined;
    }

    async delete(id: string): Promise<boolean> {
        const idx = this.policies.findIndex(p => p.id === id);
        if (idx > -1) {
            this.policies.splice(idx, 1);
            return true;
        }
        return false;
    }
}
