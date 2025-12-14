"use client";

import { useEffect, useMemo, useState } from "react";
import { payrollConfigurationService } from "@/app/services/payroll-configuration";
import { ConfigStatus } from "@/app/types/enums";
import type { InsuranceBracket } from "@/app/types/payroll";

type InsuranceForm = {
  name: string;
  amount: string;
  minSalary: string;
  maxSalary: string;
  employeeRate: string;
  employerRate: string;
};

export default function HRManagerPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brackets, setBrackets] = useState<InsuranceBracket[]>([]);
  const [filter, setFilter] = useState<ConfigStatus | "all">("all");
  const [form, setForm] = useState<InsuranceForm>({
    name: "",
    amount: "",
    minSalary: "",
    maxSalary: "",
    employeeRate: "",
    employerRate: "",
  });
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return brackets;
    return brackets.filter((b) => b.status === filter);
  }, [brackets, filter]);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await payrollConfigurationService.getInsuranceBrackets();
    if (res.error) setError(res.error);
    setBrackets((res.data as any)?.data || (res.data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setCreating(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      amount: Number(form.amount),
      minSalary: Number(form.minSalary),
      maxSalary: Number(form.maxSalary),
      employeeRate: Number(form.employeeRate),
      employerRate: Number(form.employerRate),
    };
    const res = await payrollConfigurationService.createInsuranceBracket(payload);
    if (res.error) setError(res.error);
    else {
      setForm({ name: "", amount: "", minSalary: "", maxSalary: "", employeeRate: "", employerRate: "" });
      await load();
    }
    setCreating(false);
  };

  const approve = async (id: string) => {
    const res = await payrollConfigurationService.approveInsuranceBracket(id, {});
    if (res.error) setError(res.error);
    await load();
  };

  const reject = async (id: string) => {
    const res = await payrollConfigurationService.rejectInsuranceBracket(id, {});
    if (res.error) setError(res.error);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">HR Manager</h1>
        <p className="text-slate-600 mt-2">Insurance brackets oversight and approvals</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Create Insurance Bracket</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Min Salary" type="number" value={form.minSalary} onChange={(e) => setForm((f) => ({ ...f, minSalary: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Max Salary" type="number" value={form.maxSalary} onChange={(e) => setForm((f) => ({ ...f, maxSalary: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Employee Rate (%)" type="number" value={form.employeeRate} onChange={(e) => setForm((f) => ({ ...f, employeeRate: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Employer Rate (%)" type="number" value={form.employerRate} onChange={(e) => setForm((f) => ({ ...f, employerRate: e.target.value }))} />
          <button className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50" onClick={create} disabled={creating || !form.name || !form.amount || !form.minSalary || !form.maxSalary || !form.employeeRate || !form.employerRate}>
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Insurance Brackets</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Filter:</label>
            <select className="border border-slate-300 rounded px-2 py-1" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
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
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Salary Range</th>
                  <th className="py-2 px-3">Employee%</th>
                  <th className="py-2 px-3">Employer%</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="py-2 px-3">{b.name}</td>
                    <td className="py-2 px-3">{b.amount}</td>
                    <td className="py-2 px-3">{b.minSalary} - {b.maxSalary}</td>
                    <td className="py-2 px-3">{b.employeeRate}%</td>
                    <td className="py-2 px-3">{b.employerRate}%</td>
                    <td className="py-2 px-3">{b.status}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <button className="px-3 py-1 border rounded hover:bg-green-50" onClick={() => approve(b.id)}>Approve</button>
                      <button className="px-3 py-1 border rounded hover:bg-red-50" onClick={() => reject(b.id)}>Reject</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-4 px-3 text-slate-600" colSpan={7}>No insurance brackets found</td>
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

