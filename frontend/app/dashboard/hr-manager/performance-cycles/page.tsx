'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { performanceService } from '@/app/services/performance';

/**
 * Performance Cycles Page - HR Manager
 * REQ-PP-02: Define and schedule appraisal cycles (annual, semi-annual, probationary)
 */
export default function PerformanceCyclesPage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        setLoading(true);
        const response = await performanceService.getCycles();
        setCycles(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load cycles');
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading cycles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appraisal Cycles</h1>
          <p className="text-slate-600 mt-2">Define and schedule appraisal cycles</p>
        </div>
        <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
          + Create Cycle
        </button>
      </div>

      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Cycle Management</h2>
            <p className="text-teal-100 mt-2">{cycles.length} cycles configured</p>
          </div>
          <div className="text-6xl">📅</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Cycles List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Cycle Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Period</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {cycles.length > 0 ? (
              cycles.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{cycle.name}</td>
                  <td className="px-6 py-4 text-slate-700">{cycle.type || 'Annual'}</td>
                  <td className="px-6 py-4 text-slate-700">
                    {cycle.startDate} - {cycle.endDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cycle.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      cycle.status === 'PLANNED' ? 'bg-blue-100 text-blue-700' :
                      cycle.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {cycle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-teal-600 hover:text-teal-800 font-medium text-sm mr-3">
                      Edit
                    </button>
                    <button className="text-slate-600 hover:text-slate-800 font-medium text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-600">
                  No cycles found. Create your first appraisal cycle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/hr-manager">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

