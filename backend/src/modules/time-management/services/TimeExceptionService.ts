import { Injectable } from '@nestjs/common';
import { TimeException } from '../models/TimeException';

@Injectable()
export class TimeExceptionService {
    // Dummy in-memory time exceptions
    private exceptions: Partial<TimeException>[] = [
        {
            employeeId: 'emp001' as any,
            exceptionType: 'Overtime',
            date: new Date('2025-11-10'),
            startTime: new Date('2025-11-10T18:00:00'),
            endTime: new Date('2025-11-10T20:00:00'),
            duration: 2,
            reason: 'Project deadline',
            status: 'Pending',
            approvedBy: 'user001' as any,
            auditTrail: [],
        },
        {
            employeeId: 'emp002' as any,
            exceptionType: 'Permission',
            date: new Date('2025-11-12'),
            startTime: new Date('2025-11-12T09:00:00'),
            endTime: new Date('2025-11-12T11:00:00'),
            duration: 2,
            reason: 'Doctor appointment',
            status: 'Approved',
            approvedBy: 'user002' as any,
            auditTrail: [],
        },
        {
            employeeId: 'emp003' as any,
            exceptionType: 'Correction',
            date: new Date('2025-11-15'),
            duration: 1,
            reason: 'System error in attendance',
            status: 'Rejected',
            approvedBy: 'user003' as any,
            auditTrail: [],
        },
    ];

    async create(exception: Partial<TimeException>): Promise<Partial<TimeException>> {
        this.exceptions.push(exception);
        return exception;
    }

    async findAll(): Promise<Partial<TimeException>[]> {
        return this.exceptions;
    }

    async findOne(index: number): Promise<Partial<TimeException> | undefined> {
        return this.exceptions[index];
    }

    async update(index: number, updateData: Partial<TimeException>): Promise<Partial<TimeException> | undefined> {
        if (this.exceptions[index]) {
            this.exceptions[index] = { ...this.exceptions[index], ...updateData };
            return this.exceptions[index];
        }
        return undefined;
    }

    async delete(index: number): Promise<boolean> {
        if (this.exceptions[index]) {
            this.exceptions.splice(index, 1);
            return true;
        }
        return false;
    }
}
