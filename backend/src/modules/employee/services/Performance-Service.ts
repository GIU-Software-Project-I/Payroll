// Performance CRUD Service
import {Injectable} from "@nestjs/common";

@Injectable()
export class PerformanceService {
    private appraisals = [
        {
            id: '1',
            employeeId: '1',
            cycle: 'Q1 2024',
            rating: 4.5,
            status: 'Completed',
        },
        {
            id: '2',
            employeeId: '2',
            cycle: 'Q1 2024',
            rating: 4.0,
            status: 'In Progress',
        },
    ];

    private appraisalCycles = [
        { id: '1', name: 'Q1 2024', startDate: '2024-01-01', endDate: '2024-03-31' },
        { id: '2', name: 'Q2 2024', startDate: '2024-04-01', endDate: '2024-06-30' },
    ];

    getAllAppraisals() {
        return this.appraisals;
    }

    getAppraisalById(id: string) {
        return this.appraisals.find(app => app.id === id);
    }

    createAppraisal(data: any) {
        const newAppraisal = { id: Date.now().toString(), ...data };
        this.appraisals.push(newAppraisal);
        return newAppraisal;
    }

    updateAppraisal(id: string, data: any) {
        const index = this.appraisals.findIndex(app => app.id === id);
        if (index !== -1) {
            this.appraisals[index] = { ...this.appraisals[index], ...data };
            return this.appraisals[index];
        }
        return null;
    }

    deleteAppraisal(id: string) {
        const index = this.appraisals.findIndex(app => app.id === id);
        if (index !== -1) {
            this.appraisals.splice(index, 1);
            return { success: true };
        }
        return { success: false };
    }

    getAllAppraisalCycles() {
        return this.appraisalCycles;
    }

    getAppraisalCycleById(id: string) {
        return this.appraisalCycles.find(cycle => cycle.id === id);
    }

    createAppraisalCycle(data: any) {
        const newCycle = { id: Date.now().toString(), ...data };
        this.appraisalCycles.push(newCycle);
        return newCycle;
    }

    updateAppraisalCycle(id: string, data: any) {
        const index = this.appraisalCycles.findIndex(cycle => cycle.id === id);
        if (index !== -1) {
            this.appraisalCycles[index] = { ...this.appraisalCycles[index], ...data };
            return this.appraisalCycles[index];
        }
        return null;
    }

    deleteAppraisalCycle(id: string) {
        const index = this.appraisalCycles.findIndex(cycle => cycle.id === id);
        if (index !== -1) {
            this.appraisalCycles.splice(index, 1);
            return { success: true };
        }
        return { success: false };
    }
}
