'use client';

import { useState, useEffect } from 'react';
import { payrollSpecialistService, ExpenseClaim, ClaimReviewAction } from '@/app/services/payroll-specialist';
import { useAuth } from '@/app/context/AuthContext';
import { SystemRole } from '@/app/types';

export default function ExpenseClaimsPage() {
  const { hasRole } = useAuth();
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [escalateToManager, setEscalateToManager] = useState(false);
  const [filter, setFilter] = useState<ExpenseClaim['status'] | 'all'>('pending');

  useEffect(() => {
    if (!hasRole([SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.HR_ADMIN])) return;
    loadClaims();
  }, [hasRole, filter]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const response = filter === 'all' 
        ? await payrollSpecialistService.getAllClaims()
        : await payrollSpecialistService.getAllClaims(filter);
      
      if (response.data) setClaims(response.data);
    } catch (error) {
      console.error('Failed to load claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClaim = async () => {
    if (!selectedClaim) return;

    try {
      const action: ClaimReviewAction = {
        claimId: selectedClaim.id,
        action: reviewAction,
        notes: reviewNotes,
        escalateToManager: reviewAction === 'approve' && escalateToManager,
      };

      const response = await payrollSpecialistService.reviewClaim(action);
      if (response.data) {
        setClaims(prev => prev.map(c => 
          c.id === selectedClaim.id ? response.data! : c
        ));
        setShowReviewModal(false);
        setSelectedClaim(null);
        setReviewNotes('');
        setEscalateToManager(false);
      }
    } catch (error) {
      console.error('Failed to review claim:', error);
    }
  };

  const openReviewModal = (claim: ExpenseClaim, action: 'approve' | 'reject') => {
    setSelectedClaim(claim);
    setReviewAction(action);
    setReviewNotes('');
    setEscalateToManager(false);
    setShowReviewModal(true);
  };

  const getPriorityColor = (priority: ExpenseClaim['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: ExpenseClaim['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: ExpenseClaim['category']) => {
    switch (category) {
      case 'travel': return 'bg-blue-100 text-blue-800';
      case 'meals': return 'bg-green-100 text-green-800';
      case 'supplies': return 'bg-purple-100 text-purple-800';
      case 'training': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasRole([SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.HR_ADMIN])) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Access denied. Payroll Specialist role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expense Claim Review and Approval</h1>
          <p className="text-slate-600 mt-1">Review and approve/reject expense claims</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">Status:</label>
          <div className="flex space-x-2">
            {['all', 'pending', 'under_review', 'approved', 'rejected', 'escalated'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Expense Claims</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 mt-2">Loading claims...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{claim.employeeName}</div>
                        <div className="text-xs text-slate-500">{claim.employeeNumber}</div>
                        <div className="text-xs text-slate-500">{claim.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{claim.title}</div>
                        <div className="text-xs text-slate-500 max-w-xs truncate">{claim.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(claim.category)}`}>
                        {claim.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      ${claim.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(claim.priority)}`}>
                        {claim.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                        {claim.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(claim.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                        {claim.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openReviewModal(claim, 'approve')}
                              className="text-green-600 hover:text-green-800"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openReviewModal(claim, 'reject')}
                              className="text-red-600 hover:text-red-800"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {claims.length === 0 && (
              <div className="p-6 text-center text-slate-500">
                No expense claims found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Claim Details Modal */}
      {selectedClaim && !showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Expense Claim Details</h3>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Employee</label>
                  <p className="text-slate-900">{selectedClaim.employeeName}</p>
                  <p className="text-sm text-slate-600">{selectedClaim.employeeNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Department</label>
                  <p className="text-slate-900">{selectedClaim.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Category</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedClaim.category)}`}>
                    {selectedClaim.category}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Amount</label>
                  <p className="text-lg font-semibold text-slate-900">${selectedClaim.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Priority</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedClaim.priority)}`}>
                    {selectedClaim.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedClaim.status)}`}>
                    {selectedClaim.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Title</label>
                <p className="text-slate-900 mt-1">{selectedClaim.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Description</label>
                <p className="text-slate-900 mt-1">{selectedClaim.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Period</label>
                <p className="text-slate-900">{selectedClaim.period}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Submitted</label>
                <p className="text-slate-900">{new Date(selectedClaim.submittedAt).toLocaleString()}</p>
              </div>
              {selectedClaim.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Notes</label>
                  <p className="text-slate-900 mt-1">{selectedClaim.notes}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-500">Receipts</label>
                <div className="mt-2 space-y-2">
                  {selectedClaim.receipts.map((receipt, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-700">{receipt}</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {selectedClaim.status === 'pending' && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => openReviewModal(selectedClaim, 'reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => openReviewModal(selectedClaim, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {reviewAction === 'approve' ? 'Approve Expense Claim' : 'Reject Expense Claim'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Claim</label>
                <p className="text-slate-900">{selectedClaim.title}</p>
                <p className="text-sm text-slate-600">{selectedClaim.employeeName} • ${selectedClaim.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Review Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add your review notes..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
              {reviewAction === 'approve' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="escalate"
                    className="mr-2"
                    checked={escalateToManager}
                    onChange={(e) => setEscalateToManager(e.target.checked)}
                  />
                  <label htmlFor="escalate" className="text-sm text-slate-700">
                    Escalate to Payroll Manager
                  </label>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewClaim}
                className={`px-4 py-2 text-white rounded-lg hover:opacity-90 ${
                  reviewAction === 'approve' ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
