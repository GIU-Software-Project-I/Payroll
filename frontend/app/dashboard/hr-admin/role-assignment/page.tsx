'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { employeeProfileService } from '@/app/services/employee-profile';

/**
 * Role Assignment Page - HR Admin
 * US-E7-05: Assign roles and access permissions to each employee
 */
export default function RoleAssignmentPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeProfileService.getAllEmployees();
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAssignRole = async (employeeId: string, role: string) => {
    try {
      await employeeProfileService.assignRole(employeeId, { role });
      alert('Role assigned successfully');
    } catch (err: any) {
      alert('Failed to assign role: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Role Assignment</h1>
        <p className="text-slate-600 mt-2">Assign roles and access permissions to employees</p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Access Control</h2>
            <p className="text-purple-100 mt-2">Manage employee roles and permissions</p>
          </div>
          <div className="text-6xl">🔐</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Employee Roles Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Employee</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Department</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Current Role</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">👤</div>
                      <div>
                        <p className="font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-slate-500 text-sm">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{emp.department || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {emp.role || 'Department Employee'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      onChange={(e) => handleAssignRole(emp.id, e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      defaultValue=""
                    >
                      <option value="" disabled>Assign Role</option>
                      <option value="department employee">Department Employee</option>
                      <option value="department head">Department Head</option>
                      <option value="HR Employee">HR Employee</option>
                      <option value="HR Manager">HR Manager</option>
                      <option value="HR Admin">HR Admin</option>
                      <option value="Payroll Specialist">Payroll Specialist</option>
                      <option value="System Admin">System Admin</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-600">No employees found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-2">📋 Role Assignment Guidelines</h3>
        <ul className="text-purple-800 text-sm space-y-2">
          <li>• Roles determine what features and data each employee can access</li>
          <li>• Department Employee: Basic self-service access</li>
          <li>• Department Head: Team management and performance appraisals</li>
          <li>• HR roles: Employee management and system configuration</li>
          <li>• All role changes are logged per BR 22</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/hr-admin">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

