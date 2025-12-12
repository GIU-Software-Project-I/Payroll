'use client';

import { Card } from '@/app/components';

export default function PayrollPage() {
  const payrollSummary = {
    basicSalary: 15000,
    allowances: 3500,
    deductions: 2800,
    netSalary: 15700,
  };

  const recentPayslips = [
    { id: 1, month: 'November 2025', gross: 18500, deductions: 2800, net: 15700, status: 'Paid' },
    { id: 2, month: 'October 2025', gross: 18500, deductions: 2800, net: 15700, status: 'Paid' },
    { id: 3, month: 'September 2025', gross: 18500, deductions: 2800, net: 15700, status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
        <p className="text-slate-500 mt-1">View your salary details and payslips</p>
      </div>

      {/* Current Month Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-slate-500">Basic Salary</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            EGP {payrollSummary.basicSalary.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Allowances</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            + EGP {payrollSummary.allowances.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Deductions</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            - EGP {payrollSummary.deductions.toLocaleString()}
          </p>
        </Card>
        <Card className="bg-blue-600 border-blue-600">
          <p className="text-sm text-blue-100">Net Salary</p>
          <p className="text-2xl font-bold text-white mt-1">
            EGP {payrollSummary.netSalary.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Salary Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Earnings">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Basic Salary</span>
              <span className="font-medium">EGP 15,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Housing Allowance</span>
              <span className="font-medium">EGP 2,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Transportation</span>
              <span className="font-medium">EGP 1,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Mobile Allowance</span>
              <span className="font-medium">EGP 500</span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-green-600">
              <span>Total Earnings</span>
              <span>EGP 18,500</span>
            </div>
          </div>
        </Card>

        <Card title="Deductions">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Income Tax</span>
              <span className="font-medium">EGP 1,500</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Social Insurance</span>
              <span className="font-medium">EGP 800</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Health Insurance</span>
              <span className="font-medium">EGP 500</span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-red-600">
              <span>Total Deductions</span>
              <span>EGP 2,800</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Payslips */}
      <Card title="Recent Payslips" action={
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Download All
        </button>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Month</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Gross</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Deductions</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Net</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPayslips.map((payslip) => (
                <tr key={payslip.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium">{payslip.month}</td>
                  <td className="py-3 px-4">EGP {payslip.gross.toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-600">- EGP {payslip.deductions.toLocaleString()}</td>
                  <td className="py-3 px-4 font-medium">EGP {payslip.net.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      {payslip.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Download
                    </button>
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

