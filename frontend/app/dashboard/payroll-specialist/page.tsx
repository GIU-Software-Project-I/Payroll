"use client";

import Link from "next/link";

export default function PayrollSpecialistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payroll Specialist</h1>
        <p className="text-slate-600 mt-2">Payroll configuration workspace</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Configuration Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/payroll-specialist/pay-types">
            <button className="w-full p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">💼</div>
              <p className="font-medium text-slate-900">Pay Types</p>
              <p className="text-xs text-slate-500 mt-1">Create and manage pay types</p>
            </button>
          </Link>
          <Link href="/dashboard/payroll-specialist/payroll-policies">
            <button className="w-full p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">📋</div>
              <p className="font-medium text-slate-900">Payroll Policies</p>
              <p className="text-xs text-slate-500 mt-1">Define allowances, deductions, etc.</p>
            </button>
          </Link>
          <Link href="/dashboard/payroll-specialist/pay-grades">
            <button className="w-full p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">🏷️</div>
              <p className="font-medium text-slate-900">Pay Grades</p>
              <p className="text-xs text-slate-500 mt-1">Create, edit drafts, submit for approval</p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

