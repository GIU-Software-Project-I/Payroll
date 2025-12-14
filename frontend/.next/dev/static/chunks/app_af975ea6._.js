(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/types/enums.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// ENUMS - System Roles & Authentication
// =====================================================
__turbopack_context__.s([
    "AccrualMethod",
    ()=>AccrualMethod,
    "AdjustmentType",
    ()=>AdjustmentType,
    "Applicability",
    ()=>Applicability,
    "ApplicationStage",
    ()=>ApplicationStage,
    "ApplicationStatus",
    ()=>ApplicationStatus,
    "AppraisalCycleStatus",
    ()=>AppraisalCycleStatus,
    "AppraisalRatingScaleType",
    ()=>AppraisalRatingScaleType,
    "AppraisalRecordStatus",
    ()=>AppraisalRecordStatus,
    "AppraisalType",
    ()=>AppraisalType,
    "ApprovalStatus",
    ()=>ApprovalStatus,
    "AttachmentType",
    ()=>AttachmentType,
    "BankStatus",
    ()=>BankStatus,
    "BenefitStatus",
    ()=>BenefitStatus,
    "BonusStatus",
    ()=>BonusStatus,
    "CandidateStatus",
    ()=>CandidateStatus,
    "ClaimStatus",
    ()=>ClaimStatus,
    "ConfigStatus",
    ()=>ConfigStatus,
    "ContractType",
    ()=>ContractType,
    "CorrectionRequestStatus",
    ()=>CorrectionRequestStatus,
    "DisputeStatus",
    ()=>DisputeStatus,
    "DocumentType",
    ()=>DocumentType,
    "EmployeeStatus",
    ()=>EmployeeStatus,
    "Gender",
    ()=>Gender,
    "GraduationType",
    ()=>GraduationType,
    "HolidayType",
    ()=>HolidayType,
    "InterviewMethod",
    ()=>InterviewMethod,
    "InterviewStatus",
    ()=>InterviewStatus,
    "LeaveStatus",
    ()=>LeaveStatus,
    "MaritalStatus",
    ()=>MaritalStatus,
    "OfferFinalStatus",
    ()=>OfferFinalStatus,
    "OfferResponseStatus",
    ()=>OfferResponseStatus,
    "OnboardingTaskStatus",
    ()=>OnboardingTaskStatus,
    "PayrollPaymentStatus",
    ()=>PayrollPaymentStatus,
    "PayrollStatus",
    ()=>PayrollStatus,
    "PayslipPaymentStatus",
    ()=>PayslipPaymentStatus,
    "PolicyType",
    ()=>PolicyType,
    "ProfileChangeStatus",
    ()=>ProfileChangeStatus,
    "PunchPolicy",
    ()=>PunchPolicy,
    "PunchType",
    ()=>PunchType,
    "RefundStatus",
    ()=>RefundStatus,
    "RoundingRule",
    ()=>RoundingRule,
    "ShiftAssignmentStatus",
    ()=>ShiftAssignmentStatus,
    "SystemRole",
    ()=>SystemRole,
    "TerminationInitiation",
    ()=>TerminationInitiation,
    "TerminationStatus",
    ()=>TerminationStatus,
    "TimeExceptionStatus",
    ()=>TimeExceptionStatus,
    "TimeExceptionType",
    ()=>TimeExceptionType,
    "WorkType",
    ()=>WorkType
]);
var SystemRole = /*#__PURE__*/ function(SystemRole) {
    SystemRole["DEPARTMENT_EMPLOYEE"] = "department employee";
    SystemRole["DEPARTMENT_HEAD"] = "department head";
    SystemRole["HR_MANAGER"] = "HR Manager";
    SystemRole["HR_EMPLOYEE"] = "HR Employee";
    SystemRole["PAYROLL_SPECIALIST"] = "Payroll Specialist";
    SystemRole["PAYROLL_MANAGER"] = "Payroll Manager";
    SystemRole["SYSTEM_ADMIN"] = "System Admin";
    SystemRole["LEGAL_POLICY_ADMIN"] = "Legal & Policy Admin";
    SystemRole["RECRUITER"] = "Recruiter";
    SystemRole["FINANCE_STAFF"] = "Finance Staff";
    SystemRole["JOB_CANDIDATE"] = "Job Candidate";
    SystemRole["HR_ADMIN"] = "HR Admin";
    return SystemRole;
}({});
var Gender = /*#__PURE__*/ function(Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    return Gender;
}({});
var MaritalStatus = /*#__PURE__*/ function(MaritalStatus) {
    MaritalStatus["SINGLE"] = "SINGLE";
    MaritalStatus["MARRIED"] = "MARRIED";
    MaritalStatus["DIVORCED"] = "DIVORCED";
    MaritalStatus["WIDOWED"] = "WIDOWED";
    return MaritalStatus;
}({});
var EmployeeStatus = /*#__PURE__*/ function(EmployeeStatus) {
    EmployeeStatus["ACTIVE"] = "ACTIVE";
    EmployeeStatus["INACTIVE"] = "INACTIVE";
    EmployeeStatus["ON_LEAVE"] = "ON_LEAVE";
    EmployeeStatus["SUSPENDED"] = "SUSPENDED";
    EmployeeStatus["RETIRED"] = "RETIRED";
    EmployeeStatus["PROBATION"] = "PROBATION";
    EmployeeStatus["TERMINATED"] = "TERMINATED";
    return EmployeeStatus;
}({});
var ContractType = /*#__PURE__*/ function(ContractType) {
    ContractType["FULL_TIME_CONTRACT"] = "FULL_TIME_CONTRACT";
    ContractType["PART_TIME_CONTRACT"] = "PART_TIME_CONTRACT";
    return ContractType;
}({});
var WorkType = /*#__PURE__*/ function(WorkType) {
    WorkType["FULL_TIME"] = "FULL_TIME";
    WorkType["PART_TIME"] = "PART_TIME";
    return WorkType;
}({});
var GraduationType = /*#__PURE__*/ function(GraduationType) {
    GraduationType["UNDERGRADE"] = "UNDERGRADE";
    GraduationType["BACHELOR"] = "BACHELOR";
    GraduationType["MASTER"] = "MASTER";
    GraduationType["PHD"] = "PHD";
    GraduationType["OTHER"] = "OTHER";
    return GraduationType;
}({});
var ProfileChangeStatus = /*#__PURE__*/ function(ProfileChangeStatus) {
    ProfileChangeStatus["PENDING"] = "PENDING";
    ProfileChangeStatus["APPROVED"] = "APPROVED";
    ProfileChangeStatus["REJECTED"] = "REJECTED";
    ProfileChangeStatus["CANCELED"] = "CANCELED";
    return ProfileChangeStatus;
}({});
var CandidateStatus = /*#__PURE__*/ function(CandidateStatus) {
    CandidateStatus["APPLIED"] = "APPLIED";
    CandidateStatus["SCREENING"] = "SCREENING";
    CandidateStatus["INTERVIEW"] = "INTERVIEW";
    CandidateStatus["OFFER_SENT"] = "OFFER_SENT";
    CandidateStatus["OFFER_ACCEPTED"] = "OFFER_ACCEPTED";
    CandidateStatus["HIRED"] = "HIRED";
    CandidateStatus["REJECTED"] = "REJECTED";
    CandidateStatus["WITHDRAWN"] = "WITHDRAWN";
    return CandidateStatus;
}({});
var ApplicationStatus = /*#__PURE__*/ function(ApplicationStatus) {
    ApplicationStatus["SUBMITTED"] = "submitted";
    ApplicationStatus["IN_PROCESS"] = "in_process";
    ApplicationStatus["OFFER"] = "offer";
    ApplicationStatus["HIRED"] = "hired";
    ApplicationStatus["REJECTED"] = "rejected";
    return ApplicationStatus;
}({});
var ApplicationStage = /*#__PURE__*/ function(ApplicationStage) {
    ApplicationStage["SCREENING"] = "screening";
    ApplicationStage["DEPARTMENT_INTERVIEW"] = "department_interview";
    ApplicationStage["HR_INTERVIEW"] = "hr_interview";
    ApplicationStage["OFFER"] = "offer";
    return ApplicationStage;
}({});
var InterviewStatus = /*#__PURE__*/ function(InterviewStatus) {
    InterviewStatus["SCHEDULED"] = "scheduled";
    InterviewStatus["COMPLETED"] = "completed";
    InterviewStatus["CANCELLED"] = "cancelled";
    return InterviewStatus;
}({});
var InterviewMethod = /*#__PURE__*/ function(InterviewMethod) {
    InterviewMethod["ONSITE"] = "onsite";
    InterviewMethod["VIDEO"] = "video";
    InterviewMethod["PHONE"] = "phone";
    return InterviewMethod;
}({});
var OfferResponseStatus = /*#__PURE__*/ function(OfferResponseStatus) {
    OfferResponseStatus["PENDING"] = "pending";
    OfferResponseStatus["ACCEPTED"] = "accepted";
    OfferResponseStatus["REJECTED"] = "rejected";
    return OfferResponseStatus;
}({});
var OfferFinalStatus = /*#__PURE__*/ function(OfferFinalStatus) {
    OfferFinalStatus["PENDING"] = "pending";
    OfferFinalStatus["APPROVED"] = "approved";
    OfferFinalStatus["REJECTED"] = "rejected";
    return OfferFinalStatus;
}({});
var ApprovalStatus = /*#__PURE__*/ function(ApprovalStatus) {
    ApprovalStatus["PENDING"] = "pending";
    ApprovalStatus["APPROVED"] = "approved";
    ApprovalStatus["REJECTED"] = "rejected";
    return ApprovalStatus;
}({});
var OnboardingTaskStatus = /*#__PURE__*/ function(OnboardingTaskStatus) {
    OnboardingTaskStatus["PENDING"] = "pending";
    OnboardingTaskStatus["IN_PROGRESS"] = "in_progress";
    OnboardingTaskStatus["COMPLETED"] = "completed";
    return OnboardingTaskStatus;
}({});
var TerminationStatus = /*#__PURE__*/ function(TerminationStatus) {
    TerminationStatus["PENDING"] = "pending";
    TerminationStatus["UNDER_REVIEW"] = "under_review";
    TerminationStatus["APPROVED"] = "approved";
    TerminationStatus["REJECTED"] = "rejected";
    return TerminationStatus;
}({});
var TerminationInitiation = /*#__PURE__*/ function(TerminationInitiation) {
    TerminationInitiation["EMPLOYEE"] = "employee";
    TerminationInitiation["HR"] = "hr";
    TerminationInitiation["MANAGER"] = "manager";
    return TerminationInitiation;
}({});
var DocumentType = /*#__PURE__*/ function(DocumentType) {
    DocumentType["RESUME"] = "resume";
    DocumentType["COVER_LETTER"] = "cover_letter";
    DocumentType["ID_DOCUMENT"] = "id_document";
    DocumentType["DEGREE"] = "degree";
    DocumentType["CERTIFICATE"] = "certificate";
    DocumentType["REFERENCE"] = "reference";
    DocumentType["CONTRACT"] = "contract";
    DocumentType["OTHER"] = "other";
    return DocumentType;
}({});
var LeaveStatus = /*#__PURE__*/ function(LeaveStatus) {
    LeaveStatus["PENDING"] = "pending";
    LeaveStatus["APPROVED"] = "approved";
    LeaveStatus["REJECTED"] = "rejected";
    LeaveStatus["CANCELLED"] = "cancelled";
    return LeaveStatus;
}({});
var AccrualMethod = /*#__PURE__*/ function(AccrualMethod) {
    AccrualMethod["MONTHLY"] = "monthly";
    AccrualMethod["QUARTERLY"] = "quarterly";
    AccrualMethod["ANNUALLY"] = "annually";
    AccrualMethod["NONE"] = "none";
    return AccrualMethod;
}({});
var AdjustmentType = /*#__PURE__*/ function(AdjustmentType) {
    AdjustmentType["CREDIT"] = "credit";
    AdjustmentType["DEBIT"] = "debit";
    return AdjustmentType;
}({});
var AttachmentType = /*#__PURE__*/ function(AttachmentType) {
    AttachmentType["MEDICAL_CERTIFICATE"] = "medical_certificate";
    AttachmentType["OTHER"] = "other";
    return AttachmentType;
}({});
var RoundingRule = /*#__PURE__*/ function(RoundingRule) {
    RoundingRule["NONE"] = "none";
    RoundingRule["ROUND_UP"] = "round_up";
    RoundingRule["ROUND_DOWN"] = "round_down";
    RoundingRule["ROUND_NEAREST"] = "round_nearest";
    return RoundingRule;
}({});
var ConfigStatus = /*#__PURE__*/ function(ConfigStatus) {
    ConfigStatus["DRAFT"] = "draft";
    ConfigStatus["APPROVED"] = "approved";
    ConfigStatus["REJECTED"] = "rejected";
    return ConfigStatus;
}({});
var PolicyType = /*#__PURE__*/ function(PolicyType) {
    PolicyType["DEDUCTION"] = "Deduction";
    PolicyType["ALLOWANCE"] = "Allowance";
    PolicyType["BENEFIT"] = "Benefit";
    PolicyType["MISCONDUCT"] = "Misconduct";
    PolicyType["LEAVE"] = "Leave";
    return PolicyType;
}({});
var Applicability = /*#__PURE__*/ function(Applicability) {
    Applicability["ALL_EMPLOYEES"] = "All Employees";
    Applicability["FULL_TIME"] = "Full Time Employees";
    Applicability["PART_TIME"] = "Part Time Employees";
    Applicability["CONTRACTORS"] = "Contractors";
    return Applicability;
}({});
var PayrollStatus = /*#__PURE__*/ function(PayrollStatus) {
    PayrollStatus["DRAFT"] = "draft";
    PayrollStatus["UNDER_REVIEW"] = "under review";
    PayrollStatus["PENDING_FINANCE_APPROVAL"] = "pending finance approval";
    PayrollStatus["REJECTED"] = "rejected";
    PayrollStatus["APPROVED"] = "approved";
    PayrollStatus["LOCKED"] = "locked";
    PayrollStatus["UNLOCKED"] = "unlocked";
    return PayrollStatus;
}({});
var PayrollPaymentStatus = /*#__PURE__*/ function(PayrollPaymentStatus) {
    PayrollPaymentStatus["PAID"] = "paid";
    PayrollPaymentStatus["PENDING"] = "pending";
    return PayrollPaymentStatus;
}({});
var PayslipPaymentStatus = /*#__PURE__*/ function(PayslipPaymentStatus) {
    PayslipPaymentStatus["PENDING"] = "pending";
    PayslipPaymentStatus["PAID"] = "paid";
    return PayslipPaymentStatus;
}({});
var BankStatus = /*#__PURE__*/ function(BankStatus) {
    BankStatus["VALID"] = "valid";
    BankStatus["MISSING"] = "missing";
    return BankStatus;
}({});
var BonusStatus = /*#__PURE__*/ function(BonusStatus) {
    BonusStatus["PENDING"] = "pending";
    BonusStatus["PAID"] = "paid";
    BonusStatus["APPROVED"] = "approved";
    BonusStatus["REJECTED"] = "rejected";
    return BonusStatus;
}({});
var BenefitStatus = /*#__PURE__*/ function(BenefitStatus) {
    BenefitStatus["PENDING"] = "pending";
    BenefitStatus["PAID"] = "paid";
    BenefitStatus["APPROVED"] = "approved";
    BenefitStatus["REJECTED"] = "rejected";
    return BenefitStatus;
}({});
var ClaimStatus = /*#__PURE__*/ function(ClaimStatus) {
    ClaimStatus["UNDER_REVIEW"] = "under review";
    ClaimStatus["APPROVED"] = "approved";
    ClaimStatus["REJECTED"] = "rejected";
    return ClaimStatus;
}({});
var DisputeStatus = /*#__PURE__*/ function(DisputeStatus) {
    DisputeStatus["UNDER_REVIEW"] = "under review";
    DisputeStatus["APPROVED"] = "approved";
    DisputeStatus["REJECTED"] = "rejected";
    return DisputeStatus;
}({});
var RefundStatus = /*#__PURE__*/ function(RefundStatus) {
    RefundStatus["PENDING"] = "pending";
    RefundStatus["PAID"] = "paid";
    return RefundStatus;
}({});
var CorrectionRequestStatus = /*#__PURE__*/ function(CorrectionRequestStatus) {
    CorrectionRequestStatus["SUBMITTED"] = "SUBMITTED";
    CorrectionRequestStatus["IN_REVIEW"] = "IN_REVIEW";
    CorrectionRequestStatus["APPROVED"] = "APPROVED";
    CorrectionRequestStatus["REJECTED"] = "REJECTED";
    CorrectionRequestStatus["ESCALATED"] = "ESCALATED";
    return CorrectionRequestStatus;
}({});
var PunchType = /*#__PURE__*/ function(PunchType) {
    PunchType["IN"] = "IN";
    PunchType["OUT"] = "OUT";
    return PunchType;
}({});
var HolidayType = /*#__PURE__*/ function(HolidayType) {
    HolidayType["NATIONAL"] = "NATIONAL";
    HolidayType["ORGANIZATIONAL"] = "ORGANIZATIONAL";
    HolidayType["WEEKLY_REST"] = "WEEKLY_REST";
    return HolidayType;
}({});
var ShiftAssignmentStatus = /*#__PURE__*/ function(ShiftAssignmentStatus) {
    ShiftAssignmentStatus["PENDING"] = "PENDING";
    ShiftAssignmentStatus["APPROVED"] = "APPROVED";
    ShiftAssignmentStatus["CANCELLED"] = "CANCELLED";
    ShiftAssignmentStatus["EXPIRED"] = "EXPIRED";
    return ShiftAssignmentStatus;
}({});
var PunchPolicy = /*#__PURE__*/ function(PunchPolicy) {
    PunchPolicy["MULTIPLE"] = "MULTIPLE";
    PunchPolicy["FIRST_LAST"] = "FIRST_LAST";
    PunchPolicy["ONLY_FIRST"] = "ONLY_FIRST";
    return PunchPolicy;
}({});
var TimeExceptionType = /*#__PURE__*/ function(TimeExceptionType) {
    TimeExceptionType["MISSED_PUNCH"] = "MISSED_PUNCH";
    TimeExceptionType["LATE"] = "LATE";
    TimeExceptionType["EARLY_LEAVE"] = "EARLY_LEAVE";
    TimeExceptionType["SHORT_TIME"] = "SHORT_TIME";
    TimeExceptionType["OVERTIME_REQUEST"] = "OVERTIME_REQUEST";
    TimeExceptionType["MANUAL_ADJUSTMENT"] = "MANUAL_ADJUSTMENT";
    return TimeExceptionType;
}({});
var TimeExceptionStatus = /*#__PURE__*/ function(TimeExceptionStatus) {
    TimeExceptionStatus["OPEN"] = "OPEN";
    TimeExceptionStatus["PENDING"] = "PENDING";
    TimeExceptionStatus["APPROVED"] = "APPROVED";
    TimeExceptionStatus["REJECTED"] = "REJECTED";
    TimeExceptionStatus["ESCALATED"] = "ESCALATED";
    TimeExceptionStatus["RESOLVED"] = "RESOLVED";
    return TimeExceptionStatus;
}({});
var AppraisalCycleStatus = /*#__PURE__*/ function(AppraisalCycleStatus) {
    AppraisalCycleStatus["DRAFT"] = "draft";
    AppraisalCycleStatus["ACTIVE"] = "active";
    AppraisalCycleStatus["COMPLETED"] = "completed";
    AppraisalCycleStatus["ARCHIVED"] = "archived";
    return AppraisalCycleStatus;
}({});
var AppraisalRecordStatus = /*#__PURE__*/ function(AppraisalRecordStatus) {
    AppraisalRecordStatus["PENDING"] = "pending";
    AppraisalRecordStatus["IN_PROGRESS"] = "in_progress";
    AppraisalRecordStatus["SUBMITTED"] = "submitted";
    AppraisalRecordStatus["HR_PUBLISHED"] = "hr_published";
    AppraisalRecordStatus["DISPUTED"] = "disputed";
    AppraisalRecordStatus["ARCHIVED"] = "archived";
    return AppraisalRecordStatus;
}({});
var AppraisalRatingScaleType = /*#__PURE__*/ function(AppraisalRatingScaleType) {
    AppraisalRatingScaleType["NUMERIC"] = "numeric";
    AppraisalRatingScaleType["LETTER"] = "letter";
    AppraisalRatingScaleType["DESCRIPTIVE"] = "descriptive";
    return AppraisalRatingScaleType;
}({});
var AppraisalType = /*#__PURE__*/ function(AppraisalType) {
    AppraisalType["ANNUAL"] = "annual";
    AppraisalType["PROBATION"] = "probation";
    AppraisalType["MID_YEAR"] = "mid_year";
    AppraisalType["PROJECT"] = "project";
    return AppraisalType;
}({});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Authentication Interfaces
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/employee.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Employee Profile Interfaces
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/organization.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Organization Structure Interfaces
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/recruitment.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Recruitment Interfaces (matches backend schemas)
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/onboarding.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Onboarding & Offboarding Interfaces (matches backend schemas)
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/leaves.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Leaves Management Interfaces (matches backend schemas)
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/payroll.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Payroll Interfaces
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/time-management.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Time Management Interfaces
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/performance.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Performance Management Interfaces
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/common.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =====================================================
// Common/Shared Interfaces
// =====================================================
// =====================================================
// API Response Types
// =====================================================
__turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/types/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// =====================================================
// HR System Types - Main Export File
// =====================================================
// Re-export all enums
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/enums.ts [app-client] (ecmascript)");
// Re-export all interfaces
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$employee$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/employee.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$organization$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/organization.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$recruitment$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/recruitment.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$onboarding$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/onboarding.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$leaves$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/leaves.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$payroll$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/payroll.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$time$2d$management$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/time-management.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$performance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/performance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/common.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/constants/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Constants for the HR System
__turbopack_context__.s([
    "APP_DESCRIPTION",
    ()=>APP_DESCRIPTION,
    "APP_NAME",
    ()=>APP_NAME,
    "DASHBOARD_NAV_ITEMS",
    ()=>DASHBOARD_NAV_ITEMS,
    "DESIGN_SYSTEM",
    ()=>DESIGN_SYSTEM,
    "MOCK_DASHBOARD_STATS",
    ()=>MOCK_DASHBOARD_STATS,
    "MOCK_NOTIFICATIONS",
    ()=>MOCK_NOTIFICATIONS,
    "MOCK_USER",
    ()=>MOCK_USER,
    "NAV_LINKS",
    ()=>NAV_LINKS,
    "ROLE_NAVIGATION",
    ()=>ROLE_NAVIGATION,
    "STATUS_COLORS",
    ()=>STATUS_COLORS
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/types/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/enums.ts [app-client] (ecmascript)");
;
const APP_NAME = 'HR System';
const APP_DESCRIPTION = 'German International University HR Management System';
const DESIGN_SYSTEM = {
    colors: {
        primary: '#4F46E5',
        primaryLight: '#E0E7FF',
        primaryDark: '#4338CA',
        success: '#059669',
        successLight: '#D1FAE5',
        warning: '#D97706',
        warningLight: '#FEF3C7',
        danger: '#DC2626',
        dangerLight: '#FEE2E2',
        info: '#2563EB',
        infoLight: '#DBEAFE',
        neutral: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            600: '#475569',
            700: '#334155',
            900: '#0F172A'
        }
    }
};
const NAV_LINKS = {
    public: [
        {
            label: 'Home',
            href: '/'
        },
        {
            label: 'About',
            href: '/about'
        },
        {
            label: 'Careers',
            href: '/careers'
        },
        {
            label: 'Contact',
            href: '/contact'
        }
    ],
    auth: [
        {
            label: 'Login',
            href: '/login'
        },
        {
            label: 'Register',
            href: '/register'
        }
    ]
};
const DASHBOARD_NAV_ITEMS = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home'
    },
    {
        label: 'Employee Profile',
        href: '/dashboard/employee',
        icon: 'user'
    },
    {
        label: 'Organization',
        href: '/dashboard/organization',
        icon: 'building'
    },
    {
        label: 'Recruitment',
        href: '/dashboard/recruitment',
        icon: 'users'
    },
    {
        label: 'Onboarding',
        href: '/dashboard/onboarding',
        icon: 'clipboard-check'
    },
    {
        label: 'Time Management',
        href: '/dashboard/time-management',
        icon: 'clock'
    },
    {
        label: 'Leaves',
        href: '/dashboard/leaves',
        icon: 'calendar'
    },
    {
        label: 'Payroll',
        href: '/dashboard/payroll',
        icon: 'dollar-sign'
    },
    {
        label: 'Performance',
        href: '/dashboard/performance',
        icon: 'trending-up'
    },
    {
        label: 'Offboarding',
        href: '/dashboard/offboarding',
        icon: 'log-out'
    }
];
const MOCK_USER = {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.hassan@giu.edu.eg',
    role: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
    department: 'Human Resources',
    avatar: undefined
};
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        type: 'success',
        title: 'Leave Request Approved',
        message: 'Your annual leave request for Dec 20-25 has been approved.',
        read: false,
        createdAt: '2025-12-11T09:00:00Z'
    },
    {
        id: '2',
        type: 'info',
        title: 'Payroll Processing',
        message: 'December payroll is now under review.',
        read: false,
        createdAt: '2025-12-10T14:30:00Z'
    },
    {
        id: '3',
        type: 'warning',
        title: 'Performance Review Due',
        message: 'You have 3 pending performance reviews to complete.',
        read: true,
        createdAt: '2025-12-09T11:00:00Z'
    },
    {
        id: '4',
        type: 'success',
        title: 'New Employee Onboarded',
        message: 'Sarah Ahmed has successfully completed onboarding.',
        read: true,
        createdAt: '2025-12-08T16:00:00Z'
    }
];
const MOCK_DASHBOARD_STATS = {
    totalEmployees: 248,
    activeLeaves: 12,
    pendingApprovals: 8,
    openPositions: 5,
    pendingPayroll: 3,
    performanceReviews: 15
};
const ROLE_NAVIGATION = {
    DEPARTMENT_EMPLOYEE: [
        {
            label: 'Profile',
            icon: 'user',
            route: '/dashboard/department-employee/profile'
        },
        {
            label: 'Leaves',
            icon: 'calendar',
            route: '/dashboard/department-employee/leaves'
        },
        {
            label: 'Payroll',
            icon: 'dollar-sign',
            route: '/dashboard/department-employee/payroll'
        },
        {
            label: 'Time Management',
            icon: 'clock',
            route: '/dashboard/department-employee/time-management'
        },
        {
            label: 'Performance',
            icon: 'star',
            route: '/dashboard/department-employee/performance'
        },
        {
            label: 'Disputes & Claims',
            icon: 'alert-circle',
            route: '/dashboard/department-employee/disputes-claims'
        }
    ],
    DEPARTMENT_HEAD: [
        {
            label: 'Dashboard',
            icon: 'home',
            route: '/dashboard/department-head/dashboard'
        },
        {
            label: 'Team',
            icon: 'users',
            route: '/dashboard/department-head/team'
        },
        {
            label: 'Leaves Approval',
            icon: 'check-circle',
            route: '/dashboard/department-head/leaves-approval'
        },
        {
            label: 'Performance Reviews',
            icon: 'trending-up',
            route: '/dashboard/department-head/performance-reviews'
        },
        {
            label: 'Organization',
            icon: 'building2',
            route: '/dashboard/department-head/organization'
        }
    ],
    HR_MANAGER: [
        {
            label: 'Dashboard',
            icon: 'home',
            route: '/dashboard/hr-manager/dashboard'
        },
        {
            label: 'Employee Profiles',
            icon: 'user',
            route: '/dashboard/hr-manager/employee-profiles'
        },
        {
            label: 'Recruitment',
            icon: 'briefcase',
            route: '/dashboard/hr-manager/recruitment'
        },
        {
            label: 'Onboarding',
            icon: 'arrow-right',
            route: '/dashboard/hr-manager/onboarding'
        },
        {
            label: 'Offboarding',
            icon: 'arrow-left',
            route: '/dashboard/hr-manager/offboarding'
        }
    ],
    PAYROLL_SPECIALIST: [
        {
            label: 'Configuration',
            icon: 'settings',
            route: '/dashboard/payroll-specialist/configuration'
        },
        {
            label: 'Payroll Runs',
            icon: 'document',
            route: '/dashboard/payroll-specialist/payroll-runs'
        },
        {
            label: 'Reports',
            icon: 'chart-bar',
            route: '/dashboard/payroll-specialist/reports'
        }
    ],
    FINANCE_STAFF: [
        {
            label: 'Payroll Review',
            icon: 'check-circle',
            route: '/dashboard/finance-staff/payroll-review'
        },
        {
            label: 'Disbursement',
            icon: 'send',
            route: '/dashboard/finance-staff/disbursement'
        },
        {
            label: 'Reports',
            icon: 'chart-bar',
            route: '/dashboard/finance-staff/reports'
        }
    ],
    SYSTEM_ADMIN: [
        {
            label: 'Organization',
            icon: 'building2',
            route: '/dashboard/system-admin/organization-structure'
        },
        {
            label: 'Users',
            icon: 'users',
            route: '/dashboard/system-admin/user-management'
        },
        {
            label: 'System Config',
            icon: 'settings',
            route: '/dashboard/system-admin/system-config'
        }
    ]
};
const STATUS_COLORS = {
    approved: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'badge-approved'
    },
    pending: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'badge-pending'
    },
    rejected: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'badge-rejected'
    },
    draft: {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        badge: 'badge-draft'
    },
    active: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        badge: 'badge-active'
    },
    inactive: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        badge: 'badge-inactive'
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "api",
    ()=>api,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = ("TURBOPACK compile-time value", "http://localhost:500") || 'http://localhost:500';
