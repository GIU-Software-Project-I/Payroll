'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { performanceService } from '@/app/services/performance';

/**
 * Disputes Page - HR Manager
 * REQ-OD-07: Resolve disputes between employees and managers about ratings
 */
export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        const response = await performanceService.searchDisputes();
        setDisputes(response.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load disputes');
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dispute Resolution</h1>
        <p className="text-slate-600 mt-2">Resolve disputes between employees and managers about ratings</p>
      </div>

      <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Pending Disputes</h2>
            <p className="text-amber-100 mt-2">{disputes.filter(d => d.status === 'PENDING').length} pending resolution</p>
          </div>
          <div className="text-6xl">⚖️</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Disputes List */}
      <div className="space-y-4">
        {disputes.length > 0 ? (
          disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{dispute.employeeName || 'Employee'}</h3>
                  <p className="text-slate-600 text-sm">Cycle: {dispute.cycleName || 'N/A'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  dispute.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  dispute.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {dispute.status}
                </span>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Reason for Objection:</p>
                <p className="text-slate-600 text-sm">{dispute.reason || 'No reason provided'}</p>
              </div>
              {dispute.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                    Approve & Adjust
                  </button>
                  <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                    Deny
                  </button>
                  <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
                    View Details
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-slate-600">No disputes found</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="font-semibold text-amber-900 mb-2">📋 Dispute Resolution Guidelines</h3>
        <ul className="text-amber-800 text-sm space-y-2">
          <li>• Review the employee's objection reason and supporting evidence</li>
          <li>• Compare with the manager's original rating and feedback</li>
          <li>• Approve & Adjust: Update the rating if the objection is valid</li>
          <li>• Deny: Keep the original rating with explanation</li>
          <li>• All outcomes are logged per BR 32</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/hr-manager">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

