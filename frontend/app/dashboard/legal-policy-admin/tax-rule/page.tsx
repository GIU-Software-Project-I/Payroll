'use client';

import { useState, useEffect } from 'react';
import { payrollConfigurationService } from '@/app/services/payroll-configuration';
import { useAuth } from '@/app/context/AuthContext';

// ==================== TAX COMPONENTS TYPES ====================
interface TaxComponent {
  type: TaxComponentType;
  name: string;
  description: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
  formula?: string;
}

enum TaxComponentType {
  INCOME_TAX = 'INCOME_TAX',
  EXEMPTION = 'EXEMPTION',
  SURCHARGE = 'SURCHARGE',
  CESS = 'CESS',
  OTHER_DEDUCTION = 'OTHER_DEDUCTION'
}

interface TaxRule {
  _id: string;
  name: string;
  description?: string;
  taxComponents: TaxComponent[];
  status: 'draft' | 'approved' | 'rejected';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  __v: number;
}

// ==================== TAX BRACKETS TYPES ====================
interface TaxBracket {
  _id: string;
  name: string;
  description?: string;
  localTaxLawReference: string;
  minIncome: number;
  maxIncome: number;
  taxRate: number;
  baseAmount: number;
  status: 'draft' | 'approved' | 'rejected';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  effectiveDate?: string;
  expiryDate?: string;
  __v: number;
}

interface BackendErrorResponse {
  message?: string;
  error?: string | { message: string };
  statusCode?: number;
  [key: string]: any;
}

// ==================== CONSTANTS ====================
const taxTypeOptions = [
  { value: 'Income Tax', label: 'Income Tax' },
  { value: 'Corporate Tax', label: 'Corporate Tax' },
  { value: 'Value Added Tax (VAT)', label: 'Value Added Tax (VAT)' },
  { value: 'Withholding Tax', label: 'Withholding Tax' },
  { value: 'Capital Gains Tax', label: 'Capital Gains Tax' },
  { value: 'Property Tax', label: 'Property Tax' },
  { value: 'Excise Tax', label: 'Excise Tax' },
  { value: 'Customs Duty', label: 'Customs Duty' },
];

const taxComponentTypeOptions = [
  { value: TaxComponentType.INCOME_TAX, label: 'Income Tax' },
  { value: TaxComponentType.EXEMPTION, label: 'Exemption' },
  { value: TaxComponentType.SURCHARGE, label: 'Surcharge' },
  { value: TaxComponentType.CESS, label: 'Cess' },
  { value: TaxComponentType.OTHER_DEDUCTION, label: 'Other Deduction' },
];

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels = {
  draft: 'Draft',
  approved: 'Approved',
  rejected: 'Rejected',
};

