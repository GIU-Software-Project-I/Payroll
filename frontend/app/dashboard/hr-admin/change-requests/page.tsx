'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { employeeProfileService } from '@/app/services/employee-profile';

/**
 * Change Requests Page - HR Admin
 * US-E2-03: Review and approve employee-submitted profile changes
 */
export default function ChangeRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reqResponse, countResponse] = await Promise.all([
          employeeProfileService.getAllChangeRequests(),
          employeeProfileService.getPendingChangeRequestsCount()
        ]);
        setRequests(Array.isArray(reqResponse.data) ? reqResponse.data : []);
        setPendingCount((countResponse.data as any)?.count || 0);
      } catch (err: any) {
        setError(err.message || 'Failed to load change requests');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProcess = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await employeeProfileService.processChangeRequest(requestId, {
        action,
        reason: action === 'reject' ? 'Request rejected by HR Admin' : undefined
      });
      // Refresh the list
      const response = await employeeProfileService.getAllChangeRequests();
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      alert('Failed to process request: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading change requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Change Requests</h1>
        <p className="text-slate-600 mt-2">Review and process employee-submitted profile changes</p>
      </div>

      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Pending Approvals</h2>
            <p className="text-orange-100 mt-2">{pendingCount} requests awaiting review</p>
          </div>
          <div className="text-6xl">📝</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{request.employeeName || 'Employee'}</h3>
                  <p className="text-slate-600 text-sm">Submitted: {request.createdAt || 'N/A'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  request.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {request.status}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Change Details:</p>
                <p className="text-slate-600 text-sm">{request.changeDescription || JSON.stringify(request.changes)}</p>
              </div>

              {request.status === 'PENDING' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleProcess(request.id, 'approve')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleProcess(request.id, 'reject')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-slate-600">No change requests found</p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Link href="/dashboard/hr-admin">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

