'use client';

import { Card } from '@/app/components';

export default function OnboardingPage() {
  const onboardingTasks = [
    { id: 1, employee: 'Sara Mohamed', position: 'Software Engineer', startDate: 'Dec 15, 2025', progress: 75, status: 'In Progress' },
    { id: 2, employee: 'Ahmed Khaled', position: 'Marketing Specialist', startDate: 'Dec 18, 2025', progress: 40, status: 'In Progress' },
    { id: 3, employee: 'Fatma Ali', position: 'HR Assistant', startDate: 'Jan 2, 2026', progress: 10, status: 'Not Started' },
  ];

  const taskCategories = [
    { name: 'Documentation', completed: 3, total: 5 },
    { name: 'IT Setup', completed: 2, total: 4 },
    { name: 'Training', completed: 1, total: 3 },
    { name: 'Department Orientation', completed: 0, total: 2 },
  ];

  const stats = [
    { label: 'Active Onboarding', value: 3, color: 'text-blue-600', icon: '🚀' },
    { label: 'Completed This Month', value: 5, color: 'text-green-600', icon: '✅' },
    { label: 'Upcoming', value: 4, color: 'text-amber-600', icon: '📅' },
    { label: 'Avg. Completion Time', value: '5 days', color: 'text-purple-600', icon: '⏱️' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Onboarding</h1>
          <p className="text-slate-500 mt-1">Manage new employee onboarding process</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Start New Onboarding
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

      {/* Active Onboarding */}
      <Card title="Active Onboarding" action={
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Status</option>
          <option>In Progress</option>
          <option>Not Started</option>
          <option>Completed</option>
        </select>
      }>
        <div className="space-y-4">
          {onboardingTasks.map((task) => (
            <div key={task.id} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                    {task.employee.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{task.employee}</h4>
                    <p className="text-sm text-slate-500">{task.position}</p>
                    <p className="text-xs text-slate-400 mt-1">Start Date: {task.startDate}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-700'
                    : task.status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {task.status}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-medium">{task.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Task Categories Overview */}
      <Card title="Onboarding Checklist Overview">
        <div className="grid md:grid-cols-4 gap-4">
          {taskCategories.map((category, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg text-center">
              <h4 className="font-medium text-slate-800">{category.name}</h4>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {category.completed}/{category.total}
              </p>
              <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-blue-500"
                  style={{ width: `${(category.completed / category.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

