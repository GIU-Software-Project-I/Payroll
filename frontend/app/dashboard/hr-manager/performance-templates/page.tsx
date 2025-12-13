'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { performanceService } from '@/app/services/performance';

/**
 * Performance Templates Page - HR Manager
 * REQ-PP-01: Configure standardized appraisal templates and rating scales
 */
export default function PerformanceTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await performanceService.getTemplates();
        setTemplates(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appraisal Templates</h1>
          <p className="text-slate-600 mt-2">Configure standardized appraisal templates and rating scales</p>
        </div>
        <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
          + Create Template
        </button>
      </div>

      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Template Management</h2>
            <p className="text-teal-100 mt-2">{templates.length} templates configured</p>
          </div>
          <div className="text-6xl">📋</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-slate-900">{template.name || 'Unnamed Template'}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  template.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-4">{template.description || 'No description'}</p>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 text-sm font-medium">
                  Edit
                </button>
                <button className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-slate-600">No templates found. Create your first template.</p>
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

