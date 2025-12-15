# HR System - Full System Workflow Guide
## Complete Subsystem Integration & Dependencies

**Version:** 1.0  
**Date:** December 15, 2025

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Module 1: Employee Profile](#2-module-1-employee-profile)
3. [Module 2: Organization Structure](#3-module-2-organization-structure)
4. [Module 3: Recruitment](#4-module-3-recruitment)
5. [Module 4: Onboarding](#5-module-4-onboarding)
6. [Module 5: Offboarding](#6-module-5-offboarding)
7. [Module 6: Leaves Management](#7-module-6-leaves-management)
8. [Module 7: Time Management](#8-module-7-time-management)
9. [Module 8: Performance Management](#9-module-8-performance-management)
10. [Module 9: Payroll Configuration](#10-module-9-payroll-configuration)
11. [Module 10: Payroll Execution](#11-module-10-payroll-execution)
12. [Module 11: Payroll Tracking](#12-module-11-payroll-tracking)
13. [Data Flow Diagrams](#13-data-flow-diagrams)
14. [Complete API Reference](#14-complete-api-reference)

---

## 1. System Architecture Overview

### 1.1 Module Dependency Matrix

```
                    PROVIDES DATA TO →
                    ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
                    │ EP │ OS │ RC │ ON │ OF │ LV │ TM │ PF │ PC │ PE │ PT │
    ┌───────────────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┤
R   │ EP (Employee) │ -  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │
E   │ OS (Org Str)  │ ✓  │ -  │ ✓  │ ✓  │    │ ✓  │ ✓  │ ✓  │    │ ✓  │    │
C   │ RC (Recruit)  │ ✓  │    │ -  │ ✓  │    │    │    │    │    │    │    │
E   │ ON (Onboard)  │ ✓  │    │    │ -  │    │ ✓  │ ✓  │    │    │ ✓  │    │
I   │ OF (Offboard) │ ✓  │    │    │    │ -  │ ✓  │ ✓  │    │    │ ✓  │    │
V   │ LV (Leaves)   │    │    │    │    │    │ -  │ ✓  │    │    │ ✓  │ ✓  │
E   │ TM (Time Mgt) │    │    │    │    │    │ ✓  │ -  │    │    │ ✓  │ ✓  │
S   │ PF (Perform)  │    │    │    │    │    │    │    │ -  │    │    │    │
    │ PC (Pay Conf) │    │    │    │    │    │    │    │    │ -  │ ✓  │    │
F   │ PE (Pay Exec) │    │    │    │    │    │    │    │    │    │ -  │ ✓  │
R   │ PT (Pay Trk)  │    │    │    │    │    │    │    │    │    │ ✓  │ -  │
O   └───────────────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
M
```

### 1.2 Module Legend

| Code | Module | Primary Responsibility |
|------|--------|----------------------|
| EP | Employee Profile | Employee master data, authentication |
| OS | Organization Structure | Departments, positions, hierarchy |
| RC | Recruitment | Hiring pipeline, candidates, offers |
| ON | Onboarding | New hire setup, contracts |
| OF | Offboarding | Termination, clearance |
| LV | Leaves | Leave types, requests, balances |
| TM | Time Management | Attendance, shifts, overtime |
| PF | Performance | Appraisals, reviews |
| PC | Payroll Configuration | Tax, insurance, allowances setup |
| PE | Payroll Execution | Payroll runs, payslips |
| PT | Payroll Tracking | Disputes, claims, history |

---

## 2. Module 1: Employee Profile

### 2.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `employee_profiles` | Master employee data |
| `employee_system_roles` | Authentication & roles |
| `employee_qualifications` | Education, certifications |
| `employeedocuments` | Personal documents |
| `employee_profile_change_requests` | Profile update requests |

### 2.2 Data RECEIVED From Other Modules

| From Module | Data/Event | Purpose |
|-------------|------------|---------|
| Recruitment | Hired candidate info | Create new employee profile |
| Onboarding | Contract details | Update employment info |
| Organization | Position assignment | Update position/department |
| Performance | Review scores | Store in profile history |

### 2.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| ALL MODULES | Employee basic info | `GET /employee-profile/:id` |
| Organization | Employee for assignment | `GET /employee-profile/admin/employees` |
| Recruitment | Employee as referrer | `GET /employee-profile/:id` |
| Leaves | Employee for leave request | `GET /employee-profile/:id` |
| Time Management | Employee for attendance | `GET /employee-profile/admin/employees` |
| Performance | Employee for appraisal | `GET /employee-profile/:id` |
| Payroll Execution | Employee for payroll | `GET /employee-profile/admin/employees?departmentId=xxx&status=active` |
| Payroll Tracking | Employee for history | `GET /employee-profile/:id` |

### 2.4 UI Components Required

**Admin Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Employee List | firstName, lastName, employeeNumber, department, status | View, Edit, Deactivate |
| Employee Form | All profile fields | Create, Update |
| Role Assignment | roles[], isActive | Assign roles |
| Change Requests | requestType, status, changes | Approve, Reject |

**Employee Self-Service:**
| Component | Fields | Actions |
|-----------|--------|---------|
| My Profile | Personal info, contact | View, Request change |
| My Documents | documentType, uploadDate | Upload, Download |

---

## 3. Module 2: Organization Structure

### 3.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `departments` | Company departments |
| `positions` | Job positions |
| `position_assignments` | Employee-position links |
| `structure_change_requests` | Org change requests |
| `structure_change_logs` | Audit trail |
| `structure_approvals` | Approval workflow |

### 3.2 Data RECEIVED From Other Modules

| From Module | Data/Event | Purpose |
|-------------|------------|---------|
| Employee Profile | Employee info | For position assignment |
| Recruitment | New position needs | Create position |

### 3.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Employee Profile | Departments, Positions | `GET /organization-structure/departments` |
| Recruitment | Available positions | `GET /organization-structure/positions` |
| Leaves | Department hierarchy | `GET /organization-structure/departments/:id` |
| Time Management | Department shifts | `GET /organization-structure/departments` |
| Performance | Department for appraisal | `GET /organization-structure/departments` |
| Payroll Execution | Departments for runs | `GET /organization-structure/departments?isActive=true` |

### 3.4 UI Components Required

**HR Admin Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Department Tree | name, parentId, headId, employeeCount | View hierarchy |
| Department Form | name, description, parentDepartment, head | Create, Edit |
| Position List | title, department, payGrade, reportingTo | Create, Edit |
| Position Assignment | employee, position, startDate | Assign, End |
| Org Chart | Visual hierarchy | Interactive navigation |

---

## 4. Module 3: Recruitment

### 4.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `jobtemplates` | Reusable job descriptions |
| `jobrequisitions` | Open positions |
| `candidates` | Applicant profiles |
| `applications` | Job applications |
| `applicationstatushistories` | Status tracking |
| `interviews` | Interview schedules |
| `referrals` | Employee referrals |
| `offers` | Job offers |

### 4.2 Data RECEIVED From Other Modules

| From Module | Data/Event | Purpose |
|-------------|------------|---------|
| Employee Profile | Employees as referrers | Link referrals |
| Organization | Positions, departments | Create requisitions |
| Payroll Config | Pay grades | Salary in offers |

### 4.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Employee Profile | Hired candidate | POST creates employee |
| Onboarding | Accepted offer | `POST /recruitment/applications/:id/trigger-preboarding` |

### 4.4 UI Components Required

**HR Recruiter Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Requisition List | title, department, status, applicantCount | Create, Edit, Close |
| Requisition Form | title, description, requirements, salaryRange | Create, Edit |
| Application Pipeline | candidate, stage, rating | Move stages, Reject |
| Candidate Profile | name, email, resume, experience | View, Rate |
| Interview Scheduler | date, time, panelists, type | Schedule, Reschedule |
| Offer Letter | salary, startDate, benefits | Generate, Send |

**Hiring Manager Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| My Requisitions | Requisitions I created | View status |
| Interview Queue | Pending interviews | Complete, Feedback |

---

## 5. Module 4: Onboarding

### 5.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `onboardings` | Onboarding process tracking |
| `contracts` | Employment contracts |
| `documents` | Onboarding documents |

### 5.2 Data RECEIVED From Other Modules

| From Module | Data/Event | Purpose |
|-------------|------------|---------|
| Recruitment | Accepted offer | Trigger onboarding |
| Employee Profile | New employee ID | Link onboarding |
| Payroll Config | Signing bonus config | Process bonus |

### 5.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Employee Profile | Employment start | Updates employee record |
| Leaves | Initial entitlements | `POST /onboarding/trigger-payroll-initiation` |
| Time Management | Shift assignment | Triggers assignment |
| Payroll Execution | Signing bonus | `POST /onboarding/contracts/:id/process-signing-bonus` |

### 5.4 UI Components Required

**HR Admin Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Onboarding List | employee, status, progress, startDate | View, Manage |
| Task Checklist | taskName, status, dueDate, assignee | Complete, Assign |
| Contract Upload | contractType, startDate, endDate, salary | Upload, Send for signing |
| Document Collection | documentType, status | Request, Verify |
| Equipment Reservation | equipmentType, status | Reserve, Track |

**New Hire Portal:**
| Component | Fields | Actions |
|-----------|--------|---------|
| My Tasks | Pending tasks | Complete |
| My Documents | Required documents | Upload |
| My Contract | Contract details | View, Sign |

---

## 6. Module 5: Offboarding

### 6.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `terminationrequests` | Termination/resignation requests |
| `clearancechecklists` | Exit clearance tracking |

### 6.2 Data RECEIVED From Other Modules

| From Module | Data/Event | Purpose |
|-------------|------------|---------|
| Employee Profile | Employee info | Process termination |
| Leaves | Leave balance | Calculate encashment |

### 6.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Employee Profile | Termination date | Updates employee status |
| Leaves | Final balance settlement | Encashment calculation |
| Time Management | Access revocation | `POST /offboarding/revoke-access` |
| Payroll Execution | Termination benefits | `POST /offboarding/trigger-final-settlement` |

### 6.4 UI Components Required

**HR Admin Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Termination Requests | employee, type, requestDate, status | Approve, Reject |
| Resignation Form | employee, lastWorkingDay, reason | Submit, Process |
| Clearance Checklist | department, items[], status | Track, Complete |
| Equipment Return | equipment, returnStatus | Mark returned |
| Final Settlement | unpaidSalary, leaveEncashment, benefits | Calculate, Process |

**Employee Self-Service:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Resignation Form | lastWorkingDay, reason | Submit |
| My Clearance | departments, status | Track |

---

## 7. Module 6: Leaves Management

### 7.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `leavetypes` | Leave type definitions |
| `leavecategories` | Category groupings |
| `leavepolicies` | Leave rules |
| `leaverequests` | Employee requests |
| `leavebalances` | Current balances |
| `leaveentitlements` | Allocated days |
| `leaveadjustments` | Manual adjustments |
| `leave_deductions` | Deductions for payroll |
| `attachments` | Medical certificates |
| `calendars` | Holiday calendars |

### 7.2 Data RECEIVED From Other Modules

| From Module | Data/Event | Purpose |
|-------------|------------|---------|
| Employee Profile | Employee info | Create leave request |
| Onboarding | New hire | Initialize entitlements |
| Offboarding | Termination | Calculate encashment |
| Time Management | Attendance gaps | Auto-apply leave |

### 7.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Time Management | Approved leaves | `GET /leaves/requests?status=approved` |
| Payroll Execution | Unpaid leave deduction | `POST /leaves/payroll/calculate-unpaid-deduction` |
| Payroll Execution | Leave encashment | `POST /leaves/payroll/calculate-encashment` |
| Payroll Tracking | Leave balance history | `GET /leaves/employees/:id/history` |

### 7.4 UI Components Required

**HR Admin Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Leave Types | name, code, paidType, maxDays | Create, Edit |
| Leave Policies | leaveType, eligibility, carryover | Configure |
| All Requests | employee, type, dates, status | Approve, Reject |
| Balance Adjustments | employee, type, adjustment, reason | Adjust |
| Holiday Calendar | date, name, type | Add, Edit |

**Manager Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Team Leave Requests | employee, type, dates | Approve, Reject |
| Team Calendar | Team leave schedule | View |
| Team Balances | employee, leaveType, balance | View |

**Employee Self-Service:**
| Component | Fields | Actions |
|-----------|--------|---------|
| My Balances | leaveType, entitled, used, remaining | View |
| Leave Request Form | type, startDate, endDate, reason | Submit |
| My Requests | type, dates, status | View, Cancel |
| Team Calendar | Team availability | View |

---

## 8. Module 7: Time Management

### 8.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `attendancerecords` | Daily punch in/out |
| `shifts` | Shift definitions |
| `shifttypes` | Shift type configs |
| `shiftassignments` | Employee schedules |
| `schedulerules` | Scheduling rules |
| `overtimerules` | OT calculations |
| `latenessrules` | Late penalties |
| `timeexceptions` | Exceptions |
| `attendancecorrectionrequests` | Corrections |
| `holidays` | Company holidays |

### 8.2 Data RECEIVED From Other Modules

| From Module | Data/Event | Purpose |
|-------------|------------|---------|
| Employee Profile | Employee info | Track attendance |
| Organization | Department | Group by department |
| Onboarding | New hire | Assign shift |
| Offboarding | Termination | End attendance |
| Leaves | Approved leave | Mark as leave day |

### 8.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Leaves | Attendance gaps | Auto-suggest leave |
| Payroll Execution | Work hours summary | `GET /attendance/payroll?employeeId=xxx&startDate=xxx&endDate=xxx` |
| Payroll Tracking | Attendance history | `GET /attendance/month/:employeeId` |

### 8.4 UI Components Required

**HR Admin Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Shift Types | name, startTime, endTime, breakMinutes | Create, Edit |
| Shift Assignments | employee, shift, effectiveDate | Assign |
| Overtime Rules | type, multiplier, conditions | Configure |
| Lateness Rules | threshold, deductionRate | Configure |
| Holiday List | date, name, type | Add, Edit |
| Attendance Report | employee, date, punchIn, punchOut, hours | Export |

**Manager Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Team Attendance | Today's team status | View |
| Correction Requests | employee, date, correction | Approve, Reject |
| Overtime Approvals | employee, hours, reason | Approve |

**Employee Self-Service:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Punch In/Out | Current status, time | Punch |
| My Attendance | date, punchIn, punchOut, hours | View |
| Correction Request | date, actualTime, reason | Submit |
| My Schedule | Assigned shifts | View |

---

## 9. Module 8: Performance Management

### 9.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `appraisal_templates` | Review form templates |
| `appraisal_cycles` | Review periods |
| `appraisal_assignments` | Employee-reviewer mapping |
| `appraisal_records` | Completed reviews |
| `appraisal_disputes` | Appeal records |
| `assessmentresults` | Assessment scores |

### 9.2 Data RECEIVED From Other Modules

| From Module | Data/Event | Purpose |
|-------------|------------|---------|
| Employee Profile | Employee info | Assign appraisal |
| Organization | Department, Position | Group appraisals |

### 9.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Employee Profile | Performance scores | Stored in profile |

### 9.4 UI Components Required

**HR Admin Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Appraisal Templates | name, sections, questions, rating | Create, Edit |
| Appraisal Cycles | name, startDate, endDate, status | Create, Activate |
| Bulk Assignments | cycle, employees, reviewers | Assign |
| Cycle Dashboard | completion stats | View |

**Manager Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| My Appraisals | employee, cycle, status | Complete review |
| Appraisal Form | criteria, ratings, comments | Submit |
| Team Performance | Team scores | View |

**Employee Self-Service:**
| Component | Fields | Actions |
|-----------|--------|---------|
| My Reviews | cycle, reviewer, status | View |
| Self Assessment | criteria, selfRating | Submit |
| Performance History | Past reviews | View |
| Dispute Form | reason, evidence | Submit dispute |

---

## 10. Module 9: Payroll Configuration

### 10.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `taxrules` | Tax calculation rules |
| `taxbrackets` | Tax rate brackets |
| `insurancebrackets` | Insurance rates |
| `allowancetypes` | Allowance definitions |
| `allowances` | Configured allowances |
| `paytypes` | Payment types |
| `paygrades` | Salary bands |
| `deductiontypes` | Deduction categories |
| `benefittypes` | Benefit definitions |
| `payrollpolicies` | General rules |
| `payrollconfigs` | System configs |
| `bonusconfigs` | Bonus configs |
| `signingbonus` | Signing bonus configs |
| `signingbonuses` | Signing bonus policies |
| `terminationandresignationbenefits` | Termination configs |
| `companywidesettings` | Global settings |

### 10.2 Data RECEIVED From Other Modules

| From Module | Data/Event | Purpose |
|-------------|------------|---------|
| Organization | Positions | Link pay grades |

### 10.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Recruitment | Pay grades for offers | `GET /payroll-configuration-requirements/pay-grades` |
| Onboarding | Signing bonus config | `GET /payroll-configuration-requirements/signing-bonuses/all` |
| Payroll Execution | Tax rules | `GET /payroll-configuration-requirements/tax-rules?status=approved` |
| Payroll Execution | Insurance brackets | `GET /payroll-configuration-requirements/insurance-brackets?status=approved` |
| Payroll Execution | Allowances | `GET /payroll-configuration-requirements/allowances/all` |
| Payroll Execution | Pay grades | `GET /payroll-configuration-requirements/pay-grades` |

### 10.4 UI Components Required

**Payroll Manager Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Tax Rules | name, bracket, rate, status | Create, Edit, Approve |
| Insurance Brackets | name, minSalary, maxSalary, employeeRate, employerRate | Create, Edit |
| Pay Grades | code, name, minSalary, maxSalary, baseSalary | Create, Edit |
| Allowance Types | name, amount, type, taxable | Create, Edit |
| Signing Bonus Config | eligibility, amount, conditions | Configure |
| Termination Benefits | yearsOfService, multiplier | Configure |
| Company Settings | payrollDate, currency, fiscalYear | Configure |

---

## 11. Module 10: Payroll Execution

### 11.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `payrollruns` | Monthly payroll cycles |
| `employeepayrolldetails` | Individual calculations |
| `payslips` | Generated payslips |
| `employeesigningbonus` | Employee signing bonuses |
| `employeeterminationresignations` | Termination benefits |
| `employeeallowances` | Employee allowances |
| `employeebenefits` | Employee benefits |

### 11.2 Data RECEIVED From Other Modules

| From Module | Data/Event | API Used |
|-------------|------------|----------|
| Employee Profile | Active employees | `GET /employee-profile/admin/employees` |
| Organization | Departments | `GET /organization-structure/departments` |
| Onboarding | Signing bonus trigger | Contract signing event |
| Offboarding | Termination benefits | Termination event |
| Leaves | Unpaid leave days | `POST /leaves/payroll/calculate-unpaid-deduction` |
| Time Management | Work hours | `GET /attendance/payroll` |
| Payroll Config | Tax, Insurance, Allowances | Multiple endpoints |
| Payroll Tracking | Refunds, Penalties | `GET /payroll/tracking/refunds/pending` |

### 11.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Payroll Tracking | Payroll runs | `GET /payroll-execution/runs` |
| Payroll Tracking | Payslips | `GET /payroll-execution/:id/payslips` |
| Employee (self-service) | My payslips | `GET /payroll-execution/payslips/:id` |

### 11.4 UI Components Required

**Payroll Specialist Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Create Initiation | department, period | Create |
| Payroll Runs List | runId, department, period, status, netPay | View, Manage |
| Run Details | employees, grossPay, deductions, netPay | View breakdown |
| Signing Bonuses Tab | employee, amount, status | Edit, Approve, Reject |
| Termination Benefits Tab | employee, type, amount, status | Edit, Approve, Reject |
| Irregularities | flagged issues | Review |

**Payroll Manager Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Pending Approval | Runs awaiting approval | Approve, Reject |
| Run Details | Full financial breakdown | Review |
| Freeze/Unfreeze | Lock status | Freeze, Unfreeze |

**Finance Staff Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| Finance Approval | Runs pending finance | Approve |
| Financial Breakdown | Taxes, Insurance, Net Pay | Review |
| Generate Payslips | | Generate button |
| Payslips List | Employee payslips | View, Download |

---

## 12. Module 11: Payroll Tracking

### 12.1 Collections Owned

| Collection | Purpose |
|------------|---------|
| `disputes` | Payroll disputes |
| `claims` | Employee claims |
| `refunds` | Approved refunds |
| `employeepenalties` | Misconduct penalties |
| `notificationlogs` | System notifications |

### 12.2 Data RECEIVED From Other Modules

| From Module | Data/Event | API Used |
|-------------|------------|----------|
| Employee Profile | Employee info | For dispute filing |
| Payroll Execution | Payslips | `GET /payroll-execution/:id/payslips` |
| Payroll Execution | Payroll runs | `GET /payroll-execution/runs` |

### 12.3 Data SENT To Other Modules

| To Module | Data Provided | API Endpoint |
|-----------|---------------|--------------|
| Payroll Execution | Pending refunds | `GET /payroll/tracking/refunds/pending` |
| Payroll Execution | Penalties | `GET /payroll/tracking/employee/:id/misconduct-deductions` |

### 12.4 UI Components Required

**Employee Self-Service:**
| Component | Fields | Actions |
|-----------|--------|---------|
| My Payslips | period, grossPay, deductions, netPay | View, Download PDF |
| Payslip Detail | Earnings breakdown, Deductions breakdown | View |
| File Dispute | payslip, issue, description | Submit |
| My Disputes | date, status, resolution | Track |
| File Claim | type, amount, description | Submit |
| My Claims | type, amount, status | Track |

**Payroll Specialist Dashboard:**
| Component | Fields | Actions |
|-----------|--------|---------|
| All Disputes | employee, issue, status | Review, Resolve |
| All Claims | employee, type, amount | Review, Approve |
| Refund Processing | dispute/claim, amount | Process refund |
| Penalty Management | employee, type, amount | Add, Remove |

---

## 13. Data Flow Diagrams

### 13.1 Employee Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMPLOYEE LIFECYCLE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

 RECRUITMENT          ONBOARDING           ACTIVE EMPLOYMENT         OFFBOARDING
 ══════════          ══════════           ═════════════════         ═══════════

┌──────────┐        ┌──────────┐         ┌──────────────────┐      ┌──────────┐
│ Candidate│───────►│ New Hire │────────►│ Active Employee  │─────►│ Exiting  │
│ Applied  │ Offer  │ Onboard  │ Complete│                  │ Term │ Employee │
└──────────┘ Accept └──────────┘         └──────────────────┘ Req  └──────────┘
     │                   │                        │                     │
     ▼                   ▼                        ▼                     ▼
┌──────────┐        ┌──────────┐         ┌──────────────────┐      ┌──────────┐
│ RC:      │        │ ON:      │         │ Daily Operations │      │ OF:      │
│ Create   │        │ Create   │         │                  │      │ Create   │
│ Candidate│        │ Employee │         │ • Leave Requests │      │ Clearance│
│ Record   │        │ Profile  │         │ • Attendance     │      │ Checklist│
└──────────┘        └──────────┘         │ • Performance    │      └──────────┘
                         │               │ • Payroll        │           │
                         ▼               └──────────────────┘           ▼
                    ┌──────────┐                                   ┌──────────┐
                    │ ON:      │                                   │ PE:      │
                    │ Signing  │                                   │ Final    │
                    │ Bonus    │                                   │ Settlement│
                    └──────────┘                                   └──────────┘
```

### 13.2 Monthly Payroll Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONTHLY PAYROLL FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

 Start of Month                Mid-Month                    End of Month
 ══════════════               ═════════                    ════════════

┌─────────────┐           ┌─────────────┐              ┌─────────────┐
│ TM: Track   │           │ LV: Process │              │ PE: Create  │
│ Attendance  │           │ Leave Req   │              │ Payroll Run │
└──────┬──────┘           └──────┬──────┘              └──────┬──────┘
       │                         │                            │
       │    ┌────────────────────┴────────────────────┐       │
       │    │                                         │       │
       ▼    ▼                                         ▼       ▼
┌─────────────────┐                           ┌─────────────────┐
│ Collect Data:   │                           │ PE: Calculate   │
│ • Work Hours    │──────────────────────────►│ Gross → Net     │
│ • Leave Days    │                           │ for Each Emp    │
│ • Overtime      │                           └────────┬────────┘
└─────────────────┘                                    │
                                                       ▼
┌─────────────┐           ┌─────────────┐     ┌─────────────────┐
│ PC: Tax     │           │ PC: Ins     │     │ PE: Create      │
│ Rules       │──────────►│ Brackets    │────►│ Draft Run       │
└─────────────┘           └─────────────┘     └────────┬────────┘
                                                       │
       ┌───────────────────────────────────────────────┘
       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ PE: Specialist  │────►│ PE: Manager     │────►│ PE: Finance     │
│ Review          │     │ Approval        │     │ Approval        │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │ PE: Generate    │
                                               │ Payslips        │
                                               └────────┬────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │ PT: Employee    │
                                               │ Views Payslip   │
                                               └─────────────────┘
```

---

## 14. Complete API Reference

### 14.1 Employee Profile APIs

```
Base: /employee-profile

POST   /                              Create employee
GET    /admin/employees               List all employees (with filters)
GET    /admin/search                  Search employees
GET    /:id                           Get employee by ID
PATCH  /:id                           Update employee
PATCH  /:id/deactivate               Deactivate employee
PATCH  /:id/role                     Update role

GET    /me/:userId                    Get own profile
PATCH  /me/:userId/contact-info      Update contact
POST   /me/:userId/correction-request Submit change request
GET    /me/:userId/documents          Get documents
POST   /me/:userId/documents          Upload document
```

### 14.2 Organization Structure APIs

```
Base: /organization-structure

POST   /departments                   Create department
GET    /departments                   List departments
GET    /departments/:id               Get department
PATCH  /departments/:id               Update department
GET    /departments/:id/hierarchy     Get hierarchy

POST   /positions                     Create position
GET    /positions                     List positions
GET    /positions/:id                 Get position

POST   /assignments                   Create assignment
GET    /assignments                   List assignments
PATCH  /assignments/:id/end           End assignment

GET    /org-chart                     Get org chart
```

### 14.3 Recruitment APIs

```
Base: /recruitment

POST   /job-templates                 Create template
GET    /job-templates                 List templates

POST   /job-requisitions              Create requisition
GET    /job-requisitions              List requisitions
GET    /job-requisitions/published    Public job listings
PATCH  /job-requisitions/:id/publish  Publish requisition
PATCH  /job-requisitions/:id/close    Close requisition

POST   /applications                  Submit application
GET    /applications                  List applications
PATCH  /applications/:id/stage        Update stage
PATCH  /applications/:id/reject       Reject application

POST   /interviews                    Schedule interview
GET    /interviews                    List interviews
PATCH  /interviews/:id/complete       Complete interview

POST   /offers                        Create offer
PATCH  /offers/:id/approve            Approve offer
PATCH  /offers/:id/candidate-response Record response

POST   /applications/:id/trigger-preboarding  Start onboarding
```

### 14.4 Onboarding APIs

```
Base: /onboarding

POST   /                              Create onboarding
GET    /                              List onboardings
GET    /:id                           Get onboarding
GET    /:id/progress                  Get progress

POST   /:id/tasks                     Add task
PATCH  /:id/tasks/:taskName/status    Update task status

POST   /upload-contract               Upload contract
GET    /contracts/:contractId         Get contract
POST   /contracts/:contractId/create-employee  Create employee

POST   /provision-access              Provision system access
POST   /reserve-equipment             Reserve equipment
POST   /contracts/:contractId/process-signing-bonus  Process bonus
```

### 14.5 Offboarding APIs

```
Base: /offboarding

POST   /termination-requests          Create termination
GET    /termination-requests          List terminations
PATCH  /termination-requests/:id/status  Update status

POST   /resignation-requests          Submit resignation
GET    /resignation-requests/all      List resignations

POST   /clearance-checklists          Create checklist
GET    /clearance-checklists/:id      Get checklist
PATCH  /clearance-checklists/:id/items  Update items

POST   /revoke-access                 Revoke system access
POST   /trigger-final-settlement      Trigger final pay
```

### 14.6 Leaves APIs

```
Base: /leaves

POST   /types                         Create leave type
GET    /types                         List leave types

POST   /requests                      Submit request
GET    /requests                      List requests
PATCH  /requests/:id                  Update request
PATCH  /requests/:id/cancel           Cancel request
PATCH  /requests/:id/manager-approve  Manager approve
PATCH  /requests/:id/manager-reject   Manager reject
PATCH  /requests/:id/hr-finalize      HR finalize

GET    /employees/:employeeId/balances    Get balances
GET    /employees/:employeeId/history     Get history

POST   /payroll/calculate-unpaid-deduction  Calculate for payroll
POST   /payroll/calculate-encashment       Calculate encashment
```

### 14.7 Time Management APIs

```
Base: /attendance

POST   /punch-in                      Punch in
POST   /punch-out                     Punch out
GET    /today/:employeeId             Today's record
GET    /month/:employeeId             Monthly records
GET    /payroll                       Payroll summary

PUT    /:id                           Update record
POST   /correct                       Submit correction
POST   /review/:recordId              Review correction

Base: /shift-management

POST   /shift-types                   Create shift type
POST   /shifts                        Create shift
POST   /assignments                   Assign shift
POST   /overtime-rules                Create OT rule
POST   /lateness-rules                Create lateness rule
```

### 14.8 Performance APIs

```
Base: /performance

POST   /templates                     Create template
GET    /templates                     List templates

POST   /cycles                        Create cycle
GET    /cycles                        List cycles
POST   /cycles/:id/activate           Activate cycle
POST   /cycles/:id/close              Close cycle

POST   /assignments                   Create assignment
POST   /assignments/bulk              Bulk assign
GET    /assignments/manager/:managerId  Manager's assignments

POST   /records                       Submit review
GET    /records/:id                   Get review
POST   /records/:id/publish           Publish review
POST   /records/:id/acknowledge       Acknowledge

POST   /disputes                      File dispute
PATCH  /disputes/:id/resolve          Resolve dispute
```

### 14.9 Payroll Configuration APIs

```
Base: /payroll-configuration-requirements

POST   /tax-rules                     Create tax rule
GET    /tax-rules                     List tax rules
PATCH  /tax-rules/:id/approve         Approve rule

POST   /insurance-brackets            Create bracket
GET    /insurance-brackets            List brackets
PATCH  /insurance-brackets/:id/approve  Approve bracket

POST   /allowances                    Create allowance
GET    /allowances/all                List allowances
PATCH  /allowances/:id/approve        Approve allowance

GET    /pay-grades                    List pay grades
POST   /pay-grades                    Create pay grade

GET    /company-settings              Get settings
PUT    /company-settings              Update settings
```

### 14.10 Payroll Execution APIs

```
Base: /payroll-execution

POST   /initiation                    Create payroll run
GET    /initiation/:id                Get run details
PATCH  /initiation/:id                Update run
POST   /initiation/:id/approve        Specialist approve
POST   /initiation/:id/reject         Reject run

POST   /:id/approve                   Manager approve
POST   /:id/approve-finance           Finance approve
POST   /:id/freeze                    Freeze run
POST   /:id/unfreeze                  Unfreeze run
POST   /:id/generate-payslips         Generate payslips

GET    /runs                          List runs
GET    /:id/payslips                  Get payslips for run
GET    /payslips/:payslipId           Get single payslip

GET    /signing-bonuses               List signing bonuses
POST   /signing-bonuses/:id/edit      Edit bonus
POST   /signing-bonuses/:id/approve   Approve bonus
POST   /signing-bonuses/:id/reject    Reject bonus

GET    /termination-benefits          List benefits
POST   /termination-benefits/:id/edit  Edit benefit
POST   /termination-benefits/:id/approve  Approve benefit
POST   /termination-benefits/:id/reject   Reject benefit

GET    /departments                   Get departments (for dropdown)
```

### 14.11 Payroll Tracking APIs

```
Base: /payroll/tracking

GET    /employee/:employeeId/payslips     Employee payslips
GET    /payslip/:payslipId/employee/:employeeId  Single payslip
GET    /payslip/:payslipId/employee/:employeeId/download  Download PDF

GET    /employee/:employeeId/salary-history    Salary history
GET    /employee/:employeeId/tax-deductions    Tax history
GET    /employee/:employeeId/insurance-deductions  Insurance history

POST   /employee/:employeeId/disputes   File dispute
GET    /disputes                        List all disputes
PUT    /disputes/:disputeId/review      Review dispute
PUT    /disputes/:disputeId/confirm     Confirm resolution

POST   /employee/:employeeId/claims     File claim
GET    /claims                          List all claims
PUT    /claims/:claimId/review          Review claim

GET    /refunds/pending                 Pending refunds
PUT    /refunds/:refundId/mark-paid     Mark refund paid
```

---

## Appendix A: Collection Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MASTER REFERENCE: employee_profiles                      │
│                              (Central Entity)                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ employee_system │         │ position_       │         │ employeepayroll │
│ _roles          │         │ assignments     │         │ details         │
│ (Auth/Roles)    │         │ (Org Link)      │         │ (Payroll)       │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         │                           ▼                           ▼
         │                  ┌─────────────────┐         ┌─────────────────┐
         │                  │ departments     │         │ payrollruns     │
         │                  │ positions       │         │ payslips        │
         │                  └─────────────────┘         └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OPERATIONS LINKED BY employeeId                     │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────┤
│ leaverequests   │ attendancerecords│ appraisal_     │ employeesigning    │
│ leavebalances   │ shiftassignments │ assignments    │ bonus              │
│                 │                  │ appraisal_     │ employeetermination│
│                 │                  │ records        │ resignations       │
└─────────────────┴─────────────────┴─────────────────┴─────────────────────┘
```

---

## Appendix B: Status Values Reference

### Employee Status
- `active` - Currently employed
- `inactive` - Deactivated
- `terminated` - Employment ended
- `on_leave` - On extended leave

### Leave Request Status
- `pending` - Awaiting approval
- `manager_approved` - Manager approved
- `approved` - Fully approved
- `rejected` - Denied
- `cancelled` - Cancelled by employee

### Payroll Run Status
- `draft` - Initial creation
- `under review` - Specialist approved, calculating
- `pending finance approval` - Manager approved
- `approved` - Finance approved
- `rejected` - Rejected at any stage
- `locked` - Frozen/finalized

### Signing Bonus / Termination Benefit Status
- `pending` - Awaiting review
- `approved` - Approved for payment
- `rejected` - Denied
- `paid` - Included in payroll

---

**Document End**

*This document serves as the integration guide for all HR System subsystems.*
*For module-specific details, contact the respective team owners.*
