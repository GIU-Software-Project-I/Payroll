'use client';

export default function DepartmentEmployeePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Department Employee Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to your self-service employee portal</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Leave Balance</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">12 days</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Pending Requests</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Last Payslip</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">Dec 2025</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p className="text-slate-600 text-sm">Attendance</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">98%</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">📅</div>
            <p className="font-medium text-slate-900">Request Leave</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">📄</div>
            <p className="font-medium text-slate-900">View Payslip</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">👤</div>
            <p className="font-medium text-slate-900">My Profile</p>
          </button>
          <button className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
            <div className="text-2xl mb-2">⏰</div>
            <p className="font-medium text-slate-900">Clock In/Out</p>
          </button>
        </div>
      </div>
    </div>
  );
}

