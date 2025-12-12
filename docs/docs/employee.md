# Employee Profile Module Documentation

## Overview

The Employee Profile Module manages employee self-service features, manager team views, and HR administrative functions for employee data management.

---

## API Routes

### Self-Service Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/employee-profile/me` | Get own profile |
| PATCH | `/employee-profile/me/contact-info` | Update contact info |
| PATCH | `/employee-profile/me/bio` | Update biography/photo |
| POST | `/employee-profile/me/correction-request` | Submit correction request |
| GET | `/employee-profile/me/correction-requests` | Get own correction requests (paginated) |
| PATCH | `/employee-profile/me/correction-requests/:requestId/cancel` | Cancel own pending request |

### Manager Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/employee-profile/team` | Get team profiles |
| GET | `/employee-profile/team/paginated` | Get team profiles (paginated) |

### HR Admin Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/employee-profile/admin/employees` | Get all employees (paginated) |
| GET | `/employee-profile/admin/search` | Search employees (paginated) |
| GET | `/employee-profile/admin/change-requests` | Get all change requests (paginated) |
| GET | `/employee-profile/admin/change-requests/:requestId` | Get single change request |
| PATCH | `/employee-profile/admin/change-requests/:requestId/process` | Process (approve/reject) request |
| GET | `/employee-profile/admin/change-requests/count/pending` | Get pending requests count |
| GET | `/employee-profile/admin/stats/by-status` | Employee count by status |
| GET | `/employee-profile/admin/stats/by-department` | Employee count by department |
| GET | `/employee-profile/:id` | Get employee profile (admin view) |
| PATCH | `/employee-profile/:id` | Update employee profile |
| PATCH | `/employee-profile/:id/deactivate` | Deactivate employee |
| PATCH | `/employee-profile/:id/role` | Assign role to employee |

---

## Edge Cases Covered

### 1. Duplicate Pending Change Request Prevention
- **Scenario:** Employee tries to submit a new correction request while having an existing PENDING request
- **Behavior:** Throws `ConflictException` with message explaining they must wait or cancel existing request

### 2. Status Transition Validation
- **Scenario:** HR tries to change employee status to an invalid state
- **Behavior:** Validates against status transition matrix, throws `BadRequestException` for invalid transitions
- **Terminal State:** TERMINATED cannot transition to any other state

### 3. Terminated Employee Operations
- **Scenario:** Operations attempted on terminated employees
- **Behavior:**
  - Cannot update contact info → `BadRequestException`
  - Cannot update bio → `BadRequestException`
  - Cannot submit correction request → `BadRequestException`
  - Cannot be deactivated again → `BadRequestException`
  - Cannot be assigned a role → `BadRequestException`

### 4. Change Request Cancellation Ownership
- **Scenario:** Employee tries to cancel another employee's change request
- **Behavior:** Throws `BadRequestException` - can only cancel own requests

### 5. Change Request Processing State
- **Scenario:** HR tries to process an already processed (APPROVED/REJECTED/CANCELED) request
- **Behavior:** Throws `BadRequestException` - only PENDING requests can be processed

### 6. Rejection Reason Requirement
- **Scenario:** HR rejects a change request without providing a reason
- **Behavior:** Throws `BadRequestException` - rejection reason is required

### 7. Auto-Cancel Pending Requests on Deactivation
- **Scenario:** Employee with pending change requests is deactivated
- **Behavior:** All PENDING change requests are automatically CANCELED

### 8. Role Assignment Validation
- **Scenario:** HR assigns an inactive or non-existent role
- **Behavior:**
  - Non-existent role → `NotFoundException`
  - Inactive role → `BadRequestException`

### 9. ObjectId Validation
- **Scenario:** Invalid MongoDB ObjectId format provided
- **Behavior:** Throws `BadRequestException` with field name

### 10. Manager Team View - No Position
- **Scenario:** Manager has no primaryPositionId assigned
- **Behavior:** Returns empty array (no team to show)

### 11. Unique National ID Validation
- **Scenario:** Admin tries to update national ID to one that already exists
- **Behavior:** Throws `ConflictException` - national ID must be unique

### 12. Unique Work Email Validation
- **Scenario:** Admin tries to update work email to one that already exists
- **Behavior:** Throws `ConflictException` - work email must be unique

---

## Status Transition Matrix

| Current Status | Allowed Transitions |
|----------------|---------------------|
| PROBATION | ACTIVE, TERMINATED |
| ACTIVE | ON_LEAVE, SUSPENDED, INACTIVE, RETIRED, TERMINATED |
| ON_LEAVE | ACTIVE, TERMINATED |
| SUSPENDED | ACTIVE, TERMINATED |
| INACTIVE | ACTIVE, TERMINATED |
| RETIRED | TERMINATED |
| TERMINATED | (none - terminal state) |

---

## DTOs

### UpdateContactInfoDto
```typescript
{
  mobilePhone?: string;
  homePhone?: string;
  personalEmail?: string; // @IsEmail
  address?: {
    city?: string;
    streetAddress?: string;
    country?: string;
  }
}
```

### UpdateBioDto
```typescript
{
  biography?: string;
  profilePictureUrl?: string; // @IsUrl
}
```

### CreateCorrectionRequestDto
```typescript
{
  requestDescription: string; // @IsNotEmpty
  reason?: string;
}
```

### AdminUpdateProfileDto
```typescript
{
  // Personal Information
  firstName?: string;
  middleName?: string;
  lastName?: string;
  nationalId?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  dateOfBirth?: string;

  // Contact Information
  personalEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
  address?: AddressDto;

  // Profile
  biography?: string;
  profilePictureUrl?: string;

  // Organization
  primaryPositionId?: string;
  primaryDepartmentId?: string;
  supervisorPositionId?: string;

  // Employment
  status?: EmployeeStatus;
  contractType?: ContractType;
  workType?: WorkType;
  dateOfHire?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  workEmail?: string;

  // Banking
  bankName?: string;
  bankAccountNumber?: string;
}
```

### AdminAssignRoleDto
```typescript
{
  accessProfileId: string; // @IsMongoId, @IsNotEmpty
}
```

### SearchEmployeesDto
```typescript
{
  query?: string;
  status?: EmployeeStatus;
  departmentId?: string;
  positionId?: string;
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
}
```

### ProcessChangeRequestDto
```typescript
{
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string; // Required when status is REJECTED
}
```

### PaginatedResult<T>
```typescript
{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}
```

---

## TODOs for Future Implementation

### Authorization & Security
- Implement AuthGuard for all routes
- Implement RolesGuard with role-based access
- Add @Roles decorator with appropriate roles per route
- Implement JWT token validation

### Notifications
- N-037: Profile updated notification (to employee & HR)
- N-040: Profile change request submitted notification (to HR/Manager)

### Integration with Other Modules
- Sync employee status changes with Payroll Module (block payment for TERMINATED)
- Sync employee status changes with Time Management Module
- Trigger Org Structure Module update when position/department changes

---

## Files Modified/Created

### New Files
- `dto/employee-profile/search-employees.dto.ts`
- `dto/employee-profile/process-change-request.dto.ts`

### Modified Files
- `dto/employee-profile/admin-update-profile.dto.ts` - Added all HR-editable fields
- `services/employee-profile.service.ts` - Complete implementation with edge cases
- `controllers/employee-profile.controller.ts` - All routes implemented

### Test Files
- `testing/employee/employee.http` - 55+ test cases

---

*Document Last Updated: December 12, 2025*

