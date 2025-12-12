'use client';

import { Card } from '@/app/components';

export default function OffboardingPage() {
  const offboardingCases = [
    { id: 1, employee: 'Mahmoud Ibrahim', position: 'Senior Developer', lastDay: 'Dec 20, 2025', type: 'Resignation', progress: 60 },
    { id: 2, employee: 'Heba Samir', position: 'Accountant', lastDay: 'Dec 31, 2025', type: 'Resignation', progress: 25 },
  ];

  const checklistItems = [
    { name: 'Exit Interview', status: 'completed' },
    { name: 'Knowledge Transfer', status: 'in-progress' },
    { name: 'Asset Return', status: 'pending' },
    { name: 'Access Revocation', status: 'pending' },
    { name: 'Final Settlement', status: 'pending' },
    { name: 'Clearance Certificate', status: 'pending' },
  ];

  const stats = [
    { label: 'Active Offboarding', value: 2, color: 'text-amber-600', icon: '👋' },
    { label: 'Completed This Month', value: 1, color: 'text-green-600', icon: '✅' },
    { label: 'Pending Clearance', value: 2, color: 'text-red-600', icon: '⏳' },
    { label: 'Avg. Process Time', value: '7 days', color: 'text-blue-600', icon: '📊' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in-progress': return '•';
      default: return '○';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Offboarding</h1>
          <p className="text-slate-500 mt-1">Manage employee separation and exit processes</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Initiate Offboarding
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Offboarding Cases */}
      <Card title="Active Offboarding Cases">
        <div className="space-y-4">
          {offboardingCases.map((caseItem) => (
            <div key={caseItem.id} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-semibold">
                    {caseItem.employee.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{caseItem.employee}</h4>
                    <p className="text-sm text-slate-500">{caseItem.position}</p>
                    <p className="text-xs text-slate-400 mt-1">Last Working Day: {caseItem.lastDay}</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">
                  {caseItem.type}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Clearance Progress</span>
                  <span className="font-medium">{caseItem.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-amber-500"
                    style={{ width: `${caseItem.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-3 flex justify-end space-x-3">
                <button className="text-sm text-slate-600 hover:text-slate-700 font-medium">
                  View Checklist
                </button>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Manage →
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Offboarding Checklist Template */}
      <Card title="Standard Offboarding Checklist">
        <div className="grid md:grid-cols-2 gap-4">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
              </span>
              <span className="text-slate-700">{item.name}</span>
              <span className={`ml-auto px-2 py-0.5 text-xs rounded ${getStatusColor(item.status)}`}>
                {item.status.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Exit Reasons Analytics */}
      <Card title="Exit Reasons (Last 12 Months)">
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { reason: 'Better Opportunity', count: 8, percentage: 40 },
            { reason: 'Personal Reasons', count: 4, percentage: 20 },
            { reason: 'Relocation', count: 3, percentage: 15 },
            { reason: 'Career Change', count: 3, percentage: 15 },
            { reason: 'Other', count: 2, percentage: 10 },
          ].map((item, index) => (
            <div key={index} className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-800">{item.count}</p>
              <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
              <p className="text-xs text-blue-600 mt-1">{item.percentage}%</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

