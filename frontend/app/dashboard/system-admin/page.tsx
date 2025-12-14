"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { payrollConfigurationService } from "@/app/services/payroll-configuration";

type CompanySettingsForm = {
  companyName: string;
  currency: string;
  payrollCycleDay: string;
  taxYear: string;
  fiscalYearStart: string;
  fiscalYearEnd: string;
};

export default function SystemAdminPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CompanySettingsForm>({
    companyName: "",
    currency: "USD",
    payrollCycleDay: "28",
    taxYear: "2025",
    fiscalYearStart: "2025-01-01",
    fiscalYearEnd: "2025-12-31",
  });

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    const res = await payrollConfigurationService.getCompanyWideSettings();
    if (res.error) setError(res.error);
    const data = (res.data as any)?.data || (res.data as any);
    if (data) {
      setForm({
        companyName: data.companyName ?? "",
        currency: data.currency ?? "USD",
        payrollCycleDay: String(data.payrollCycleDay ?? "28"),
        taxYear: data.taxYear ?? "",
        fiscalYearStart: data.fiscalYearStart ?? "",
        fiscalYearEnd: data.fiscalYearEnd ?? "",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    const payload = {
      companyName: form.companyName,
      currency: form.currency,
      payrollCycleDay: Number(form.payrollCycleDay),
      taxYear: form.taxYear,
      fiscalYearStart: form.fiscalYearStart,
      fiscalYearEnd: form.fiscalYearEnd,
    };
    const res = await payrollConfigurationService.updateCompanyWideSettings(payload);
    if (res.error) setError(res.error);
    setSaving(false);
  };

  const triggerBackup = async () => {
    // Placeholder: call backend when endpoint exists; for now just UI feedback
    alert("Backup triggered (placeholder)");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">Company-wide settings and system tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">System Uptime</p>
          <p className="text-2xl font-bold text-green-600 mt-2">99.9%</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Active Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">145</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Backup Status</p>
          <p className="text-2xl font-bold text-green-600 mt-2">OK</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Alerts</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Settings</h2>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {loading ? (
          <p className="text-slate-600">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="border rounded px-3 py-2" placeholder="Company Name" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
            <input className="border rounded px-3 py-2" placeholder="Currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
            <input className="border rounded px-3 py-2" placeholder="Payroll Cycle Day" type="number" value={form.payrollCycleDay} onChange={(e) => setForm((f) => ({ ...f, payrollCycleDay: e.target.value }))} />
            <input className="border rounded px-3 py-2" placeholder="Tax Year" value={form.taxYear} onChange={(e) => setForm((f) => ({ ...f, taxYear: e.target.value }))} />
            <input className="border rounded px-3 py-2" placeholder="Fiscal Year Start (YYYY-MM-DD)" value={form.fiscalYearStart} onChange={(e) => setForm((f) => ({ ...f, fiscalYearStart: e.target.value }))} />
            <input className="border rounded px-3 py-2" placeholder="Fiscal Year End (YYYY-MM-DD)" value={form.fiscalYearEnd} onChange={(e) => setForm((f) => ({ ...f, fiscalYearEnd: e.target.value }))} />
            <div className="md:col-span-3 flex gap-2">
              <button className="bg-violet-600 text-white rounded px-4 py-2 disabled:opacity-50" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</button>
              <button className="border rounded px-4 py-2" onClick={triggerBackup}>Trigger Data Backup</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/system-admin/organization">
            <button className="w-full p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors text-center">
              <div className="text-2xl mb-2">🏢</div>
              <p className="font-medium text-slate-900">Organization</p>
              <p className="text-xs text-slate-500 mt-1">View structure</p>
            </button>
          </Link>
          <Link href="/dashboard/system-admin/departments">
            <button className="w-full p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors text-center">
              <div className="text-2xl mb-2">🏛️</div>
              <p className="font-medium text-slate-900">Departments</p>
              <p className="text-xs text-slate-500 mt-1">Manage departments</p>
            </button>
          </Link>
          <Link href="/dashboard/system-admin/positions">
            <button className="w-full p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors text-center">
              <div className="text-2xl mb-2">💼</div>
              <p className="font-medium text-slate-900">Positions</p>
              <p className="text-xs text-slate-500 mt-1">Manage positions</p>
            </button>
          </Link>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors text-center">
            <div className="text-2xl mb-2">🔧</div>
            <p className="font-medium text-slate-900">Maintenance</p>
            <p className="text-xs text-slate-500 mt-1">System tools</p>
          </button>
        </div>
      </div>
    </div>
  );
}

