'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { performanceService } from '@/app/services/performance';

/**
 * Performance Page - Department Head (Manager)
 * REQ-PP-13: View assigned appraisal forms
 * REQ-AE-03: Complete structured appraisal ratings for direct reports
 * REQ-AE-04: Add comments, examples and development recommendations
 */
export default function PerformancePage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        // Get assignments for manager - using 'me' as placeholder for current user
        const response = await performanceService.searchAssignments();
        setAssignments(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load appraisal assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading appraisal assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error loading assignments</p>
        <p className="text-red-700 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Team Performance</h1>
        <p className="text-slate-600 mt-2">Manage appraisals for your direct reports</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Appraisal Management</h2>
            <p className="text-indigo-100 mt-2">{assignments.length} pending appraisals</p>
          </div>
          <div className="text-6xl">📊</div>
        </div>
      </div>

      {/* Pending Appraisals */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Pending Appraisals</h3>
        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{assignment.employeeName || 'Employee'}</h4>
                    <p className="text-slate-600 text-sm">{assignment.cycleName || 'Appraisal Cycle'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      assignment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      assignment.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {assignment.status || 'Pending'}
                    </span>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                      {assignment.status === 'Completed' ? 'View' : 'Start Appraisal'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">No pending appraisals</p>
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-900 mb-2">📋 Manager Responsibilities</h3>
        <ul className="text-indigo-800 text-sm space-y-2">
          <li>• Complete structured appraisal ratings for your direct reports</li>
          <li>• Add comments, examples, and development recommendations</li>
          <li>• Submit appraisals before the cycle deadline</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/department-head">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

