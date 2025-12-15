'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiService from '@/app/services/api';

interface TaxRule {
  _id: string;
  name: string;
  taxType: string;
  status: string;
  effectiveDate: string;
  brackets: Array<{
    minIncome: number;
    maxIncome: number;
    rate: number;
  }>;
}

export default function TaxRulesPage() {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxRules();
  }, []);

  const fetchTaxRules = async () => {
    try {
      const res = await apiService.get('/payroll-configuration-requirements/tax-rules');
      const data = (res?.data || res) as any;
      setTaxRules(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch tax rules:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tax Rules</h1>
          <p className="text-slate-600 mt-1">Configure tax calculation rules and brackets</p>
        </div>
        <Link href="/dashboard/payroll-specialist">
          <button className="text-slate-600 hover:text-slate-900">← Back to Dashboard</button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : taxRules.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No tax rules configured</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Brackets</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {taxRules.map((rule) => (
                  <tr key={rule._id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{rule.name}</td>
                    <td className="py-3 px-4 text-slate-600">{rule.taxType}</td>
                    <td className="py-3 px-4 text-slate-600">{rule.brackets?.length || 0} brackets</td>
                    <td className="py-3 px-4">{getStatusBadge(rule.status)}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {rule.effectiveDate ? new Date(rule.effectiveDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
