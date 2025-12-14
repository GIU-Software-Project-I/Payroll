'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { organizationStructureService } from '@/app/services/organization-structure';

/**
 * Positions Management Page - System Admin
 * REQ-OSM-01: Define and create positions
 * REQ-OSM-02: Update existing positions
 * REQ-OSM-05: Deactivate obsolete positions
 * BR 12: Positions with historical assignments can only be delimited
 */
export default function PositionsPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', code: '', departmentId: '', payGrade: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
      try {
        setLoading(true);
        const [posResponse, deptResponse] = await Promise.all([
          organizationStructureService.getPositions(),
          organizationStructureService.getDepartments()
        ]);
        setPositions(Array.isArray(posResponse.data) ? posResponse.data : []);
        setDepartments(Array.isArray(deptResponse.data) ? deptResponse.data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await organizationStructureService.createPosition(formData);
      setShowCreateForm(false);
      setFormData({ title: '', code: '', departmentId: '', payGrade: '' });
      fetchData();
    } catch (err: any) {
      alert('Failed to create position: ' + err.message);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this position?')) return;
    try {
      await organizationStructureService.deactivatePosition(id);
      fetchData();
    } catch (err: any) {
      alert('Failed to deactivate: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Position Management</h1>
          <p className="text-slate-600 mt-2">Create, update, and manage positions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium"
        >
          + Create Position
        </button>
      </div>

      <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Position Structure</h2>
            <p className="text-violet-100 mt-2">{positions.length} positions defined</p>
          </div>
          <div className="text-6xl">💼</div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Position</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Position Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Position Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="e.g., POS-SSE-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Department *</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pay Grade</label>
              <input
                type="text"
                value={formData.payGrade}
                onChange={(e) => setFormData({ ...formData, payGrade: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="e.g., Grade 5"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium">
              Create
            </button>
            <button onClick={() => setShowCreateForm(false)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Positions Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Position</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Code</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Department</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Pay Grade</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {positions.length > 0 ? (
              positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{pos.title}</td>
                  <td className="px-6 py-4 text-slate-700 font-mono">{pos.code}</td>
                  <td className="px-6 py-4 text-slate-700">{pos.departmentName || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-700">{pos.payGrade || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pos.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {pos.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-violet-600 hover:text-violet-800 font-medium text-sm">Edit</button>
                      {pos.isActive && (
                        <button
                          onClick={() => handleDeactivate(pos.id)}
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
                <td colSpan={6} className="px-6 py-8 text-center text-slate-600">No positions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
        <h3 className="font-semibold text-violet-900 mb-2">📋 Position Management Rules</h3>
        <ul className="text-violet-800 text-sm space-y-2">
          <li>• BR 10: Positions must have Position ID, Pay Grade, and Department ID</li>
          <li>• BR 12: Positions with historical assignments can only be delimited (soft delete)</li>
          <li>• BR 30: Creation requires Cost Center and Reporting Manager</li>
          <li>• BR 37: Historical records must be preserved</li>
        </ul>
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

