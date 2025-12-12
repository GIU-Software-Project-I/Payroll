// =====================================================
// Recruitment Interfaces (matches backend schemas)
// =====================================================

import {
  CandidateStatus,
  ApplicationStatus,
  ApplicationStage,
  InterviewStatus,
  InterviewMethod,
  OfferResponseStatus,
  OfferFinalStatus,
  ApprovalStatus,
  DocumentType,
  Gender,
  MaritalStatus,
} from './enums';
import { Address } from './employee';

// =====================================================
// Job Template (matches backend job-template.schema.ts)
// =====================================================

export interface JobTemplate {
  id: string;
  title: string;
  description?: string;
  requirements?: string[];
  qualifications?: string[];
  responsibilities?: string[];
  departmentId?: string;
  positionId?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// Job Requisition (matches backend job-requisition.schema.ts)
// =====================================================

export interface JobRequisition {
  id: string;
  requisitionId: string;
  templateId?: string;
  openings: number;
  location?: string;
  hiringManagerId: string;
  publishStatus: 'draft' | 'published' | 'closed';
  postingDate?: string;
  expiryDate?: string;

  // Denormalized
  templateTitle?: string;
  hiringManagerName?: string;
  applicationCount?: number;

  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequisitionRequest {
  templateId?: string;
  openings: number;
  location?: string;
  hiringManagerId: string;
  expiryDate?: string;
}

// =====================================================
// Candidate (matches backend Candidate.Schema.ts)
// =====================================================

export interface Candidate {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName?: string;
  nationalId: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  dateOfBirth?: string;
  personalEmail: string;
  mobilePhone: string;
  homePhone?: string;
  address?: Address;
  profilePictureUrl?: string;
  status: CandidateStatus;
  password?: string;
  accessProfileId?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// Application (matches backend application.schema.ts)
// =====================================================

export interface Application {
  id: string;
  candidateId: string;
  requisitionId: string;
  assignedHr?: string;
  currentStage: ApplicationStage;
  status: ApplicationStatus;

  // Denormalized
  candidateName?: string;
  candidateEmail?: string;
  jobTitle?: string;
  departmentName?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationRequest {
  candidateId: string;
  requisitionId: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  currentStage?: ApplicationStage;
}

// =====================================================
// Interview (matches backend interview.schema.ts)
// =====================================================

export interface Interview {
  id: string;
  applicationId: string;
  stage: ApplicationStage;
  scheduledDate: string;
  method: InterviewMethod;
  panel: string[]; // employee IDs
  calendarEventId?: string;
  videoLink?: string;
  status: InterviewStatus;
  feedbackId?: string;
  candidateFeedback?: string;

  // Denormalized
  panelMembers?: InterviewPanelMember[];

  createdAt: string;
  updatedAt: string;
}

export interface InterviewPanelMember {
  employeeId: string;
  employeeName: string;
}

export interface CreateInterviewRequest {
  applicationId: string;
  stage: ApplicationStage;
  scheduledDate: string;
  method: InterviewMethod;
  panel: string[];
  videoLink?: string;
}

// =====================================================
// Assessment Result (matches backend assessment-result.schema.ts)
// =====================================================

export interface AssessmentResult {
  id: string;
  interviewId: string;
  evaluatorId: string;
  scores: AssessmentScore[];
  overallScore?: number;
  recommendation?: 'hire' | 'no_hire' | 'maybe';
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentScore {
  criterion: string;
  score: number;
  maxScore: number;
  comments?: string;
}

export interface SubmitAssessmentRequest {
  interviewId: string;
  scores: AssessmentScore[];
  overallScore?: number;
  recommendation?: 'hire' | 'no_hire' | 'maybe';
  comments?: string;
}

// =====================================================
// Job Offer (matches backend offer.schema.ts)
// =====================================================

export interface JobOffer {
  id: string;
  applicationId: string;
  candidateId: string;
  hrEmployeeId?: string;

  // Compensation
  grossSalary: number;
  signingBonus?: number;
  benefits?: string[];
  conditions?: string;
  insurances?: string;
  content?: string;
  role?: string;
  deadline?: string;

  // Status
  applicantResponse: OfferResponseStatus;
  finalStatus: OfferFinalStatus;

  // Approvers
  approvers: OfferApprover[];

  // Signatures
  candidateSignedAt?: string;
  hrSignedAt?: string;
  managerSignedAt?: string;

  // Denormalized
  candidateName?: string;
  positionTitle?: string;
  departmentName?: string;

  createdAt: string;
  updatedAt: string;
}

export interface OfferApprover {
  employeeId: string;
  role: string;
  status: ApprovalStatus;
  actionDate?: string;
  comment?: string;
}

export interface CreateJobOfferRequest {
  applicationId: string;
  grossSalary: number;
  signingBonus?: number;
  benefits?: string[];
  conditions?: string;
  insurances?: string;
  content?: string;
  role?: string;
  deadline?: string;
}

export interface RespondToOfferRequest {
  response: 'accepted' | 'rejected';
}

// =====================================================
// Contract (matches backend contract.schema.ts)
// =====================================================

export interface Contract {
  id: string;
  offerId: string;
  employeeId: string;
  startDate: string;
  endDate?: string;
  contractType: string;
  signedByEmployee: boolean;
  signedByHr: boolean;
  signedAt?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// Document (matches backend document.schema.ts)
// =====================================================

export interface RecruitmentDocument {
  id: string;
  ownerId: string;
  ownerType: 'candidate' | 'employee';
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadDocumentRequest {
  ownerId: string;
  ownerType: 'candidate' | 'employee';
  documentType: DocumentType;
  file: File;
}

// =====================================================
// Referral (matches backend referral.schema.ts)
// =====================================================

export interface Referral {
  id: string;
  referrerId: string;
  candidateId: string;
  requisitionId?: string;
  status: 'pending' | 'hired' | 'rejected';
  bonusPaid: boolean;
  bonusAmount?: number;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// Application History (matches backend application-history.schema.ts)
// =====================================================

export interface ApplicationHistory {
  id: string;
  applicationId: string;
  action: string;
  fromStage?: ApplicationStage;
  toStage?: ApplicationStage;
  fromStatus?: ApplicationStatus;
  toStatus?: ApplicationStatus;
  performedBy: string;
  notes?: string;
  createdAt: string;
}

// =====================================================
// Recruitment Statistics
// =====================================================

export interface RecruitmentStats {
  totalOpenPositions: number;
  totalApplications: number;
  applicationsByStatus: Record<ApplicationStatus, number>;
  applicationsByStage: Record<ApplicationStage, number>;
  interviewsScheduled: number;
  offersExtended: number;
  offersAccepted: number;
  averageTimeToHire: number;
  conversionRate: number;
}

export interface RecruitmentPipeline {
  stage: ApplicationStage | 'new' | 'hired';
  count: number;
  candidates: {
    id: string;
    name: string;
    appliedAt: string;
    jobTitle: string;
  }[];
}
