'use client';

export default function SystemAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">System-wide configuration and management</p>
      </div>

      {/* Quick Stats */}
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">🏢</div>
            <p className="font-medium text-slate-900">Organization</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">⚙️</div>
            <p className="font-medium text-slate-900">Configuration</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-medium text-slate-900">System Health</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">🔧</div>
            <p className="font-medium text-slate-900">Maintenance</p>
          </button>
        </div>
      </div>
    </div>
  );
}

