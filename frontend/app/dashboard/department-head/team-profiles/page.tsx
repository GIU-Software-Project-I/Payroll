'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { employeeProfileService } from '@/app/services/employee-profile';

/**
 * Team Profiles Page - Department Head
 * US-E4-01: View team members' profiles (excluding sensitive info)
 * US-E4-02: See summary of team's job titles and departments
 */
export default function TeamProfilesPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const response = await employeeProfileService.getTeamProfiles();
        setTeam(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load team profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading team profiles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error loading team</p>
        <p className="text-red-700 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Team</h1>
        <p className="text-slate-600 mt-2">View and manage your direct reports</p>
      </div>

      {/* Team Overview */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Team Overview</h2>
            <p className="text-indigo-100 mt-2">{team.length} team members</p>
          </div>
          <div className="text-6xl">👥</div>
        </div>
      </div>

      {/* Team Grid */}
      {team.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <div key={member.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">👤</div>
                <div>
                  <h3 className="font-bold text-slate-900">{member.firstName} {member.lastName}</h3>
                  <p className="text-slate-600 text-sm">{member.position || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Employee ID:</span>
                  <span className="text-slate-900 font-medium">{member.employeeId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Department:</span>
                  <span className="text-slate-900 font-medium">{member.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Email:</span>
                  <span className="text-slate-900 font-medium truncate max-w-32">{member.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className={`font-medium ${member.status === 'Active' ? 'text-green-600' : 'text-slate-600'}`}>
                    {member.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No team members found</p>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-900 mb-2">📋 Team Management</h3>
        <ul className="text-indigo-800 text-sm space-y-2">
          <li>• View your direct reports and their basic information</li>
          <li>• Note: Sensitive information (salary, personal IDs) is restricted</li>
          <li>• Access performance appraisals for your team members</li>
        </ul>
      </div>

      {/* Actions */}
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

