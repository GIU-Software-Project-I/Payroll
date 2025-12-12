'use client';

import { Card } from '@/app/components';

export default function OrganizationPage() {
  const departments = [
    { id: 1, name: 'Engineering', employees: 45, head: 'Mohamed Ali', positions: 12 },
    { id: 2, name: 'Human Resources', employees: 12, head: 'Sarah Ahmed', positions: 5 },
    { id: 3, name: 'Marketing', employees: 18, head: 'Nada Hassan', positions: 6 },
    { id: 4, name: 'Finance', employees: 15, head: 'Ahmed Mahmoud', positions: 4 },
    { id: 5, name: 'Operations', employees: 32, head: 'Khaled Ibrahim', positions: 8 },
  ];

  const orgStats = [
    { label: 'Total Departments', value: 8, color: 'text-blue-600' },
    { label: 'Total Positions', value: 56, color: 'text-green-600' },
    { label: 'Vacant Positions', value: 5, color: 'text-amber-600' },
    { label: 'Management Level', value: 12, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Organization Structure</h1>
          <p className="text-slate-500 mt-1">Manage departments and organizational hierarchy</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            View Org Chart
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Department
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {orgStats.map((stat, index) => (
          <Card key={index}>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Department List */}
      <Card title="Departments">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Department</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Department Head</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Employees</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Positions</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-semibold mr-3">
                        {dept.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{dept.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{dept.head}</td>
                  <td className="py-3 px-4 font-medium text-blue-600">{dept.employees}</td>
                  <td className="py-3 px-4">{dept.positions}</td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3">
                      View
                    </button>
                    <button className="text-slate-600 hover:text-slate-700 text-sm font-medium">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Simple Org Chart Visualization */}
      <Card title="Organization Chart">
        <div className="flex flex-col items-center py-8">
          {/* CEO */}
          <div className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium shadow-lg">
            CEO
          </div>
          <div className="w-px h-8 bg-slate-300"></div>

          {/* C-Level */}
          <div className="flex items-center space-x-4">
            <div className="w-24 h-px bg-slate-300"></div>
            <div className="flex space-x-4">
              {['CFO', 'COO', 'CTO', 'CHRO'].map((title, index) => (
                <div key={index} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium text-sm">
                  {title}
                </div>
              ))}
            </div>
            <div className="w-24 h-px bg-slate-300"></div>
          </div>
          <div className="w-px h-8 bg-slate-300"></div>

          {/* Departments */}
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
            {departments.map((dept) => (
              <div key={dept.id} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">
                {dept.name}
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-500">Click &ldquo;View Org Chart&rdquo; for a detailed interactive view</p>
        </div>
      </Card>
    </div>
  );
}

