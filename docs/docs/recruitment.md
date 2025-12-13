# Recruitment Module Integration Documentation

## Overview

This document describes the integration of the Recruitment module (Recruitment, Onboarding, Offboarding services) with Employee Profile, Auth, and Time Management (Notifications) modules.

## Integration Architecture

### SharedRecruitmentService

A centralized service located in `src/modules/shared/shared-recruitment.service.ts` that handles all cross-module integrations for recruitment-related functionality.

**Key Features:**
- Notification creation and distribution
- Employee profile creation from contracts (using EmployeeAuthService for password hashing)
- Employee deactivation for termination
- Candidate status management
- Validation utilities with comprehensive edge case handling

## Inputs from Other Sub-Systems - Complete Verification

### RECRUITMENT Module Inputs

| Requirement | Input Needed | Status | Implementation |
|-------------|--------------|--------|----------------|
| REC-003 | Organizational Structure (Jobs/Positions) | ✅ | `departmentId`, `positionId` in JobRequisition |
| REC-004 | None (System Configuration) | ✅ | Internal stages |
| REC-007 | Candidate CVs/Documents | ✅ | Document upload in Application |
| REC-008 | Hiring Process Template | ✅ | Internal stage tracking |
| REC-010 | Time Management (Availability) | ✅ | `scheduledDate`, notifications via SharedRecruitmentService |
| REC-011 | Interview panel feedback | ✅ | `submitFeedback()` method |
| REC-017 | Candidate Status Tracking | ✅ | `sendStatusUpdateNotification()` |
| REC-020 | Evaluation Criteria | ✅ | Score validation (1-10) |
| REC-021 | Calendar/Time Management | ✅ | Panel scheduling with notifications |
| REC-028 | Candidate consent | ✅ | `dataProcessingConsent` in Application |
| REC-029 | Offer Acceptance Status | ✅ | `recordCandidateResponse()` triggers contract |

### ONBOARDING Module Inputs

| Requirement | Input Needed | Status | Implementation |
|-------------|--------------|--------|----------------|
| ONB-002 | Recruitment (Signed Contract) | ✅ | `getContractDetails()`, `createEmployeeFromContract()` |
| ONB-005 | Notifications Module | ✅ | `getPendingTasks()` sends via SharedRecruitmentService |
| ONB-007 | New Hire Documents | ✅ | `uploadDocument()` method |
| ONB-009 | Employee Profile (New Hire) | ✅ | `validateEmployeeExists()` before provisioning |
| ONB-012 | None | ✅ | `reserveEquipment()` method |
| ONB-013 | System Admin Config | ✅ | `scheduleAccessRevocation()` method |
| ONB-018 | Contract Signing Date | ⏳ | TODO: Payroll integration (excluded per request) |
| ONB-019 | Contract Details | ⏳ | TODO: Payroll integration (excluded per request) |

### OFFBOARDING Module Inputs

| Requirement | Input Needed | Status | Implementation |
|-------------|--------------|--------|----------------|
| OFF-001 | Performance Management (Warnings) | ✅ | `validateTerminationJustification()` checks appraisal history, returns warnings |
| OFF-006 | None (Configuration) | ✅ | Default departments in `createClearanceChecklist()` |
| OFF-007 | Employee Profile (Inactive Status) | ✅ | `deactivateEmployee()` via SharedRecruitmentService |
| OFF-010 | Clearance Status Updates | ✅ | `updateClearanceItem()` method |
| OFF-013 | Leaves Module (Balance) | ⏳ | TODO: Leaves/Payroll integration (excluded per request) |
| OFF-018/019 | Employee Profile | ✅ | `validateEmployeeExists()` before resignation |

## Requirements Verification

### Recruitment Requirements (REC)

