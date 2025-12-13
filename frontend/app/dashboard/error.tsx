'use client';

import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-600 text-sm mb-6">{error.message || 'An error occurred while loading the page.'}</p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

