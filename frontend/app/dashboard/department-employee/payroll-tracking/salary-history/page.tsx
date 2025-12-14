'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { payrollTrackingService } from '@/app/services/payroll-tracking';

/**
 * Salary History Page - Department Employee
 * REQ-PY-3: View base salary according to employment contract
 * REQ-PY-13: Access salary history to track payments over time
 * BR 2: Calculate base salary according to contract terms and role type
 */

interface SalaryRecord {
  id: string;
  effectiveDate: string;
  endDate?: string;
  baseSalary: number;
  currency: string;
  contractType: string;
  payGrade?: string;
  reason?: string;
  status: string;
}

interface BaseSalaryInfo {
  currentBaseSalary: number;
  currency: string;
  contractType: string;
  payGrade?: string;
  effectiveDate: string;
  workHoursPerWeek?: number;
  salaryFrequency?: string;
}

export default function SalaryHistoryPage() {
  const { user } = useAuth();
  const [baseSalaryInfo, setBaseSalaryInfo] = useState<BaseSalaryInfo | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  useEffect(() => {
    const fetchSalaryData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch current base salary
        const baseSalaryResponse = await payrollTrackingService.getBaseSalary(user.id);
        setBaseSalaryInfo(baseSalaryResponse?.data || null);
        
        // Fetch salary history
        const historyResponse = await payrollTrackingService.getSalaryHistory(user.id);
        setSalaryHistory(historyResponse?.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load salary information');
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryData();
  }, [user?.id]);

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

  const getContractTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'full-time':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Full-Time</span>;
      case 'part-time':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Part-Time</span>;
      case 'temporary':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Temporary</span>;
      case 'contract':
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Contract</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{type || 'N/A'}</span>;
    }
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading salary information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error loading salary data</p>
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
          <h1 className="text-3xl font-bold text-slate-900">Salary History</h1>
          <p className="text-slate-600 mt-2">View your base salary and track salary changes over time</p>
        </div>
        <Link href="/dashboard/department-employee/payroll-tracking">
          <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
            ← Back to Payroll Tracking
          </button>
        </Link>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Current Base Salary</h2>
            {baseSalaryInfo ? (
              <>
                <p className="text-4xl font-bold mt-2">
                  {formatCurrency(baseSalaryInfo.currentBaseSalary, baseSalaryInfo.currency)}
                </p>
                <p className="text-green-100 mt-1">
                  {baseSalaryInfo.salaryFrequency || 'Monthly'} • Effective {formatDate(baseSalaryInfo.effectiveDate)}
                </p>
              </>
            ) : (
              <p className="text-green-100 mt-2">No salary information available</p>
            )}
          </div>
          <div className="text-6xl">💵</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'current'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Current Salary Details
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Salary History ({salaryHistory.length})
        </button>
      </div>

      {/* Current Salary Tab */}
      {activeTab === 'current' && baseSalaryInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Salary Details */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">💰 Salary Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Base Salary</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(baseSalaryInfo.currentBaseSalary, baseSalaryInfo.currency)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Currency</span>
                <span className="font-medium text-slate-900">{baseSalaryInfo.currency}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Payment Frequency</span>
                <span className="font-medium text-slate-900">{baseSalaryInfo.salaryFrequency || 'Monthly'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Effective Date</span>
                <span className="font-medium text-slate-900">{formatDate(baseSalaryInfo.effectiveDate)}</span>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">📋 Contract Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Contract Type</span>
                {getContractTypeBadge(baseSalaryInfo.contractType)}
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Pay Grade</span>
                <span className="font-medium text-slate-900">{baseSalaryInfo.payGrade || 'N/A'}</span>
              </div>
              {baseSalaryInfo.workHoursPerWeek && (
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Work Hours/Week</span>
                  <span className="font-medium text-slate-900">{baseSalaryInfo.workHoursPerWeek} hours</span>
                </div>
              )}
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">📊 Salary Breakdown (Based on Contract)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-green-600">Annual Salary</p>
                <p className="text-xl font-bold text-green-700 mt-1">
                  {formatCurrency(baseSalaryInfo.currentBaseSalary * 12, baseSalaryInfo.currency)}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-600">Monthly Salary</p>
                <p className="text-xl font-bold text-blue-700 mt-1">
                  {formatCurrency(baseSalaryInfo.currentBaseSalary, baseSalaryInfo.currency)}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-sm text-purple-600">Weekly (Approx)</p>
                <p className="text-xl font-bold text-purple-700 mt-1">
                  {formatCurrency(baseSalaryInfo.currentBaseSalary / 4.33, baseSalaryInfo.currency)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 text-center">
                <p className="text-sm text-amber-600">Daily (Approx)</p>
                <p className="text-xl font-bold text-amber-700 mt-1">
                  {formatCurrency(baseSalaryInfo.currentBaseSalary / 22, baseSalaryInfo.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {salaryHistory.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Salary History</h3>
              <p className="text-slate-600">Your salary change history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Effective Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">End Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Base Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Contract Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Pay Grade</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Change Reason</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {salaryHistory.map((record, index) => {
                    const previousRecord = salaryHistory[index + 1];
                    const percentChange = previousRecord
                      ? calculatePercentageChange(record.baseSalary, previousRecord.baseSalary)
                      : null;
                    const isIncrease = previousRecord && record.baseSalary > previousRecord.baseSalary;
                    const isDecrease = previousRecord && record.baseSalary < previousRecord.baseSalary;

                    return (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">
                            {formatDate(record.effectiveDate)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {record.endDate ? formatDate(record.endDate) : 'Current'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-green-600">
                            {formatCurrency(record.baseSalary, record.currency)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getContractTypeBadge(record.contractType)}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {record.payGrade || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {record.reason || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          {percentChange !== null && (
                            <span className={`font-medium ${
                              isIncrease ? 'text-green-600' : isDecrease ? 'text-red-600' : 'text-slate-600'
                            }`}>
                              {isIncrease ? '↑' : isDecrease ? '↓' : '='} {Math.abs(Number(percentChange))}%
                            </span>
                          )}
                          {percentChange === null && (
                            <span className="text-slate-400">Initial</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!baseSalaryInfo && activeTab === 'current' && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Salary Information Available</h3>
          <p className="text-slate-600">Your salary details will appear here once they are configured.</p>
        </div>
      )}
    </div>
  );
}
