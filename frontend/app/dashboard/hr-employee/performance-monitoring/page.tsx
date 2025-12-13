'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { performanceService } from '@/app/services/performance';

/**
 * Performance Monitoring Page - HR Employee
 * REQ-AE-06: Monitor appraisal progress and send reminders
 */
export default function PerformanceMonitoringPage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        setLoading(true);
        const response = await performanceService.getCycles();
        const cyclesData = Array.isArray(response.data) ? response.data : [];
        const activeCycles = cyclesData.filter((c: any) => c.status === 'ACTIVE');
        setCycles(activeCycles);
        if (activeCycles.length > 0) {
          setSelectedCycleId(activeCycles[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load cycles');
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!selectedCycleId) return;
      try {
        const response = await performanceService.getCompletionDashboard(selectedCycleId);
        setDashboard(response.data);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
      }
    };

    fetchDashboard();
  }, [selectedCycleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Performance Monitoring</h1>
        <p className="text-slate-600 mt-2">Track appraisal completion and send reminders</p>
      </div>

      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Completion Dashboard</h2>
            <p className="text-cyan-100 mt-2">Monitor progress across departments</p>
          </div>
          <div className="text-6xl">📊</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Cycle Selector */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Cycle</label>
        <select
          value={selectedCycleId || ''}
          onChange={(e) => setSelectedCycleId(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <p className="text-slate-600 text-sm">Total Assignments</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{dashboard.totalAssignments || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <p className="text-slate-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{dashboard.completed || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <p className="text-slate-600 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{dashboard.inProgress || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <p className="text-slate-600 text-sm">Not Started</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{dashboard.notStarted || 0}</p>
          </div>
        </div>
      )}

      {/* Department Progress */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">Department Progress</h3>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm font-medium">
            Send Reminders
          </button>
        </div>
        {dashboard?.departments ? (
          <div className="space-y-4">
            {dashboard.departments.map((dept: any) => (
              <div key={dept.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{dept.name}</span>
                  <span className="text-slate-600 text-sm">{dept.completionRate}% complete</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-cyan-600 h-2 rounded-full"
                    style={{ width: `${dept.completionRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">Select a cycle to view department progress</p>
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

