'use client';

import Link from 'next/link';

export default function PayrollPage() {
  const menuItems = [
    {
      title: 'Payslip',
      description: 'View and download your payslips',
      href: '/dashboard/payroll/payslips',
      icon: '📄'
    },
    {
      title: 'Salary History',
      description: 'View your salary history',
      href: '/dashboard/payroll/history',
      icon: '📊'
    },
    {
      title: 'Deductions',
      description: 'View tax and other deductions',
      href: '/dashboard/payroll/deductions',
      icon: '💸'
    },
    {
      title: 'Reports',
      description: 'Download payroll reports',
      href: '/dashboard/payroll/reports',
      icon: '📋'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Payroll</h1>
          <p className="text-slate-600 mt-2">Access your payroll information and documents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

