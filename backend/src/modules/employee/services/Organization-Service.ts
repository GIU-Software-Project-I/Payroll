// Organization CRUD Service
import {Injectable} from "@nestjs/common";

@Injectable()
export class OrganizationService {
    private departments = [
        { id: '1', name: 'Engineering', manager: 'John Doe', employees: 5 },
        { id: '2', name: 'HR', manager: 'Jane Smith', employees: 3 },
    ];

    private positions = [
        { id: '1', title: 'Senior Developer', department: 'Engineering', level: 5 },
        { id: '2', title: 'HR Manager', department: 'HR', level: 4 },
    ];

    getAllDepartments() {
        return this.departments;
    }

    getDepartmentById(id: string) {
        return this.departments.find(dept => dept.id === id);
    }

    createDepartment(data: any) {
        const newDept = { id: Date.now().toString(), ...data };
        this.departments.push(newDept);
        return newDept;
    }

    updateDepartment(id: string, data: any) {
        const index = this.departments.findIndex(dept => dept.id === id);
        if (index !== -1) {
            this.departments[index] = { ...this.departments[index], ...data };
            return this.departments[index];
        }
        return null;
    }

    deleteDepartment(id: string) {
        const index = this.departments.findIndex(dept => dept.id === id);
        if (index !== -1) {
            this.departments.splice(index, 1);
            return { success: true };
        }
        return { success: false };
    }

    getAllPositions() {
        return this.positions;
    }

    getPositionById(id: string) {
        return this.positions.find(pos => pos.id === id);
    }

    createPosition(data: any) {
        const newPos = { id: Date.now().toString(), ...data };
        this.positions.push(newPos);
        return newPos;
    }

    updatePosition(id: string, data: any) {
        const index = this.positions.findIndex(pos => pos.id === id);
        if (index !== -1) {
            this.positions[index] = { ...this.positions[index], ...data };
            return this.positions[index];
        }
        return null;
    }

    deletePosition(id: string) {
        const index = this.positions.findIndex(pos => pos.id === id);
        if (index !== -1) {
            this.positions.splice(index, 1);
            return { success: true };
        }
        return { success: false };
    }
}