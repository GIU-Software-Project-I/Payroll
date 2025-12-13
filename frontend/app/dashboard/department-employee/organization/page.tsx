'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { organizationStructureService } from '@/app/services/organization-structure';

/**
 * Organization Structure Page - Department Employee
 * REQ-SANV-01: View organizational hierarchy
 * BR 24: Organizational structure must be viewable as a graphical chart
 */
export default function OrganizationPage() {
  const [orgChart, setOrgChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        setLoading(true);
        const data = await organizationStructureService.getOrgChart();
        setOrgChart(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load organization structure');
      } finally {
        setLoading(false);
      }
    };

    fetchStructure();
  }, []);

  const toggleDepartment = (deptId: string) => {
    setExpandedDepts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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

  if (!orgChart) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-medium">No organization data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Organization Structure</h1>
        <p className="text-slate-600 mt-2">View company departments, reporting lines, and organizational hierarchy</p>
      </div>

      {/* Company Overview */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">{orgChart.companyName || 'Organization'}</h2>
            <p className="text-green-100 mt-2">Organization Structure</p>
          </div>
          <div className="text-6xl">🏢</div>
        </div>
      </div>

      {/* Organization Tree */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Departments</h2>

          {orgChart.departments && orgChart.departments.length > 0 ? (
            <div className="space-y-3">
              {orgChart.departments.map((dept: any) => (
                <div key={dept.id} className="border border-slate-200 rounded-lg">
                  {/* Department Header */}
                  <button
                    onClick={() => toggleDepartment(dept.id)}
                    className="w-full px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="text-2xl">
                        {expandedDepts.has(dept.id) ? '▼' : '▶'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{dept.name}</h3>
                        {dept.head && (
                          <p className="text-slate-600 text-sm">
                            Head: <span className="font-medium">{dept.head.name || 'N/A'}</span> •
                            <span className="ml-2">{dept.employeeCount || 0} employees</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-slate-500">📊</div>
                  </button>

                  {/* Sub-departments */}
                  {expandedDepts.has(dept.id) && dept.subDepartments && dept.subDepartments.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                      <div className="space-y-3 ml-6">
                        <p className="text-sm font-medium text-slate-700 mb-4">Teams within {dept.name}</p>
                        {dept.subDepartments.map((subDept: any) => (
                          <div key={subDept.id} className="bg-white p-4 rounded-lg border border-slate-200 hover:border-green-300 transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-slate-900">{subDept.name}</h4>
                                {subDept.head && (
                                  <p className="text-slate-600 text-sm">
                                    Team Lead: <span className="font-medium">{subDept.head.name || 'N/A'}</span>
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">{subDept.employeeCount || 0}</p>
                                <p className="text-xs text-slate-600">team members</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No departments available</p>
          )}
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">📋 Organization Information</h3>
        <ul className="text-green-800 text-sm space-y-2">
          <li>• View the complete organizational structure and reporting lines</li>
          <li>• Find contact information for team members and departments</li>
          <li>• Understand your position within the organization</li>
          <li>• See team compositions and department hierarchies</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/dashboard/department-employee">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

