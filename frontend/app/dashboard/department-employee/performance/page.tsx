'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { performanceService } from '@/app/services/performance';

/**
 * Performance Page - Department Employee
 * REQ-OD-01: View final ratings, feedback, and development notes
 * REQ-OD-08: Access past appraisal history
 * REQ-AE-07: Flag or raise a concern about a rating
 */
export default function PerformancePage() {
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        setLoading(true);
        const response = await performanceService.getEmployeeAppraisalHistory();
        setAppraisals(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        setError(err.message || 'Failed to load performance history');
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisals();
  }, []);

  const handleFileDispute = async () => {
    if (!selectedAppraisal || !disputeReason.trim()) return;

    try {
      setSubmittingDispute(true);
      await performanceService.fileDispute({
        recordId: selectedAppraisal.id,
        reason: disputeReason,
      });
      alert('Dispute submitted successfully. HR will review your concern.');
      setShowDisputeForm(false);
      setDisputeReason('');
    } catch (err: any) {
      alert('Failed to submit dispute: ' + err.message);
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleAcknowledge = async (recordId: string) => {
    try {
      await performanceService.acknowledgeRecord(recordId);
      // Refresh appraisals
      const response = await performanceService.getEmployeeAppraisalHistory();
      setAppraisals(Array.isArray(response.data) ? response.data : []);
      alert('Appraisal acknowledged successfully');
    } catch (err: any) {
      alert('Failed to acknowledge: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading performance history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error loading performance data</p>
        <p className="text-red-700 text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Performance</h1>
        <p className="text-slate-600 mt-2">View your appraisal history, ratings, and feedback</p>
      </div>

      {/* Overview Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Performance Overview</h2>
            <p className="text-green-100 mt-2">{appraisals.length} appraisal records</p>
          </div>
          <div className="text-6xl">📊</div>
        </div>
      </div>

      {/* Current/Latest Appraisal */}
      {appraisals.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Latest Appraisal</h3>
          <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{appraisals[0].cycleName || 'Performance Review'}</h4>
                <p className="text-slate-600 text-sm">
                  {appraisals[0].reviewDate || appraisals[0].createdAt || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${
                  appraisals[0].overallRating >= 4 ? 'bg-green-100 text-green-700' :
                  appraisals[0].overallRating >= 3 ? 'bg-blue-100 text-blue-700' :
                  appraisals[0].overallRating >= 2 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {appraisals[0].overallRating || 'N/A'}/5
                </div>
                <p className="text-xs text-slate-500 mt-1">Overall Rating</p>
              </div>
            </div>

            {/* Feedback Section */}
            {appraisals[0].feedback && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                <h5 className="font-semibold text-slate-900 mb-2">Manager Feedback</h5>
                <p className="text-slate-700 text-sm">{appraisals[0].feedback}</p>
              </div>
            )}

            {/* Development Notes */}
            {appraisals[0].developmentNotes && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-2">Development Recommendations</h5>
                <p className="text-blue-800 text-sm">{appraisals[0].developmentNotes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              {appraisals[0].status === 'PUBLISHED' && !appraisals[0].acknowledged && (
                <button
                  onClick={() => handleAcknowledge(appraisals[0].id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Acknowledge
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedAppraisal(appraisals[0]);
                  setShowDisputeForm(true);
                }}
                className="px-6 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 font-medium"
              >
                Raise Concern
              </button>
              <button
                onClick={() => setSelectedAppraisal(appraisals[0])}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appraisal History */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Appraisal History</h3>
        {appraisals.length > 0 ? (
          <div className="space-y-4">
            {appraisals.map((appraisal, index) => (
              <div
                key={appraisal.id || index}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setSelectedAppraisal(appraisal)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{appraisal.cycleName || `Appraisal ${index + 1}`}</h4>
                    <p className="text-slate-600 text-sm">
                      {appraisal.reviewDate || appraisal.createdAt || 'N/A'} • {appraisal.type || 'Annual Review'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appraisal.overallRating >= 4 ? 'bg-green-100 text-green-700' :
                      appraisal.overallRating >= 3 ? 'bg-blue-100 text-blue-700' :
                      appraisal.overallRating >= 2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {appraisal.overallRating || 'N/A'}/5
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appraisal.acknowledged ? 'bg-green-100 text-green-700' : 
                      appraisal.status === 'PUBLISHED' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {appraisal.acknowledged ? 'Acknowledged' : appraisal.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-slate-600">No appraisal records found</p>
            <p className="text-slate-500 text-sm mt-2">Your performance appraisals will appear here once completed</p>
          </div>
        )}
      </div>

      {/* Dispute Form Modal */}
      {showDisputeForm && selectedAppraisal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Raise a Concern</h3>
            <p className="text-slate-600 text-sm mb-4">
              You have 7 days from the publication date to raise any concerns about your appraisal.
              Your concern will be reviewed by HR.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason for Concern *
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Please describe your concern about the appraisal rating or feedback..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleFileDispute}
                disabled={submittingDispute || !disputeReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-slate-400 font-medium"
              >
                {submittingDispute ? 'Submitting...' : 'Submit Concern'}
              </button>
              <button
                onClick={() => {
                  setShowDisputeForm(false);
                  setDisputeReason('');
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAppraisal && !showDisputeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedAppraisal.cycleName || 'Performance Review'}</h3>
                <p className="text-slate-600 text-sm">{selectedAppraisal.reviewDate || selectedAppraisal.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedAppraisal(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-2">Overall Rating</h4>
              <div className={`inline-block px-6 py-3 rounded-lg text-2xl font-bold ${
                selectedAppraisal.overallRating >= 4 ? 'bg-green-100 text-green-700' :
                selectedAppraisal.overallRating >= 3 ? 'bg-blue-100 text-blue-700' :
                selectedAppraisal.overallRating >= 2 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {selectedAppraisal.overallRating || 'N/A'} / 5
              </div>
            </div>

            {/* Criteria Ratings */}
            {selectedAppraisal.criteriaRatings && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Rating Breakdown</h4>
                <div className="space-y-3">
                  {selectedAppraisal.criteriaRatings.map((criteria: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">{criteria.name}</span>
                      <span className="font-medium text-slate-900">{criteria.rating}/5</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {selectedAppraisal.feedback && (
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-2">Manager Feedback</h4>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{selectedAppraisal.feedback}</p>
              </div>
            )}

            {/* Strengths */}
            {selectedAppraisal.strengths && (
              <div className="mb-6">
                <h4 className="font-semibold text-green-900 mb-2">Strengths</h4>
                <p className="text-green-800 bg-green-50 p-4 rounded-lg">{selectedAppraisal.strengths}</p>
              </div>
            )}

            {/* Areas for Improvement */}
            {selectedAppraisal.areasForImprovement && (
              <div className="mb-6">
                <h4 className="font-semibold text-orange-900 mb-2">Areas for Improvement</h4>
                <p className="text-orange-800 bg-orange-50 p-4 rounded-lg">{selectedAppraisal.areasForImprovement}</p>
              </div>
            )}

            {/* Development Notes */}
            {selectedAppraisal.developmentNotes && (
              <div className="mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">Development Recommendations</h4>
                <p className="text-blue-800 bg-blue-50 p-4 rounded-lg">{selectedAppraisal.developmentNotes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              {selectedAppraisal.status === 'PUBLISHED' && !selectedAppraisal.acknowledged && (
                <button
                  onClick={() => handleAcknowledge(selectedAppraisal.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Acknowledge
                </button>
              )}
              <button
                onClick={() => setShowDisputeForm(true)}
                className="px-6 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 font-medium"
              >
                Raise Concern
              </button>
              <button
                onClick={() => setSelectedAppraisal(null)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">📋 About Performance Appraisals</h3>
        <ul className="text-green-800 text-sm space-y-2">
          <li>• View your performance ratings, feedback, and development recommendations</li>
          <li>• Acknowledge your appraisal once you have reviewed it</li>
          <li>• You have 7 days to raise any concerns about your rating</li>
          <li>• All appraisals are saved to your permanent profile record (BR 6)</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Link href="/dashboard/department-employee">
          <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}

