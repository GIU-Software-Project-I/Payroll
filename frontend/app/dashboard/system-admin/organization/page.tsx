'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { organizationStructureService } from '@/app/services/organization-structure';

/**
 * Organization Overview Page - System Admin
 * REQ-SANV-01: View organizational hierarchy
 * BR 24: Organizational structure viewable as a graphical chart
 */
export default function OrganizationPage() {
  const [orgChart, setOrgChart] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chartResponse, deptStats, posStats] = await Promise.all([
          organizationStructureService.getOrgChart(),
          organizationStructureService.getDepartmentStats(),
          organizationStructureService.getPositionStats()
        ]);
        setOrgChart(chartResponse.data);
        setStats({
          departments: deptStats.data,
          positions: posStats.data
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load organization');
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Organization Overview</h1>
        <p className="text-slate-600 mt-2">Complete view of organizational structure</p>
      </div>

      <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">System Administration</h2>
            <p className="text-violet-100 mt-2">Manage the complete organizational structure</p>
          </div>
          <div className="text-6xl">🏢</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Total Departments</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.departments?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Active Departments</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats?.departments?.active || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Total Positions</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.positions?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Vacant Positions</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats?.positions?.vacant || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/system-admin/departments">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏛️</div>
              <div>
                <h3 className="font-bold text-slate-900">Manage Departments</h3>
                <p className="text-slate-600 text-sm">Create, edit, and deactivate departments</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/system-admin/positions">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-4xl">💼</div>
              <div>
                <h3 className="font-bold text-slate-900">Manage Positions</h3>
                <p className="text-slate-600 text-sm">Create, edit, and deactivate positions</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Organization Chart */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Organization Chart</h3>
        {orgChart ? (
          <pre className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(orgChart, null, 2)}
          </pre>
        ) : (
          <p className="text-slate-600">No organization data available</p>
        )}
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/system-admin">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

