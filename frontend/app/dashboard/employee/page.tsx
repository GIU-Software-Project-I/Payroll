'use client';

import { Card } from '@/app/components';
import Link from 'next/link';

export default function EmployeePage() {
  const employeeModules = [
    {
      title: 'My Profile',
      description: 'View and manage your personal information',
      href: '/dashboard/employee/profile',
      icon: '👤',
    },
    {
      title: 'Documents',
      description: 'Access your employee documents and certificates',
      href: '/dashboard/employee/documents',
      icon: '📄',
    },
    {
      title: 'Team Directory',
      description: 'Find colleagues and view organization structure',
      href: '/dashboard/employee/directory',
      icon: '👥',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Employee Profile</h1>
        <p className="text-slate-500 mt-1">Manage your profile and access employee services</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {employeeModules.map((module, index) => (
          <Link key={index} href={module.href}>
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
              <div className="text-center py-4">
                <span className="text-4xl">{module.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-slate-800">{module.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{module.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <Card title="Profile Summary">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">3.5</p>
            <p className="text-sm text-slate-500">Years of Service</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">15</p>
            <p className="text-sm text-slate-500">Leave Balance</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-600">2</p>
            <p className="text-sm text-slate-500">Pending Requests</p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">A</p>
            <p className="text-sm text-slate-500">Last Rating</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

