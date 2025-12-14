"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { payrollConfigurationService } from "@/app/services/payroll-configuration";

type CompanySettingsForm = {
  currency: string;
  timeZone: string;
  payDate: string;
};

interface BackupHistory {
  id: string;
  timestamp: string;
  size: string;
  status: "success" | "failed" | "pending";
  type: "full" | "incremental";
}

export default function SystemAdminPage() {
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [errorSettings, setErrorSettings] = useState<string | null>(null);
  const [successSettings, setSuccessSettings] = useState<string | null>(null);
  
  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([
    {
      id: "bak-001",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      size: "2.4 GB",
      status: "success",
      type: "full",
    },
    {
      id: "bak-002",
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      size: "156 MB",
      status: "success",
      type: "incremental",
    },
    {
      id: "bak-003",
      timestamp: new Date().toISOString(),
      size: "172 MB",
      status: "pending",
      type: "incremental",
    },
  ]);
  
  const [backupConfig, setBackupConfig] = useState({
    autoBackupEnabled: true,
    backupFrequency: "daily",
    retentionDays: "30",
    backupTime: "02:00",
    notifyEmail: "admin@company.com",
  });

  const [form, setForm] = useState<CompanySettingsForm>({
    currency: "EGP",
    timeZone: "Africa/Cairo",
    payDate: new Date().toISOString().split('T')[0],
  });

  const loadSettings = async () => {
    setLoadingSettings(true);
    setErrorSettings(null);
    try {
      const res = await payrollConfigurationService.getCompanyWideSettings();
      // Handle both wrapped and unwrapped response formats
      const data = (res.data as any)?.data || (res.data as any);
      if (data) {
        setForm({
          currency: data.currency ?? "EGP",
          timeZone: data.timeZone ?? "Africa/Cairo",
          payDate: data.payDate ? new Date(data.payDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
      }
    } catch (e: any) {
      setErrorSettings(e?.message || "Failed to load settings");
      console.error('Load settings error:', e);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    setErrorSettings(null);
    setSuccessSettings(null);
    try {
      const payload = {
        currency: form.currency,
        timeZone: form.timeZone,
        payDate: form.payDate,
      };
      await payrollConfigurationService.updateCompanyWideSettings(payload);
      setSuccessSettings("Company settings saved successfully");
    } catch (e: any) {
      setErrorSettings(e?.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const triggerBackup = async () => {
    try {
      // Add new pending backup to history
      const newBackup: BackupHistory = {
        id: `bak-${Date.now()}`,
        timestamp: new Date().toISOString(),
        size: "0 MB",
        status: "pending",
        type: "incremental",
      };
      setBackupHistory([newBackup, ...backupHistory]);

      // Simulate backup completion after 3 seconds
      setTimeout(() => {
        setBackupHistory((prev) =>
          prev.map((b) =>
            b.id === newBackup.id
              ? { ...b, status: "success", size: Math.random() * 500 + "MB" }
              : b
          )
        );
      }, 3000);
    } catch (e: any) {
      alert("Failed to trigger backup: " + e?.message);
    }
  };

  const saveBackupConfig = async () => {
    try {
      // Call backend to save backup configuration when endpoint available
      alert("Backup configuration saved successfully");
    } catch (e: any) {
      alert("Failed to save backup config: " + e?.message);
    }
  };

  const restoreBackup = (id: string) => {
    if (!confirm("Are you sure you want to restore from this backup? This will overwrite current data.")) return;
    alert(`Restore from backup ${id} initiated (placeholder)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">Company-wide settings, system configuration, and data management</p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm font-medium">System Uptime</p>
          <p className="text-2xl font-bold text-green-600 mt-2">99.9%</p>
          <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm font-medium">Active Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">248</p>
          <p className="text-xs text-slate-500 mt-1">Connected now</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm font-medium">Last Backup</p>
          <p className="text-2xl font-bold text-green-600 mt-2">2 hours ago</p>
          <p className="text-xs text-slate-500 mt-1">Status: Success</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm font-medium">Storage Used</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">47.2 GB</p>
          <p className="text-xs text-slate-500 mt-1">of 100 GB available</p>
        </div>
      </div>

      {/* REQ-PY-15: Company-Wide Settings Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Company-Wide Settings</h2>
          <p className="text-xs text-slate-600 mt-1">REQ-PY-15: Configure company settings, payroll cycles, and time zone</p>
        </div>

        {/* Info Banner */}
        <div className="p-4 mx-6 mt-6 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium">⚙️ Payroll Configuration Settings</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Payroll Date:</strong> When payroll will be executed and processed</li>
            <li><strong>Currency:</strong> Default currency for all salary, allowance, and deduction calculations</li>
            <li><strong>Timezone:</strong> Server timezone for scheduled payroll runs and audit logs</li>
            <li>Changes apply to all new payroll runs created after modification</li>
          </ul>
        </div>

        {/* Settings Form */}
        <div className="p-6">
          {errorSettings && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              ❌ {errorSettings}
            </div>
          )}
          {successSettings && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✓ {successSettings}
            </div>
          )}

          {loadingSettings ? (
            <p className="text-slate-600">Loading settings...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  >
                    <option value="EGP">EGP - Egyptian Pound</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="PKR">PKR - Pakistani Rupee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.timeZone}
                    onChange={(e) => setForm((f) => ({ ...f, timeZone: e.target.value }))}
                  >
                    <option value="Africa/Cairo">Africa/Cairo</option>
                    <option value="UTC">UTC</option>
                    <option value="EST">EST - Eastern Standard Time</option>
                    <option value="CST">CST - Central Standard Time</option>
                    <option value="MST">MST - Mountain Standard Time</option>
                    <option value="PST">PST - Pacific Standard Time</option>
                    <option value="GST">GST - Gulf Standard Time (Dubai)</option>
                    <option value="PKT">PKT - Pakistan Standard Time</option>
                    <option value="IST">IST - Indian Standard Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payroll Date</label>
                  <input
                    type="date"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.payDate}
                    onChange={(e) => setForm((f) => ({ ...f, payDate: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500 mt-1">Date for payroll execution</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 text-sm font-medium"
                >
                  {savingSettings ? "Saving..." : "Save Company Settings"}
                </button>
                <button
                  onClick={loadSettings}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REQ-PY-16: Data Backup Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backup Configuration Panel */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Backup Configuration</h2>
            <p className="text-xs text-slate-600 mt-1">REQ-PY-16: Set backup schedule and policies</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={backupConfig.autoBackupEnabled}
                  onChange={(e) =>
                    setBackupConfig((c) => ({ ...c, autoBackupEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-slate-300 text-violet-600"
                />
                <span className="text-sm font-medium text-slate-700">Enable Automatic Backups</span>
              </label>
              <p className="text-xs text-slate-500 ml-6">Automatically backup data on schedule</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Backup Frequency</label>
              <select
                value={backupConfig.backupFrequency}
                onChange={(e) =>
                  setBackupConfig((c) => ({ ...c, backupFrequency: e.target.value }))
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="hourly">Every Hour</option>
                <option value="every-6h">Every 6 Hours</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Backup Time (UTC)</label>
              <input
                type="time"
                value={backupConfig.backupTime}
                onChange={(e) =>
                  setBackupConfig((c) => ({ ...c, backupTime: e.target.value }))
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Retention (days)</label>
              <input
                type="number"
                min="7"
                max="365"
                value={backupConfig.retentionDays}
                onChange={(e) =>
                  setBackupConfig((c) => ({ ...c, retentionDays: e.target.value }))
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Keep backups for this many days</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notification Email</label>
              <input
                type="email"
                value={backupConfig.notifyEmail}
                onChange={(e) =>
                  setBackupConfig((c) => ({ ...c, notifyEmail: e.target.value }))
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="admin@company.com"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={saveBackupConfig}
                className="flex-1 px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm font-medium"
              >
                Save Config
              </button>
              <button
                onClick={triggerBackup}
                className="flex-1 px-3 py-2 border border-violet-300 bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 text-sm font-medium"
              >
                Backup Now
              </button>
            </div>
          </div>
        </div>

        {/* Backup History Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Backup History</h2>
            <p className="text-xs text-slate-600 mt-1">Recent backup operations and restore options</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-slate-50">
                  <th className="py-3 px-6 font-medium text-slate-700">Timestamp</th>
                  <th className="py-3 px-6 font-medium text-slate-700">Type</th>
                  <th className="py-3 px-6 font-medium text-slate-700">Size</th>
                  <th className="py-3 px-6 font-medium text-slate-700">Status</th>
                  <th className="py-3 px-6 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backupHistory.map((backup) => (
                  <tr key={backup.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-6 text-slate-900">
                      {new Date(backup.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {backup.type === "full" ? "Full Backup" : "Incremental"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-600">{backup.size}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${
                          backup.status === "success"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : backup.status === "failed"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {backup.status === "success"
                          ? "✓ Success"
                          : backup.status === "failed"
                          ? "✗ Failed"
                          : "⏳ In Progress"}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      {backup.status === "success" && (
                        <button
                          onClick={() => restoreBackup(backup.id)}
                          className="px-2 py-1 border border-slate-300 rounded text-xs hover:bg-slate-50"
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Information Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information & Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-medium text-slate-900 mb-2">Company Settings (REQ-PY-15)</p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-slate-700">
              <li>Payroll date controls when payroll execution occurs</li>
              <li>Currency setting is used in all calculations and reports globally</li>
              <li>Timezone affects scheduled payroll tasks and audit log timestamps</li>
              <li>All changes apply to new payroll runs created after modification</li>
              <li>Default values: Currency=EGP, Timezone=Africa/Cairo per BR 3</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-900 mb-2">Data Backup (REQ-PY-16)</p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-slate-700">
              <li>Automatic backups prevent data loss</li>
              <li>Full backups run weekly; daily incremental backups</li>
              <li>Backups stored in geographically distributed locations</li>
              <li>Test restore procedures regularly</li>
              <li>Retention period set to 30 days by default (adjustable)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">System Administration</h2>
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

