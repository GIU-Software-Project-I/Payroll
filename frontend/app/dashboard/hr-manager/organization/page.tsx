'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { organizationStructureService } from '@/app/services/organization-structure';

/**
 * Organization Page - HR Manager
 * View and manage organizational structure
 */
export default function OrganizationPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await organizationStructureService.getDepartments();
        setDepartments(Array.isArray(response.data) ? response.data : []);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Organization Structure</h1>
        <p className="text-slate-600 mt-2">View departments and organizational hierarchy</p>
      </div>

      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Organization Overview</h2>
            <p className="text-teal-100 mt-2">{departments.length} departments</p>
          </div>
          <div className="text-6xl">🏢</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 text-lg mb-2">{dept.name}</h3>
              <p className="text-slate-600 text-sm mb-4">{dept.code || 'No code'}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Head:</span>
                  <span className="text-slate-900 font-medium">{dept.headName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className={`font-medium ${dept.isActive ? 'text-green-600' : 'text-slate-600'}`}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-slate-600">No departments found</p>
          </div>
        )}
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

