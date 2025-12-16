import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { paySlip } from '../../payroll/payroll-execution/models/payslip.schema';
import { EmployeeProfile } from '../../employee/models/employee/employee-profile.schema';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(paySlip.name) private payslipModel: Model<paySlip>,
    @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfile>,
  ) {}

  // ============ TAX REPORTS ============

  async getTaxReports(period?: string) {
    // For now, return empty array - in real implementation, this would query a database
    return [];
  }

  async generateTaxReport(period: string) {
    // Mock payroll runs data
    const payrollRuns = [];
    // In real implementation, this would query database
    // const payrollRuns = await this.payrollRunModel.find({
    //   status: 'completed',
    //   period: { $regex: period }
    // }).populate('employeeId');

    // Aggregate tax data
    const taxAggregation = await this.aggregateTaxData(payrollRuns);

    const report = {
      id: `tax-${period}-${Date.now()}`,
      period,
      title: `Tax Report - ${period}`,
      totalTaxWithheld: taxAggregation.totalTax,
      taxTypes: taxAggregation.taxTypes,
      employeeCount: payrollRuns.length,
      generatedAt: new Date().toISOString(),
      status: 'final',
      downloadUrl: `/finance/tax-reports/${period}/download`
    };

    // In real implementation, save to database
    return report;
  }

  async downloadTaxReport(id: string) {
    // In real implementation, generate and return PDF
    return { message: 'Tax report download not implemented yet' };
  }

  // ============ INSURANCE REPORTS ============

  async getInsuranceReports(period?: string) {
    return [];
  }

  async generateInsuranceReport(period: string) {
    // Mock payroll runs data
    const payrollRuns = [];
    // In real implementation, this would query database
    // const payrollRuns = await this.payrollRunModel.find({
    //   status: 'completed',
    //   period: { $regex: period }
    // }).populate('employeeId');

    const insuranceAggregation = await this.aggregateInsuranceData(payrollRuns);

    const report = {
      id: `insurance-${period}-${Date.now()}`,
      period,
      title: `Insurance Report - ${period}`,
      totalContributions: insuranceAggregation.totalInsurance,
      insuranceTypes: insuranceAggregation.insuranceTypes,
      employeeCount: payrollRuns.length,
      generatedAt: new Date().toISOString(),
      status: 'final',
      downloadUrl: `/finance/insurance-reports/${period}/download`
    };

    return report;
  }

  async downloadInsuranceReport(id: string) {
    return { message: 'Insurance report download not implemented yet' };
  }

  // ============ BENEFITS REPORTS ============

  async getBenefitsReports(period?: string) {
    return [];
  }

  async generateBenefitsReport(period: string) {
    // Mock payroll runs data
    const payrollRuns = [];
    // In real implementation, this would query database
    // const payrollRuns = await this.payrollRunModel.find({
    //   status: 'completed',
    //   period: { $regex: period }
    // }).populate('employeeId');

    const benefitsAggregation = await this.aggregateBenefitsData(payrollRuns);

    const report = {
      id: `benefits-${period}-${Date.now()}`,
      period,
      title: `Benefits Report - ${period}`,
      totalBenefits: benefitsAggregation.totalBenefits,
      benefitTypes: benefitsAggregation.benefitTypes,
      employeeCount: payrollRuns.length,
      generatedAt: new Date().toISOString(),
      status: 'final',
      downloadUrl: `/finance/benefits-reports/${period}/download`
    };

    return report;
  }

  async downloadBenefitsReport(id: string) {
    return { message: 'Benefits report download not implemented yet' };
  }

  // ============ PAYROLL SUMMARIES ============

  async getPayrollSummaries(filters: any) {
    return [];
  }

  async generatePayrollSummary(type: string, period: string) {
    // Mock payroll runs data
    const payrollRuns = [];
    // In real implementation, this would query database
    // const payrollRuns = await this.payrollRunModel.find({
    //   status: 'completed',
    //   period: { $regex: period }
    // }).populate('employeeId');

    const summaryAggregation = await this.aggregatePayrollData(payrollRuns);

    const summary = {
      id: `${type}-${period}-${Date.now()}`,
      type,
      period,
      title: `${type.replace('_', '-').charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Summary - ${period}`,
      totalGrossPay: summaryAggregation.totalGrossPay,
      totalNetPay: summaryAggregation.totalNetPay,
      totalDeductions: summaryAggregation.totalDeductions,
      totalTaxes: summaryAggregation.totalTaxes,
      employeeCount: payrollRuns.length,
      departmentBreakdown: summaryAggregation.departmentBreakdown,
      generatedAt: new Date().toISOString(),
      status: 'final',
      downloadUrl: `/finance/payroll-summaries/${type}-${period}/download`
    };

    return summary;
  }

  async downloadPayrollSummary(id: string) {
    return { message: 'Payroll summary download not implemented yet' };
  }

  // ============ PAYSLIP HISTORY ============

  async getPayslipHistory(period?: string) {
    return [];
  }

  async generatePayslipHistoryReport(period: string) {
    try {
      console.log('Generating payslip history report for period:', period);
      
      // Parse period (format: YYYY-MM)
      const [year, month] = period.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      console.log('Date range:', { startDate, endDate });

      // Query payslips from database using actual schema fields
      const payslips = await this.payslipModel
        .find({
          createdAt: { $gte: startDate, $lte: endDate }
        })
        .populate('employeeId', 'fullName department')
        .lean()
        .exec();

      console.log(`Found ${payslips.length} payslips`);

      if (payslips.length === 0) {
        // Return empty report
        return {
          id: `payslip-history-${period}-${Date.now()}`,
          period,
          title: `Payslip History - ${period}`,
          totalPayslips: 0,
          employeeCount: 0,
          totalGrossPay: 0,
          totalNetPay: 0,
          totalDeductions: 0,
          departmentBreakdown: [],
          generatedAt: new Date().toISOString(),
          status: 'final',
          downloadUrl: `/finance/payslip-history-reports/${period}/download`
        };
      }

      // Calculate totals using actual schema fields
      const totalPayslips = payslips.length;
      const totalGrossPay = payslips.reduce((sum, ps: any) => sum + (ps.grossPay || ps.totalGrossSalary || 0), 0);
      const totalNetPay = payslips.reduce((sum, ps: any) => sum + (ps.netPay || 0), 0);
      
      // Calculate deductions as grossPay - netPay
      const totalDeductions = totalGrossPay - totalNetPay;

      // Get unique employees
      const uniqueEmployees = new Set(payslips.map((ps: any) => ps.employeeId?._id?.toString() || ps.employeeId?.toString()));
      const employeeCount = uniqueEmployees.size;

      console.log('Calculated totals:', { totalPayslips, totalGrossPay, totalNetPay, totalDeductions, employeeCount });

      // Group by department
      const departmentMap = new Map();
      for (const payslip of payslips) {
        const employee: any = payslip.employeeId;
        const deptName = employee?.department || 'Unknown';
        
        if (!departmentMap.has(deptName)) {
          departmentMap.set(deptName, {
            departmentName: deptName,
            employeeCount: 0,
            totalGrossPay: 0,
            totalNetPay: 0,
            totalDeductions: 0,
            employees: new Set()
          });
        }
        
        const dept = departmentMap.get(deptName);
        const empId = employee?._id?.toString() || employee?.toString();
        dept.employees.add(empId);
        
        const ps: any = payslip;
        const grossPay = ps.grossPay || ps.totalGrossSalary || 0;
        const netPay = ps.netPay || 0;
        
        dept.totalGrossPay += grossPay;
        dept.totalNetPay += netPay;
        dept.totalDeductions += (grossPay - netPay);
      }

      // Convert to array and calculate employee counts
      const departmentBreakdown = Array.from(departmentMap.values()).map(dept => ({
        departmentName: dept.departmentName,
        employeeCount: dept.employees.size,
        totalGrossPay: Math.round(dept.totalGrossPay * 100) / 100,
        totalNetPay: Math.round(dept.totalNetPay * 100) / 100,
        totalDeductions: Math.round(dept.totalDeductions * 100) / 100
      }));

      const report = {
        id: `payslip-history-${period}-${Date.now()}`,
        period,
        title: `Payslip History - ${period}`,
        totalPayslips,
        employeeCount,
        totalGrossPay: Math.round(totalGrossPay * 100) / 100,
        totalNetPay: Math.round(totalNetPay * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        departmentBreakdown,
        generatedAt: new Date().toISOString(),
        status: 'final',
        downloadUrl: `/finance/payslip-history-reports/${period}/download`
      };

      console.log('Generated report:', report);
      return report;
    } catch (error) {
      console.error('Error generating payslip history report:', error);
      throw error;
    }
  }

  async downloadPayslipHistoryReport(id: string) {
    return { message: 'Payslip history report download not implemented yet' };
  }

  // ============ HELPER METHODS ============

  private async aggregateTaxData(payrollRuns: any[]) {
    // Mock aggregation - in real implementation, calculate from payroll data
    return {
      totalTax: 50000,
      taxTypes: [
        { taxType: 'Income Tax', amount: 30000, employeeCount: payrollRuns.length },
        { taxType: 'Social Security', amount: 20000, employeeCount: payrollRuns.length }
      ]
    };
  }

  private async aggregateInsuranceData(payrollRuns: any[]) {
    return {
      totalInsurance: 15000,
      insuranceTypes: [
        { insuranceType: 'Health Insurance', amount: 10000, employeeCount: payrollRuns.length },
        { insuranceType: 'Life Insurance', amount: 5000, employeeCount: Math.floor(payrollRuns.length * 0.5) }
      ]
    };
  }

  private async aggregateBenefitsData(payrollRuns: any[]) {
    return {
      totalBenefits: 25000,
      benefitTypes: [
        { benefitType: 'Health Benefits', amount: 15000, employeeCount: payrollRuns.length },
        { benefitType: 'Retirement Benefits', amount: 10000, employeeCount: Math.floor(payrollRuns.length * 0.8) }
      ]
    };
  }

  private async aggregatePayrollData(payrollRuns: any[]) {
    // Mock department breakdown
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const departmentBreakdown = departments.map(dept => ({
      departmentName: dept,
      employeeCount: Math.floor(payrollRuns.length * 0.3),
      totalGrossPay: Math.floor(Math.random() * 100000) + 50000,
      totalNetPay: Math.floor(Math.random() * 80000) + 40000,
      totalDeductions: Math.floor(Math.random() * 20000) + 10000
    }));

    return {
      totalGrossPay: payrollRuns.reduce((sum, run) => sum + (run.grossPay || 0), 0),
      totalNetPay: payrollRuns.reduce((sum, run) => sum + (run.netPay || 0), 0),
      totalDeductions: payrollRuns.reduce((sum, run) => sum + (run.deductions || 0), 0),
      totalTaxes: payrollRuns.reduce((sum, run) => sum + (run.taxes || 0), 0),
      departmentBreakdown
    };
  }
}
