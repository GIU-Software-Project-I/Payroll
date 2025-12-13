'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { organizationStructureService } from '@/app/services/organization-structure';

/**
 * Departments Management Page - System Admin
 * REQ-OSM-01: Define and create departments
 * REQ-OSM-02: Update existing departments
 * REQ-OSM-05: Deactivate obsolete departments
 */
export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await organizationStructureService.getDepartments();
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await organizationStructureService.createDepartment(formData);
      setShowCreateForm(false);
      setFormData({ name: '', code: '' });
      fetchDepartments();
    } catch (err: any) {
      alert('Failed to create department: ' + err.message);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this department?')) return;
    try {
      await organizationStructureService.deactivateDepartment(id);
      fetchDepartments();
    } catch (err: any) {
      alert('Failed to deactivate: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Department Management</h1>
          <p className="text-slate-600 mt-2">Create, update, and manage departments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium"
        >
          + Create Department
        </button>
      </div>

      <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Organizational Structure</h2>
            <p className="text-violet-100 mt-2">{departments.length} departments</p>
          </div>
          <div className="text-6xl">🏛️</div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Department</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Department Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Enter department name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Department Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Enter department code (e.g., DEPT-ENG)"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium">
                Create
              </button>
              <button onClick={() => setShowCreateForm(false)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Departments Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Department</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Code</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Head</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{dept.name}</td>
                  <td className="px-6 py-4 text-slate-700 font-mono">{dept.code}</td>
                  <td className="px-6 py-4 text-slate-700">{dept.headName || 'Not assigned'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dept.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-violet-600 hover:text-violet-800 font-medium text-sm">Edit</button>
                      {dept.isActive && (
                        <button
                          onClick={() => handleDeactivate(dept.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-600">No departments found</td>
              </tr>
            )}
          </tbody>
        </table>
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