if ("TURBOPACK compile-time truthy", 1) {
    console.log('[API] Base URL:', API_BASE_URL);
}
class ApiService {
    baseUrl;
    constructor(baseUrl){
        this.baseUrl = baseUrl;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            },
            credentials: 'include'
        };
        try {
            const response = await fetch(url, config);
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            }
            if (!response.ok) {
                return {
                    error: data?.message || `HTTP error! status: ${response.status}`,
                    status: response.status
                };
            }
            return {
                data,
                status: response.status
            };
        } catch (error) {
            console.error('[API] Request failed:', url);
            console.error('[API] Error:', error);
            return {
                error: error instanceof Error ? error.message : 'Network error - Is the backend running?',
                status: 0
            };
        }
    }
    async get(endpoint, headers) {
        return this.request(endpoint, {
            method: 'GET',
            headers
        });
    }
    async post(endpoint, data, headers) {
        return this.request(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            headers
        });
    }
    async put(endpoint, data, headers) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            headers
        });
    }
    async patch(endpoint, data, headers) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
            headers
        });
    }
    async delete(endpoint, headers) {
        return this.request(endpoint, {
            method: 'DELETE',
            headers
        });
    }
}
const api = new ApiService(API_BASE_URL);
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authService",
    ()=>authService,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
const authService = {
    /**
   * Login with email and password
   * Sets HTTP-only cookie with JWT token
   */ async login (credentials) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/login', credentials);
        return response;
    },
    /**
   * Register a new candidate (public registration)
   */ async registerCandidate (data) {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/register-candidate', data);
        return response;
    },
    /**
   * Logout - clears the JWT cookie
   */ async logout () {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/logout');
        return response;
    },
    /**
   * Get current user profile (if authenticated)
   */ async getCurrentUser () {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/employee/profile/me');
        return response;
    }
};
const __TURBOPACK__default__export__ = authService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/employee-profile/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "employeeProfileService",
    ()=>employeeProfileService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