| Req ID | Requirement | Status | Implementation |
|--------|-------------|--------|----------------|
| REC-003 | HR Manager defines standardized job description templates | ✅ | `createJobTemplate()`, `getAllJobTemplates()`, `updateJobTemplate()` |
| REC-004 | Establish hiring process templates with stages | ✅ | Application tracked through stages: SCREENING, DEPARTMENT_INTERVIEW, HR_INTERVIEW, OFFER |
| REC-007 | Candidate uploads CV and applies for positions | ✅ | `createApplication()` with dataProcessingConsent validation |
| REC-008 | Track candidates through each stage of hiring | ✅ | `updateApplicationStage()`, `updateApplicationStatus()`, `getApplicationHistory()` |
| REC-009 | Monitor recruitment progress across positions | ✅ | `getRecruitmentDashboard()`, `getRequisitionProgress()` |
| REC-010 | Schedule and manage interview invitations | ✅ | `scheduleInterview()` with panel members, notifications sent |
| REC-011 | Provide feedback/interview score for filtration | ✅ | `submitFeedback()`, `getFeedbackByInterview()`, `getAverageScore()` |
| REC-014 | Manage job offers and approvals | ✅ | `createOffer()`, `approveOffer()` with multi-approver workflow |
| REC-017 | Candidate receives updates about application status | ✅ | `sendStatusUpdateNotification()` via SharedRecruitmentService |
| REC-018 | Generate, send and collect electronically signed offer letters | ✅ | `sendOfferLetter()`, `recordCandidateResponse()`, Contract creation |
| REC-020 | Structured assessment and scoring forms per role | ✅ | `submitFeedback()` with score validation (1-10) |
| REC-021 | Coordinate interview panels | ✅ | `scheduleInterview()` with panel array, notifications to all |
| REC-022 | Automated rejection notifications and templates | ✅ | `sendRejectionNotification()` via SharedRecruitmentService |
| REC-023 | Preview and publish jobs on careers page | ✅ | `publishJobRequisition()`, `getPublishedJobs()` |
| REC-028 | Candidate consent for data processing | ✅ | `dataProcessingConsent` required in `createApplication()` |
| REC-029 | Trigger pre-boarding tasks after offer acceptance | ✅ | `triggerPreboarding()`, `createContractFromOffer()` |
| REC-030 | Tag candidates as referrals | ✅ | `createReferral()`, `isReferral()`, `getReferralByCandidate()` |

### Onboarding Requirements (ONB)

| Req ID | Requirement | Status | Implementation |
|--------|-------------|--------|----------------|
| ONB-001 | Create onboarding task checklists | ✅ | `createOnboarding()` with tasks array |
| ONB-002 | Access signed contract detail to create employee profile | ✅ | `createEmployeeFromContract()` using EmployeeAuthService |
| ONB-004 | View onboarding steps in tracker | ✅ | `getOnboardingByEmployeeId()`, `getOnboardingProgress()` |
| ONB-005 | Receive reminders and notifications for tasks | ✅ | `getPendingTasks()` sends notifications via SharedRecruitmentService |
| ONB-007 | Upload documents (ID, contracts, certifications) | ✅ | `uploadDocument()` with HR notification |
| ONB-009 | Provision system access (payroll, email, internal) | ✅ | `provisionSystemAccess()` with IT/HR notifications |
| ONB-012 | Reserve and track equipment, desk, access cards | ✅ | `reserveEquipment()` with Admin/HR notifications |
| ONB-013 | Automated account provisioning and scheduled revocation | ✅ | `scheduleAccessRevocation()` links to Offboarding |
| ONB-018 | Payroll initiation based on contract signing | ⏳ | TODO: Payroll integration excluded |
| ONB-019 | Process signing bonuses from contract | ⏳ | TODO: Payroll integration excluded |

### Offboarding Requirements (OFF)

| Req ID | Requirement | Status | Implementation |
|--------|-------------|--------|----------------|
| OFF-001 | Initiate termination reviews based on warnings/performance | ✅ | `createTerminationRequest()` with reason validation |
| OFF-006 | Offboarding checklist (IT assets, ID cards, equipment) | ✅ | `createClearanceChecklist()` with default departments |
| OFF-007 | Revoke system and account access upon termination | ✅ | `revokeSystemAccess()` deactivates employee profile |
| OFF-010 | Multi-department exit clearance sign-offs | ✅ | `updateClearanceItem()` with status tracking, completion notifications |
| OFF-013 | Trigger benefits termination and final pay calculation | ✅ | `triggerFinalSettlement()` with notifications (Payroll TODO) |
| OFF-018 | Employee request resignation with reasoning | ✅ | `createResignationRequest()` with employee validation |
| OFF-019 | Employee track resignation request status | ✅ | `getResignationRequestByEmployeeId()`, `getTerminationRequestById()` |

## Edge Cases Covered

### Recruitment Service
- ✅ Cannot apply to unpublished job requisition
- ✅ Cannot apply to expired job requisition
- ✅ Candidate cannot apply twice to same position
- ✅ Data processing consent required for application
- ✅ Cannot schedule interview for rejected/hired application
- ✅ Interview date must be in the future
- ✅ Cannot schedule duplicate interview for same stage
- ✅ Only panel members can submit feedback
- ✅ Score validation (1-10 range)
- ✅ Cannot submit duplicate feedback
- ✅ Offer deadline must be in future
- ✅ Cannot create duplicate active offer
- ✅ Cannot approve rejected offer
- ✅ Cannot respond to offer after deadline
- ✅ Cannot change status of hired application

