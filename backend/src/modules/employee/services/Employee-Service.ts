import { Injectable } from '@nestjs/common';

// Employee CRUD Service
@Injectable()
export class EmployeeService {
    private employees = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            department: 'Engineering',
            position: 'Senior Developer',
            status: 'Active',
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            department: 'HR',
            position: 'HR Manager',
            status: 'Active',
        },
    ];

    getAll() {
        return this.employees;
    }

    getById(id: string) {
        return this.employees.find(emp => emp.id === id);
    }

    create(data: any) {
        const newEmployee = { id: Date.now().toString(), ...data };
        this.employees.push(newEmployee);
        return newEmployee;
    }

    update(id: string, data: any) {
        const index = this.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            this.employees[index] = { ...this.employees[index], ...data };
            return this.employees[index];
        }
        return null;
    }

    delete(id: string) {
        const index = this.employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            this.employees.splice(index, 1);
            return { success: true };
        }
        return { success: false };
    }
}



