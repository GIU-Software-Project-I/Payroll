'use client';

import { useState, useEffect } from 'react';
import { financeStaffService, TaxReport, InsuranceReport, BenefitsReport } from '@/app/services/finance-staff';
import { useAuth } from '@/app/context/AuthContext';
import { SystemRole } from '@/app/types';

export default function TaxInsuranceBenefitsPage() {
  const { hasRole } = useAuth();
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [insuranceReports, setInsuranceReports] = useState<InsuranceReport[]>([]);
  const [benefitsReports, setBenefitsReports] = useState<BenefitsReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tax' | 'insurance' | 'benefits'>('tax');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    if (!hasRole([SystemRole.FINANCE_STAFF, SystemRole.PAYROLL_MANAGER, SystemRole.HR_ADMIN])) return;
    loadReports();
  }, [hasRole, selectedPeriod]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = selectedPeriod ? `?period=${selectedPeriod}` : '';
      const [taxResponse, insuranceResponse, benefitsResponse]: [
        { data?: TaxReport[] } | undefined,
        { data?: InsuranceReport[] } | undefined,
        { data?: BenefitsReport[] } | undefined
      ] = await Promise.all([
        financeStaffService.getTaxReports(selectedPeriod),
        financeStaffService.getInsuranceReports(selectedPeriod),
        financeStaffService.getBenefitsReports(selectedPeriod),
      ]);
      
      if (taxResponse?.data) setTaxReports(taxResponse.data);
      if (insuranceResponse?.data) setInsuranceReports(insuranceResponse.data);
      if (benefitsResponse?.data) setBenefitsReports(benefitsResponse.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (type: 'tax' | 'insurance' | 'benefits') => {
    try {
      let response: any;
      switch (type) {
        case 'tax':
          response = await financeStaffService.generateTaxReport(selectedPeriod);
          if (response?.data) setTaxReports(prev => [response.data as TaxReport, ...prev]);
          break;
        case 'insurance':
          response = await financeStaffService.generateInsuranceReport(selectedPeriod);
          if (response?.data) setInsuranceReports(prev => [response.data as InsuranceReport, ...prev]);
          break;
        case 'benefits':
          response = await financeStaffService.generateBenefitsReport(selectedPeriod);
          if (response?.data) setBenefitsReports(prev => [response.data as BenefitsReport, ...prev]);
          break;
      }
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleDownloadReport = async (reportId: string, type: 'tax' | 'insurance' | 'benefits') => {
    try {
      const response = await financeStaffService.downloadReport(reportId, type);
      if (response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}-report-${reportId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  if (!hasRole([SystemRole.FINANCE_STAFF, SystemRole.PAYROLL_MANAGER, SystemRole.HR_ADMIN])) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Access denied. Finance Staff role required.</p>
      </div>
    );
  }

  const renderTaxReports = () => (
    <div className="space-y-4">
      {taxReports.map((report) => (
        <div key={report.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-slate-900">{report.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{report.period}</p>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Total Tax Withheld</p>
                  <p className="text-lg font-semibold text-slate-900">${report.totalTaxWithheld.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Employees</p>
                  <p className="text-lg font-semibold text-slate-900">{report.employeeCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'final' ? 'bg-green-100 text-green-800' :
                    report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {report.taxTypes.map((taxType, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">{taxType.taxType}</span>
                    <span className="text-slate-900">${taxType.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownloadReport(report.id, 'tax')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      ))}
      {taxReports.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No tax reports found
        </div>
      )}
    </div>
  );

  const renderInsuranceReports = () => (
    <div className="space-y-4">
      {insuranceReports.map((report) => (
        <div key={report.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-slate-900">{report.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{report.period}</p>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Total Contributions</p>
                  <p className="text-lg font-semibold text-slate-900">${report.totalContributions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Employees</p>
                  <p className="text-lg font-semibold text-slate-900">{report.employeeCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'final' ? 'bg-green-100 text-green-800' :
                    report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {report.insuranceTypes.map((insuranceType, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">{insuranceType.insuranceType}</span>
                    <span className="text-slate-900">${insuranceType.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownloadReport(report.id, 'insurance')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      ))}
      {insuranceReports.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No insurance reports found
        </div>
      )}
    </div>
  );

  const renderBenefitsReports = () => (
    <div className="space-y-4">
      {benefitsReports.map((report) => (
        <div key={report.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-slate-900">{report.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{report.period}</p>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Total Benefits</p>
                  <p className="text-lg font-semibold text-slate-900">${report.totalBenefits.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Employees</p>
                  <p className="text-lg font-semibold text-slate-900">{report.employeeCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'final' ? 'bg-green-100 text-green-800' :
                    report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {report.benefitTypes.map((benefitType, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">{benefitType.benefitType}</span>
                    <span className="text-slate-900">${benefitType.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownloadReport(report.id, 'benefits')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      ))}
      {benefitsReports.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No benefits reports found
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tax, Insurance, and Benefits Reports</h1>
          <p className="text-slate-600 mt-1">Generate and download compliance reports for accounting books</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Report
        </button>
      </div>

      {/* Period Filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">Period:</label>
          <input
            type="month"
            className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          />
          <button
            onClick={loadReports}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'tax', label: 'Tax Reports', count: taxReports.length },
              { id: 'insurance', label: 'Insurance Reports', count: insuranceReports.length },
              { id: 'benefits', label: 'Benefits Reports', count: benefitsReports.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-500 mt-2">Loading reports...</p>
            </div>
          ) : (
            <>
              {activeTab === 'tax' && renderTaxReports()}
              {activeTab === 'insurance' && renderInsuranceReports()}
              {activeTab === 'benefits' && renderBenefitsReports()}
            </>
          )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Generate Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="tax">Tax Report</option>
                  <option value="insurance">Insurance Report</option>
                  <option value="benefits">Benefits Report</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Period</label>
                <input
                  type="month"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGenerateReport(activeTab)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