/**
 * Helper function to build query string
 */ const buildQueryString = (params)=>{
    const filteredParams = Object.entries(params).filter(([, value])=>value !== undefined && value !== null && value !== '').map(([key, value])=>`${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
    return filteredParams ? `?${filteredParams}` : '';
};
const employeeProfileService = {
    // =============================================
    // Self-Service Endpoints (Employee)
    // =============================================
    /**
   * Get own profile (self-service)
   * GET /employee-profile/me
   */ getMyProfile: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/me`);
    },
    /**
   * Update contact information
   * PATCH /employee-profile/me/contact-info
   */ updateContactInfo: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/employee-profile/me/contact-info`, data);
    },
    /**
   * Update biography and photo
   * PATCH /employee-profile/me/bio
   */ updateBio: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/employee-profile/me/bio`, data);
    },
    /**
   * Submit correction request
   * POST /employee-profile/me/correction-request
   */ submitCorrectionRequest: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/employee-profile/me/correction-request`, data);
    },
    /**
   * Get own correction requests (paginated)
   * GET /employee-profile/me/correction-requests
   */ getMyCorrectionRequests: async (page, limit)=>{
        const query = buildQueryString({
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/me/correction-requests${query}`);
    },
    /**
   * Cancel own correction request
   * PATCH /employee-profile/me/correction-requests/:requestId/cancel
   */ cancelCorrectionRequest: async (requestId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/employee-profile/me/correction-requests/${requestId}/cancel`, {});
    },
    // =============================================
    // Manager Endpoints (Team View)
    // =============================================
    /**
   * Get team profiles
   * GET /employee-profile/team
   */ getTeamProfiles: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/team`);
    },
    /**
   * Get team profiles (paginated)
   * GET /employee-profile/team/paginated
   */ getTeamProfilesPaginated: async (page, limit)=>{
        const query = buildQueryString({
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/team/paginated${query}`);
    },
    // =============================================
    // HR Admin Endpoints (Master Data)
    // =============================================
    /**
   * Get all employees (paginated)
   * GET /employee-profile/admin/employees
   */ getAllEmployees: async (page, limit)=>{
        const query = buildQueryString({
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/admin/employees${query}`);
    },
    /**
   * Search employees (paginated)
   * GET /employee-profile/admin/search
   */ searchEmployees: async (q, page, limit)=>{
        const query = buildQueryString({
            q,
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/admin/search${query}`);
    },
    /**
   * Get all change requests (paginated)
   * GET /employee-profile/admin/change-requests
   */ getAllChangeRequests: async (page, limit)=>{
        const query = buildQueryString({
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/admin/change-requests${query}`);
    },
    /**
   * Get single change request
   * GET /employee-profile/admin/change-requests/:requestId
   */ getChangeRequest: async (requestId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/admin/change-requests/${requestId}`);
    },
    /**
   * Process (approve/reject) change request
   * PATCH /employee-profile/admin/change-requests/:requestId/process
   */ processChangeRequest: async (requestId, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/employee-profile/admin/change-requests/${requestId}/process`, data);
    },
    /**
   * Get pending change requests count
   * GET /employee-profile/admin/change-requests/count/pending
   */ getPendingChangeRequestsCount: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/admin/change-requests/count/pending`);
    },
    /**
   * Get employee count by status
   * GET /employee-profile/admin/stats/by-status
   */ getEmployeeCountByStatus: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/admin/stats/by-status`);
    },
    /**
   * Get employee count by department
   * GET /employee-profile/admin/stats/by-department
   */ getEmployeeCountByDepartment: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/admin/stats/by-department`);
    },
    /**
   * Get employee profile (admin view)
   * GET /employee-profile/:id
   */ getEmployeeProfile: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/employee-profile/${id}`);
    },
    /**
   * Update employee profile (admin)
   * PATCH /employee-profile/:id
   */ updateEmployeeProfile: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/employee-profile/${id}`, data);
    },
    /**
   * Deactivate employee
   * PATCH /employee-profile/:id/deactivate
   */ deactivateEmployee: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/employee-profile/${id}/deactivate`, data || {});
    },
    /**
   * Assign role to employee
   * PATCH /employee-profile/:id/role
   */ assignRole: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/employee-profile/${id}/role`, data);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/leaves/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "leavesService",
    ()=>leavesService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
const leavesService = {
    submitRequest: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/leaves/request', data);
    },
    getMyRequests: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/leaves/my-requests');
    },
    getBalance: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/leaves/balance');
    },
    updateRequest: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/leaves/${id}`, data);
    },
    cancelRequest: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`/leaves/${id}`);
    },
    getTeamLeaves: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/leaves/team');
    },
    approveRequest: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/leaves/${id}/approve`, data);
    },
    rejectRequest: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/leaves/${id}/reject`, data);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/organization-structure/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "organizationStructureService",
    ()=>organizationStructureService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
