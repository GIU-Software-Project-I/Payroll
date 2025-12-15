'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { payrollExecutionService } from '@/app/services/payroll-execution';

interface Stats {
    pendingApprovals: number;
    totalPayroll: number;
    payslipsReady: number;
    fullyApproved: number;
}

export default function FinanceStaffPage() {
    const [stats, setStats] = useState<Stats>({
        pendingApprovals: 0,
        totalPayroll: 0,
        payslipsReady: 0,
        fullyApproved: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await payrollExecutionService.listRuns({ page: 1, limit: 100 });
            const data = (res?.data || res) as any;
            const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

            // Runs approved by manager but not finance
            const pending = items.filter((r: any) => r.approvedByManager && !r.approvedByFinance).length;

            // Total payroll pending finance approval
            const totalPay = items
                .filter((r: any) => r.approvedByManager && !r.approvedByFinance)
                .reduce((sum: number, r: any) => sum + (r.totalnetpay || 0), 0);

            // Runs with payslips generated
            const withPayslips = items.filter((r: any) => r.payslipsGenerated).length;

            // Fully approved runs
            const approved = items.filter((r: any) => r.approvedByFinance).length;

            setStats({
                pendingApprovals: pending,
                totalPayroll: totalPay,
                payslipsReady: withPayslips,
                fullyApproved: approved,
            });
        } catch (e) {
            console.error('Failed to fetch stats:', e);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `EGP ${amount.toLocaleString()}`;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Finance Staff Dashboard</h1>
                <p className="text-slate-800 mt-2">Final payroll approval and payslip generation (REQ-PY-15, REQ-PY-8)</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <p className="text-slate-600 text-sm">Pending Finance Approval</p>
                    <p className={`text-2xl font-bold mt-2 ${stats.pendingApprovals > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                        {loading ? '...' : stats.pendingApprovals}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <p className="text-slate-600 text-sm">Pending Total</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                        {loading ? '...' : formatCurrency(stats.totalPayroll)}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <p className="text-slate-600 text-sm">Payslips Generated</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">
                        {loading ? '...' : stats.payslipsReady}
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <p className="text-slate-600 text-sm">Fully Approved</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {loading ? '...' : stats.fullyApproved}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/dashboard/finance-staff/runs"
                        className="p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center block"
                    >
                        <div className="text-2xl mb-2">✅</div>
                        <p className="font-medium text-slate-900">Approve Payroll</p>
                        <p className="text-xs text-slate-500 mt-1">REQ-PY-15 - Final Step</p>
                    </Link>
                    <Link
                        href="/dashboard/finance-staff/runs"
                        className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center block"
                    >
                        <div className="text-2xl mb-2">📄</div>
                        <p className="font-medium text-slate-900">Generate Payslips</p>
                        <p className="text-xs text-slate-500 mt-1">REQ-PY-8</p>
                    </Link>
                    <Link
                        href="/dashboard/finance-staff/runs"
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center block"
                    >
                        <div className="text-2xl mb-2">📊</div>
                        <p className="font-medium text-slate-900">Financial Review</p>
                        <p className="text-xs text-slate-500 mt-1">BR 59 - Breakdown</p>
                    </Link>
                    <Link
                        href="/dashboard/finance-staff/runs"
                        className="p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center block"
                    >
                        <div className="text-2xl mb-2">📋</div>
                        <p className="font-medium text-slate-900">All Runs</p>
                        <p className="text-xs text-slate-500 mt-1">View History</p>
                    </Link>
                </div>
            </div>

            {/* Requirements Info */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <h2 className="text-lg font-semibold text-green-900 mb-3">Finance Responsibilities</h2>
                <ul className="text-sm text-green-800 space-y-2">
                    <li><strong>REQ-PY-15:</strong> Final approval of payroll after manager review</li>
                    <li><strong>REQ-PY-8:</strong> Generate payslips automatically after approval</li>
                    <li><strong>BR 30:</strong> Finance is the final step in approval workflow</li>
                    <li><strong>BR 59:</strong> Review gross-to-net breakdown and verify deductions</li>
                    <li><strong>BR 16-22:</strong> Verify tax calculations and insurance deductions</li>
                </ul>
            </div>

            {/* Workflow Info */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Approval Workflow (BR 30)</h2>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">1</span>
                        <span>Specialist Creates</span>
                    </div>
                    <span className="text-gray-300">→</span>
                    <div className="flex items-center gap-2 text-gray-500">
                        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">2</span>
                        <span>Manager Approves</span>
                    </div>
                    <span className="text-gray-300">→</span>
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                        <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">3</span>
                        <span>Finance Approves (You)</span>
                    </div>
                    <span className="text-gray-300">→</span>
                    <div className="flex items-center gap-2 text-purple-600">
                        <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">4</span>
                        <span>Payslips Generated</span>
                    </div>
                </div>
            </div>
        </div>
    );
}