'use client';

import { Card } from '@/app/components';

export default function PerformancePage() {
  const performanceData = {
    currentRating: 'A',
    previousRating: 'B+',
    reviewCycle: 'Annual 2025',
    dueDate: 'Dec 15, 2025',
  };

  const competencies = [
    { name: 'Technical Skills', score: 90, maxScore: 100 },
    { name: 'Communication', score: 85, maxScore: 100 },
    { name: 'Teamwork', score: 88, maxScore: 100 },
    { name: 'Problem Solving', score: 92, maxScore: 100 },
    { name: 'Time Management', score: 78, maxScore: 100 },
  ];

  const goals = [
    { id: 1, title: 'Complete HR Module Development', progress: 75, status: 'In Progress', dueDate: 'Dec 31, 2025' },
    { id: 2, title: 'Team Training Sessions', progress: 100, status: 'Completed', dueDate: 'Nov 30, 2025' },
    { id: 3, title: 'Documentation Update', progress: 40, status: 'In Progress', dueDate: 'Jan 15, 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Performance Management</h1>
          <p className="text-slate-500 mt-1">Track your performance and goals</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          View Full Report
        </button>
      </div>

      {/* Current Performance Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
          <div className="text-white text-center">
            <p className="text-green-100 text-sm">Current Rating</p>
            <p className="text-5xl font-bold mt-2">{performanceData.currentRating}</p>
            <p className="text-green-100 text-sm mt-2">Excellent</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-500">Previous Rating</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{performanceData.previousRating}</p>
            <p className="text-xs text-green-600 mt-1">↑ Improved</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-500">Review Cycle</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{performanceData.reviewCycle}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-500">Review Due</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{performanceData.dueDate}</p>
            <p className="text-xs text-slate-400 mt-1">3 days left</p>
          </div>
        </Card>
      </div>

      {/* Competency Assessment */}
      <Card title="Competency Assessment">
        <div className="space-y-4">
          {competencies.map((competency, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">{competency.name}</span>
                <span className="text-slate-500">{competency.score}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    competency.score >= 90
                      ? 'bg-green-500'
                      : competency.score >= 80
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${competency.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between">
          <span className="font-medium text-slate-700">Overall Score</span>
          <span className="font-bold text-blue-600">86.6%</span>
        </div>
      </Card>

      {/* Goals */}
      <Card title="Goals & Objectives" action={
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          + Add Goal
        </button>
      }>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800">{goal.title}</h4>
                  <p className="text-sm text-slate-500 mt-1">Due: {goal.dueDate}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  goal.status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {goal.status}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      goal.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