/**
 * Helper function to build query string
 */ const buildQueryString = (params)=>{
    const filteredParams = Object.entries(params).filter(([, value])=>value !== undefined && value !== null && value !== '').map(([key, value])=>`${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
    return filteredParams ? `?${filteredParams}` : '';
};
const organizationStructureService = {
    // =============================================
    // Department Management
    // =============================================
    /**
   * Create new department
   * POST /departments
   */ createDepartment: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/departments`, data);
    },
    /**
   * Get all departments
   * GET /departments
   */ getDepartments: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/departments`);
    },
    /**
   * Search departments (paginated)
   * GET /departments/search
   */ searchDepartments: async (q, page, limit)=>{
        const query = buildQueryString({
            q,
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/departments/search${query}`);
    },
    /**
   * Get department statistics
   * GET /departments/stats
   */ getDepartmentStats: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/departments/stats`);
    },
    /**
   * Get department by ID
   * GET /departments/:id
   */ getDepartmentById: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/departments/${id}`);
    },
    /**
   * Get department hierarchy
   * GET /departments/:id/hierarchy
   */ getDepartmentHierarchy: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/departments/${id}/hierarchy`);
    },
    /**
   * Update department
   * PATCH /departments/:id
   */ updateDepartment: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/departments/${id}`, data);
    },
    /**
   * Deactivate department
   * PATCH /departments/:id/deactivate
   */ deactivateDepartment: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/departments/${id}/deactivate`, {});
    },
    /**
   * Reactivate department
   * PATCH /departments/:id/reactivate
   */ reactivateDepartment: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/departments/${id}/reactivate`, {});
    },
    // =============================================
    // Position Management
    // =============================================
    /**
   * Create new position
   * POST /positions
   */ createPosition: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/positions`, data);
    },
    /**
   * Get all positions
   * GET /positions
   */ getPositions: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/positions`);
    },
    /**
   * Search positions (paginated)
   * GET /positions/search
   */ searchPositions: async (q, page, limit)=>{
        const query = buildQueryString({
            q,
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/positions/search${query}`);
    },
    /**
   * Get position statistics
   * GET /positions/stats
   */ getPositionStats: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/positions/stats`);
    },
    /**
   * Get position by ID
   * GET /positions/:id
   */ getPositionById: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/positions/${id}`);
    },
    /**
   * Get subordinate positions
   * GET /positions/:id/subordinates
   */ getPositionSubordinates: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/positions/${id}/subordinates`);
    },
    /**
   * Update position
   * PATCH /positions/:id
   */ updatePosition: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/positions/${id}`, data);
    },
    /**
   * Deactivate position
   * PATCH /positions/:id/deactivate
   */ deactivatePosition: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/positions/${id}/deactivate`, {});
    },
    /**
   * Reactivate position
   * PATCH /positions/:id/reactivate
   */ reactivatePosition: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/positions/${id}/reactivate`, {});
    },
    /**
   * Get position history
   * GET /positions/:id/history
   */ getPositionHistory: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/positions/${id}/history`);
    },
    /**
   * End position assignment
   * POST /positions/:id/end-assignment
   */ endAssignment: async (positionId, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/positions/${positionId}/end-assignment`, data);
    },
    // =============================================
    // Organization Chart
    // =============================================
    /**
   * Get organization chart
   * GET /org-chart
   */ getOrgChart: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/org-chart`);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/recruitment/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "recruitmentService",
    ()=>recruitmentService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
