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
    return {
      id: raw.id || raw._id,
      name: raw.name || raw.title || "",
      title: raw.title || raw.name || "",
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

      // Check for errors in response
      if (res?.error) {
        setError(res.error);
        setItems([]);
        return;
      }

      // Handle different response structures
      let rawData: any[] = [];
      
      // First check if res.data exists
      if (res?.data) {
        // Case 1: Direct array
        if (Array.isArray(res.data)) {
          rawData = res.data;
        }
        // Case 2: Wrapped in { data: [...] }
        else if (res.data.data && Array.isArray(res.data.data)) {
          rawData = res.data.data;
        }
        // Case 3: Wrapped in { statusCode, message, data: [...] }
        else if (res.data.statusCode && res.data.data && Array.isArray(res.data.data)) {
          rawData = res.data.data;
        }
        // Case 4: Specific property names
        else if (res.data.payGrades && Array.isArray(res.data.payGrades)) {
          rawData = res.data.payGrades;
        } else if (res.data.payrollPolicies && Array.isArray(res.data.payrollPolicies)) {
          rawData = res.data.payrollPolicies;
        } else if (res.data.policies && Array.isArray(res.data.policies)) {
          rawData = res.data.policies;
        } else if (res.data.payTypes && Array.isArray(res.data.payTypes)) {
          rawData = res.data.payTypes;
        } else if (res.data.allowances && Array.isArray(res.data.allowances)) {
          rawData = res.data.allowances;
        } else if (res.data.signingBonuses && Array.isArray(res.data.signingBonuses)) {
          rawData = res.data.signingBonuses;
        } else if (res.data.terminationBenefits && Array.isArray(res.data.terminationBenefits)) {
          rawData = res.data.terminationBenefits;
        } else if (res.data.taxRules && Array.isArray(res.data.taxRules)) {
          rawData = res.data.taxRules;
        }
        // Case 5: Try to find any array property
        else if (typeof res.data === 'object') {
          const keys = Object.keys(res.data);
          for (const key of keys) {
            if (Array.isArray((res.data as any)[key])) {
              rawData = (res.data as any)[key];
              break;
            }
          }
        }
      }
      // If res itself is an array
      else if (Array.isArray(res)) {
        rawData = res;
      }
      
      console.log(`[ConfigApproval] Loaded ${rawData.length} items for ${activeTab}`, { rawData: rawData.slice(0, 2) });
      setItems(Array.isArray(rawData) ? rawData.map(normalize) : []);
    } catch (e: any) {
      console.error(`Failed to load ${activeTab}:`, e);
      setError(e?.message || `Failed to load ${activeTab}. Please check if the backend is running.`);
      setItems([]);
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
      const approveMethod = `approve${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1').replace(/s$/, '')}`;
      
      switch (activeTab) {
        case "payGrades":
          await payrollConfigurationService.approvePayGrade(id, { approvedBy: user.id });
          break;
        case "payrollPolicies":
          await payrollConfigurationService.approvePayrollPolicy(id, { approvedBy: user.id });
          break;
        case "payTypes":
          await payrollConfigurationService.approvePayType(id, { approvedBy: user.id });
          break;
        case "allowances":
          await payrollConfigurationService.approveAllowance(id, { approvedBy: user.id });
          break;
        case "signingBonuses":
          await payrollConfigurationService.approveSigningBonus(id, { approvedBy: user.id });
          break;
        case "terminationBenefits":
          await payrollConfigurationService.approveTerminationBenefit(id, { approvedBy: user.id });
          break;
        case "taxRules":
          await payrollConfigurationService.approveTaxRule(id, { approvedBy: user.id });
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
      switch (activeTab) {
        case "payGrades":
          await payrollConfigurationService.rejectPayGrade(id, { approvedBy: user.id });
          break;
        case "payrollPolicies":
          await payrollConfigurationService.rejectPayrollPolicy(id, { approvedBy: user.id });
          break;
        case "payTypes":
          await payrollConfigurationService.rejectPayType(id, { approvedBy: user.id });
          break;
        case "allowances":
          await payrollConfigurationService.rejectAllowance(id, { approvedBy: user.id });
          break;
        case "signingBonuses":
          await payrollConfigurationService.rejectSigningBonus(id, { approvedBy: user.id });
          break;
        case "terminationBenefits":
          await payrollConfigurationService.rejectTerminationBenefit(id, { approvedBy: user.id });
          break;
        case "taxRules":
          await payrollConfigurationService.rejectTaxRule(id, { approvedBy: user.id });
          break;
      }
      setSuccess("Configuration rejected");
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to reject");
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
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Created</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-900">{item.name || item.title || "N/A"}</td>
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
                          <button
                            className="px-3 py-1 border rounded hover:bg-blue-50 text-xs"
                          >
                            View
                          </button>
                          <button
                            className="px-3 py-1 border rounded hover:bg-red-50 text-xs"
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
    </div>
  );
}
