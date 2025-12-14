'use client';

export default function HRAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">HR Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">HR system administration</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">520</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Active Roles</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">12</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">System Health</p>
          <p className="text-2xl font-bold text-green-600 mt-2">Healthy</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Pending Audits</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">3</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">⚙️</div>
            <p className="font-medium text-slate-900">System Config</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">👥</div>
            <p className="font-medium text-slate-900">User Management</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">📋</div>
            <p className="font-medium text-slate-900">Audit Logs</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">🔐</div>
            <p className="font-medium text-slate-900">Security</p>
          </button>
        </div>
      </div>
    </div>
  );
}

