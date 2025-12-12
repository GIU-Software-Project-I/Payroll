'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { MOCK_DASHBOARD_STATS } from '@/app/constants';

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = MOCK_DASHBOARD_STATS;

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      change: '+12 this month',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      title: 'Active Leaves',
      value: stats.activeLeaves,
      change: '3 pending approval',
      changeType: 'neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'green',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      change: '5 urgent',
      changeType: 'warning',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'amber',
    },
    {
      title: 'Open Positions',
      value: stats.openPositions,
      change: '2 new this week',
      changeType: 'positive',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple',
    },
  ];

  const quickActions = [
    { label: 'Request Leave', href: '/dashboard/leaves/request', icon: '📅' },
    { label: 'Clock In/Out', href: '/dashboard/time-management/attendance', icon: '⏰' },
    { label: 'View Payslip', href: '/dashboard/payroll/payslips', icon: '💰' },
    { label: 'Update Profile', href: '/dashboard/employee/profile', icon: '👤' },
  ];

  const recentActivities = [
    { type: 'leave', message: 'Leave request approved for Dec 20-25', time: '2 hours ago', status: 'success' },
    { type: 'payroll', message: 'December payroll has been processed', time: '1 day ago', status: 'info' },
    { type: 'performance', message: 'Performance review cycle started', time: '2 days ago', status: 'warning' },
    { type: 'onboarding', message: 'New employee Sarah Ahmed onboarded', time: '3 days ago', status: 'success' },
    { type: 'recruitment', message: 'Software Engineer position posted', time: '1 week ago', status: 'info' },
  ];

  const upcomingEvents = [
    { title: 'Performance Review Due', date: 'Dec 15, 2025', type: 'deadline' },
    { title: 'Team Meeting', date: 'Dec 13, 2025', type: 'meeting' },
    { title: 'Payroll Cutoff', date: 'Dec 20, 2025', type: 'deadline' },
    { title: 'Holiday - Christmas', date: 'Dec 25, 2025', type: 'holiday' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-100' },
      green: { bg: 'bg-green-600', text: 'text-green-600', light: 'bg-green-100' },
      amber: { bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-100' },
      purple: { bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-100' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, {user?.firstName}! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const colors = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`${colors.light} ${colors.text} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                  stat.changeType === 'warning' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
                <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="flex flex-col items-center p-4 bg-slate-50 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-colors group"
                >
                  <span className="text-2xl mb-2">{action.icon}</span>
                  <span className="text-sm font-medium text-slate-700 text-center group-hover:text-blue-700">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
              <Link href="/dashboard/activity" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 py-3 border-b border-slate-100 last:border-0">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{activity.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Calendar & Events */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
                    event.type === 'deadline' ? 'bg-red-500' :
                    event.type === 'meeting' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}>
                    {new Date(event.date).getDate()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{event.title}</p>
                    <p className="text-xs text-slate-500">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/calendar"
              className="mt-4 block w-full text-center py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Calendar
            </Link>
          </div>

          {/* Team Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Team Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Present Today</span>
                <span className="text-sm font-semibold text-green-600">236 / 248</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">12</p>
                  <p className="text-xs text-slate-500">On Leave</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-2xl font-bold text-slate-800">5</p>
                  <p className="text-xs text-slate-500">Remote</p>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-3">📢 Announcements</h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              Year-end performance reviews are due by December 15th. Please ensure all evaluations are completed on time.
            </p>
            <Link
              href="/dashboard/announcements"
              className="mt-4 inline-block text-sm font-medium text-white/90 hover:text-white"
            >
              View All Announcements →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