const recruitmentService = {
    getJobPostings: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/recruitment/jobs');
    },
    createJobPosting: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/recruitment/jobs', data);
    },
    getJobPosting: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/recruitment/jobs/${id}`);
    },
    submitApplication: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/recruitment/application', data);
    },
    getApplicationStatus: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/recruitment/application/${id}/status`);
    },
    getCandidates: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/recruitment/candidates');
    },
    updateCandidateStatus: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/recruitment/candidate/${id}/status`, data);
    },
    scheduleInterview: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/recruitment/interview/schedule', data);
    },
    createOffer: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/recruitment/offer', data);
    },
    getOffers: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/recruitment/offers');
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/time-management/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "timeManagementService",
    ()=>timeManagementService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
const timeManagementService = {
    clockIn: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/attendance/clock-in', data);
    },
    clockOut: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/attendance/clock-out', data);
    },
    requestCorrection: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/attendance/correction', data);
    },
    getAttendanceRecord: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/attendance/record');
    },
    getTeamAttendance: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/attendance/team');
    },
    approveCorrection: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/attendance/correction/${id}/approve`);
    },
    rejectCorrection: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/attendance/correction/${id}/reject`);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/payroll-configuration/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "payrollConfigurationService",
    ()=>payrollConfigurationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
const payrollConfigurationService = {
    getConfiguration: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/configuration');
    },
    updateConfiguration: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch('/payroll/configuration', data);
    },
    getPayGrades: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/pay-grades');
    },
    createPayGrade: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/payroll/pay-grades', data);
    },
    updatePayGrade: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/payroll/pay-grades/${id}`, data);
    },
    getAllowances: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/allowances');
    },
    createAllowance: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/payroll/allowances', data);
    },
    getTaxRules: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/tax-rules');
    },
    updateTaxRules: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch('/payroll/tax-rules', data);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/payroll-execution/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "payrollExecutionService",
    ()=>payrollExecutionService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
