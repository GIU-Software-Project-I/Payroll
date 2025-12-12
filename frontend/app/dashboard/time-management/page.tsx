'use client';

import { Card } from '@/app/components';

export default function TimeManagementPage() {
  const todayAttendance = {
    clockIn: '08:45 AM',
    clockOut: null,
    status: 'Present',
    hoursWorked: '4h 15m',
  };

  const weekSummary = [
    { day: 'Mon', date: '09', hours: 8.5, status: 'present' },
    { day: 'Tue', date: '10', hours: 8.0, status: 'present' },
    { day: 'Wed', date: '11', hours: 9.0, status: 'present' },
    { day: 'Thu', date: '12', hours: 4.25, status: 'working' },
    { day: 'Fri', date: '13', hours: 0, status: 'upcoming' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700';
      case 'working': return 'bg-blue-100 text-blue-700';
      case 'absent': return 'bg-red-100 text-red-700';
      case 'leave': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Time Management</h1>
        <p className="text-slate-500 mt-1">Track your attendance and working hours</p>
      </div>

      {/* Today's Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-0">
          <div className="text-white">
            <p className="text-blue-100">Today, December 12, 2025</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-200">Clock In</p>
                <p className="text-3xl font-bold">{todayAttendance.clockIn}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Clock Out</p>
                <p className="text-3xl font-bold">{todayAttendance.clockOut || '--:--'}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                Hours Today: {todayAttendance.hoursWorked}
              </span>
              <button className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Clock Out
              </button>
            </div>
          </div>
        </Card>

        <Card title="This Week">
          <div className="flex justify-between">
            {weekSummary.map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-slate-500">{day.day}</p>
                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(day.status)}`}>
                  {day.date}
                </div>
                <p className="mt-1 text-xs font-medium">{day.hours > 0 ? `${day.hours}h` : '-'}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Hours This Week</span>
              <span className="font-semibold text-slate-800">29.75 hrs</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card title="Monthly Overview" subtitle="December 2025">
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            const isWeekend = [1, 7, 8, 14, 15, 21, 22, 28, 29].includes(day);
            const isPast = day < 12;
            const isToday = day === 12;

            return (
              <div
                key={day}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                  isToday
                    ? 'bg-blue-600 text-white'
                    : isWeekend
                    ? 'bg-slate-100 text-slate-400'
                    : isPast
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-50 text-slate-600'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-green-100 mr-2"></div>
            <span className="text-slate-600">Present</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-blue-600 mr-2"></div>
            <span className="text-slate-600">Today</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded bg-slate-100 mr-2"></div>
            <span className="text-slate-600">Weekend</span>
          </div>
        </div>
      </Card>

      {/* Overtime & Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-500">Total Working Days</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">22</p>
            <p className="text-xs text-slate-400 mt-1">This month</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-500">Overtime Hours</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">8.5</p>
            <p className="text-xs text-slate-400 mt-1">This month</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-500">Average Hours/Day</p>
            <p className="text-3xl font-bold text-green-600 mt-1">8.2</p>
            <p className="text-xs text-slate-400 mt-1">This month</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