### Onboarding Service
- ✅ Contract must be fully signed (employee + employer) before onboarding
- ✅ Cannot create duplicate onboarding for same employee
- ✅ Cannot create duplicate onboarding for same contract
- ✅ Cannot modify tasks on completed onboarding
- ✅ Cannot add duplicate task names
- ✅ Cannot cancel completed onboarding
- ✅ Employee/candidate validation before document upload

### Offboarding Service
- ✅ Employee validation before creating termination/resignation request
- ✅ Cannot create termination for already terminated employee
- ✅ Cannot create duplicate active termination request
- ✅ Cannot create request if approved termination exists
- ✅ Termination date cannot be in the past
- ✅ Valid status transitions enforced (PENDING→UNDER_REVIEW→APPROVED/REJECTED)
- ✅ Clearance checklist only for approved termination
- ✅ Cannot create duplicate clearance checklist
- ✅ Final settlement requires approved termination
- ✅ Final settlement requires fully cleared checklist
- ✅ Cannot delete approved termination request
- ✅ Access revocation requires approved termination

### Employee Creation (SharedRecruitmentService)
- ✅ Cannot create employee from already hired candidate
- ✅ Cannot create employee from rejected/withdrawn candidate
- ✅ Cannot create duplicate employee by national ID
- ✅ Cannot create duplicate employee by email
- ✅ Unique work email generation with collision handling
- ✅ Password hashing via EmployeeAuthService

## Notification Types

| Type | Description | Recipients |
|------|-------------|------------|
| `INTERVIEW_SCHEDULED` | Interview scheduled for candidate | Candidate |
| `INTERVIEW_PANEL_ASSIGNMENT` | Panel member assigned to interview | Panel Members |
| `APPLICATION_STATUS_UPDATE` | Application status changed | Candidate |
| `APPLICATION_REJECTED` | Application rejected | Candidate |
| `OFFER_SENT` | Job offer sent | Candidate |
| `EMPLOYEE_PROFILE_CREATED` | New employee profile created | New Employee |
| `NEW_EMPLOYEE_CREATED` | New employee added to system | HR Users |
| `ONBOARDING_TASK_REMINDER` | Pending task reminder | Employee |
| `ONBOARDING_TASK_OVERDUE` | Overdue task alert | Employee |
| `DOCUMENT_UPLOADED` | Document uploaded for verification | HR Users |
| `SYSTEM_ACCESS_PROVISIONED` | System access granted | Employee, IT, HR |
| `EQUIPMENT_RESERVED` | Equipment and workspace reserved | Employee, HR |
| `ACCESS_REVOCATION_SCHEDULED` | Access revocation scheduled | IT, HR |
| `ONBOARDING_CANCELLED` | Onboarding cancelled | IT, HR |
| `EMPLOYEE_DEACTIVATED` | Employee terminated | HR |
| `ACCESS_REVOCATION_REQUIRED` | Access revocation needed | IT Admins |
| `TERMINATION_APPROVED` | Termination/resignation approved | Employee, HR, IT |
| `CLEARANCE_COMPLETE` | All departments cleared | HR |
| `FINAL_SETTLEMENT_TRIGGERED` | Final settlement initiated | Employee, HR |

## Module Dependencies

```
RecruitmentModule
    └── imports: SharedModule
        └── imports: AuthModule (forwardRef)
        └── exports: SharedRecruitmentService
            └── uses: EmployeeAuthService (password hashing)
            └── uses: NotificationLog (TimeManagement)
            └── uses: EmployeeProfile (Employee)
            └── uses: EmployeeSystemRole (Employee)
            └── uses: Candidate (Employee)
```

## API Endpoints

### Onboarding Controller

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/onboarding/contracts/:contractId/create-employee` | Creates employee profile from signed contract |

## Remaining TODOs (Out of Scope per User Request)

1. **Payroll Integration** (ONB-018, ONB-019):
   - Payroll initiation from contract signing
   - Signing bonus processing
   - Final pay calculation

2. **Leaves Integration** (OFF-013):
   - Leave balance fetch for encashment
   - Annual leave calculation

## File Changes Summary

### New Files Created
1. `src/modules/shared/shared-recruitment.service.ts` - Centralized integration service

### Modified Files
1. `src/modules/shared/shared.module.ts` - Added SharedRecruitmentService, AuthModule import
2. `src/modules/recruitment/recruitment.module.ts` - Added SharedModule import
3. `src/modules/recruitment/services/recruitment.service.ts` - Integrated notification calls
4. `src/modules/recruitment/services/onboarding.service.ts` - Integrated employee creation and notifications
5. `src/modules/recruitment/services/offboarding.service.ts` - Integrated employee deactivation, validation, notifications
6. `src/modules/recruitment/controllers/onboarding.controller.ts` - Added createEmployeeFromContract endpoint

