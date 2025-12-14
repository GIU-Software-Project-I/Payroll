import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
        <div className="text-6xl font-bold text-slate-900 mb-4">404</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h2>
        <p className="text-slate-600 text-sm mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

