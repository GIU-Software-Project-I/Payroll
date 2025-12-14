"use client";

import { useEffect, useMemo, useState } from "react";
import { payrollConfigurationService } from "@/app/services/payroll-configuration";
import { ConfigStatus } from "@/app/types/enums";
import type { PayGrade } from "@/app/types/payroll";

type CreateForm = {
  grade: string;
  baseSalary: string;
  grossSalary: string;
};

export default function PayrollSpecialistPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payGrades, setPayGrades] = useState<PayGrade[]>([]);
  const [form, setForm] = useState<CreateForm>({ grade: "", baseSalary: "", grossSalary: "" });
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<ConfigStatus | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return payGrades;
    return payGrades.filter((pg) => pg.status === filter);
  }, [payGrades, filter]);

  const loadPayGrades = async () => {
    setLoading(true);
    setError(null);
    const res = await payrollConfigurationService.getPayGrades();
    if (res.error) setError(res.error);
    setPayGrades((res.data as any)?.data || (res.data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadPayGrades();
  }, []);

  const onCreate = async () => {
    setCreating(true);
    setError(null);
    const payload = {
      grade: form.grade.trim(),
      baseSalary: Number(form.baseSalary),
      grossSalary: Number(form.grossSalary),
    };
    const res = await payrollConfigurationService.createPayGrade(payload);
    if (res.error) {
      setError(res.error);
    } else {
      setForm({ grade: "", baseSalary: "", grossSalary: "" });
      await loadPayGrades();
    }
    setCreating(false);
  };

  const onSubmitForApproval = async (id: string) => {
    // Use update endpoint to set status=draft -> approved workflow begins via manager
    const res = await payrollConfigurationService.updatePayGrade(id, { status: ConfigStatus.DRAFT });
    if (!res.error) await loadPayGrades();
  };

  const onDelete = async (id: string) => {
    const res = await payrollConfigurationService.deletePayGrade(id);
    if (!res.error) await loadPayGrades();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payroll Specialist</h1>
        <p className="text-slate-600 mt-2">Manage pay grades and submit for approval</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Pay Grade</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            className="border border-slate-300 rounded px-3 py-2"
            placeholder="Grade (e.g., Senior TA)"
            value={form.grade}
            onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
          />
          <input
            className="border border-slate-300 rounded px-3 py-2"
            placeholder="Base Salary"
            type="number"
            value={form.baseSalary}
            onChange={(e) => setForm((f) => ({ ...f, baseSalary: e.target.value }))}
          />
          <input
            className="border border-slate-300 rounded px-3 py-2"
            placeholder="Gross Salary"
            type="number"
            value={form.grossSalary}
            onChange={(e) => setForm((f) => ({ ...f, grossSalary: e.target.value }))}
          />
          <button
            className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
            onClick={onCreate}
            disabled={creating || !form.grade || !form.baseSalary || !form.grossSalary}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Pay Grades</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Filter:</label>
            <select
              className="border border-slate-300 rounded px-2 py-1"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value={ConfigStatus.DRAFT}>Draft</option>
              <option value={ConfigStatus.APPROVED}>Approved</option>
              <option value={ConfigStatus.REJECTED}>Rejected</option>
            </select>
          </div>
        </div>

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
                {filtered.map((pg) => (
                  <tr key={pg.id} className="border-b">
                    <td className="py-2 px-3">{pg.grade}</td>
                    <td className="py-2 px-3">{pg.baseSalary}</td>
                    <td className="py-2 px-3">{pg.grossSalary}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 rounded text-xs bg-slate-100 border">
                        {pg.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 flex gap-2">
                      <button
                        className="px-3 py-1 border rounded hover:bg-blue-50"
                        onClick={() => onSubmitForApproval(pg.id)}
                      >
                        Submit for approval
                      </button>
                      <button
                        className="px-3 py-1 border rounded hover:bg-red-50"
                        onClick={() => onDelete(pg.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-4 px-3 text-slate-600" colSpan={5}>No pay grades found</td>
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

