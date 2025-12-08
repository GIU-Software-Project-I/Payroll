# Postman Testing Guide - Payroll Configuration API

**Base URL:** `http://localhost:8000/payroll-configuration`

**Content-Type:** `application/json`

---

## 📋 Table of Contents

1. [Allowance Endpoints](#1-allowance-endpoints)
2. [Pay Type Endpoints](#2-pay-type-endpoints)
3. [Pay Grade Endpoints](#3-pay-grade-endpoints)
4. [Tax Rules Endpoints](#4-tax-rules-endpoints)
5. [Payroll Policies Endpoints](#5-payroll-policies-endpoints)
6. [Signing Bonus Endpoints](#6-signing-bonus-endpoints)
7. [Termination Benefits Endpoints](#7-termination-benefits-endpoints)
8. [Insurance Brackets Endpoints](#8-insurance-brackets-endpoints)
9. [Company Settings Endpoints](#9-company-settings-endpoints)
10. [Backup Endpoints](#10-backup-endpoints)

---

## 1. Allowance Endpoints

### 1.1 Update Allowance
**Method:** `PUT`  
**URL:** `{{baseUrl}}/allowances/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Allowance ID

**Request Body:**
```json
{
  "name": "Transportation Allowance",
  "amount": 500
}
```

**Request Body Fields (all optional):**
- `name` (string, optional) - Allowance name
- `amount` (number, optional, min: 0) - Allowance amount

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Transportation Allowance",
  "amount": 500,
  "status": "draft",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Cannot edit approved configurations
  ```json
  {
    "statusCode": 400,
    "message": "Cannot edit approved configurations. Delete and create a new one.",
    "error": "Bad Request"
  }
  ```
- `404 Not Found` - Allowance not found
  ```json
  {
    "statusCode": 404,
    "message": "Allowance with ID 65a1b2c3d4e5f6g7h8i9j0k1 not found",
    "error": "Not Found"
  }
  ```

---

### 1.2 Delete Allowance
**Method:** `DELETE`  
**URL:** `{{baseUrl}}/allowances/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Allowance ID

**Request Body:** None

**Success Response (204 No Content):**
No response body

**Error Responses:**
- `404 Not Found` - Allowance not found
  ```json
  {
    "statusCode": 404,
    "message": "Allowance with ID 65a1b2c3d4e5f6g7h8i9j0k1 not found",
    "error": "Not Found"
  }
  ```

---

### 1.3 Approve Allowance
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/allowances/:id/approve`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Allowance ID

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3"
}
```

**Request Body Fields:**
- `approvedBy` (string, required) - Employee ID of the Payroll Manager approving

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Transportation Allowance",
  "amount": 500,
  "status": "approved",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3",
  "approvedAt": "2024-01-15T12:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Only DRAFT configurations can be approved
  ```json
  {
    "statusCode": 400,
    "message": "Only DRAFT configurations can be approved",
    "error": "Bad Request"
  }
  ```
- `404 Not Found` - Allowance not found

---

### 1.4 Reject Allowance
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/allowances/:id/reject`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Allowance ID

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3",
  "rejectionReason": "Amount exceeds company policy limit"
}
```

**Request Body Fields:**
- `approvedBy` (string, required) - Employee ID of the Payroll Manager rejecting
- `rejectionReason` (string, optional) - Reason for rejection

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Transportation Allowance",
  "amount": 500,
  "status": "rejected",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3",
  "approvedAt": "2024-01-15T12:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Only DRAFT configurations can be rejected
- `404 Not Found` - Allowance not found

---

## 2. Pay Type Endpoints

### 2.1 Update Pay Type
**Method:** `PUT`  
**URL:** `{{baseUrl}}/pay-types/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Pay Type ID

**Request Body:**
```json
{
  "type": "Monthly",
  "amount": 10000
}
```

**Request Body Fields (all optional):**
- `type` (string, optional) - Pay type (e.g., "Hourly", "Daily", "Weekly", "Monthly")
- `amount` (number, optional, min: 6000) - Pay amount

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "type": "Monthly",
  "amount": 10000,
  "status": "draft",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Cannot edit approved configurations
- `404 Not Found` - Pay type not found

---

### 2.2 Delete Pay Type
**Method:** `DELETE`  
**URL:** `{{baseUrl}}/pay-types/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Pay Type ID

**Success Response (204 No Content):** No response body

---

### 2.3 Approve Pay Type
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/pay-types/:id/approve`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3"
}
```

**Success Response (200 OK):** Updated pay type with status "approved"

---

### 2.4 Reject Pay Type
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/pay-types/:id/reject`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3",
  "rejectionReason": "Invalid pay type"
}
```

**Success Response (200 OK):** Updated pay type with status "rejected"

---

## 3. Pay Grade Endpoints

### 3.1 Update Pay Grade
**Method:** `PUT`  
**URL:** `{{baseUrl}}/pay-grades/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Pay Grade ID

**Request Body:**
```json
{
  "grade": "Senior Manager",
  "baseSalary": 15000,
  "grossSalary": 18000
}
```

**Request Body Fields (all optional):**
- `grade` (string, optional) - Pay grade name
- `baseSalary` (number, optional, min: 6000) - Base salary
- `grossSalary` (number, optional, min: 6000) - Gross salary

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "grade": "Senior Manager",
  "baseSalary": 15000,
  "grossSalary": 18000,
  "status": "draft",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 3.2 Delete Pay Grade
**Method:** `DELETE`  
**URL:** `{{baseUrl}}/pay-grades/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Success Response (204 No Content):** No response body

---

### 3.3 Approve Pay Grade
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/pay-grades/:id/approve`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3"
}
```

---

### 3.4 Reject Pay Grade
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/pay-grades/:id/reject`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3",
  "rejectionReason": "Salary range not aligned with market rates"
}
```

---

## 4. Tax Rules Endpoints

### 4.1 Update Tax Rule
**Method:** `PUT`  
**URL:** `{{baseUrl}}/tax-rules/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Tax Rule ID

**Request Body:**
```json
{
  "name": "Income Tax 2024",
  "description": "Updated tax rules for fiscal year 2024",
  "rate": 15.5
}
```

**Request Body Fields (all optional):**
- `name` (string, optional) - Tax rule name
- `description` (string, optional) - Tax rule description
- `rate` (number, optional, min: 0) - Tax rate percentage

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Income Tax 2024",
  "description": "Updated tax rules for fiscal year 2024",
  "rate": 15.5,
  "status": "draft",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 4.2 Delete Tax Rule
**Method:** `DELETE`  
**URL:** `{{baseUrl}}/tax-rules/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Success Response (204 No Content):** No response body

---

### 4.3 Approve Tax Rule
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/tax-rules/:id/approve`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3"
}
```

---

### 4.4 Reject Tax Rule
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/tax-rules/:id/reject`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3",
  "rejectionReason": "Tax rate not compliant with current legislation"
}
```

---

## 5. Payroll Policies Endpoints

### 5.1 Update Payroll Policy
**Method:** `PUT`  
**URL:** `{{baseUrl}}/policies/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Payroll Policy ID

**Request Body:**
```json
{
  "policyName": "Overtime Policy 2024",
  "policyType": "Allowance",
  "description": "Updated overtime compensation policy",
  "effectiveDate": "2024-01-01T00:00:00.000Z",
  "ruleDefinition": {
    "percentage": 50,
    "fixedAmount": 0,
    "thresholdAmount": 40
  },
  "applicability": "All Employees"
}
```

**Request Body Fields (all optional):**
- `policyName` (string, optional) - Policy name
- `policyType` (enum, optional) - One of: "Deduction", "Allowance", "Benefit", "Misconduct", "Leave"
- `description` (string, optional) - Policy description
- `effectiveDate` (date string, optional) - Effective date (ISO 8601 format)
- `ruleDefinition` (object, optional) - Rule definition object:
  - `percentage` (number, 0-100) - Percentage value
  - `fixedAmount` (number, min: 0) - Fixed amount
  - `thresholdAmount` (number, min: 1) - Threshold amount
- `applicability` (enum, optional) - One of: "All Employees", "Full Time Employees", "Part Time Employees", "Contractors"

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "policyName": "Overtime Policy 2024",
  "policyType": "Allowance",
  "description": "Updated overtime compensation policy",
  "effectiveDate": "2024-01-01T00:00:00.000Z",
  "ruleDefinition": {
    "percentage": 50,
    "fixedAmount": 0,
    "thresholdAmount": 40
  },
  "applicability": "All Employees",
  "status": "draft",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 5.2 Delete Payroll Policy
**Method:** `DELETE`  
**URL:** `{{baseUrl}}/policies/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Success Response (204 No Content):** No response body

---

### 5.3 Approve Payroll Policy
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/policies/:id/approve`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3"
}
```

---

### 5.4 Reject Payroll Policy
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/policies/:id/reject`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3",
  "rejectionReason": "Policy conflicts with existing regulations"
}
```

---

## 6. Signing Bonus Endpoints

### 6.1 Update Signing Bonus
**Method:** `PUT`  
**URL:** `{{baseUrl}}/signing-bonuses/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Signing Bonus ID

**Request Body:**
```json
{
  "positionName": "Senior Software Engineer",
  "amount": 5000
}
```

**Request Body Fields (all optional):**
- `positionName` (string, optional) - Position name
- `amount` (number, optional, min: 0) - Signing bonus amount

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "positionName": "Senior Software Engineer",
  "amount": 5000,
  "status": "draft",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 6.2 Delete Signing Bonus
**Method:** `DELETE`  
**URL:** `{{baseUrl}}/signing-bonuses/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Success Response (204 No Content):** No response body

---

### 6.3 Approve Signing Bonus
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/signing-bonuses/:id/approve`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3"
}
```

---

### 6.4 Reject Signing Bonus
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/signing-bonuses/:id/reject`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3",
  "rejectionReason": "Amount exceeds budget allocation"
}
```

---

## 7. Termination Benefits Endpoints

### 7.1 Update Termination Benefit
**Method:** `PUT`  
**URL:** `{{baseUrl}}/termination-benefits/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Path Parameters:**
- `id` (string, required) - Termination Benefit ID

**Request Body:**
```json
{
  "name": "Severance Package",
  "amount": 30000,
  "terms": "3 months salary for employees with 5+ years of service"
}
```

**Request Body Fields (all optional):**
- `name` (string, optional) - Benefit name
- `amount` (number, optional, min: 0) - Benefit amount
- `terms` (string, optional) - Terms and conditions

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Severance Package",
  "amount": 30000,
  "terms": "3 months salary for employees with 5+ years of service",
  "status": "draft",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": null,
  "approvedAt": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### 7.2 Delete Termination Benefit
**Method:** `DELETE`  
**URL:** `{{baseUrl}}/termination-benefits/:id`  
**Phase:** Phase 4 - REQ-PY-18

**Success Response (204 No Content):** No response body

---

### 7.3 Approve Termination Benefit
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/termination-benefits/:id/approve`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3"
}
```

---

### 7.4 Reject Termination Benefit
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/termination-benefits/:id/reject`  
**Phase:** Phase 4 - REQ-PY-18

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k3",
  "rejectionReason": "Terms not compliant with labor law"
}
```

---

## 8. Insurance Brackets Endpoints

### 8.1 Approve Insurance Bracket
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/insurance-brackets/:id/approve`  
**Phase:** Phase 5 - REQ-PY-22 (HR Manager approval)

**Path Parameters:**
- `id` (string, required) - Insurance Bracket ID

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k4"
}
```

**Request Body Fields:**
- `approvedBy` (string, required) - Employee ID of the HR Manager approving

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Social Insurance",
  "amount": 0,
  "minSalary": 5000,
  "maxSalary": 20000,
  "employeeRate": 11,
  "employerRate": 18.75,
  "status": "approved",
  "createdBy": "65a1b2c3d4e5f6g7h8i9j0k2",
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k4",
  "approvedAt": "2024-01-15T12:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**Note:** Insurance Brackets are approved by HR Manager (not Payroll Manager)

---

### 8.2 Reject Insurance Bracket
**Method:** `PATCH`  
**URL:** `{{baseUrl}}/insurance-brackets/:id/reject`  
**Phase:** Phase 5 - REQ-PY-22 (HR Manager approval)

**Request Body:**
```json
{
  "approvedBy": "65a1b2c3d4e5f6g7h8i9j0k4",
  "rejectionReason": "Rates not compliant with social insurance law"
}
```

**Note:** Insurance Brackets cannot be deleted (excluded from Phase 4 delete operations)

---

## 9. Company Settings Endpoints

### 9.1 Get Company-Wide Settings
**Method:** `GET`  
**URL:** `{{baseUrl}}/company-settings`  
**Phase:** Phase 3 - REQ-PY-15

**Path Parameters:** None  
**Request Body:** None

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "payDate": "2024-01-25T00:00:00.000Z",
  "timeZone": "Africa/Cairo",
  "currency": "EGP",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Note:** If no settings exist, default settings will be created automatically.

---

### 9.2 Update Company-Wide Settings
**Method:** `PUT`  
**URL:** `{{baseUrl}}/company-settings`  
**Phase:** Phase 3 - REQ-PY-15

**Request Body:**
```json
{
  "payDate": "2024-01-25T00:00:00.000Z",
  "timeZone": "Africa/Cairo",
  "currency": "EGP"
}
```

**Request Body Fields (all optional):**
- `payDate` (date string, optional) - Pay date (ISO 8601 format)
- `timeZone` (string, optional) - Time zone (e.g., "Africa/Cairo", "UTC")
- `currency` (string, optional) - Currency code (e.g., "EGP", "USD")

**Success Response (200 OK):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "payDate": "2024-01-25T00:00:00.000Z",
  "timeZone": "Africa/Cairo",
  "currency": "EGP",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

## 10. Backup Endpoints

### 10.1 Create Backup
**Method:** `POST`  
**URL:** `{{baseUrl}}/backup/create`  
**Phase:** Phase 3 - REQ-PY-16

**Request Body (optional):**
```json
{
  "name": "payroll-config-backup-2024-01-15",
  "oplog": false,
  "dumpDbUsersAndRoles": false
}
```

**Request Body Fields (all optional):**
- `name` (string, optional) - Backup name (default: "payroll-config-backup")
- `oplog` (boolean, optional) - Include oplog (default: false)
- `dumpDbUsersAndRoles` (boolean, optional) - Dump users and roles (default: false)

**Success Response (201 Created):**
```json
{
  "message": "Backup created successfully",
  "filename": "payroll-config-backup-2024-01-15.tar.gz",
  "path": "/path/to/backups/payroll-config-backup-2024-01-15.tar.gz",
  "size": 1024000,
  "createdAt": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Backup failed
  ```json
  {
    "statusCode": 400,
    "message": "Backup failed: [error message]",
    "error": "Bad Request"
  }
  ```

---

### 10.2 List Backups
**Method:** `GET`  
**URL:** `{{baseUrl}}/backup/list`  
**Phase:** Phase 3 - REQ-PY-16

**Path Parameters:** None  
**Request Body:** None

**Success Response (200 OK):**
```json
[
  {
    "filename": "payroll-config-backup-2024-01-15.tar.gz",
    "path": "/path/to/backups/payroll-config-backup-2024-01-15.tar.gz",
    "size": 1024000,
    "createdAt": "2024-01-15T12:00:00.000Z"
  },
  {
    "filename": "payroll-config-backup-2024-01-14.tar.gz",
    "path": "/path/to/backups/payroll-config-backup-2024-01-14.tar.gz",
    "size": 1023000,
    "createdAt": "2024-01-14T12:00:00.000Z"
  }
]
```

---

### 10.3 Delete Backup
**Method:** `DELETE`  
**URL:** `{{baseUrl}}/backup/:filename`  
**Phase:** Phase 3 - REQ-PY-16

**Path Parameters:**
- `filename` (string, required) - Backup filename (e.g., "payroll-config-backup-2024-01-15.tar.gz")

**Request Body:** None

**Success Response (204 No Content):** No response body

**Error Responses:**
- `400 Bad Request` - Failed to delete backup
  ```json
  {
    "statusCode": 400,
    "message": "Failed to delete backup: [error message]",
    "error": "Bad Request"
  }
  ```

---

## 🔄 Common Workflow Examples

### Example 1: Approve a Configuration
1. **Update** configuration (PUT) - Only works if status is DRAFT
2. **Approve** configuration (PATCH /approve) - Changes status to APPROVED
3. **Try to Update** again - Will fail with "Cannot edit approved configurations"
4. **Delete** configuration (DELETE) - Works even if APPROVED
5. Create new configuration (Phase 1-2) - Can create new one after deletion

### Example 2: Reject a Configuration
1. **Update** configuration (PUT) - Only works if status is DRAFT
2. **Reject** configuration (PATCH /reject) - Changes status to REJECTED
3. **Update** again - Works because status is REJECTED (not APPROVED)
4. **Approve** after fixing - Can approve after updating

### Example 3: Insurance Bracket Workflow
1. **Approve** Insurance Bracket (PATCH /approve) - HR Manager approval
2. **Cannot Delete** - Insurance Brackets cannot be deleted (no DELETE endpoint)
3. **Cannot Update** - Update endpoint not available for Insurance Brackets

---

## ⚠️ Important Notes

### Status Values
- `draft` - Configuration is in draft state (can be edited, approved, or rejected)
- `approved` - Configuration is approved (cannot be edited, can be deleted)
- `rejected` - Configuration is rejected (can be edited, approved, or rejected)

### Edit Restriction
- **Phase 4 Requirement:** Even Payroll Manager cannot edit after approval
- **Behavior:** Update endpoints will return 400 error if status is "approved"
- **Solution:** Delete the approved configuration and create a new one (Phase 1-2)

### Delete Restrictions
- **Insurance Brackets:** Cannot be deleted (no DELETE endpoint)
- **All Other Configs:** Can be deleted regardless of status (DRAFT, APPROVED, or REJECTED)

### Approval Workflow
- **Phase 4:** Payroll Manager approves all configs except Insurance
- **Phase 5:** HR Manager approves Insurance Brackets only
- **Requirement:** Only DRAFT configurations can be approved/rejected

---

## 🧪 Testing Checklist

### Phase 3 Testing
- [ ] Get company settings
- [ ] Update company settings
- [ ] Create backup
- [ ] List backups
- [ ] Delete backup

### Phase 4 Testing
- [ ] Update each config type (DRAFT status)
- [ ] Try to update APPROVED config (should fail)
- [ ] Approve configuration
- [ ] Reject configuration
- [ ] Delete APPROVED configuration
- [ ] Delete DRAFT configuration

### Phase 5 Testing
- [ ] Approve Insurance Bracket (HR Manager)
- [ ] Reject Insurance Bracket (HR Manager)
- [ ] Verify Insurance Bracket cannot be deleted

---

## 📝 Postman Collection Setup

### Environment Variables
Create a Postman environment with:
- `baseUrl`: `http://localhost:8000/payroll-configuration`
- `testAllowanceId`: (Use actual ID from database)
- `testPayTypeId`: (Use actual ID from database)
- `testPayGradeId`: (Use actual ID from database)
- `testTaxRuleId`: (Use actual ID from database)
- `testPolicyId`: (Use actual ID from database)
- `testSigningBonusId`: (Use actual ID from database)
- `testTerminationBenefitId`: (Use actual ID from database)
- `testInsuranceBracketId`: (Use actual ID from database)
- `payrollManagerId`: (Employee ID of Payroll Manager)
- `hrManagerId`: (Employee ID of HR Manager)

### Headers
All requests should include:
```
Content-Type: application/json
```

If authentication is enabled, also include:
```
Authorization: Bearer <your-jwt-token>
```

---

**Last Updated:** 2024  
**API Version:** 1.0  
**Base URL:** `http://localhost:8000/payroll-configuration`

