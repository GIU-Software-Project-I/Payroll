# Payroll Execution Subsystem Documentation

## Overview
The Payroll Execution subsystem handles the complete lifecycle of payroll processing, including signing bonuses, termination benefits, payroll run initiation, multi-step approval workflow, and payslip generation. It enforces Egyptian labor law compliance and organizational business rules.

---

## Table of Contents
1. [Business Rules](#business-rules)
2. [User Stories & Requirements](#user-stories--requirements)
3. [State Machines](#state-machines)
4. [API Endpoints](#api-endpoints)
5. [Workflows](#workflows)
6. [Edge Cases & Validations](#edge-cases--validations)
7. [Role-Based Access Control](#role-based-access-control)

---

## Business Rules

### General Rules
- **BR 1, 66**: All employees must have a valid contract to receive compensation
- **BR 4, 60**: Minimum wage enforcement (6,000 EGP) - system validates before processing
- **BR 30**: Multi-step approval workflow (Payroll Specialist → Manager → Finance)
- **BR 34, 35**: Calculation order is critical (Gross → Deductions → Net)
- **BR 63**: All calculations must be validated before creating payroll drafts

### Signing Bonus Rules
- **BR 24, 28**: Signing bonuses are disbursed only once
- **BR 25**: Only authorized personnel can edit/approve bonuses
- Valid states: `pending`, `approved`, `paid`, `rejected`, `cancelled`

### Termination Benefit Rules
- **BR 26**: Termination benefits require HR clearance before processing
- **BR 27**: Resignation benefits require manager approval
- **BR 29, 56**: System auto-calculates severance, unused leave, notice period pay
- Valid states: `pending`, `processing`, `approved`, `paid`, `rejected`

### Payroll Processing Rules
- **BR 18**: Finance staff marks payroll as "paid" after bank transfer
- **BR 34**: Gross-to-net calculation sequence must be maintained
- **REQ-PY-2**: System prorates salary for mid-month hires/terminations
- **REQ-PY-23**: Auto-includes signing bonuses and termination benefits in payroll
- **Net Pay Formula**: `netPay = (netSalary - penalties + overtime + refunds + bonuses + benefits)`
  - **netSalary** = `proratedGross - taxes - insurance`
  - **penalties** = `misconductPenalties + missingWorkPenalty + latenessPenalty`
  - **missingWorkPenalty** = `(missingWorkMinutes / 60) × hourlyRate`
  - **latenessPenalty** = `(latenessMinutes / 60) × hourlyRate × 0.5`
  - **overtime** = `(overtimeMinutes / 60) × hourlyRate × 1.5`
  - **refunds** = approved refunds from Payroll Tracking
  - **bonuses** = approved signing bonuses
  - **benefits** = approved termination benefits

### Time Management Integration
- **Working Hours**: System retrieves actual work minutes from attendance records
- **Overtime**: Calculated at 1.5x hourly rate for approved overtime minutes
- **Lateness**: Deducted at 50% of hourly rate for late arrivals
- **Missing Work**: Full hourly rate deducted for missing work time
- **Attendance Data**: Includes scheduled vs actual work minutes, overtime, lateness

### Leaves Integration
- **Unpaid Leave**: Days with unpaid leave are deducted from working days
- **Paid Leave**: Does not affect salary calculation
- **Leave Types**: System checks if leave type is marked as paid or unpaid
- **Period Calculation**: Only counts leave days within the payroll period

---

## User Stories & Requirements

### Signing Bonuses
- **REQ-PY-28**: View all signing bonuses (filterable by status)
- **REQ-PY-29**: Edit signing bonus amount/details (before approval)

### Termination Benefits
- **REQ-PY-31**: Approve termination/resignation benefits
- **REQ-PY-32**: Edit termination benefit amounts

### Payroll Initiation
- **REQ-PY-23**: Create payroll initiation for specific period
- **REQ-PY-24**: Approve payroll initiation (triggers processing)
- **REQ-PY-26**: Edit draft payroll before approval

### Payroll Approval Workflow
- **REQ-PY-6**: View payroll draft before approval
- **REQ-PY-7**: Freeze/lock payroll to prevent changes
- **REQ-PY-15**: Finance approves payroll (final step)
- **REQ-PY-19**: Unfreeze payroll with reason (emergency corrections)
- **REQ-PY-22**: Manager approves payroll (step 1 of approval)

### Payslip Generation
- **REQ-PY-8**: Generate and distribute payslips after approval

---

## State Machines

### Signing Bonus States
```
pending → approved → paid
   ↓         ↓
rejected  cancelled
```
**Valid Transitions:**
- `pending → approved`
- `pending → rejected`
- `approved → paid`
- `approved → cancelled`

### Termination Benefit States
```
pending → processing → approved → paid
   ↓          ↓           ↓
rejected   rejected   rejected
```
**Valid Transitions:**
- `pending → processing`
- `pending → rejected`
- `processing → approved`
- `processing → rejected`
- `approved → paid`
- `approved → rejected`

### Payroll Run States
```
draft → pending_manager_approval → pending_finance_approval → approved
  ↓              ↓                         ↓                     ↓
rejected     rejected                  rejected              frozen → paid
```
**Valid Transitions:**
- `draft → pending_manager_approval`
- `draft → rejected`
- `pending_manager_approval → pending_finance_approval`
- `pending_manager_approval → rejected`
- `pending_finance_approval → approved`
- `pending_finance_approval → rejected`
- `approved → frozen`
- `frozen → paid`
- `frozen → approved` (unfreeze)

---

## API Endpoints

### Base URL
```
/api/payroll-execution
```

### Signing Bonus Endpoints

#### Get All Signing Bonuses
```http
GET /signing-bonuses
Query Params: ?status=pending|approved|paid|rejected|cancelled
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER, FINANCE_STAFF
```

#### Get Signing Bonus by ID
```http
GET /signing-bonuses/:id
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER, FINANCE_STAFF
```

#### Edit Signing Bonus
```http
POST /signing-bonuses/:id/edit
Content-Type: application/json
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER

Body:
{
  "amount": 5000,
  "note": "Adjusted amount",
  "paymentDate": "2025-12-31T00:00:00.000Z"
}

Validations:
- Cannot edit if status is 'paid' or 'approved'
- Amount must be positive
- Payment date cannot be in the past
```

#### Approve Signing Bonus
```http
POST /signing-bonuses/:id/approve
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER

Validations:
- Must be in 'pending' state
- Cannot approve twice (BR 28)
- Employee must have valid contract
```

#### Approve All Pending Signing Bonuses
```http
POST /approve-signing-bonuses
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER

Returns: { approvedCount: number }
```

---

### Termination Benefit Endpoints

#### Get All Termination Benefits
```http
GET /termination-benefits
Query Params: ?status=pending|processing|approved|paid|rejected
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER, FINANCE_STAFF
```

#### Get Termination Benefit by ID
```http
GET /termination-benefits/:id
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER, FINANCE_STAFF
```

#### Edit Termination Benefit
```http
POST /termination-benefits/:id/edit
Content-Type: application/json
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER

Body:
{
  "givenAmount": 15000,
  "note": "Adjusted based on contract"
}

Validations:
- Cannot edit if status is 'paid' or 'approved'
- Amount must be non-negative
```

#### Approve Termination Benefit
```http
POST /termination-benefits/:id/approve
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER

Validations:
- Must be in 'pending' or 'processing' state
- Employee must have HR clearance (BR 26)
- Employee must be marked as terminated
```

---

### Payroll Initiation Endpoints

#### Create Payroll Initiation
```http
POST /initiation
Content-Type: application/json
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST

Body:
{
  "payrollPeriod": "2025-12-31T00:00:00.000Z",
  "entity": "TechCorp Egypt",
  "employees": 0,
  "exceptions": 0,
  "totalnetpay": 0
}

Validations:
- No duplicate payroll period (BR 63)
- Period must be valid date
- Cannot create for future periods
```

#### Get Payroll Initiation by ID
```http
GET /initiation/:id
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER, FINANCE_STAFF
```

#### Edit Payroll Initiation
```http
PATCH /initiation/:id
Content-Type: application/json
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST

Body:
{
  "payrollPeriod": "2025-12-31T23:59:59.999Z",
  "entity": "Updated Entity",
  "employees": 50,
  "exceptions": 2,
  "totalnetpay": 250000
}

Validations:
- Can only edit if status is 'draft' or 'rejected'
- Cannot edit locked/frozen payroll
```

#### Approve Payroll Initiation
```http
POST /initiation/:id/approve
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST

Effect:
- Triggers full payroll processing (REQ-PY-23)
- Transitions to 'pending_manager_approval'
- Processes all employees in period
- Auto-includes signing bonuses and termination benefits
```

#### Reject Payroll Initiation
```http
POST /initiation/:id/reject
Content-Type: application/json
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER, FINANCE_STAFF

Body:
{
  "reason": "Incorrect period selected"
}

Validations:
- Reason is required
- Can reject from any approval stage
```

---

### Payroll Approval Workflow Endpoints

#### Manager Approval
```http
POST /:payrollRunId/approve
Authorization: Bearer token
Roles: HR_MANAGER

Validations:
- Must be in 'pending_manager_approval' state
- Transitions to 'pending_finance_approval'
```

#### Finance Approval
```http
POST /:payrollRunId/approve-finance
Authorization: Bearer token
Roles: FINANCE_STAFF

Validations:
- Must be in 'pending_finance_approval' state
- Marks paymentStatus as 'paid' (BR 18)
- Transitions to 'approved'
```

#### Freeze Payroll
```http
POST /:payrollRunId/freeze
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER, FINANCE_STAFF

Effect:
- Locks payroll to prevent unauthorized changes (REQ-PY-7)
- Transitions to 'frozen'
```

#### Unfreeze Payroll
```http
POST /:payrollRunId/unfreeze
Content-Type: application/json
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER

Body:
{
  "reason": "Emergency correction needed"
}

Validations:
- Must be in 'frozen' state
- Reason is required (REQ-PY-19)
- Transitions back to 'approved'
```

#### Generate Payslips
```http
POST /:payrollRunId/generate-payslips
Content-Type: application/json
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, FINANCE_STAFF

Body: {}

Validations:
- Must be in 'approved' or 'frozen' state
- Cannot generate for draft payrolls
```

---

### Viewing Endpoints

#### Get Payroll Draft/Run Details
```http
GET /draft/:id
Authorization: Bearer token
Roles: PAYROLL_SPECIALIST, HR_MANAGER, FINANCE_STAFF

Returns:
- Complete payroll run details
- All employee pay records
- Signing bonuses included
- Termination benefits included
- Total net pay calculation
```

---

## Workflows

### Complete Payroll Workflow

```
1. CREATE INITIATION (Payroll Specialist)
   POST /initiation
   Status: draft

2. APPROVE INITIATION (Payroll Specialist)
   POST /initiation/:id/approve
   Status: pending_manager_approval
   - System processes all employees
   - Prorates salaries for mid-month hires/terminations
   - Includes approved signing bonuses
   - Includes approved termination benefits

3. MANAGER REVIEW & APPROVAL (HR Manager)
   GET /draft/:id (review)
   POST /:id/approve
   Status: pending_finance_approval

4. FINANCE REVIEW & APPROVAL (Finance Staff)
   GET /draft/:id (review)
   POST /:id/approve-finance
   Status: approved
   Payment Status: paid

5. FREEZE PAYROLL (Any authorized role)
   POST /:id/freeze
   Status: frozen
   - Prevents further modifications

6. GENERATE PAYSLIPS (Payroll Specialist or Finance)
   POST /:id/generate-payslips
   - Creates individual payslips for all employees

7. UNFREEZE IF NEEDED (Payroll Specialist or Manager)
   POST /:id/unfreeze
   Status: approved
   - Requires reason for audit trail
```

### Signing Bonus Workflow

```
1. BONUS CREATED (during onboarding)
   Status: pending

2. REVIEW BONUSES (Payroll Specialist/Manager)
   GET /signing-bonuses?status=pending

3. EDIT IF NEEDED (before approval)
   POST /signing-bonuses/:id/edit

4. APPROVE BONUS
   POST /signing-bonuses/:id/approve
   Status: approved

5. AUTO-INCLUDE IN PAYROLL
   - System automatically includes in next payroll run
   - Status changes to: paid
   - Can only be disbursed once (BR 28)
```

### Termination Benefit Workflow

```
1. EMPLOYEE TERMINATED (via offboarding)
   - System creates termination benefit record
   Status: pending

2. HR CLEARANCE CHECK (automatic)
   - System validates clearance completed
   Status: processing

3. REVIEW & EDIT (Payroll Specialist/Manager)
   GET /termination-benefits/:id
   POST /termination-benefits/:id/edit

4. APPROVE BENEFIT
   POST /termination-benefits/:id/approve
   Status: approved

5. AUTO-INCLUDE IN PAYROLL
   - System calculates:
     * Severance pay (if applicable)
     * Unused leave balance
     * Notice period pay
   - Included in next payroll run
   Status: paid
```

---

## Edge Cases & Validations

### Duplicate Prevention
- **Duplicate Payroll Period**: Cannot create two payroll runs for same period
- **Duplicate Bonus Disbursement**: BR 28 enforces single disbursement
- **Duplicate Approval**: Cannot approve already approved items

### State Transition Validation
- **Invalid State Changes**: System rejects transitions not in state machine
- **Approval Order**: Finance cannot approve before manager approval
- **Edit Restrictions**: Cannot edit paid/approved items

### Authorization Checks
- **Role-Based Access**: Each endpoint validates user role
- **Fallback Authorization**: Uses EmployeeProfileService if request user missing
- **Contract Validation**: All operations validate active contract (BR 1, 66)

### Calculation Validations
- **Minimum Wage**: System enforces 6,000 EGP minimum (BR 4, 60)
- **Negative Pay Check**: Ensures no employee has negative net pay
- **Proration Logic**: Correct calculations for mid-month hires/terminations
- **Gross-to-Net Order**: Maintains BR 34, 35 calculation sequence
- **Attendance Validation**: Verifies attendance records exist for the period
- **Overtime Approval**: Only includes approved overtime hours
- **Leave Validation**: Confirms leave requests are approved before deduction

### Salary Calculation Process

#### Step 1: Base Calculation
```
proratedGross = (baseSalary + allowances) × (daysWorked / daysInMonth)
```

#### Step 2: Get Attendance Data (Time Management)
```typescript
{
  actualWorkMinutes: number,      // Total minutes actually worked
  scheduledWorkMinutes: number,   // Total minutes scheduled
  overtimeMinutes: number,        // Approved overtime minutes
  latenessMinutes: number,        // Total late minutes
  missingWorkMinutes: number,     // scheduledMinutes - actualMinutes
  workingDays: number            // Days with recorded work
}
```

#### Step 3: Get Leave Data (Leaves Module)
```typescript
unpaidLeaveDays: number  // Approved unpaid leave days in period
```

#### Step 4: Calculate Penalties
```
hourlyRate = baseSalary / (daysInMonth × 8)

misconductPenalties = sum of approved misconduct penalties
missingWorkPenalty = (missingWorkMinutes / 60) × hourlyRate
latenessPenalty = (latenessMinutes / 60) × hourlyRate × 0.5

totalPenalties = misconductPenalties + missingWorkPenalty + latenessPenalty
```

#### Step 5: Calculate Overtime Pay
```
overtimePay = (overtimeMinutes / 60) × hourlyRate × 1.5
```

#### Step 6: Calculate Deductions
```
taxes = calculated based on tax brackets
insurance = calculated based on insurance brackets
totalDeductions = taxes + insurance
```

#### Step 7: Calculate Net Pay
```
netSalary = proratedGross - totalDeductions
netPay = netSalary - totalPenalties + overtimePay + refunds + bonuses + benefits
```

#### Step 8: Minimum Wage Enforcement
```
proratedMinimumWage = (minimumWage / daysInMonth) × daysWorked
if (netPay < proratedMinimumWage) {
  netPay = proratedMinimumWage
  // Flag as exception
}
```

### Date Validations
- **Future Periods**: Cannot create payroll for future dates
- **Past Payment Dates**: Cannot set past dates for signing bonuses
- **Period Overlap**: Validates no overlapping payroll periods

### Clearance Validations
- **HR Clearance**: Termination benefits require clearance (BR 26)
- **Manager Approval**: Resignation benefits need manager sign-off (BR 27)
- **Termination Status**: Employee must be marked as terminated

### Locking Validations
- **Frozen Payroll**: Cannot edit frozen payroll (must unfreeze first)
- **Unfreeze Requirements**: Must provide reason for audit trail
- **Freeze State**: Can only freeze approved payrolls

---

## Role-Based Access Control

### Payroll Specialist (`PAYROLL_SPECIALIST`)
**Permissions:**
- Create payroll initiation
- Edit draft payroll
- Approve payroll initiation (triggers processing)
- View all payroll data
- Edit signing bonuses (before approval)
- Approve signing bonuses
- Edit termination benefits (before approval)
- Approve termination benefits
- Freeze/unfreeze payroll
- Generate payslips

### HR Manager (`HR_MANAGER`)
**Permissions:**
- Approve payroll (manager approval step)
- View all payroll data
- Edit signing bonuses
- Approve signing bonuses
- Edit termination benefits
- Approve termination benefits
- Freeze payroll
- Unfreeze payroll
- Reject payroll at any stage

### Finance Staff (`FINANCE_STAFF`)
**Permissions:**
- Final payroll approval (marks as paid)
- View all payroll data
- Freeze payroll
- Generate payslips
- Reject payroll at finance stage

---

## Data Models

### Signing Bonus
```typescript
{
  employee: ObjectId,              // ref: EmployeeProfile
  amount: Number,                   // positive value
  status: BonusStatus,             // pending|approved|paid|rejected|cancelled
  note: String,
  paymentDate: Date,
  createdBy: ObjectId,
  approvedBy: ObjectId,
  rejectedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Termination Benefit
```typescript
{
  employee: ObjectId,              // ref: EmployeeProfile
  calculatedAmount: Number,        // auto-calculated
  givenAmount: Number,             // can be edited
  status: BenefitStatus,           // pending|processing|approved|paid|rejected
  note: String,
  createdBy: ObjectId,
  approvedBy: ObjectId,
  rejectedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Payroll Initiation
```typescript
{
  payrollPeriod: Date,             // unique constraint
  entity: String,
  employees: Number,
  exceptions: Number,
  totalnetpay: Number,
  status: PayRollStatus,           // draft|pending_manager_approval|...
  paymentStatus: PayRollPaymentStatus, // pending|in_transit|paid|failed
  createdBy: ObjectId,
  approvedBy: ObjectId,
  rejectedBy: ObjectId,
  rejectionReason: String,
  unfreezeReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payroll Run (extends Initiation)
```typescript
{
  ...payrollInitiationFields,
  employeePayRecords: [{
    employee: ObjectId,
    grossPay: Number,
    deductions: Number,
    penalties: {
      misconduct: Number,          // From Payroll Tracking
      missingWork: Number,         // From Time Management
      lateness: Number,            // From Time Management
      total: Number
    },
    overtime: {
      minutes: Number,             // From Time Management
      amount: Number               // Calculated at 1.5x rate
    },
    refunds: Number,               // From Payroll Tracking
    attendance: {
      actualWorkMinutes: Number,
      scheduledWorkMinutes: Number,
      missingWorkMinutes: Number,
      overtimeMinutes: Number,
      latenessMinutes: Number,
      workingDays: Number,
      unpaidLeaveDays: Number      // From Leaves module
    },
    netPay: Number,
    signingBonusIncluded: ObjectId,
    terminationBenefitIncluded: ObjectId,
    prorated: Boolean,
    proratedDays: Number
  }]
}
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid state transition: cannot approve paid bonus",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized: missing or invalid token",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden: insufficient permissions (requires HR_MANAGER)",
  "error": "Forbidden"
}
```

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Payroll initiation not found",
  "error": "Not Found"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Payroll period already exists: 2025-12-31",
  "error": "Conflict"
}
```

---

## Testing Strategy

### Unit Tests
- State transition validation
- Authorization checks
- Calculation logic (proration, gross-to-net)
- Edge case handling

### Integration Tests
- Complete payroll workflow
- Multi-step approval process
- Auto-inclusion of bonuses/benefits
- Freeze/unfreeze operations

### End-to-End Tests
- Full payroll cycle from initiation to payslip generation
- Authorization scenarios (different roles)
- Error scenarios (invalid transitions, unauthorized access)
- Edge cases (duplicate periods, negative pay, missing contracts)

---

## Audit Trail

All operations maintain complete audit trail:
- `createdBy`: User who initiated the action
- `approvedBy`: User who approved
- `rejectedBy`: User who rejected
- `rejectionReason`: Required for rejections
- `unfreezeReason`: Required for unfreeze operations
- `timestamps`: createdAt, updatedAt for all records

---

## Performance Considerations

### Optimizations
- Index on `payrollPeriod` for duplicate prevention
- Populate employee details only when needed
- Batch processing for signing bonus approvals
- Efficient queries with status filters

### Scalability
- Can handle large employee counts (tested with 1000+ employees)
- Pagination support for list endpoints
- Efficient state machine validation (O(1) lookup)

---

## Compliance & Security

### Egyptian Labor Law
- BR 4, 60: Minimum wage enforcement (6,000 EGP)
- BR 1, 66: Contract validation
- BR 26, 27: Clearance and approval requirements
- BR 29, 56: Correct severance calculations

### Security Measures
- JWT-based authentication
- Role-based access control
- Authorization checks on all endpoints
- Audit trail for all operations
- State machine prevents unauthorized transitions

---

## Troubleshooting

### Common Issues

**Issue**: Cannot approve payroll initiation  
**Solution**: Check that status is 'draft' and user has PAYROLL_SPECIALIST role

**Issue**: Finance approval fails  
**Solution**: Ensure manager approval completed first (BR 30 multi-step)

**Issue**: Cannot edit signing bonus  
**Solution**: Check status - can only edit 'pending' bonuses

**Issue**: Payroll shows negative pay for employee  
**Solution**: System validation prevents this - check deductions configuration

**Issue**: Termination benefit not auto-included  
**Solution**: Verify benefit is 'approved' and employee termination is in payroll period

**Issue**: Duplicate payroll period error  
**Solution**: Query existing payroll runs, ensure no overlap with chosen period

---

## Future Enhancements

### Planned Features
- Email notifications for approval steps
- PDF payslip generation
- Integration with bank transfer APIs
- Advanced reporting and analytics
- Payroll amendment/correction workflow
- Multi-currency support

### API Versioning
- Current version: v1
- Breaking changes will increment version
- Deprecation notices provided 6 months in advance

---

## Support & Contact

For technical issues or questions:
- Check this documentation first
- Review HTTP test file for examples
- Consult business rules section for validation logic
- Review state machines for workflow understanding

---

*Last Updated: 2025-12-11*  
*Version: 1.0*  
*Maintained by: Development Team*
