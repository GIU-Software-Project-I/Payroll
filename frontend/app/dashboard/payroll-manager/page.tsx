"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { payrollConfigurationService } from "@/app/services/payroll-configuration";
import { ConfigStatus } from "@/app/types/enums";
import { useAuth } from "@/app/context/AuthContext";

type ConfigType = 
  | "payrollPolicies" 
  | "payTypes" 
  | "payGrades" 
  | "allowances" 
  | "signingBonuses" 
  | "terminationBenefits"
  | "taxRules";

interface ConfigItem {
  id: string;
  name?: string;
  grade?: string;
  type?: string;
  title?: string;
  policyName?: string;
  allowanceName?: string;
  bonusName?: string;
  benefitType?: string;
  taxType?: string;
  status: ConfigStatus;
  createdBy?: string;
  createdAt?: string;
  baseSalary?: number;
  grossSalary?: number;
  [key: string]: any;
}

export default function PayrollManagerPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab") as ConfigType | null;
  
  const [activeTab, setActiveTab] = useState<ConfigType>(tabFromUrl || "payGrades");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [filter, setFilter] = useState<"draft" | "all">("draft");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const tabs: Array<{ key: ConfigType; label: string }> = [
    { key: "payGrades", label: "Pay Grades" },
    { key: "payrollPolicies", label: "Payroll Policies" },
    { key: "payTypes", label: "Pay Types" },
    { key: "allowances", label: "Allowances" },
    { key: "signingBonuses", label: "Signing Bonuses" },
    { key: "terminationBenefits", label: "Termination Benefits" },
    { key: "taxRules", label: "Tax Rules" },
  ];

  const normalizeItems = (raw: any[], type: ConfigType): ConfigItem[] => {
    return raw.map((item) => ({
      id: item.id || item._id,
      name: item.name || item.grade || item.type || item.title || item.policyName || item.allowanceName || item.bonusName || item.benefitType || item.taxType,
      status: item.status || item.configStatus || ConfigStatus.DRAFT,
      createdBy: item.createdBy || item.creator,
      createdAt: item.createdAt || item.created_at,
      baseSalary: item.baseSalary,
      grossSalary: item.grossSalary,
      ...item,
    }));
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;
      const statusFilter = filter === "draft" ? { status: ConfigStatus.DRAFT } : {};

      switch (activeTab) {
        case "payGrades":
          response = await payrollConfigurationService.getPayGrades(filter === "draft" ? ConfigStatus.DRAFT : undefined);
          break;
        case "payrollPolicies":
          response = await payrollConfigurationService.getPayrollPolicies(statusFilter);
          break;
        case "payTypes":
          response = await payrollConfigurationService.getPayTypes(statusFilter);
          break;
        case "allowances":
          response = await payrollConfigurationService.getAllowances(statusFilter);
          break;
        case "signingBonuses":
          response = await payrollConfigurationService.getSigningBonuses(statusFilter);
          break;
        case "terminationBenefits":
          response = await payrollConfigurationService.getTerminationBenefits(statusFilter);
          break;
        case "taxRules":
          response = await payrollConfigurationService.getTaxRules();
          const allTaxRules = Array.isArray(response?.data) ? response.data : [];
          const filteredTaxRules = filter === "draft" ? allTaxRules.filter((r: any) => r.status === ConfigStatus.DRAFT) : allTaxRules;
          setItems(normalizeItems(filteredTaxRules, activeTab));
          setLoading(false);
          return;
        default:
          response = { data: [] };
      }

      const data = response as any;
      const rawData = data?.data?.data || data?.data || [];
      setItems(normalizeItems(Array.isArray(rawData) ? rawData : [], activeTab));
    } catch (e: any) {
      setError(e?.message || "Failed to load configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeTab, filter]);

  const approve = async (id: string) => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const payload = { approvedBy: user.id };
      
      switch (activeTab) {
        case "payGrades":
          await payrollConfigurationService.approvePayGrade(id, payload);
          break;
        case "payrollPolicies":
          await payrollConfigurationService.approvePayrollPolicy(id, payload);
          break;
        case "payTypes":
          await payrollConfigurationService.approvePayType(id, payload);
          break;
        case "allowances":
          await payrollConfigurationService.approveAllowance(id, payload);
          break;
        case "signingBonuses":
          await payrollConfigurationService.approveSigningBonus(id, payload);
          break;
        case "terminationBenefits":
          await payrollConfigurationService.approveTerminationBenefit(id, payload);
          break;
        case "taxRules":
          await payrollConfigurationService.approveTaxRule(id, payload);
          break;
      }

      setSuccess("Configuration approved successfully");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to approve");
    }
  };

  const reject = async (id: string) => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const payload = { approvedBy: user.id };
      
      switch (activeTab) {
        case "payGrades":
          await payrollConfigurationService.rejectPayGrade(id, payload);
          break;
        case "payrollPolicies":
          await payrollConfigurationService.rejectPayrollPolicy(id, payload);
          break;
        case "payTypes":
          await payrollConfigurationService.rejectPayType(id, payload);
          break;
        case "allowances":
          await payrollConfigurationService.rejectAllowance(id, payload);
          break;
        case "signingBonuses":
          await payrollConfigurationService.rejectSigningBonus(id, payload);
          break;
        case "terminationBenefits":
          await payrollConfigurationService.rejectTerminationBenefit(id, payload);
          break;
        case "taxRules":
          await payrollConfigurationService.rejectTaxRule(id, payload);
          break;
      }

      setSuccess("Configuration rejected");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to reject");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure? Cannot edit after approval - must delete and create new.")) return;

    setError(null);
    setSuccess(null);

    try {
      switch (activeTab) {
        case "payGrades":
          await payrollConfigurationService.deletePayGrade(id);
          break;
        case "payrollPolicies":
          await payrollConfigurationService.deletePayrollPolicy(id);
          break;
        case "payTypes":
          await payrollConfigurationService.deletePayType(id);
          break;
        case "allowances":
          await payrollConfigurationService.deleteAllowance(id);
          break;
        case "signingBonuses":
          await payrollConfigurationService.deleteSigningBonus(id);
          break;
        case "terminationBenefits":
          await payrollConfigurationService.deleteTerminationBenefit(id);
          break;
        case "taxRules":
          await payrollConfigurationService.deleteTaxRule(id);
          break;
      }

      setSuccess("Configuration deleted");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    }
  };

  const beginEdit = (item: ConfigItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    setError(null);
    setSuccess(null);

    try {
      const payload = { ...editForm };
      delete payload.id;
      delete payload._id;
      delete payload.status;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.createdBy;
      delete payload.approvedBy;

      switch (activeTab) {
        case "payGrades":
          await payrollConfigurationService.updatePayGrade(editingId, payload);
          break;
        case "payrollPolicies":
          await payrollConfigurationService.updatePayrollPolicy(editingId, payload);
          break;
        case "payTypes":
          await payrollConfigurationService.updatePayType(editingId, payload);
          break;
        case "allowances":
          await payrollConfigurationService.updateAllowance(editingId, payload);
          break;
        case "signingBonuses":
          await payrollConfigurationService.updateSigningBonus(editingId, payload);
          break;
        case "terminationBenefits":
          await payrollConfigurationService.updateTerminationBenefit(editingId, payload);
          break;
        case "taxRules":
          await payrollConfigurationService.updateTaxRule(editingId, payload);
          break;
      }

      setSuccess("Configuration updated");
      setEditingId(null);
      setEditForm({});
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to update");
    }
  };

  const getDisplayName = (item: ConfigItem): string => {
    return item.name || item.grade || item.type || item.title || item.policyName || "Unnamed";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Payroll Configuration Approval</h1>
        <p className="text-slate-600 mt-2">Review, edit, approve, or reject payroll configurations (excluding insurance & company settings)</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium">📋 REQ-PY-18: Payroll Manager Responsibilities</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Approve or reject draft configurations before they become active</li>
          <li>Edit any configuration (draft, approved, rejected)</li>
          <li>Delete configurations (except insurance - handled by HR Manager)</li>
          <li><strong>Important:</strong> Once approved, configurations cannot be edited - must delete and recreate</li>
        </ul>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Show:</label>
            <select
              className="border border-slate-300 rounded-lg px-3 py-1 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="draft">Draft Only</option>
              <option value="all">All Statuses</option>
            </select>
          </div>
          <button
            onClick={load}
            className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Table */}
        <div className="p-6">
          {loading ? (
            <p className="text-slate-600">Loading...</p>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-3">
                📭
              </div>
              <p className="text-slate-700 font-medium">No configurations found</p>
              <p className="text-slate-500 text-sm mt-1">
                {filter === "draft" ? "No pending draft configurations" : "No configurations in this category"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b bg-slate-50">
                    <th className="py-2 px-3">Name</th>
                    {activeTab === "payGrades" && (
                      <>
                        <th className="py-2 px-3">Base</th>
                        <th className="py-2 px-3">Gross</th>
                      </>
                    )}
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Created</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3">
                        {editingId === item.id ? (
                          <input
                            className="border rounded px-2 py-1 w-full"
                            value={editForm.name || editForm.grade || ""}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, [activeTab === "payGrades" ? "grade" : "name"]: e.target.value }))
                            }
                          />
                        ) : (
                          <span className="font-medium text-slate-900">{getDisplayName(item)}</span>
                        )}
                      </td>
                      {activeTab === "payGrades" && (
                        <>
                          <td className="py-2 px-3">
                            {editingId === item.id ? (
                              <input
                                className="border rounded px-2 py-1 w-20"
                                type="number"
                                value={editForm.baseSalary || 0}
                                onChange={(e) => setEditForm((f) => ({ ...f, baseSalary: Number(e.target.value) }))}
                              />
                            ) : (
                              <span className="tabular-nums">{item.baseSalary || "-"}</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {editingId === item.id ? (
                              <input
                                className="border rounded px-2 py-1 w-20"
                                type="number"
                                value={editForm.grossSalary || 0}
                                onChange={(e) => setEditForm((f) => ({ ...f, grossSalary: Number(e.target.value) }))}
                              />
                            ) : (
                              <span className="tabular-nums">{item.grossSalary || "-"}</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs border ${
                            item.status === ConfigStatus.APPROVED
                              ? "bg-green-50 border-green-200 text-green-700"
                              : item.status === ConfigStatus.REJECTED
                              ? "bg-red-50 border-red-200 text-red-700"
                              : "bg-slate-50 border-slate-200 text-slate-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-slate-600">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-2 px-3">
                        {editingId === item.id ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="px-3 py-1 border rounded hover:bg-green-50 text-xs"
                              onClick={saveEdit}
                            >
                              Save
                            </button>
                            <button
                              className="px-3 py-1 border rounded hover:bg-slate-50 text-xs"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {item.status === ConfigStatus.DRAFT && (
                              <>
                                <button
                                  className="px-3 py-1 border rounded hover:bg-green-50 text-xs"
                                  onClick={() => approve(item.id)}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  className="px-3 py-1 border rounded hover:bg-red-50 text-xs"
                                  onClick={() => reject(item.id)}
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            <button
                              className="px-3 py-1 border rounded hover:bg-blue-50 text-xs"
                              onClick={() => beginEdit(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="px-3 py-1 border rounded hover:bg-red-50 text-xs"
                              onClick={() => deleteItem(item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

