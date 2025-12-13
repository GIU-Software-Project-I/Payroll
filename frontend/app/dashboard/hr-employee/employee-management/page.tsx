'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { employeeProfileService } from '@/app/services/employee-profile';

/**
 * Employee Management Page - HR Employee
 * US-E6-03: Search for employees data
 */
export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEmployees();
      return;
    }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Employee Directory</h1>
        <p className="text-slate-600 mt-2">Search and view employee information</p>
      </div>

      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">HR Operations</h2>
            <p className="text-cyan-100 mt-2">{employees.length} employees in directory</p>
          </div>
          <div className="text-6xl">📋</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, department..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button onClick={handleSearch} className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium">
            Search
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.length > 0 ? (
          employees.map((emp) => (
            <div key={emp.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">👤</div>
                <div>
                  <h3 className="font-bold text-slate-900">{emp.firstName} {emp.lastName}</h3>
                  <p className="text-slate-600 text-sm">{emp.employeeId}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Department:</span>
                  <span className="text-slate-900">{emp.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Position:</span>
                  <span className="text-slate-900">{emp.position || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="text-slate-900 truncate max-w-32">{emp.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-slate-600">No employees found</p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/hr-employee">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

