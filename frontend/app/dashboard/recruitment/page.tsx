'use client';

import { Card } from '@/app/components';

export default function RecruitmentPage() {
  const openPositions = [
    { id: 1, title: 'Senior Software Engineer', department: 'Engineering', applicants: 45, status: 'Active', posted: '2 weeks ago' },
    { id: 2, title: 'HR Coordinator', department: 'Human Resources', applicants: 28, status: 'Active', posted: '1 week ago' },
    { id: 3, title: 'Marketing Manager', department: 'Marketing', applicants: 32, status: 'Interview', posted: '3 weeks ago' },
    { id: 4, title: 'Data Analyst', department: 'Business Intelligence', applicants: 56, status: 'Active', posted: '4 days ago' },
  ];

  const recruitmentStats = [
    { label: 'Open Positions', value: 5, icon: '💼' },
    { label: 'Total Applicants', value: 161, icon: '👥' },
    { label: 'Interviews Scheduled', value: 12, icon: '📅' },
    { label: 'Offers Extended', value: 3, icon: '✉️' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recruitment</h1>
          <p className="text-slate-500 mt-1">Manage job postings and track applications</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recruitmentStats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Open Positions */}
      <Card title="Open Positions" action={
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All Departments</option>
          <option>Engineering</option>
          <option>Human Resources</option>
          <option>Marketing</option>
        </select>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Position</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Department</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Applicants</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Posted</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {openPositions.map((position) => (
                <tr key={position.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{position.title}</td>
                  <td className="py-3 px-4">{position.department}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-600">{position.applicants}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      position.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {position.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{position.posted}</td>
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

      {/* Recruitment Pipeline */}
      <Card title="Recruitment Pipeline">
        <div className="grid grid-cols-5 gap-4">
          {[
            { stage: 'New', count: 89, color: 'bg-slate-100 text-slate-700' },
            { stage: 'Screening', count: 34, color: 'bg-blue-100 text-blue-700' },
            { stage: 'Interview', count: 23, color: 'bg-amber-100 text-amber-700' },
            { stage: 'Offer', count: 12, color: 'bg-green-100 text-green-700' },
            { stage: 'Hired', count: 3, color: 'bg-purple-100 text-purple-700' },
          ].map((stage, index) => (
            <div key={index} className={`p-4 rounded-lg text-center ${stage.color}`}>
              <p className="text-2xl font-bold">{stage.count}</p>
              <p className="text-sm mt-1">{stage.stage}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