const payrollExecutionService = {
    createPayrollRun: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/payroll/run/create', data);
    },
    getPayrollRun: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/payroll/run/${id}`);
    },
    getPayrollRuns: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/runs');
    },
    draftPayroll: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/payroll/draft', data);
    },
    processPayroll: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/payroll/run/${id}/process`, data);
    },
    approvePayroll: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/payroll/run/${id}/approve`);
    },
    rejectPayroll: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/payroll/run/${id}/reject`);
    },
    freezePayroll: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/payroll/run/${id}/freeze`);
    },
    unfreezePayroll: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/payroll/run/${id}/unfreeze`);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/payroll-tracking/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "payrollTrackingService",
    ()=>payrollTrackingService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
const payrollTrackingService = {
    getPayslip: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/payroll/payslip/${id}`);
    },
    getPayslips: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/payslips');
    },
    downloadPayslip: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/payroll/payslip/${id}/download`);
    },
    getSalaryHistory: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/salary-history');
    },
    getDeductions: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/deductions');
    },
    submitDispute: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/payroll/dispute', data);
    },
    getDisputes: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/disputes');
    },
    submitClaim: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/payroll/claim', data);
    },
    getClaims: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/payroll/claims');
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/performance/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "performanceService",
    ()=>performanceService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
/**
 * Helper function to build query string
 */ const buildQueryString = (params)=>{
    const filteredParams = Object.entries(params).filter(([, value])=>value !== undefined && value !== null && value !== '').map(([key, value])=>`${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
    return filteredParams ? `?${filteredParams}` : '';
};
const performanceService = {
    // =============================================
    // Templates
    // =============================================
    /**
   * Create appraisal template
   * POST /performance/templates
   */ createTemplate: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/templates`, data);
    },
    /**
   * Get all templates
   * GET /performance/templates
   */ getTemplates: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/templates`);
    },
    /**
   * Search templates (paginated)
   * GET /performance/templates/search
   */ searchTemplates: async (q, page, limit)=>{
        const query = buildQueryString({
            q,
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/templates/search${query}`);
    },
    /**
   * Get template statistics
   * GET /performance/templates/stats
   */ getTemplateStats: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/templates/stats`);
    },
    /**
   * Get template by ID
   * GET /performance/templates/:id
   */ getTemplateById: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/templates/${id}`);
    },
    /**
   * Update template
   * PATCH /performance/templates/:id
   */ updateTemplate: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/performance/templates/${id}`, data);
    },
    /**
   * Deactivate template
   * PATCH /performance/templates/:id/deactivate
   */ deactivateTemplate: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/performance/templates/${id}/deactivate`, {});
    },
    /**
   * Reactivate template
   * PATCH /performance/templates/:id/reactivate
   */ reactivateTemplate: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/performance/templates/${id}/reactivate`, {});
    },
    // =============================================
    // Cycles
    // =============================================
    /**
   * Create appraisal cycle
   * POST /performance/cycles
   */ createCycle: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/cycles`, data);
    },
    /**
   * Get all cycles
   * GET /performance/cycles
   */ getCycles: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/cycles`);
    },
    /**
   * Search cycles (paginated)
   * GET /performance/cycles/search
   */ searchCycles: async (q, page, limit)=>{
        const query = buildQueryString({
            q,
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/cycles/search${query}`);
    },
    /**
   * Get cycle statistics
   * GET /performance/cycles/stats
   */ getCycleStats: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/cycles/stats`);
    },
    /**
   * Get cycle by ID
   * GET /performance/cycles/:id
   */ getCycleById: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/cycles/${id}`);
    },
    /**
   * Update cycle
   * PATCH /performance/cycles/:id
   */ updateCycle: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/performance/cycles/${id}`, data);
    },
    /**
   * Activate PLANNED cycle
   * POST /performance/cycles/:id/activate
   */ activateCycle: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/cycles/${id}/activate`, {});
    },
    /**
   * Close ACTIVE cycle
   * POST /performance/cycles/:id/close
   */ closeCycle: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/cycles/${id}/close`, {});
    },
    /**
   * Archive CLOSED cycle
   * POST /performance/cycles/:id/archive
   */ archiveCycle: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/cycles/${id}/archive`, {});
    },
    // =============================================
    // Assignments
    // =============================================
    /**
   * Create assignment
   * POST /performance/assignments
   */ createAssignment: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/assignments`, data);
    },
    /**
   * Bulk create assignments
   * POST /performance/assignments/bulk
   */ bulkCreateAssignments: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/assignments/bulk`, data);
    },
    /**
   * Search assignments (paginated)
   * GET /performance/assignments
   */ searchAssignments: async (q, page, limit)=>{
        const query = buildQueryString({
            q,
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/assignments${query}`);
    },
    /**
   * Get assignments for manager
   * GET /performance/assignments/manager/:id
   */ getAssignmentsForManager: async (managerId, page, limit)=>{
        const query = buildQueryString({
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/assignments/manager/${managerId}${query}`);
    },
    /**
   * Get assignments for employee
   * GET /performance/assignments/employee/:id
   */ getAssignmentsForEmployee: async (employeeId, page, limit)=>{
        const query = buildQueryString({
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/assignments/employee/${employeeId}${query}`);
    },
    /**
   * Get assignment by ID
   * GET /performance/assignments/:id
   */ getAssignmentById: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/assignments/${id}`);
    },
    // =============================================
    // Records
    // =============================================
    /**
   * Submit appraisal record
   * POST /performance/records
   */ submitAppraisalRecord: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/records`, data);
    },
    /**
   * Save draft record
   * POST /performance/records/draft
   */ saveDraftRecord: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/records/draft`, data);
    },
    /**
   * Search records (paginated)
   * GET /performance/records
   */ searchRecords: async (q, page, limit)=>{
        const query = buildQueryString({
            q,
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/records${query}`);
    },
    /**
   * Get record by assignment
   * GET /performance/records/assignment/:id
   */ getRecordByAssignment: async (assignmentId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/records/assignment/${assignmentId}`);
    },
    /**
   * Get record by ID
   * GET /performance/records/:id
   */ getRecordById: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/records/${id}`);
    },
    /**
   * Publish record
   * POST /performance/records/:id/publish
   */ publishRecord: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/records/${id}/publish`, {});
    },
    /**
   * Bulk publish records
   * POST /performance/records/bulk-publish
   */ bulkPublishRecords: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/records/bulk-publish`, data);
    },
    /**
   * Acknowledge record (employee)
   * POST /performance/records/:id/acknowledge
   */ acknowledgeRecord: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/records/${id}/acknowledge`, {});
    },
    /**
   * Mark record as viewed (employee)
   * POST /performance/records/:id/view
   */ markRecordViewed: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/records/${id}/view`, {});
    },
    /**
   * Get employee appraisal history
   * GET /performance/employee/:id/history
   */ getEmployeeAppraisalHistory: async (employeeId, page, limit)=>{
        const query = buildQueryString({
            page,
            limit
        });
        const endpoint = employeeId ? `/performance/employee/${employeeId}/history${query}` : `/performance/employee/me/history${query}`;
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(endpoint);
    },
    // =============================================
    // Disputes
    // =============================================
    /**
   * File dispute/objection
   * POST /performance/disputes
   */ fileDispute: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/performance/disputes`, data);
    },
    /**
   * Search disputes (paginated)
   * GET /performance/disputes
   */ searchDisputes: async (q, page, limit)=>{
        const query = buildQueryString({
            q,
            page,
            limit
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/disputes${query}`);
    },
    /**
   * Get dispute statistics
   * GET /performance/disputes/stats
   */ getDisputeStats: async ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/disputes/stats`);
    },
    /**
   * Get dispute by ID
   * GET /performance/disputes/:id
   */ getDisputeById: async (id)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/disputes/${id}`);
    },
    /**
   * Assign dispute reviewer
   * PATCH /performance/disputes/:id/assign-reviewer
   */ assignDisputeReviewer: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/performance/disputes/${id}/assign-reviewer`, data);
    },
    /**
   * Resolve dispute
   * PATCH /performance/disputes/:id/resolve
   */ resolveDispute: async (id, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/performance/disputes/${id}/resolve`, data);
    },
    // =============================================
    // Dashboard
    // =============================================
    /**
   * Get completion dashboard
   * GET /performance/dashboard/:cycleId
   */ getCompletionDashboard: async (cycleId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/performance/dashboard/${cycleId}`);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/onboarding/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "onboardingService",
    ()=>onboardingService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
