"use client";

import { useEffect, useMemo, useState } from "react";
import { payrollConfigurationService } from "@/app/services/payroll-configuration";
import { ConfigStatus } from "@/app/types/enums";
import { useAuth } from "@/app/context/AuthContext";
import { useSearchParams } from "next/navigation";

interface ConfigItem {
  id: string;
  name?: string;
  title?: string;
  status: ConfigStatus;
  createdAt?: string;
  [key: string]: any;
}

type EditState = {
  id: string;
  [key: string]: any;
} | null;

export default function PayrollSystemConfigurationApprovalPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "payGrades");
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [filter, setFilter] = useState<ConfigStatus | "all">("all");
  const [edit, setEdit] = useState<EditState>(null);
  const [view, setView] = useState<ConfigItem | null>(null);

  const tabs: Array<{ id: string; label: string; icon: string }> = [
    { id: "payGrades", label: "Pay Grades", icon: "💰" },
    { id: "payrollPolicies", label: "Payroll Policies", icon: "📋" },
    { id: "payTypes", label: "Pay Types", icon: "🏷️" },
    { id: "allowances", label: "Allowances", icon: "➕" },
    { id: "signingBonuses", label: "Signing Bonuses", icon: "🎁" },
    { id: "terminationBenefits", label: "Termination Benefits", icon: "🚪" },
    { id: "taxRules", label: "Tax Rules", icon: "📊" },
  ];

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  const normalize = (raw: any): ConfigItem => {
    // Extract name based on config type
    let displayName = "";
    
    if (activeTab === "payGrades") {
      displayName = raw.grade || raw.name || "";
    } else if (activeTab === "payTypes") {
      displayName = raw.type || "";
    } else if (activeTab === "taxRules") {
      displayName = raw.name || raw.ruleName || "";
    } else if (activeTab === "allowances") {
      displayName = raw.name || raw.allowanceName || "";
    } else if (activeTab === "signingBonuses") {
      displayName = raw.positionName || raw.name || raw.bonusName || "";
    } else if (activeTab === "terminationBenefits") {
      displayName = raw.name || raw.benefitName || "";
    } else {
      displayName = raw.name || raw.title || raw.policyName || raw.typeName || "";
    }
    
    return {
      id: raw._id || raw.id,
      name: displayName,
      title: displayName,
      status: raw.status || ConfigStatus.DRAFT,
      createdAt: raw.createdAt,
      ...raw,
    };
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      switch (activeTab) {
        case "payGrades":
          res = await payrollConfigurationService.getPayGrades();
          break;
        case "payrollPolicies":
          res = await payrollConfigurationService.getPayrollPolicies();
          break;
        case "payTypes":
          res = await payrollConfigurationService.getPayTypes();
          break;
        case "allowances":
          res = await payrollConfigurationService.getAllowances();
          break;
        case "signingBonuses":
          res = await payrollConfigurationService.getSigningBonuses();
          break;
        case "terminationBenefits":
          res = await payrollConfigurationService.getTerminationBenefits();
          break;
        case "taxRules":
          res = await payrollConfigurationService.getTaxRules();
          break;
        default:
          res = { data: [] };
      }

      if ((res as any)?.error) {
        throw new Error((res as any).error);
      }

      const rawData = (res.data as any)?.data || (res.data as any) || [];
      setItems(Array.isArray(rawData) ? rawData.map(normalize) : []);
    } catch (e: any) {
      setError(e?.message || `Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [activeTab]);

  const approve = async (id: string) => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      let res;
      switch (activeTab) {
        case "payGrades":
          res = await payrollConfigurationService.approvePayGrade(id, { approvedBy: user.id });
          break;
        case "payrollPolicies":
          res = await payrollConfigurationService.approvePayrollPolicy(id, { approvedBy: user.id });
          break;
        case "payTypes":
          res = await payrollConfigurationService.approvePayType(id, { approvedBy: user.id });
          break;
        case "allowances":
          res = await payrollConfigurationService.approveAllowance(id, { approvedBy: user.id });
          break;
        case "signingBonuses":
          res = await payrollConfigurationService.approveSigningBonus(id, { approvedBy: user.id });
          break;
        case "terminationBenefits":
          res = await payrollConfigurationService.approveTerminationBenefit(id, { approvedBy: user.id });
          break;
        case "taxRules":
          res = await payrollConfigurationService.approveTaxRule(id, { approvedBy: user.id });
          break;
      }
      
      if ((res as any)?.error) {
        throw new Error((res as any).error);
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
      let res;
      switch (activeTab) {
        case "payGrades":
          res = await payrollConfigurationService.rejectPayGrade(id, { approvedBy: user.id });
          break;
        case "payrollPolicies":
          res = await payrollConfigurationService.rejectPayrollPolicy(id, { approvedBy: user.id });
          break;
        case "payTypes":
          res = await payrollConfigurationService.rejectPayType(id, { approvedBy: user.id });
          break;
        case "allowances":
          res = await payrollConfigurationService.rejectAllowance(id, { approvedBy: user.id });
          break;
        case "signingBonuses":
          res = await payrollConfigurationService.rejectSigningBonus(id, { approvedBy: user.id });
          break;
        case "terminationBenefits":
          res = await payrollConfigurationService.rejectTerminationBenefit(id, { approvedBy: user.id });
          break;
        case "taxRules":
          res = await payrollConfigurationService.rejectTaxRule(id, { approvedBy: user.id });
          break;
      }
      
      if ((res as any)?.error) {
        throw new Error((res as any).error);
      }
      
      setSuccess("Configuration rejected");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to reject");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      let res;
      switch (activeTab) {
        case "payGrades":
          res = await payrollConfigurationService.deletePayGrade(id);
          break;
        case "payrollPolicies":
          res = await payrollConfigurationService.deletePayrollPolicy(id);
          break;
        case "payTypes":
          res = await payrollConfigurationService.deletePayType(id);
          break;
        case "allowances":
          res = await payrollConfigurationService.deleteAllowance(id);
          break;
        case "signingBonuses":
          res = await payrollConfigurationService.deleteSigningBonus(id);
          break;
        case "terminationBenefits":
          res = await payrollConfigurationService.deleteTerminationBenefit(id);
          break;
        case "taxRules":
          res = await payrollConfigurationService.deleteTaxRule(id);
          break;
      }
      
      if ((res as any)?.error) {
        throw new Error((res as any).error);
      }
      
      setSuccess("Configuration deleted successfully");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    }
  };

  const viewItem = (item: ConfigItem) => {
    setEdit(null);
    setError(null);
    setSuccess(null);
    setView(item);
  };

  const closeView = () => setView(null);

  const beginEdit = (item: ConfigItem) => {
    // Only DRAFT items can be edited
    if (item.status !== ConfigStatus.DRAFT) {
      setError("Only DRAFT configurations can be edited.");
      return;
    }

    setEdit(item);
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEdit(null);
    setError(null);
  };

  const saveEdit = async () => {
    if (!edit) return;

    setError(null);
    setSuccess(null);

    try {
      let res;
      let payload: any = {};

      // Build payload based on config type
      if (activeTab === "payGrades") {
        payload = {
          grade: edit.grade,
          baseSalary: Number(edit.baseSalary),
          grossSalary: Number(edit.grossSalary),
        };
        res = await payrollConfigurationService.updatePayGrade(edit.id, payload);
      } else if (activeTab === "payrollPolicies") {
        payload = {
          name: edit.name,
          description: edit.description,
        };
        res = await payrollConfigurationService.updatePayrollPolicy(edit.id, payload);
      } else if (activeTab === "payTypes") {
        payload = {
          name: edit.name,
          description: edit.description,
        };
        res = await payrollConfigurationService.updatePayType(edit.id, payload);
      } else if (activeTab === "allowances") {
        payload = {
          name: edit.name,
          description: edit.description,
          amount: Number(edit.amount),
        };
        res = await payrollConfigurationService.updateAllowance(edit.id, payload);
      } else if (activeTab === "signingBonuses") {
        payload = {
          name: edit.name,
          description: edit.description,
          amount: Number(edit.amount),
        };
        res = await payrollConfigurationService.updateSigningBonus(edit.id, payload);
      } else if (activeTab === "terminationBenefits") {
        payload = {
          name: edit.name,
          description: edit.description,
          amount: Number(edit.amount),
        };
        res = await payrollConfigurationService.updateTerminationBenefit(edit.id, payload);
      } else if (activeTab === "taxRules") {
        payload = {
          name: edit.name,
          description: edit.description,
        };
        res = await payrollConfigurationService.updateTaxRule(edit.id, payload);
      }

      if ((res as any)?.error) {
        throw new Error((res as any).error);
      }

      setSuccess("Configuration updated successfully");
      setEdit(null);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to update configuration");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payroll System Configuration Approval</h1>
        <p className="text-slate-600 mt-2">Review, approve, reject, and manage all payroll configuration types</p>
      </div>


      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
          ✓ {success}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEdit(null);
                setFilter("all");
              }}
              className={`flex-shrink-0 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter & List */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-xs text-slate-600 mt-1">Approve, reject, edit, or delete configurations</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600">Filter</label>
              <select
                className="border border-slate-300 rounded-lg px-2 py-1 text-sm"
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

          {/* Edit Form */}
          {edit && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-900">Edit Configuration</h3>
                <button
                  onClick={cancelEdit}
                  className="text-blue-700 hover:text-blue-900 text-sm"
                >
                  ✕ Cancel
                </button>
              </div>

              {activeTab === "payGrades" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Grade Name</label>
                    <input
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      value={edit.grade || ""}
                      onChange={(e) => setEdit({ ...edit, grade: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Base Salary</label>
                    <input
                      type="number"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      value={edit.baseSalary || ""}
                      onChange={(e) => setEdit({ ...edit, baseSalary: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Gross Salary</label>
                    <input
                      type="number"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      value={edit.grossSalary || ""}
                      onChange={(e) => setEdit({ ...edit, grossSalary: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {(activeTab === "payrollPolicies" || activeTab === "payTypes" || activeTab === "taxRules") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Name</label>
                    <input
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      value={edit.name || ""}
                      onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Description</label>
                    <input
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      value={edit.description || ""}
                      onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {(activeTab === "allowances" || activeTab === "signingBonuses" || activeTab === "terminationBenefits") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700">Name</label>
                    <input
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      value={edit.name || ""}
                      onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Description</label>
                    <input
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      value={edit.description || ""}
                      onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Amount (EGP)</label>
                    <input
                      type="number"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                      value={edit.amount || ""}
                      onChange={(e) => setEdit({ ...edit, amount: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-600">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-3">
                📭
              </div>
              <p className="text-slate-700 font-medium">No configurations to review</p>
              <p className="text-slate-500 text-sm mt-1">Specialists will create configurations for you to approve.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b bg-slate-50">
                    <th className="py-2 px-3">Name/Description</th>
                    {activeTab === "payGrades" && (
                      <>
                        <th className="py-2 px-3">Base Salary</th>
                        <th className="py-2 px-3">Gross Salary</th>
                      </>
                    )}
                    {(activeTab === "payrollPolicies") && (
                      <th className="py-2 px-3">Description</th>
                    )}
                    {activeTab === "payTypes" && (
                      <th className="py-2 px-3">Amount (EGP)</th>
                    )}
                    {activeTab === "allowances" && (
                      <th className="py-2 px-3">Amount (EGP)</th>
                    )}
                    {activeTab === "signingBonuses" && (
                      <th className="py-2 px-3">Amount (EGP)</th>
                    )}
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Created</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {item.name || item.grade || item.title || "Unnamed"}
                      </td>
                      {activeTab === "payGrades" && (
                        <>
                          <td className="py-2 px-3 text-slate-700">
                            {item.baseSalary ? `${Number(item.baseSalary).toLocaleString()} EGP` : "-"}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {item.grossSalary ? `${Number(item.grossSalary).toLocaleString()} EGP` : "-"}
                          </td>
                        </>
                      )}
                      {(activeTab === "payrollPolicies") && (
                        <td className="py-2 px-3 text-xs text-slate-600">
                          {item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + "..." : item.description) : "-"}
                        </td>
                      )}
                      {activeTab === "payTypes" && (
                        <td className="py-2 px-3 text-slate-700">
                          {item.amount ? `${Number(item.amount).toLocaleString()} EGP` : "-"}
                        </td>
                      )}
                      {activeTab === "allowances" && (
                        <td className="py-2 px-3 text-slate-700">
                          {item.amount ? `${Number(item.amount).toLocaleString()} EGP` : "-"}
                        </td>
                      )}
                      {activeTab === "signingBonuses" && (
                        <td className="py-2 px-3 text-slate-700">
                          {item.amount ? `${Number(item.amount).toLocaleString()} EGP` : "-"}
                        </td>
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
                          {(item.status === ConfigStatus.DRAFT) && activeTab !== "payTypes" && (
                            <button
                              className="px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 text-blue-700 text-xs"
                              onClick={() => beginEdit(item)}
                            >
                              ✎ Edit
                            </button>
                          )}
                          <button
                            className="px-3 py-1 border rounded hover:bg-blue-50 text-xs"
                            onClick={() => viewItem(item)}
                          >
                            View
                          </button>
                          <button
                            className="px-3 py-1 border border-red-300 rounded hover:bg-red-50 text-red-700 text-xs"
                            onClick={() => deleteItem(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuration Management Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-medium text-slate-900 mb-2">✅ Approval Process</p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-slate-700">
              <li>Only DRAFT items require approval or rejection</li>
              <li>Approved configs are immediately applied to payroll</li>
              <li>Rejected configs return to draft for revision</li>
              <li>You can edit any configuration at any status</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-900 mb-2">📊 Configuration Types</p>
            <ul className="list-disc ml-5 space-y-1 text-sm text-slate-700">
              <li>Pay Grades: Salary structures and levels</li>
              <li>Payroll Policies: Processing and calculation rules</li>
              <li>Pay Types: Salary, overtime, bonus categories</li>
              <li>Allowances & Deductions: Benefits and deduction types</li>
              <li>Bonuses & Tax Rules: Special payments and tax calculations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {view && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeView} />
          <div className="relative bg-white w-[95vw] max-w-2xl rounded-xl shadow-xl border border-slate-200">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {view.name || view.grade || view.title || 'Details'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: {view.id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs border ${
                  view.status === ConfigStatus.APPROVED
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : view.status === ConfigStatus.REJECTED
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  {view.status}
                </span>
                <button onClick={closeView} className="text-slate-500 hover:text-slate-700 text-sm">✕</button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Common meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">Created</div>
                  <div className="text-sm font-medium text-slate-900">
                    {view.createdAt ? new Date(view.createdAt).toLocaleString() : '—'}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500">Type</div>
                  <div className="text-sm font-medium text-slate-900">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </div>
                </div>
              </div>

              {/* Type-specific details */}
              {activeTab === 'payGrades' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <KV label="Grade" value={view.grade || '—'} />
                  <KV label="Base Salary" value={view.baseSalary ? `${Number(view.baseSalary).toLocaleString()} EGP` : '—'} />
                  <KV label="Gross Salary" value={view.grossSalary ? `${Number(view.grossSalary).toLocaleString()} EGP` : '—'} />
                </div>
              )}

              {activeTab === 'payTypes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <KV label="Type" value={view.type || view.name || '—'} />
                  <KV label="Amount" value={view.amount ? `${Number(view.amount).toLocaleString()} EGP` : '—'} />
                </div>
              )}

              {activeTab === 'allowances' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <KV label="Name" value={view.name || '—'} />
                  <KV label="Amount" value={view.amount ? `${Number(view.amount).toLocaleString()} EGP` : '—'} />
                </div>
              )}

              {activeTab === 'signingBonuses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <KV label="Name" value={view.name || view.positionName || '—'} />
                  <KV label="Amount" value={view.amount ? `${Number(view.amount).toLocaleString()} EGP` : '—'} />
                </div>
              )}

              {activeTab === 'terminationBenefits' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <KV label="Name" value={view.name || '—'} />
                  <KV label="Amount" value={view.amount ? `${Number(view.amount).toLocaleString()} EGP` : '—'} />
                </div>
              )}

              {activeTab === 'payrollPolicies' && (
                <div className="space-y-2">
                  <KV label="Name" value={view.name || view.title || '—'} />
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="text-xs text-slate-500">Description</div>
                    <div className="text-sm text-slate-800 whitespace-pre-wrap">{view.description || '—'}</div>
                  </div>
                </div>
              )}

              {activeTab === 'taxRules' && (
                <div className="space-y-3">
                  <KV label="Name" value={view.name || '—'} />
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="text-xs text-slate-500">Description</div>
                    <div className="text-sm text-slate-800 whitespace-pre-wrap">{view.description || '—'}</div>
                  </div>
                  {Array.isArray((view as any).taxComponents) && (
                    <div className="bg-white rounded-lg border border-slate-200">
                      <div className="px-3 py-2 text-xs font-medium text-slate-600 border-b">Tax Components</div>
                      <ul className="divide-y">
                        {(view as any).taxComponents.map((comp: any, idx: number) => (
                          <li key={idx} className="px-3 py-2 text-sm flex justify-between">
                            <span className="text-slate-800">{comp.name || comp.type || `Component ${idx+1}`}</span>
                            <span className="text-slate-600">{comp.rate}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={closeView} className="px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper for key/value display
function KV({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-900">{value ?? '—'}</div>
    </div>
  );
}
