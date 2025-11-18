import { Injectable } from '@nestjs/common';
import { Report } from '../models/TimeReport';

@Injectable()
export class ReportService {
    // Dummy in-memory reports
    private reports: Partial<Report>[] = [
        {
            id: 'report001',
            reportType: 'Overtime',
            generatedBy: 'hr_manager001',
            content: {
                summary: {
                    totalEmployees: 50,
                    totalOvertimeHours: 120,
                    totalExceptions: 0,
                    totalPenalties: 0,
                },
                details: [
                    {
                        employeeId: 'emp001',
                        metrics: {
                            overtimeHours: 10,
                            exceptionType: '',
                            penaltyReason: '',
                            penaltyAmount: 0,
                        },
                    },
                    {
                        employeeId: 'emp002',
                        metrics: {
                            overtimeHours: 8,
                            exceptionType: '',
                            penaltyReason: '',
                            penaltyAmount: 0,
                        },
                    },
                ],
            },
            createdAt: new Date(),
            auditTrail: [],
        },
        {
            id: 'report002',
            reportType: 'Exception',
            generatedBy: 'system',
            content: {
                summary: {
                    totalEmployees: 50,
                    totalOvertimeHours: 0,
                    totalExceptions: 5,
                    totalPenalties: 0,
                },
                details: [
                    {
                        employeeId: 'emp010',
                        metrics: {
                            overtimeHours: 0,
                            exceptionType: 'Late Arrival',
                            penaltyReason: '',
                            penaltyAmount: 0,
                        },
                    },
                ],
            },
            createdAt: new Date(),
            auditTrail: [],
        },
        {
            id: 'report003',
            reportType: 'Penalty',
            generatedBy: 'hr_manager002',
            content: {
                summary: {
                    totalEmployees: 50,
                    totalOvertimeHours: 0,
                    totalExceptions: 0,
                    totalPenalties: 3,
                },
                details: [
                    {
                        employeeId: 'emp020',
                        metrics: {
                            overtimeHours: 0,
                            exceptionType: '',
                            penaltyReason: 'Unapproved Absence',
                            penaltyAmount: 200,
                        },
                    },
                ],
            },
            createdAt: new Date(),
            auditTrail: [],
        },
    ];

    async create(report: Partial<Report>): Promise<Partial<Report>> {
        this.reports.push(report);
        return report;
    }

    async findAll(): Promise<Partial<Report>[]> {
        return this.reports;
    }

    async findOne(id: string): Promise<Partial<Report> | undefined> {
        return this.reports.find(r => r.id === id);
    }

    async update(id: string, updateData: Partial<Report>): Promise<Partial<Report> | undefined> {
        const idx = this.reports.findIndex(r => r.id === id);
        if (idx > -1) {
            this.reports[idx] = { ...this.reports[idx], ...updateData };
            return this.reports[idx];
        }
        return undefined;
    }

    async delete(id: string): Promise<boolean> {
        const idx = this.reports.findIndex(r => r.id === id);
        if (idx > -1) {
            this.reports.splice(idx, 1);
            return true;
        }
        return false;
    }
}
