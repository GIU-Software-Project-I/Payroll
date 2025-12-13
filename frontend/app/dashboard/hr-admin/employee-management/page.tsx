'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { employeeProfileService } from '@/app/services/employee-profile';

/**
 * Employee Management Page - HR Admin
 * US-EP-04: Edit any part of an employee's profile
 * US-EP-05: Deactivate employee profile upon termination
 */
export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [empResponse, statusResponse, deptResponse] = await Promise.all([
          employeeProfileService.getAllEmployees(),
          employeeProfileService.getEmployeeCountByStatus(),
          employeeProfileService.getEmployeeCountByDepartment()
        ]);
        setEmployees(Array.isArray(empResponse.data) ? empResponse.data : []);
        setStats({
          byStatus: statusResponse.data,
          byDepartment: deptResponse.data
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const response = await employeeProfileService.searchEmployees(searchQuery);
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
        <p className="text-slate-600 mt-2">Full administrative access to employee profiles</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">HR Administration</h2>
            <p className="text-blue-100 mt-2">{employees.length} total employees</p>
          </div>
          <div className="text-6xl">⚙️</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Employee Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Employee</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Department</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Position</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Status</th>
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
                        <p className="text-slate-500 text-sm">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{emp.department || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-700">{emp.position || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      emp.status === 'Active' ? 'bg-green-100 text-green-700' :
                      emp.status === 'Terminated' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {emp.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                      <button className="text-red-600 hover:text-red-800 font-medium text-sm">Deactivate</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-600">No employees found</td>
              </tr>
            )}
          </tbody>
        </table>
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

