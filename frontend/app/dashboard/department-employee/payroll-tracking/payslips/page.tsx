'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { payrollTrackingService } from '@/app/services/payroll-tracking';

/**
 * Payslips Page - Department Employee
 * REQ-PY-1: View and download payslip online
 * REQ-PY-2: See status and details of payslip (paid, disputed)
 * BR 17: Auto-generated Payslip with clear breakdown of components
 */

interface Payslip {
  id: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: string;
  baseSalary: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  earnings?: {
    type: string;
    amount: number;
    description?: string;
  }[];
  deductions?: {
    type: string;
    amount: number;
    description?: string;
  }[];
}

export default function PayslipsPage() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await payrollTrackingService.getEmployeePayslips(user.id);
        setPayslips(response?.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load payslips');
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [user?.id]);

  const handleViewDetails = async (payslip: Payslip) => {
    if (!user?.id) return;
    
    try {
      const response = await payrollTrackingService.getPayslipDetails(payslip.id, user.id);
      setSelectedPayslip(response?.data || payslip);
    } catch (err) {
      setSelectedPayslip(payslip);
    }
  };

  const handleDownload = async (payslipId: string) => {
    if (!user?.id) return;
    
    try {
      setDownloading(payslipId);
      const response = await payrollTrackingService.downloadPayslip(payslipId, user.id);
      
      // Handle file download
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${payslipId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      alert('Failed to download payslip: ' + (err.message || 'Unknown error'));
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Paid</span>;
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Pending</span>;
      case 'disputed':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Disputed</span>;
      case 'processing':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Processing</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status || 'Unknown'}</span>;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your payslips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error loading payslips</p>
        <p className="text-red-700 text-sm mt-2">{error}</p>
        <Link href="/dashboard/department-employee/payroll-tracking">
          <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Back to Payroll Tracking
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Payslips</h1>
          <p className="text-slate-600 mt-2">View and download your monthly payslips</p>
        </div>
        <Link href="/dashboard/department-employee/payroll-tracking">
          <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
            ← Back to Payroll Tracking
          </button>
        </Link>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Payslip Overview</h2>
            <p className="text-blue-100 mt-1">{payslips.length} payslips available</p>
          </div>
          <div className="text-5xl">📄</div>
        </div>
      </div>

      {/* Payslips List */}
      {payslips.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Payslips Available</h3>
          <p className="text-slate-600">Your payslips will appear here once they are generated.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Period</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Pay Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Gross Pay</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Deductions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Net Pay</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {formatPeriod(payslip.periodStart, payslip.periodEnd)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatDate(payslip.payDate)}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">
                      {formatCurrency(payslip.grossPay, payslip.currency)}
                    </td>
                    <td className="px-6 py-4 text-red-600">
                      -{formatCurrency(payslip.totalDeductions, payslip.currency)}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-bold">
                      {formatCurrency(payslip.netPay, payslip.currency)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payslip.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(payslip)}
                          className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(payslip.id)}
                          disabled={downloading === payslip.id}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {downloading === payslip.id ? '...' : '⬇️ PDF'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payslip Detail Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Payslip Details</h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Period: {formatPeriod(selectedPayslip.periodStart, selectedPayslip.periodEnd)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="text-white hover:text-blue-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Base Salary</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(selectedPayslip.baseSalary, selectedPayslip.currency)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Gross Pay</p>
                  <p className="text-lg font-bold text-green-700">
                    {formatCurrency(selectedPayslip.grossPay, selectedPayslip.currency)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-red-600">Deductions</p>
                  <p className="text-lg font-bold text-red-700">
                    -{formatCurrency(selectedPayslip.totalDeductions, selectedPayslip.currency)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Net Pay</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(selectedPayslip.netPay, selectedPayslip.currency)}
                  </p>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-4">💰 Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-700">Base Salary</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(selectedPayslip.baseSalary, selectedPayslip.currency)}
                    </span>
                  </div>
                  {selectedPayslip.earnings?.map((earning, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-700">{earning.type}</span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(earning.amount, selectedPayslip.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-bold">
                    <span className="text-slate-900">Total Earnings</span>
                    <span className="text-green-600">
                      {formatCurrency(selectedPayslip.grossPay, selectedPayslip.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-4">💸 Deductions</h4>
                <div className="space-y-2">
                  {selectedPayslip.deductions?.map((deduction, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-700">{deduction.type}</span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(deduction.amount, selectedPayslip.currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 font-bold">
                    <span className="text-slate-900">Total Deductions</span>
                    <span className="text-red-600">
                      -{formatCurrency(selectedPayslip.totalDeductions, selectedPayslip.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-900">Net Pay</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedPayslip.netPay, selectedPayslip.currency)}
                  </span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-slate-600">Status:</span>
                  {getStatusBadge(selectedPayslip.status)}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownload(selectedPayslip.id)}
                    disabled={downloading === selectedPayslip.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {downloading === selectedPayslip.id ? 'Downloading...' : '⬇️ Download PDF'}
                  </button>
                  <Link href="/dashboard/department-employee/payroll-tracking/claims-disputes">
                    <button className="px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50">
                      ⚠️ Dispute
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
