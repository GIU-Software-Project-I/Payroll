'use client';

import { Card } from '@/app/components';

export default function LeavesPage() {
  const leaveBalances = [
    { type: 'Annual Leave', total: 21, used: 6, pending: 0 },
    { type: 'Sick Leave', total: 10, used: 2, pending: 0 },
    { type: 'Personal Leave', total: 3, used: 1, pending: 0 },
  ];

  const recentRequests = [
    { id: 1, type: 'Annual', from: 'Dec 20, 2025', to: 'Dec 25, 2025', status: 'Approved', days: 5 },
    { id: 2, type: 'Sick', from: 'Nov 15, 2025', to: 'Nov 16, 2025', status: 'Approved', days: 2 },
    { id: 3, type: 'Personal', from: 'Oct 5, 2025', to: 'Oct 5, 2025', status: 'Approved', days: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Management</h1>
          <p className="text-slate-500 mt-1">Request and track your leaves</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Request Leave
        </button>
      </div>

      {/* Leave Balances */}
      <div className="grid md:grid-cols-3 gap-4">
        {leaveBalances.map((leave, index) => (
          <Card key={index} className="text-center">
            <h3 className="text-sm font-medium text-slate-500">{leave.type}</h3>
            <div className="mt-2 flex items-center justify-center space-x-4">
              <div>
                <p className="text-3xl font-bold text-blue-600">{leave.total - leave.used}</p>
                <p className="text-xs text-slate-400">Available</p>
              </div>
              <div className="h-12 w-px bg-slate-200"></div>
              <div className="text-left">
                <p className="text-sm text-slate-600"><span className="font-medium">{leave.total}</span> Total</p>
                <p className="text-sm text-slate-600"><span className="font-medium">{leave.used}</span> Used</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Requests */}
      <Card title="Recent Leave Requests">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">From</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">To</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Days</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((request) => (
                <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">{request.type}</td>
                  <td className="py-3 px-4">{request.from}</td>
                  <td className="py-3 px-4">{request.to}</td>
                  <td className="py-3 px-4">{request.days}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'Approved' 
                        ? 'bg-green-100 text-green-700' 
                        : request.status === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