const onboardingService = {
    createChecklist: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/onboarding/checklist', data);
    },
    getChecklistTemplate: async (departmentId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/onboarding/checklist/template/${departmentId}`);
    },
    getOnboardingStatus: async (employeeId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/onboarding/status/${employeeId}`);
    },
    updateTaskStatus: async (taskId, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/onboarding/task/${taskId}`, data);
    },
    uploadDocument: async (employeeId, file)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/onboarding/${employeeId}/documents`, file);
    },
    triggerPayrollInitiation: async (employeeId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/onboarding/${employeeId}/payroll-initiation`);
    },
    provisionAccess: async (employeeId, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/onboarding/${employeeId}/provision-access`, data);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/offboarding/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "offboardingService",
    ()=>offboardingService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
;
const offboardingService = {
    initiateTermination: async (employeeId, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/offboarding/${employeeId}/termination`, data);
    },
    getTerminationReview: async (employeeId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/offboarding/${employeeId}/termination-review`);
    },
    getClearanceChecklist: async (employeeId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/offboarding/${employeeId}/clearance-checklist`);
    },
    updateClearanceItem: async (itemId, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`/offboarding/clearance/${itemId}`, data);
    },
    calculateFinalSettlement: async (employeeId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/offboarding/${employeeId}/final-settlement`);
    },
    processFinalSettlement: async (employeeId, data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/offboarding/${employeeId}/process-settlement`, data);
    },
    revokeAccess: async (employeeId)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/offboarding/${employeeId}/revoke-access`);
    },
    submitResignation: async (data)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/offboarding/resignation', data);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/services/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$employee$2d$profile$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/employee-profile/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$leaves$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/leaves/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$organization$2d$structure$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/organization-structure/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$recruitment$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/recruitment/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$time$2d$management$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/time-management/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$payroll$2d$configuration$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/payroll-configuration/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$payroll$2d$execution$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/payroll-execution/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$payroll$2d$tracking$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/payroll-tracking/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$performance$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/performance/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$onboarding$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/onboarding/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$offboarding$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/offboarding/index.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/context/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "ROLE_PERMISSIONS",
    ()=>ROLE_PERMISSIONS,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/types/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/types/enums.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/constants/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/app/services/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/services/auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// Map backend role to SystemRole enum
