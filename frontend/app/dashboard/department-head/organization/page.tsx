'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { organizationStructureService } from '@/app/services/organization-structure';

/**
 * Organization Page - Department Head
 * REQ-SANV-02: View team's structure and reporting lines
 */
export default function OrganizationPage() {
  const [orgChart, setOrgChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        setLoading(true);
        const response = await organizationStructureService.getOrgChart();
        setOrgChart(response.data || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load organization structure');
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading organization structure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error loading structure</p>
        <p className="text-red-700 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Team Structure</h1>
        <p className="text-slate-600 mt-2">View your team's organizational structure and reporting lines</p>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Organization Chart</h2>
            <p className="text-indigo-100 mt-2">Your team hierarchy</p>
          </div>
          <div className="text-6xl">🏢</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Team Hierarchy</h3>
        {orgChart ? (
          <pre className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg overflow-auto">
            {JSON.stringify(orgChart, null, 2)}
          </pre>
        ) : (
          <p className="text-slate-600">No organization data available</p>
        )}
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

