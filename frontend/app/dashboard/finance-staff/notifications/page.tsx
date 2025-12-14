'use client';

import { useState, useEffect } from 'react';
import { financeStaffService, ApprovedDispute, ApprovedClaim } from '@/app/services/finance-staff';
import { useAuth } from '@/app/context/AuthContext';
import { SystemRole } from '@/app/types';

export default function NotificationsPage() {
  const { hasRole } = useAuth();
  const [approvedDisputes, setApprovedDisputes] = useState<ApprovedDispute[]>([]);
  const [approvedClaims, setApprovedClaims] = useState<ApprovedClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'disputes' | 'claims'>('disputes');

  useEffect(() => {
    if (!hasRole([SystemRole.FINANCE_STAFF, SystemRole.PAYROLL_MANAGER, SystemRole.HR_ADMIN])) return;
    loadNotifications();
  }, [hasRole]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [disputesResponse, claimsResponse] = await Promise.all([
        financeStaffService.getApprovedDisputes(),
        financeStaffService.getApprovedClaims(),
      ]);
      
      if (disputesResponse.data) setApprovedDisputes(disputesResponse.data);
      if (claimsResponse.data) setApprovedClaims(claimsResponse.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (type: 'dispute' | 'claim', id: string) => {
    try {
      await financeStaffService.markNotificationAsRead(type, id);
      // Reload data to update the UI
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  if (!hasRole([SystemRole.FINANCE_STAFF, SystemRole.PAYROLL_MANAGER, SystemRole.HR_ADMIN])) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Access denied. Finance Staff role required.</p>
      </div>
    );
  }

  const renderDisputes = () => (
    <div className="space-y-4">
      {approvedDisputes.map((dispute) => (
        <div key={dispute.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-slate-900">{dispute.employeeName}</h3>
                <span className="text-sm text-slate-500">{dispute.employeeNumber}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  dispute.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  dispute.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  dispute.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {dispute.priority}
                </span>
                {dispute.needsRefund && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Needs Refund
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1">{dispute.department}</p>
              <div className="mt-2">
                <p className="text-sm font-medium text-slate-900">{dispute.type}</p>
                <p className="text-sm text-slate-600 mt-1">{dispute.description}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Amount</p>
                  <p className="font-medium text-slate-900">${dispute.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Period</p>
                  <p className="font-medium text-slate-900">{dispute.period}</p>
                </div>
                <div>
                  <p className="text-slate-500">Approved By</p>
                  <p className="font-medium text-slate-900">{dispute.approvedBy}</p>
                </div>
                <div>
                  <p className="text-slate-500">Refund Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    dispute.refundStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    dispute.refundStatus === 'processed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dispute.refundStatus}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Approved on {new Date(dispute.approvedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleMarkAsRead('dispute', dispute.id)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Mark as Read
              </button>
            </div>
          </div>
        </div>
      ))}
      {approvedDisputes.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No approved disputes found
        </div>
      )}
    </div>
  );

  const renderClaims = () => (
    <div className="space-y-4">
      {approvedClaims.map((claim) => (
        <div key={claim.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-slate-900">{claim.employeeName}</h3>
                <span className="text-sm text-slate-500">{claim.employeeNumber}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  claim.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  claim.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  claim.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {claim.priority}
                </span>
                {claim.needsRefund && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Needs Refund
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1">{claim.department}</p>
              <div className="mt-2">
                <p className="text-sm font-medium text-slate-900">{claim.title}</p>
                <p className="text-sm text-slate-600 mt-1">{claim.description}</p>
              </div>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Amount</p>
                  <p className="font-medium text-slate-900">${claim.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Category</p>
                  <p className="font-medium text-slate-900">{claim.category}</p>
                </div>
                <div>
                  <p className="text-slate-500">Period</p>
                  <p className="font-medium text-slate-900">{claim.period}</p>
                </div>
                <div>
                  <p className="text-slate-500">Refund Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    claim.refundStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    claim.refundStatus === 'processed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {claim.refundStatus}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Approved on {new Date(claim.approvedAt).toLocaleDateString()} by {claim.approvedBy}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleMarkAsRead('claim', claim.id)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Mark as Read
              </button>
            </div>
          </div>
        </div>
      ))}
      {approvedClaims.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No approved claims found
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Approved Disputes and Claims Notifications</h1>
        <p className="text-slate-600 mt-1">View and manage approved disputes and expense claims for adjustments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Approved Disputes</p>
              <p className="text-2xl font-bold text-slate-900">{approvedDisputes.length}</p>
              <p className="text-sm text-slate-500 mt-1">
                {approvedDisputes.filter(d => d.needsRefund).length} need refund
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Approved Claims</p>
              <p className="text-2xl font-bold text-slate-900">{approvedClaims.length}</p>
              <p className="text-sm text-slate-500 mt-1">
                {approvedClaims.filter(c => c.needsRefund).length} need refund
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'disputes', label: 'Approved Disputes', count: approvedDisputes.length },
              { id: 'claims', label: 'Approved Claims', count: approvedClaims.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-500 mt-2">Loading notifications...</p>
            </div>
          ) : (
            <>
              {activeTab === 'disputes' && renderDisputes()}
              {activeTab === 'claims' && renderClaims()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