function mapRole(role) {
    const roleMap = {
        'department employee': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_EMPLOYEE,
        'department head': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_HEAD,
        'HR Manager': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
        'HR Employee': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE,
        'Payroll Specialist': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_SPECIALIST,
        'Payroll Manager': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_MANAGER,
        'System Admin': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        'Legal & Policy Admin': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].LEGAL_POLICY_ADMIN,
        'Recruiter': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].RECRUITER,
        'Finance Staff': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].FINANCE_STAFF,
        'Job Candidate': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].JOB_CANDIDATE,
        'HR Admin': __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN
    };
    return roleMap[role] || __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_EMPLOYEE;
}
// Get default route based on user role
function getDefaultRouteForRole(role) {
    switch(role){
        // Admin roles - full dashboard access
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN:
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN:
            return '/dashboard';
        // HR roles - HR focused dashboard
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER:
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE:
            return '/dashboard';
        // Payroll roles - payroll dashboard
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_MANAGER:
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_SPECIALIST:
            return '/dashboard/payroll';
        // Finance - payroll and reports
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].FINANCE_STAFF:
            return '/dashboard/payroll';
        // Recruiter - recruitment dashboard
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].RECRUITER:
            return '/dashboard/recruitment';
        // Department head - team management
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_HEAD:
            return '/dashboard';
        // Job candidate - recruitment/application status
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].JOB_CANDIDATE:
            return '/dashboard/recruitment';
        // Regular employee - employee self-service
        case __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_EMPLOYEE:
        default:
            return '/dashboard';
    }
}
const ROLE_PERMISSIONS = {
    // Admin routes - full access
    '/dashboard/admin': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN
    ],
    // Organization structure
    '/dashboard/organization': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_HEAD
    ],
    // Recruitment - HR, Recruiters, and Candidates (limited)
    '/dashboard/recruitment': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].RECRUITER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].JOB_CANDIDATE
    ],
    // Onboarding
    '/dashboard/onboarding': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE
    ],
    // Offboarding
    '/dashboard/offboarding': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE
    ],
    // Payroll - Payroll team and Finance
    '/dashboard/payroll': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_SPECIALIST,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].FINANCE_STAFF,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_HEAD
    ],
    // Performance - HR and Managers
    '/dashboard/performance': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_HEAD,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_EMPLOYEE
    ],
    // Time Management - Everyone
    '/dashboard/time-management': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_HEAD,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_SPECIALIST,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_MANAGER
    ],
    // Leaves - Everyone
    '/dashboard/leaves': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_HEAD,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_SPECIALIST,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].FINANCE_STAFF,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].RECRUITER
    ],
    // Employee profile - Everyone
    '/dashboard/employee': [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].SYSTEM_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_ADMIN,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].HR_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_HEAD,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].DEPARTMENT_EMPLOYEE,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_SPECIALIST,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].PAYROLL_MANAGER,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].FINANCE_STAFF,
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$types$2f$enums$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SystemRole"].RECRUITER
    ]
};
// Transform backend user response to frontend User type
function transformUser(backendUser) {
    return {
        id: backendUser.id,
        firstName: backendUser.firstName,
        lastName: backendUser.lastName,
        email: backendUser.email,
        role: mapRole(backendUser.role),
        department: backendUser.department
    };
}
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            // Check for stored session on mount
            const storedUser = localStorage.getItem('hr_user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                    setNotifications(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MOCK_NOTIFICATIONS"]);
                } catch  {
                    localStorage.removeItem('hr_user');
                }
            }
            setIsLoading(false);
        }
    }["AuthProvider.useEffect"], []);
    const login = async (email, password)=>{
        setIsLoading(true);
        setError(null);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].login({
                email,
                password
            });
            if (response.error) {
                setError(response.error);
                return false;
            }
            if (response.data?.user) {
                const transformedUser = transformUser(response.data.user);
                setUser(transformedUser);
                setNotifications(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$constants$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MOCK_NOTIFICATIONS"]);
                localStorage.setItem('hr_user', JSON.stringify(transformedUser));
                return true;
            }
            setError('Invalid response from server');
            return false;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
            return false;
        } finally{
            setIsLoading(false);
        }
    };
    const register = async (data)=>{
        setIsLoading(true);
        setError(null);
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].registerCandidate({
                firstName: data.firstName,
                lastName: data.lastName,
                nationalId: data.nationalId,
                personalEmail: data.email,
                password: data.password,
                mobilePhone: data.mobilePhone
            });
            if (response.error) {
                setError(response.error);
                return false;
            }
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            return false;
        } finally{
            setIsLoading(false);
        }
    };
    const logout = async ()=>{
        setIsLoading(true);
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$services$2f$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally{
            setUser(null);
            setNotifications([]);
            localStorage.removeItem('hr_user');
            setIsLoading(false);
        }
    };
    const clearError = ()=>setError(null);
    //Check if user has one of the specified roles
    const hasRole = (roles)=>{
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [
            roles
        ];
        return roleArray.includes(user.role);
    };
    // Get the default route for the current user's role
    const getDefaultRoute = ()=>{
        if (!user) return '/login';
        return getDefaultRouteForRole(user.role);
    };
    // Set mock role for development testing
    const setMockRole = (role)=>{
        if (user) {
            const updatedUser = {
                ...user,
                role
            };
            setUser(updatedUser);
            localStorage.setItem('hr_user', JSON.stringify(updatedUser));
        }
    };
    const markNotificationRead = (id)=>{
        setNotifications((prev)=>prev.map((n)=>n.id === id ? {
                    ...n,
                    read: true
                } : n));
    };
    const markAllNotificationsRead = ()=>{
        setNotifications((prev)=>prev.map((n)=>({
                    ...n,
                    read: true
                })));
    };
    const unreadCount = notifications.filter((n)=>!n.read).length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated: !!user,
            isLoading,
            error,
            notifications,
            unreadCount,
            login,
            register,
            logout,
            clearError,
            markNotificationRead,
            markAllNotificationsRead,
            hasRole,
            getDefaultRoute,
            setMockRole
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/app/context/AuthContext.tsx",
        lineNumber: 340,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "GCf++dgVSAM5/ZeKxTe7H0tmC6k=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_af975ea6._.js.map