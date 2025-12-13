'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { performanceService } from '@/app/services/performance';

/**
 * Performance Assignments Page - HR Employee
 * REQ-PP-05: Assign appraisal forms and templates to employees and managers in bulk
 */
export default function PerformanceAssignmentsPage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cycleResponse, assignResponse] = await Promise.all([
          performanceService.getCycles(),
          performanceService.searchAssignments()
        ]);
        setCycles(Array.isArray(cycleResponse.data) ? cycleResponse.data : []);
        setAssignments(Array.isArray(assignResponse.data) ? assignResponse.data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appraisal Assignments</h1>
          <p className="text-slate-600 mt-2">Assign forms and templates to employees</p>
        </div>
        <button className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium">
          + Bulk Assign
        </button>
      </div>

      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Assignment Management</h2>
            <p className="text-cyan-100 mt-2">{assignments.length} active assignments</p>
          </div>
          <div className="text-6xl">📝</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Active Cycles */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Active Cycles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cycles.filter(c => c.status === 'ACTIVE').map((cycle) => (
            <div key={cycle.id} className="border border-cyan-200 rounded-lg p-4 bg-cyan-50">
              <h4 className="font-bold text-slate-900">{cycle.name}</h4>
              <p className="text-slate-600 text-sm">{cycle.startDate} - {cycle.endDate}</p>
              <button className="mt-3 w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium">
                Assign Forms
              </button>
            </div>
          ))}
          {cycles.filter(c => c.status === 'ACTIVE').length === 0 && (
            <p className="text-slate-600 col-span-full">No active cycles</p>
          )}
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Employee</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Cycle</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Template</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{assignment.employeeName || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-700">{assignment.cycleName || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-700">{assignment.templateName || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      assignment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      assignment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {assignment.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-600">No assignments found</td>
              </tr>
            )}
          </tbody>
        </table>
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

