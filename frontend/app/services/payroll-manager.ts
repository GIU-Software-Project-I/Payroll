import { ApiResponse } from './api';

// Payroll Manager Service - handles dispute and claim confirmations

export interface DisputeConfirmation {
  id: string;
  employeeName: string;
  employeeNumber: string;
  description: string;
  amount?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending_confirmation' | 'confirmed' | 'rejected_by_manager';
  specialistName: string;
  specialistNotes?: string;
  submittedAt: string;
  reviewedAt: string;
}

export interface ClaimConfirmation {
  id: string;
  employeeName: string;
  employeeNumber: string;
  claimType: string;
  description: string;
  amount: number;
  approvedAmount?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending_confirmation' | 'confirmed' | 'rejected_by_manager';
  specialistName: string;
  specialistNotes?: string;
  submittedAt: string;
  reviewedAt: string;
}

export interface DisputeConfirmationAction {
  disputeId: string;
  confirmed: boolean;
  notes?: string;
}

export interface ClaimConfirmationAction {
  claimId: string;
  confirmed: boolean;
  notes?: string;
}

class PayrollManagerService {
  private baseUrl = '/api/payroll-manager';

  async getPendingDisputeConfirmations(): Promise<ApiResponse<DisputeConfirmation[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/disputes/pending-confirmation`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, error: undefined, status: 200 };
    } catch (error: any) {
      return { data: undefined, error: error.message || 'Failed to fetch dispute confirmations', status: 0 };
    }
  }

  async getPendingClaimConfirmations(): Promise<ApiResponse<ClaimConfirmation[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/claims/pending-confirmation`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, error: undefined, status: 200 };
    } catch (error: any) {
      return { data: undefined, error: error.message || 'Failed to fetch claim confirmations', status: 0 };
    }
  }

  async confirmDispute(action: DisputeConfirmationAction): Promise<ApiResponse<DisputeConfirmation>> {
    try {
      const response = await fetch(`${this.baseUrl}/disputes/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, error: undefined, status: 200 };
    } catch (error: any) {
      return { data: undefined, error: error.message || 'Failed to confirm dispute', status: 0 };
    }
  }

  async confirmClaim(action: ClaimConfirmationAction): Promise<ApiResponse<ClaimConfirmation>> {
    try {
      const response = await fetch(`${this.baseUrl}/claims/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, error: undefined, status: 200 };
    } catch (error: any) {
      return { data: undefined, error: error.message || 'Failed to confirm claim', status: 0 };
    }
  }

  async getConfirmedDisputes(): Promise<ApiResponse<DisputeConfirmation[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/disputes/confirmed`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, error: undefined, status: 200 };
    } catch (error: any) {
      return { data: undefined, error: error.message || 'Failed to fetch confirmed disputes', status: 0 };
    }
  }

  async getConfirmedClaims(): Promise<ApiResponse<ClaimConfirmation[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/claims/confirmed`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, error: undefined, status: 200 };
    } catch (error: any) {
      return { data: undefined, error: error.message || 'Failed to fetch confirmed claims', status: 0 };
    }
  }
}

export const payrollManagerService = new PayrollManagerService();
