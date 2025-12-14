'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

/**
 * Department Employee Dashboard
 * Main hub for self-service employee features
 * Features: Employee Profile, Organization, Performance, Payroll Self-Service
 */
export default function DepartmentEmployeePage() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    lastAppraisal: 'N/A',
    profileCompleteness: 85,
    pendingClaims: 0,
    lastPayslip: 'Dec 2024'
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Employee Dashboard</h1>
        <p className="text-slate-600 mt-2">Manage your profile, view organization structure, track performance, and access payroll</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">Pending Requests</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.pendingRequests}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-medium">Last Appraisal</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">{stats.lastAppraisal}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Profile Complete</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-green-900">{stats.profileCompleteness}%</p>
              </div>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm font-medium">Pending Claims</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">{stats.pendingClaims}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-700 text-sm font-medium">Last Payslip</p>
              <p className="text-xl font-bold text-teal-900 mt-2">{stats.lastPayslip}</p>
            </div>
            <div className="text-4xl">📄</div>
          </div>
        </div>
      </div>

      {/* Employee Subsystems - 4 Feature Cards */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Employee Subsystems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Employee Profile */}
          <Link href="/dashboard/department-employee/employee-profile">
            <div className="group bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all p-8 cursor-pointer h-full">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👤</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Employee Profile</h3>
              <p className="text-slate-600 text-sm mb-6">View and manage your personal information, update contact details, and request data corrections.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> View my profile
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> Update contact info
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> Request corrections
                </div>
              </div>
              <div className="mt-6 text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">Go to Profile →</div>
            </div>
          </Link>

          {/* Organization Structure */}
          <Link href="/dashboard/department-employee/organization">
            <div className="group bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all p-8 cursor-pointer h-full">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Organization</h3>
              <p className="text-slate-600 text-sm mb-6">View organizational structure, reporting lines, departments, and your position in the hierarchy.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> View org chart
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> See reporting lines
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> Explore structure
                </div>
              </div>
              <div className="mt-6 text-green-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">View Structure →</div>
            </div>
          </Link>

          {/* Performance */}
          <Link href="/dashboard/department-employee/performance">
            <div className="group bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all p-8 cursor-pointer h-full">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Performance</h3>
              <p className="text-slate-600 text-sm mb-6">View your appraisals, ratings, feedback, and development notes. Raise objections if needed.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> View ratings
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> Read feedback
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> Raise objections
                </div>
              </div>
              <div className="mt-6 text-purple-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">View Ratings →</div>
            </div>
          </Link>

          {/* Payroll Tracking */}
          <Link href="/dashboard/department-employee/payroll-tracking">
            <div className="group bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all p-8 cursor-pointer h-full">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💰</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Payroll Tracking</h3>
              <p className="text-slate-600 text-sm mb-6">View payslips, salary history, deductions, tax documents, and submit expense claims or disputes.</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> View payslips
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> Download tax docs
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <span className="mr-2">✓</span> Submit claims
                </div>
              </div>
              <div className="mt-6 text-amber-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">View Payroll Tracking →</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link href="/dashboard/department-employee/employee-profile/edit">
            <button className="w-full p-4 border border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center group">
              <div className="text-3xl mb-2">✏️</div>
              <p className="font-medium text-slate-900 group-hover:text-blue-700">Edit Profile</p>
              <p className="text-xs text-slate-500 mt-1">Update your info</p>
            </button>
          </Link>

          <Link href="/dashboard/department-employee/employee-profile">
            <button className="w-full p-4 border border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center group">
              <div className="text-3xl mb-2">👁️</div>
              <p className="font-medium text-slate-900 group-hover:text-blue-700">View Profile</p>
              <p className="text-xs text-slate-500 mt-1">See your details</p>
            </button>
          </Link>

          <Link href="/dashboard/department-employee/organization">
            <button className="w-full p-4 border border-slate-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center group">
              <div className="text-3xl mb-2">🗺️</div>
              <p className="font-medium text-slate-900 group-hover:text-green-700">Org Chart</p>
              <p className="text-xs text-slate-500 mt-1">View hierarchy</p>
            </button>
          </Link>

          <Link href="/dashboard/department-employee/payroll-tracking/payslips">
            <button className="w-full p-4 border border-slate-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-colors text-center group">
              <div className="text-3xl mb-2">📄</div>
              <p className="font-medium text-slate-900 group-hover:text-amber-700">My Payslips</p>
              <p className="text-xs text-slate-500 mt-1">View & download</p>
            </button>
          </Link>

          <Link href="/dashboard/department-employee/payroll-tracking/claims-disputes">
            <button className="w-full p-4 border border-slate-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-center group">
              <div className="text-3xl mb-2">⚠️</div>
              <p className="font-medium text-slate-900 group-hover:text-orange-700">Claims</p>
              <p className="text-xs text-slate-500 mt-1">Submit requests</p>
            </button>
          </Link>

          <Link href="/dashboard/department-employee/performance">
            <button className="w-full p-4 border border-slate-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center group">
              <div className="text-3xl mb-2">📈</div>
              <p className="font-medium text-slate-900 group-hover:text-purple-700">Ratings</p>
              <p className="text-xs text-slate-500 mt-1">See appraisals</p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
