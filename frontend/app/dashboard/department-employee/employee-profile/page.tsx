'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { employeeProfileService } from '@/app/services/employee-profile';

/**
 * Employee Profile Page - Department Employee
 * US-E2-04: View my full profile
 * US-E2-12: View bio and photo
 */
export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await employeeProfileService.getMyProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error loading profile</p>
        <p className="text-red-700 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-medium">No profile data found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-2">View and manage your personal information</p>
        </div>
        <Link href="/dashboard/department-employee/employee-profile/edit">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            ✏️ Edit Profile
          </button>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="text-8xl">👤</div>
          <div>
            <h2 className="text-3xl font-bold">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-blue-100 mt-2">{profile.position || 'N/A'}</p>
            <p className="text-blue-100">{profile.department || 'N/A'}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-blue-500 rounded-full text-sm font-medium">
              {profile.status || 'Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button className="px-4 py-3 border-b-2 border-blue-600 text-blue-600 font-medium">
          Personal Information
        </button>
        <button className="px-4 py-3 text-slate-600 hover:text-slate-900">Employment Details</button>
        <button className="px-4 py-3 text-slate-600 hover:text-slate-900">Documents</button>
      </div>

      {/* Personal Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Information</h3>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <p className="text-slate-900 mt-2 text-lg">{profile.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <p className="text-slate-900 mt-2 text-lg">{profile.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Address</label>
              <p className="text-slate-900 mt-2">{profile.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Personal Details</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Date of Birth</label>
                <p className="text-slate-900 mt-2">{profile.dateOfBirth || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <p className="text-slate-900 mt-2">{profile.gender || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Marital Status</label>
                <p className="text-slate-900 mt-2">{profile.maritalStatus || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Nationality</label>
                <p className="text-slate-900 mt-2">{profile.nationality || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment Details */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Employment Details</h3>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Employee ID</label>
              <p className="text-slate-900 mt-2 font-mono text-lg">{profile.employeeId || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Join Date</label>
              <p className="text-slate-900 mt-2">{profile.joinDate || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Contract Type</label>
              <p className="text-slate-900 mt-2">{profile.contractType || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Position & Management */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Position & Management</h3>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Department</label>
              <p className="text-slate-900 mt-2">{profile.department || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Position</label>
              <p className="text-slate-900 mt-2">{profile.position || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Direct Manager</label>
              <p className="text-slate-900 mt-2">{profile.manager || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Pay Grade</label>
              <p className="text-slate-900 mt-2">{profile.payGrade || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">About Me</h3>
          <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Link href="/dashboard/department-employee/employee-profile/edit">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Edit Profile
          </button>
        </Link>
        <Link href="/dashboard/department-employee">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