// ==================== MAIN COMPONENT ====================
export default function TaxConfigurationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rules' | 'brackets'>('rules');
  
  // ========== COMMON STATES ==========
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ========== TAX RULES STATES ==========
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showRuleViewModal, setShowRuleViewModal] = useState(false);
  const [selectedTaxRule, setSelectedTaxRule] = useState<TaxRule | null>(null);
  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    description: '',
    taxComponents: [{
      type: TaxComponentType.INCOME_TAX,
      name: '',
      description: '',
      rate: '',
      minAmount: '0',
      maxAmount: '1000000',
      formula: '',
    }]
  });

  // ========== TAX BRACKETS STATES ==========
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([]);
  const [showBracketModal, setShowBracketModal] = useState(false);
  const [showBracketViewModal, setShowBracketViewModal] = useState(false);
  const [selectedBracket, setSelectedBracket] = useState<TaxBracket | null>(null);
  const [bracketFormData, setBracketFormData] = useState({
    name: '',
    description: '',
    localTaxLawReference: '',
    minIncome: '',
    maxIncome: '',
    taxRate: '',
    baseAmount: '',
    effectiveDate: '',
    expiryDate: '',
  });

  // ========== FETCH ALL DATA ==========
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both tax rules and tax brackets
      const [rulesResponse, bracketsResponse] = await Promise.all([
        payrollConfigurationService.getTaxRules(),
        payrollConfigurationService.getTaxBrackets()
      ]);
      
      if (rulesResponse.error) throw new Error(rulesResponse.error);
      if (bracketsResponse.error) console.warn('Brackets fetch error:', bracketsResponse.error);
      
      // Process tax rules
      if (rulesResponse.data) {
        const rulesData = rulesResponse.data as any;
        if (rulesData.data && Array.isArray(rulesData.data)) {
          setTaxRules(rulesData.data);
        } else if (Array.isArray(rulesData)) {
          setTaxRules(rulesData);
        }
      }
      
      // Process tax brackets
      if (bracketsResponse.data) {
        const bracketsData = bracketsResponse.data as any;
        if (bracketsData.data && Array.isArray(bracketsData.data)) {
          setTaxBrackets(bracketsData.data);
        } else if (Array.isArray(bracketsData)) {
          setTaxBrackets(bracketsData);
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // ========== TAX RULES FUNCTIONS ==========
  const validateRuleForm = () => {
    const errors: string[] = [];
    if (!ruleFormData.name) errors.push('Tax rule name is required');
    if (ruleFormData.taxComponents.length === 0) errors.push('At least one tax component is required');

    ruleFormData.taxComponents.forEach((component, index) => {
      if (!component.name) errors.push(`Component ${index + 1}: Name is required`);
      if (!component.description) errors.push(`Component ${index + 1}: Description is required`);
      
      const rate = parseFloat(component.rate);
      if (isNaN(rate) || rate < 0) errors.push(`Component ${index + 1}: Rate must be a positive number`);
      if (rate > 100) errors.push(`Component ${index + 1}: Rate cannot exceed 100%`);

      const minAmount = parseFloat(component.minAmount);
      if (isNaN(minAmount) || minAmount < 0) errors.push(`Component ${index + 1}: Minimum amount must be a positive number`);

      const maxAmount = parseFloat(component.maxAmount);
      if (isNaN(maxAmount) || maxAmount < 0) errors.push(`Component ${index + 1}: Maximum amount must be a positive number`);
      if (maxAmount <= minAmount) errors.push(`Component ${index + 1}: Maximum amount must be greater than minimum amount`);
    });

    return errors;
  };

  const handleCreateTaxRule = async () => {
    try {
      const validationErrors = validateRuleForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        return;
      }

      if (!user?.id) {
        setError('You must be logged in to create a tax rule');
        return;
      }

      setActionLoading(true);
      
      const apiData = {
        name: ruleFormData.name,
        description: ruleFormData.description || undefined,
        taxComponents: ruleFormData.taxComponents.map(component => ({
          type: component.type,
          name: component.name,
          description: component.description,
          rate: parseFloat(component.rate),
          minAmount: parseFloat(component.minAmount),
          maxAmount: parseFloat(component.maxAmount),
          formula: component.formula || undefined,
        })),
        createdByEmployeeId: user.id,
      };
      
      const response = await payrollConfigurationService.createTaxRule(apiData);
      
      if (response.error) throw new Error(response.error);
      
      if (response.data) {
        const responseData = response.data as BackendErrorResponse;
        if (responseData.statusCode && responseData.statusCode >= 400) {
          throw new Error(responseData.message || 'Failed to create tax rule');
        }
      }
      
      setSuccess('Tax rule created successfully as DRAFT');
      setShowRuleModal(false);
      resetRuleForm();
      fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to create tax rule');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTaxRule = async () => {
    if (!selectedTaxRule) return;
    
    try {
      const validationErrors = validateRuleForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        return;
      }

      if (selectedTaxRule.status !== 'draft') {
        setError('Only DRAFT tax rules can be edited');
        return;
      }

      setActionLoading(true);
      
      const updateData = {
        description: ruleFormData.description || undefined,
        taxComponents: ruleFormData.taxComponents.map(component => ({
          type: component.type,
          name: component.name,
          description: component.description,
          rate: parseFloat(component.rate),
          minAmount: parseFloat(component.minAmount),
          maxAmount: parseFloat(component.maxAmount),
          formula: component.formula || undefined,
        })),
      };
      
      const response = await payrollConfigurationService.updateTaxRule(
        selectedTaxRule._id,
        updateData
      );
      
      if (response.error) throw new Error(response.error);
      
      if (response.data) {
        const responseData = response.data as BackendErrorResponse;
        if (responseData.statusCode && responseData.statusCode >= 400) {
          throw new Error(responseData.message || 'Failed to update tax rule');
        }
      }
      
      setSuccess('Tax rule updated successfully');
      setShowRuleModal(false);
      resetRuleForm();
      fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to update tax rule');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTaxRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax rule? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await payrollConfigurationService.deleteTaxRule(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setSuccess('Tax rule deleted successfully');
      fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tax rule');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditRuleClick = (taxRule: TaxRule) => {
    if (taxRule.status !== 'draft') {
      setError('Only DRAFT tax rules can be edited');
      return;
    }
    
    setSelectedTaxRule(taxRule);
    setRuleFormData({
      name: taxRule.name,
      description: taxRule.description || '',
      taxComponents: taxRule.taxComponents.map(component => ({
        type: component.type,
        name: component.name,
        description: component.description,
        rate: component.rate.toString(),
        minAmount: component.minAmount?.toString() || '0',
        maxAmount: component.maxAmount?.toString() || '1000000',
        formula: component.formula || '',
      }))
    });
    
    setShowRuleModal(true);
  };

  const resetRuleForm = () => {
    setRuleFormData({
      name: '',
      description: '',
      taxComponents: [{
        type: TaxComponentType.INCOME_TAX,
        name: '',
        description: '',
        rate: '',
        minAmount: '0',
        maxAmount: '1000000',
        formula: '',
      }]
    });
    setSelectedTaxRule(null);
  };

  const handleRuleComponentChange = (index: number, field: string, value: string) => {
    setRuleFormData(prev => {
      const updatedComponents = [...prev.taxComponents];
      updatedComponents[index] = { ...updatedComponents[index], [field]: value };
      return { ...prev, taxComponents: updatedComponents };
    });
  };

  const addRuleComponent = () => {
    setRuleFormData(prev => ({
      ...prev,
      taxComponents: [
        ...prev.taxComponents,
        {
          type: TaxComponentType.INCOME_TAX,
          name: '',
          description: '',
          rate: '',
          minAmount: '0',
          maxAmount: '1000000',
          formula: '',
        }
      ]
    }));
  };

  // ========== TAX BRACKETS FUNCTIONS ==========
  const validateBracketForm = () => {
    const errors: string[] = [];
    if (!bracketFormData.name) errors.push('Bracket name is required');
    if (!bracketFormData.localTaxLawReference) errors.push('Local tax law reference is required');
    if (!bracketFormData.minIncome) errors.push('Minimum income is required');
    if (!bracketFormData.maxIncome) errors.push('Maximum income is required');
    if (!bracketFormData.taxRate) errors.push('Tax rate is required');
    if (!bracketFormData.baseAmount) errors.push('Base amount is required');

    const minIncome = parseFloat(bracketFormData.minIncome);
    const maxIncome = parseFloat(bracketFormData.maxIncome);
    const taxRate = parseFloat(bracketFormData.taxRate);
    const baseAmount = parseFloat(bracketFormData.baseAmount);

    if (isNaN(minIncome) || minIncome < 0) errors.push('Minimum income must be a positive number');
    if (isNaN(maxIncome) || maxIncome < 0) errors.push('Maximum income must be a positive number');
    if (isNaN(taxRate) || taxRate < 0 || taxRate > 100) errors.push('Tax rate must be between 0 and 100%');
    if (isNaN(baseAmount) || baseAmount < 0) errors.push('Base amount must be a positive number');
    if (maxIncome <= minIncome) errors.push('Maximum income must be greater than minimum income');

    return errors;
  };

  const handleCreateTaxBracket = async () => {
    try {
      const validationErrors = validateBracketForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        return;
      }

      if (!user?.id) {
        setError('You must be logged in to create a tax bracket');
        return;
      }

      setActionLoading(true);
      
      const apiData = {
        name: bracketFormData.name,
        description: bracketFormData.description || undefined,
        localTaxLawReference: bracketFormData.localTaxLawReference,
        minIncome: parseFloat(bracketFormData.minIncome),
        maxIncome: parseFloat(bracketFormData.maxIncome),
        taxRate: parseFloat(bracketFormData.taxRate),
        baseAmount: parseFloat(bracketFormData.baseAmount),
        effectiveDate: bracketFormData.effectiveDate || undefined,
        expiryDate: bracketFormData.expiryDate || undefined,
        createdByEmployeeId: user.id,
      };
      
      const response = await payrollConfigurationService.createTaxBracket(apiData);
      
      if (response.error) throw new Error(response.error);
      
      if (response.data) {
        const responseData = response.data as BackendErrorResponse;
        if (responseData.statusCode && responseData.statusCode >= 400) {
          throw new Error(responseData.message || 'Failed to create tax bracket');
        }
      }
      
      setSuccess('Tax bracket created successfully as DRAFT');
      setShowBracketModal(false);
      resetBracketForm();
      fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to create tax bracket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTaxBracket = async () => {
    if (!selectedBracket) return;
    
    try {
      const validationErrors = validateBracketForm();
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        return;
      }

      if (selectedBracket.status !== 'draft') {
        setError('Only DRAFT tax brackets can be edited');
        return;
      }

      setActionLoading(true);
      
      const updateData = {
        description: bracketFormData.description || undefined,
        localTaxLawReference: bracketFormData.localTaxLawReference,
        minIncome: parseFloat(bracketFormData.minIncome),
        maxIncome: parseFloat(bracketFormData.maxIncome),
        taxRate: parseFloat(bracketFormData.taxRate),
        baseAmount: parseFloat(bracketFormData.baseAmount),
        effectiveDate: bracketFormData.effectiveDate || undefined,
        expiryDate: bracketFormData.expiryDate || undefined,
      };
      
      const response = await payrollConfigurationService.updateTaxBracket(
        selectedBracket._id,
        updateData
      );
      
      if (response.error) throw new Error(response.error);
      
      if (response.data) {
        const responseData = response.data as BackendErrorResponse;
        if (responseData.statusCode && responseData.statusCode >= 400) {
          throw new Error(responseData.message || 'Failed to update tax bracket');
        }
      }
      
      setSuccess('Tax bracket updated successfully');
      setShowBracketModal(false);
      resetBracketForm();
      fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to update tax bracket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTaxBracket = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax bracket? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await payrollConfigurationService.deleteTaxBracket(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setSuccess('Tax bracket deleted successfully');
      fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tax bracket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBracketClick = (bracket: TaxBracket) => {
    if (bracket.status !== 'draft') {
      setError('Only DRAFT tax brackets can be edited');
      return;
    }
    
    setSelectedBracket(bracket);
    setBracketFormData({
      name: bracket.name,
      description: bracket.description || '',
      localTaxLawReference: bracket.localTaxLawReference,
      minIncome: bracket.minIncome.toString(),
      maxIncome: bracket.maxIncome.toString(),
      taxRate: bracket.taxRate.toString(),
      baseAmount: bracket.baseAmount.toString(),
      effectiveDate: bracket.effectiveDate || '',
      expiryDate: bracket.expiryDate || '',
    });
    
    setShowBracketModal(true);
  };

  const resetBracketForm = () => {
    setBracketFormData({
      name: '',
      description: '',
      localTaxLawReference: '',
      minIncome: '',
      maxIncome: '',
      taxRate: '',
      baseAmount: '',
      effectiveDate: '',
      expiryDate: '',
    });
    setSelectedBracket(null);
  };

  // ========== HELPER FUNCTIONS ==========
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  const formatIncomeRange = (min: number, max: number) => {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  };

  const getComponentTypeLabel = (type: TaxComponentType) => {
    const option = taxComponentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tax Configuration</h1>
            <p className="text-slate-600 mt-2">Loading tax configuration...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tax Configuration</h1>
          <p className="text-slate-600 mt-2">
            Manage tax rules, components, and progressive tax brackets for payroll compliance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAllData}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Refresh All
          </button>
          <button
            onClick={() => activeTab === 'rules' ? setShowRuleModal(true) : setShowBracketModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {activeTab === 'rules' ? 'Create Tax Rule' : 'Create Tax Bracket'}
          </button>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <div className="text-green-600">✓</div>
          <p className="text-green-800 font-medium">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <div className="text-red-600">✕</div>
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            📋 Tax Rules ({taxRules.length})
          </button>
          <button
            onClick={() => setActiveTab('brackets')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'brackets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            📊 Tax Brackets ({taxBrackets.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'rules' ? (
          /* TAX RULES TABLE */
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            {taxRules.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-slate-400 mb-4">💰</div>
                <p className="text-slate-600 font-medium">No tax rules found</p>
                <p className="text-slate-500 text-sm mt-1">Create your first tax rule to get started</p>
                <button
                  onClick={() => setShowRuleModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Tax Rule
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Tax Rule</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Description</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Components</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Created</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxRules.map((taxRule) => (
                      <tr key={taxRule._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <p className="font-medium text-slate-900">{taxRule.name}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-slate-700 text-sm truncate max-w-xs" title={taxRule.description || 'No description'}>
                            {taxRule.description || '—'}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-2">
                            {taxRule.taxComponents.map((component, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                title={`${component.name}: ${component.rate}% (${component.type})`}
                              >
                                {component.name}: {formatPercentage(component.rate)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[taxRule.status]}`}>
                            {statusLabels[taxRule.status]}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-700 text-sm">{formatDate(taxRule.createdAt)}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedTaxRule(taxRule); setShowRuleViewModal(true); }}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              👁️
                            </button>
                            {taxRule.status === 'draft' && (
                              <>
                                <button
                                  onClick={() => handleEditRuleClick(taxRule)}
                                  className="p-1.5 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteTaxRule(taxRule._id)}
                                  className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* TAX BRACKETS TABLE */
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            {taxBrackets.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-slate-400 mb-4">📊</div>
                <p className="text-slate-600 font-medium">No tax brackets found</p>
                <p className="text-slate-500 text-sm mt-1">Create your first tax bracket to get started</p>
                <button
                  onClick={() => setShowBracketModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Tax Bracket
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Bracket Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Income Range</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Tax Rate</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Base Amount</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Law Reference</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxBrackets.map((bracket) => (
                      <tr key={bracket._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <p className="font-medium text-slate-900">{bracket.name}</p>
                          <p className="text-slate-500 text-sm mt-1 truncate max-w-xs">
                            {bracket.description || 'No description'}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-slate-900">
                            {formatIncomeRange(bracket.minIncome, bracket.maxIncome)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-slate-900">
                            {formatPercentage(bracket.taxRate)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-slate-900">
                            {formatCurrency(bracket.baseAmount)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[bracket.status]}`}>
                            {statusLabels[bracket.status]}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-slate-700 text-sm truncate max-w-xs" title={bracket.localTaxLawReference}>
                            {bracket.localTaxLawReference}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSelectedBracket(bracket); setShowBracketViewModal(true); }}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              👁️
                            </button>
                            {bracket.status === 'draft' && (
                              <>
                                <button
                                  onClick={() => handleEditBracketClick(bracket)}
                                  className="p-1.5 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteTaxBracket(bracket._id)}
                                  className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          {activeTab === 'rules' ? '📋 Tax Rules Information' : '📊 Tax Brackets Information'}
        </h3>
        {activeTab === 'rules' ? (
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Define tax components (e.g., Income Tax, Exemption, Surcharge)</li>
            <li>• Each component has rate, min/max amounts, and optional formula</li>
            <li>• All rules start in DRAFT status and require approval</li>
            <li>• <span className="font-semibold">Business Rule BR 6:</span> System must support multiple tax components</li>
            <li>• Only DRAFT rules can be edited or deleted</li>
          </ul>
        ) : (
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Define progressive tax brackets for income tax calculation</li>
            <li>• Each bracket has income range, tax rate, and base amount</li>
            <li>• <span className="font-semibold">Business Rule BR 5:</span> Must reference Local Tax Law</li>
            <li>• Used for progressive income tax calculations</li>
            <li>• Brackets should not overlap (e.g., 0-50K, 50,001-100K)</li>
            <li>• Only DRAFT brackets can be edited or deleted</li>
          </ul>
        )}
      </div>

      {/* ========== MODALS ========== */}
      
      {/* Tax Rule Create/Edit Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedTaxRule ? 'Edit Tax Rule' : 'Create Tax Rule'}
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tax Rule Name *
                </label>
                <select
                  name="name"
                  value={ruleFormData.name}
                  onChange={(e) => setRuleFormData({...ruleFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!selectedTaxRule}
                >
                  <option value="">Select tax type</option>
                  {taxTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Select or enter the type of tax rule</p>
                {selectedTaxRule && (
                  <p className="text-xs text-amber-600 mt-1">Tax rule name cannot be changed after creation</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({...ruleFormData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Enter description, legal references, or general notes..."
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {ruleFormData.description.length}/500 characters
                </p>
              </div>

              {/* Tax Components Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-slate-700">
                    Tax Components *
                  </label>
                  <button
                    type="button"
                    onClick={addRuleComponent}
                    className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium"
                  >
                    + Add Component
                  </button>
                </div>
                
                <div className="space-y-4">
                  {ruleFormData.taxComponents.map((component, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-slate-900">Component {index + 1}</h4>
                        {ruleFormData.taxComponents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newComponents = [...ruleFormData.taxComponents];
                              newComponents.splice(index, 1);
                              setRuleFormData({...ruleFormData, taxComponents: newComponents});
                            }}
                            className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Type *
                          </label>
                          <select
                            value={component.type}
                            onChange={(e) => handleRuleComponentChange(index, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                          >
                            {taxComponentTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={component.name}
                            onChange={(e) => handleRuleComponentChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            placeholder="e.g., Basic Income Tax"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Description *
                          </label>
                          <textarea
                            value={component.description}
                            onChange={(e) => handleRuleComponentChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            rows={2}
                            placeholder="Describe this tax component..."
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Rate (%) *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={component.rate}
                              onChange={(e) => handleRuleComponentChange(index, 'rate', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                              placeholder="e.g., 15"
                              step="0.01"
                              min="0"
                              max="100"
                              required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-slate-500 text-sm">%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Min Amount *
                          </label>
                          <input
                            type="number"
                            value={component.minAmount}
                            onChange={(e) => handleRuleComponentChange(index, 'minAmount', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            placeholder="e.g., 0"
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Max Amount *
                          </label>
                          <input
                            type="number"
                            value={component.maxAmount}
                            onChange={(e) => handleRuleComponentChange(index, 'maxAmount', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            placeholder="e.g., 1000000"
                            step="0.01"
                            min="0"
                            required
                          />
                          <p className="text-xs text-slate-500 mt-1">Must be greater than min amount</p>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Formula (Optional)
                          </label>
                          <input
                            type="text"
                            value={component.formula}
                            onChange={(e) => handleRuleComponentChange(index, 'formula', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                            placeholder="e.g., amount * rate / 100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 mb-2">ℹ️ Important Notes</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Tax rate must be between 0% and 100%</li>
                  <li>• <span className="font-semibold">Min Amount and Max Amount are required fields</span></li>
                  <li>• Max Amount must be greater than Min Amount</li>
                  <li>• Once created, tax rule name cannot be changed</li>
                  <li>• All rules start in DRAFT status and require Payroll Manager approval</li>
                  <li>• Ensure tax rules comply with current local tax legislation</li>
                  <li>• You can add multiple tax components to a single tax rule</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={selectedTaxRule ? handleUpdateTaxRule : handleCreateTaxRule}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors font-medium"
              >
                {actionLoading ? 'Saving...' : selectedTaxRule ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Bracket Create/Edit Modal */}
      {showBracketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedBracket ? 'Edit Tax Bracket' : 'Create Tax Bracket'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bracket Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={bracketFormData.name}
                  onChange={(e) => setBracketFormData({...bracketFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 0-50,000 Income Bracket"
                  required
                  disabled={!!selectedBracket}
                />
                <p className="text-xs text-slate-500 mt-1">Unique name for this tax bracket</p>
                {selectedBracket && (
                  <p className="text-xs text-amber-600 mt-1">Bracket name cannot be changed after creation</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={bracketFormData.description}
                  onChange={(e) => setBracketFormData({...bracketFormData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Describe this tax bracket..."
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {bracketFormData.description.length}/500 characters
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Local Tax Law Reference *
                </label>
                <input
                  type="text"
                  name="localTaxLawReference"
                  value={bracketFormData.localTaxLawReference}
                  onChange={(e) => setBracketFormData({...bracketFormData, localTaxLawReference: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Section 24B, Income Tax Act 2023"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Reference to local tax legislation (required for BR 5 compliance)</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Minimum Income *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="minIncome"
                      value={bracketFormData.minIncome}
                      onChange={(e) => setBracketFormData({...bracketFormData, minIncome: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      step="0.01"
                      min="0"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500">$</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimum income for this bracket</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Maximum Income *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="maxIncome"
                      value={bracketFormData.maxIncome}
                      onChange={(e) => setBracketFormData({...bracketFormData, maxIncome: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50000"
                      step="0.01"
                      min="0"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500">$</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Maximum income for this bracket (must be greater than min)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tax Rate (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="taxRate"
                      value={bracketFormData.taxRate}
                      onChange={(e) => setBracketFormData({...bracketFormData, taxRate: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="15"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500">%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Tax rate applied to income in this bracket (0-100%)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Base Amount *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="baseAmount"
                      value={bracketFormData.baseAmount}
                      onChange={(e) => setBracketFormData({...bracketFormData, baseAmount: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      step="0.01"
                      min="0"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500">$</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Fixed tax amount for this bracket</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Effective Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="effectiveDate"
                    value={bracketFormData.effectiveDate}
                    onChange={(e) => setBracketFormData({...bracketFormData, effectiveDate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Date when this bracket becomes effective</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={bracketFormData.expiryDate}
                    onChange={(e) => setBracketFormData({...bracketFormData, expiryDate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Date when this bracket expires (must be after effective date)</p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 mb-2">ℹ️ Important Notes</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• All tax brackets start in DRAFT status and require Payroll Manager approval</li>
                  <li>• Local Tax Law Reference is required for compliance with Business Rule BR 5</li>
                  <li>• Maximum income must be greater than minimum income</li>
                  <li>• Tax rate must be between 0% and 100%</li>
                  <li>• All monetary amounts must be positive numbers</li>
                  <li>• Once created, bracket name cannot be changed</li>
                  <li>• Ensure brackets don't overlap (e.g., 0-50,000 then 50,001-100,000)</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowBracketModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={selectedBracket ? handleUpdateTaxBracket : handleCreateTaxBracket}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors font-medium"
              >
                {actionLoading ? 'Saving...' : selectedBracket ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Rule View Modal */}
      {showRuleViewModal && selectedTaxRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Tax Rule Details</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedTaxRule.name}</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${statusColors[selectedTaxRule.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[selectedTaxRule.status] || selectedTaxRule.status}
                  </span>
                </div>
                <div className="text-slate-600 text-sm">ID: {selectedTaxRule._id.substring(0, 8)}...</div>
              </div>
              
              {selectedTaxRule.description && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Description</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedTaxRule.description}</p>
                  </div>
                </div>
              )}

              {/* Tax Components */}
              <div>
                <p className="text-sm text-slate-500 mb-4">Tax Components ({selectedTaxRule.taxComponents.length})</p>
                <div className="space-y-4">
                  {selectedTaxRule.taxComponents.map((component, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="font-bold text-slate-900">{component.name}</h5>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {getComponentTypeLabel(component.type)}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          {formatPercentage(component.rate)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Description</p>
                          <p className="text-sm font-medium text-slate-700">{component.description}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-500">Applicable Range</p>
                          <p className="text-sm font-medium text-slate-700">
                            {formatCurrency(component.minAmount)} to {formatCurrency(component.maxAmount)}
                          </p>
                        </div>
                        
                        {component.formula && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-slate-500">Formula</p>
                            <div className="bg-slate-50 border border-slate-200 rounded p-3">
                              <code className="text-sm text-slate-800 font-mono">
                                {component.formula}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="font-medium text-slate-900">{statusLabels[selectedTaxRule.status]}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedTaxRule.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Last Modified</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedTaxRule.updatedAt)}</p>
                </div>
                {selectedTaxRule.createdBy && (
                  <div>
                    <p className="text-sm text-slate-500">Created By</p>
                    <p className="font-medium text-slate-900">{selectedTaxRule.createdBy}</p>
                  </div>
                )}
              </div>
              
              {selectedTaxRule.approvedBy && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-green-600">Approved By</p>
                      <p className="font-medium text-green-800">{selectedTaxRule.approvedBy}</p>
                    </div>
                    {selectedTaxRule.approvedAt && (
                      <div>
                        <p className="text-sm text-green-600">Approved At</p>
                        <p className="font-medium text-green-800">{formatDate(selectedTaxRule.approvedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowRuleViewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Bracket View Modal */}
      {showBracketViewModal && selectedBracket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Tax Bracket Details</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedBracket.name}</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${statusColors[selectedBracket.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusLabels[selectedBracket.status] || selectedBracket.status}
                  </span>
                </div>
                <div className="text-slate-600 text-sm">ID: {selectedBracket._id.substring(0, 8)}...</div>
              </div>
              
              {selectedBracket.description && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Description</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedBracket.description}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500 mb-2">Local Tax Law Reference</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-medium text-blue-800">{selectedBracket.localTaxLawReference}</p>
                    <p className="text-xs text-blue-600 mt-1">Compliance: Business Rule BR 5</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-2">Income Range</p>
                  <p className="font-medium text-slate-900 text-xl">
                    {formatIncomeRange(selectedBracket.minIncome, selectedBracket.maxIncome)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-2">Tax Rate</p>
                  <p className="font-medium text-slate-900 text-3xl">
                    {formatPercentage(selectedBracket.taxRate)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-2">Base Amount</p>
                  <p className="font-medium text-slate-900 text-2xl">
                    {formatCurrency(selectedBracket.baseAmount)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-2">Effective Date</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedBracket.effectiveDate)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-2">Expiry Date</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedBracket.expiryDate)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <p className="font-medium text-slate-900">{statusLabels[selectedBracket.status]}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedBracket.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Last Modified</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedBracket.updatedAt)}</p>
                </div>
                {selectedBracket.createdBy && (
                  <div>
                    <p className="text-sm text-slate-500">Created By</p>
                    <p className="font-medium text-slate-900">{selectedBracket.createdBy}</p>
                  </div>
                )}
              </div>
              
              {selectedBracket.approvedBy && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-green-600">Approved By</p>
                      <p className="font-medium text-green-800">{selectedBracket.approvedBy}</p>
                    </div>
                    {selectedBracket.approvedAt && (
                      <div>
                        <p className="text-sm text-green-600">Approved At</p>
                        <p className="font-medium text-green-800">{formatDate(selectedBracket.approvedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowBracketViewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}