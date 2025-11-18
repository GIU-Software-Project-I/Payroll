import { Injectable } from '@nestjs/common';
import { Shift, shiftType, shiftName } from '../models/Shift';

@Injectable()
export class ShiftService {
    // Dummy in-memory data
    private shifts: Partial<Shift>[] = [
        {
            _id: 'shift001',
            type: shiftType.Normal,
            name: shiftName.FixedCoreHours,
            startTime: '09:00',
            endTime: '17:00',
            isactive: true,
            auditTrail: [],
        },
        {
            _id: 'shift002',
            type: shiftType.Split,
            name: shiftName.Split,
            startTime: '08:00',
            endTime: '12:00',
            isactive: true,
            auditTrail: [],
        },
        {
            _id: 'shift003',
            type: shiftType.Overnight,
            name: shiftName.Overtime,
            startTime: '22:00',
            endTime: '06:00',
            isactive: false,
            auditTrail: [],
        },
    ];

    async create(shift: Partial<Shift>): Promise<Partial<Shift>> {
        this.shifts.push(shift);
        return shift;
    }

    async findAll(): Promise<Partial<Shift>[]> {
        return this.shifts;
    }

    async findOne(id: string): Promise<Partial<Shift> | undefined> {
        return this.shifts.find(s => s._id === id);
    }

    async update(id: string, updateData: Partial<Shift>): Promise<Partial<Shift> | undefined> {
        const idx = this.shifts.findIndex(s => s._id === id);
        if (idx > -1) {
            this.shifts[idx] = { ...this.shifts[idx], ...updateData };
            return this.shifts[idx];
        }
        return undefined;
    }

    async delete(id: string): Promise<boolean> {
        const idx = this.shifts.findIndex(s => s._id === id);
        if (idx > -1) {
            this.shifts.splice(idx, 1);
            return true;
        }
        return false;
    }
}
