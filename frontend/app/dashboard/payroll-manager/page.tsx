"use client";

import { useEffect, useState } from "react";
import { payrollConfigurationService } from "@/app/services/payroll-configuration";
import { ConfigStatus } from "@/app/types/enums";
import type { PayGrade } from "@/app/types/payroll";

export default function PayrollManagerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPayGrades, setPendingPayGrades] = useState<PayGrade[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await payrollConfigurationService.getPayGrades(ConfigStatus.DRAFT);
    if (res.error) setError(res.error);
    setPendingPayGrades((res.data as any)?.data || (res.data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    const res = await payrollConfigurationService.approvePayGrade(id, {});
    if (res.error) setError(res.error);
    await load();
  };

  const reject = async (id: string) => {
    const res = await payrollConfigurationService.rejectPayGrade(id, {});
    if (res.error) setError(res.error);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payroll Manager</h1>
        <p className="text-slate-600 mt-2">Approve or reject payroll configurations submitted by specialists</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Pay Grades</h2>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {loading ? (
          <p className="text-slate-600">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-3">Grade</th>
                  <th className="py-2 px-3">Base</th>
                  <th className="py-2 px-3">Gross</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayGrades.map((pg) => (
                  <tr key={pg.id} className="border-b">
                    <td className="py-2 px-3">{pg.grade}</td>
                    <td className="py-2 px-3">{pg.baseSalary}</td>
                    <td className="py-2 px-3">{pg.grossSalary}</td>
                    <td className="py-2 px-3">{pg.status}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <button className="px-3 py-1 border rounded hover:bg-green-50" onClick={() => approve(pg.id)}>
                        Approve
                      </button>
                      <button className="px-3 py-1 border rounded hover:bg-red-50" onClick={() => reject(pg.id)}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingPayGrades.length === 0 && (
                  <tr>
                    <td className="py-4 px-3 text-slate-600" colSpan={5}>No pending items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

