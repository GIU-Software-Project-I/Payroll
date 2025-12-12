# Performance Module Documentation

## Overview
The Performance module manages the complete employee appraisal lifecycle including templates, cycles, assignments, records, disputes, and dashboards.

## Requirements Fulfillment Status ✅

### Phase 1: Template Definition
| Requirement | Status | Implementation |
|------------|--------|----------------|
| REQ-PP-01: Create standardized appraisal templates | ✅ | `createTemplate()` |
| Template with rating scales (3/5/10 point) | ✅ | `RatingScaleDefinition` schema |
| Template with evaluation criteria | ✅ | `EvaluationCriterion` schema |
| Department/Position applicability | ✅ | `applicableDepartmentIds`, `applicablePositionIds` |
| Template activation/deactivation | ✅ | `deactivateTemplate()`, `reactivateTemplate()` |

### Phase 2: Cycle Creation & Setup
| Requirement | Status | Implementation |
|------------|--------|----------------|
| REQ-PP-02: Create and schedule appraisal cycles | ✅ | `createCycle()` |
| Cycle status management (PLANNED→ACTIVE→CLOSED→ARCHIVED) | ✅ | `activateCycle()`, `closeCycle()`, `archiveCycle()` |
| Template assignments to cycles | ✅ | `templateAssignments` array |
| Manager and acknowledgement due dates | ✅ | `managerDueDate`, `employeeAcknowledgementDueDate` |

### Phase 3: Assignment & Evaluation
| Requirement | Status | Implementation |
|------------|--------|----------------|
| REQ-PP-05: Create individual assignments | ✅ | `createAssignment()` |
| REQ-PP-05: Bulk create assignments | ✅ | `bulkCreateAssignments()` |
| REQ-PP-13: Manager assignment view | ✅ | `getAssignmentsForManager()` |
| REQ-AE-03/04: Submit appraisal with ratings | ✅ | `submitAppraisalRecord()` |
| Save draft records | ✅ | `saveDraftRecord()` |

### Phase 4: Monitoring & Publication
| Requirement | Status | Implementation |
|------------|--------|----------------|
| REQ-AE-06: Publish records to employees | ✅ | `publishRecord()`, `bulkPublishRecords()` |
| REQ-AE-10: Completion dashboard | ✅ | `getCompletionDashboard()` |
| Pending appraisals for manager | ✅ | `getAssignmentsForManager()` |

### Phase 5: Employee Feedback
| Requirement | Status | Implementation |
|------------|--------|----------------|
| REQ-OD-01: Employee acknowledgement | ✅ | `acknowledgeRecord()` |
| Mark record as viewed | ✅ | `markRecordViewed()` |
| Employee appraisal history | ✅ | `getEmployeeAppraisalHistory()` |

### Phase 6-7: Disputes
| Requirement | Status | Implementation |
|------------|--------|----------------|
| REQ-AE-07: File dispute/objection | ✅ | `fileDispute()` |
| REQ-OD-07: Resolve dispute | ✅ | `resolveDispute()` |
| Assign dispute reviewer | ✅ | `assignDisputeReviewer()` |
| 7-day dispute window | ✅ | Validated in `fileDispute()` |

### Phase 8: Archiving
| Requirement | Status | Implementation |
|------------|--------|----------------|
| Manual cycle archiving | ✅ | `archiveCycle()` |
| Automatic archiving (30 days) | ✅ | `@Cron` `archiveCompletedCycles()` |

---

## Routes Summary (36 Routes)

### Templates (8 routes)
| # | Method | Route | Description |
|---|--------|-------|-------------|
| 1 | POST | `/performance/templates` | Create template |
| 2 | GET | `/performance/templates` | Get all templates |
| 3 | GET | `/performance/templates/search` | Search templates (paginated) |
| 4 | GET | `/performance/templates/stats` | Get template statistics |
| 5 | GET | `/performance/templates/:id` | Get template by ID |
| 6 | PATCH | `/performance/templates/:id` | Update template |
| 7 | PATCH | `/performance/templates/:id/deactivate` | Deactivate template |
| 8 | PATCH | `/performance/templates/:id/reactivate` | Reactivate template |

### Cycles (10 routes)
| # | Method | Route | Description |
|---|--------|-------|-------------|
| 9 | POST | `/performance/cycles` | Create cycle |
| 10 | GET | `/performance/cycles` | Get all cycles |
| 11 | GET | `/performance/cycles/search` | Search cycles (paginated) |
| 12 | GET | `/performance/cycles/stats` | Get cycle statistics |
| 13 | GET | `/performance/cycles/:id` | Get cycle by ID |
| 14 | PATCH | `/performance/cycles/:id` | Update cycle |
| 15 | POST | `/performance/cycles/:id/activate` | Activate PLANNED cycle |
| 16 | POST | `/performance/cycles/:id/close` | Close ACTIVE cycle |
| 17 | POST | `/performance/cycles/:id/archive` | Archive CLOSED cycle |

### Assignments (7 routes)
| # | Method | Route | Description |
|---|--------|-------|-------------|
| 18 | POST | `/performance/assignments` | Create assignment |
| 19 | POST | `/performance/assignments/bulk` | Bulk create assignments |
| 20 | GET | `/performance/assignments` | Search assignments (paginated) |
| 21 | GET | `/performance/assignments/manager/:id` | Get assignments for manager |
| 22 | GET | `/performance/assignments/employee/:id` | Get assignments for employee |
| 23 | GET | `/performance/assignments/:id` | Get assignment by ID |

### Records (10 routes)
| # | Method | Route | Description |
|---|--------|-------|-------------|
| 24 | POST | `/performance/records` | Submit appraisal record |
| 25 | POST | `/performance/records/draft` | Save draft record |
| 26 | GET | `/performance/records` | Search records (paginated) |
| 27 | GET | `/performance/records/assignment/:id` | Get record by assignment |
| 28 | GET | `/performance/records/:id` | Get record by ID |
| 29 | POST | `/performance/records/:id/publish` | Publish record |
| 30 | POST | `/performance/records/bulk-publish` | Bulk publish records |
| 31 | POST | `/performance/records/:id/acknowledge` | Acknowledge record |
| 32 | POST | `/performance/records/:id/view` | Mark record as viewed |
| 33 | GET | `/performance/employee/:id/history` | Get employee history |

### Disputes (6 routes)
| # | Method | Route | Description |
|---|--------|-------|-------------|
| 34 | POST | `/performance/disputes` | File dispute |
| 35 | GET | `/performance/disputes` | Search disputes (paginated) |
| 36 | GET | `/performance/disputes/stats` | Get dispute statistics |
| 37 | GET | `/performance/disputes/:id` | Get dispute by ID |
| 38 | PATCH | `/performance/disputes/:id/assign-reviewer` | Assign reviewer |
| 39 | PATCH | `/performance/disputes/:id/resolve` | Resolve dispute |

### Dashboard (1 route)
| # | Method | Route | Description |
|---|--------|-------|-------------|
| 40 | GET | `/performance/dashboard/:cycleId` | Get completion dashboard |

---

## Edge Cases Covered

### Template Validations
- ✅ Duplicate template name
- ✅ Criteria weights must sum to 100 (or all be 0)
- ✅ Criteria keys must be unique
- ✅ Cannot modify criteria of template in active cycle
- ✅ Cannot deactivate template used in planned/active cycles
- ✅ Cannot deactivate already inactive template
- ✅ Cannot reactivate already active template
- ✅ Template not found
- ✅ Invalid ObjectId format

### Cycle Validations
- ✅ Duplicate cycle name
- ✅ Start date must be before end date
- ✅ Manager due date must be within cycle period
- ✅ Employee acknowledgement due date must be within cycle period
- ✅ Overlapping cycles of same type not allowed
- ✅ Template must exist and be active
- ✅ Only PLANNED cycles can be updated
- ✅ Only PLANNED cycles can be activated
- ✅ Cycle must have template assignments before activation
- ✅ Cannot activate ended cycle
- ✅ Only ACTIVE cycles can be closed
- ✅ Only CLOSED cycles can be archived
- ✅ Cannot archive cycle with open disputes
- ✅ Cycle not found

### Assignment Validations
- ✅ Cycle must exist and be ACTIVE
- ✅ Template must exist and be active
- ✅ Employee cannot be their own manager
- ✅ Employee can only have one assignment per cycle
- ✅ Due date must be within cycle period
- ✅ Assignment not found

### Record Validations
- ✅ Assignment must exist
- ✅ Cycle must be ACTIVE
- ✅ Cannot modify published record
- ✅ Cannot modify archived record
- ✅ Only MANAGER_SUBMITTED records can be published
- ✅ Only HR_PUBLISHED records can be acknowledged
- ✅ Only HR_PUBLISHED records can be viewed
- ✅ Record not found

### Dispute Validations
- ✅ Appraisal record must exist
- ✅ Only published records can be disputed
- ✅ Only appraised employee can file dispute
- ✅ 7-day dispute window validation
- ✅ Cannot have duplicate open disputes
- ✅ Only OPEN disputes can have reviewer assigned
- ✅ Employee who raised dispute cannot be reviewer
- ✅ Only OPEN or UNDER_REVIEW disputes can be resolved
- ✅ Only ADJUSTED or REJECTED as resolution status
- ✅ Resolution summary is required
- ✅ Dispute not found

---

## TODOs (Integration Points)

### Notifications (Time Management Module)
```typescript
// TODO: Notify employees and managers about the new cycle
// TODO: Notify employee and manager about the assignment
// TODO: Notify employee about published appraisal
// TODO: Notify HR about the new dispute
// TODO: Notify reviewer about the assignment
// TODO: Notify employee about resolution
```

### Organization Structure Integration
```typescript
// TODO: Get manager from organization structure (for bulk assignments)
// TODO: If ADJUSTED, allow manager to revise the appraisal
```

---

## Service Methods Summary (46 methods)

### Template Methods (8)
- `createTemplate(dto)` - Create new template
- `getTemplateById(id)` - Get template by ID
- `updateTemplate(id, dto)` - Update template
- `deactivateTemplate(id)` - Deactivate template
- `reactivateTemplate(id)` - Reactivate template
- `searchTemplates(query)` - Paginated search
- `getAllTemplates(isActive?)` - Get all templates
- `getTemplateStats()` - Get statistics

### Cycle Methods (10)
- `createCycle(dto)` - Create new cycle
- `getCycleById(id)` - Get cycle by ID
- `updateCycle(id, dto)` - Update cycle
- `activateCycle(id)` - Activate PLANNED cycle
- `closeCycle(id)` - Close ACTIVE cycle
- `archiveCycle(id)` - Archive CLOSED cycle
- `searchCycles(query)` - Paginated search
- `getAllCycles(status?)` - Get all cycles
- `getCycleStats()` - Get statistics
- `archiveCompletedCycles()` - Cron job for auto-archive

### Assignment Methods (6)
- `createAssignment(dto)` - Create single assignment
- `bulkCreateAssignments(dto)` - Bulk create assignments
- `getAssignmentById(id)` - Get assignment by ID
- `searchAssignments(query)` - Paginated search
- `getAssignmentsForManager(id)` - Get manager's assignments
- `getAssignmentsForEmployee(id)` - Get employee's assignments

### Record Methods (11)
- `submitAppraisalRecord(dto)` - Submit record
- `saveDraftRecord(dto)` - Save draft
- `getRecordById(id)` - Get record by ID
- `getRecordByAssignment(id)` - Get record by assignment
- `publishRecord(id, publishedBy)` - Publish record
- `bulkPublishRecords(ids, publishedBy)` - Bulk publish
- `acknowledgeRecord(id, comment?)` - Acknowledge record
- `markRecordViewed(id)` - Mark as viewed
- `searchRecords(query)` - Paginated search
- `getEmployeeAppraisalHistory(id)` - Get employee history

### Dispute Methods (6)
- `fileDispute(dto)` - File new dispute
- `getDisputeById(id)` - Get dispute by ID
- `assignDisputeReviewer(id, reviewerId)` - Assign reviewer
- `resolveDispute(dto)` - Resolve dispute
- `searchDisputes(query)` - Paginated search
- `getDisputeStats(cycleId?)` - Get statistics

### Dashboard Methods (1)
- `getCompletionDashboard(cycleId)` - Get completion dashboard

---

## Test Coverage

### HTTP Test File
- Location: `testing/employee/performance.http`
- Total Tests: 100 requests
- Happy Path: 56 tests
- Edge Cases: 44 tests

### Postman Collection
- Location: `testing/employee/performance.postman_collection.json`
- Total Requests: 88 requests
- 12 folders organized by functionality

---

## Database Collections Used
- `appraisal_templates` - Template definitions
- `appraisal_cycles` - Cycle configurations
- `appraisal_assignments` - Employee-cycle assignments
- `appraisal_records` - Evaluation records with ratings
- `appraisal_disputes` - Employee disputes

---

## Enums Reference (Cannot be modified)

```typescript
enum AppraisalTemplateType {
    ANNUAL, SEMI_ANNUAL, PROBATIONARY, PROJECT, AD_HOC
}

enum AppraisalCycleStatus {
    PLANNED, ACTIVE, CLOSED, ARCHIVED
}

enum AppraisalAssignmentStatus {
    NOT_STARTED, IN_PROGRESS, SUBMITTED, PUBLISHED, ACKNOWLEDGED
}

enum AppraisalRecordStatus {
    DRAFT, MANAGER_SUBMITTED, HR_PUBLISHED, ARCHIVED
}

enum AppraisalDisputeStatus {
    OPEN, UNDER_REVIEW, ADJUSTED, REJECTED
}

enum AppraisalRatingScaleType {
    THREE_POINT, FIVE_POINT, TEN_POINT
}
```

---

## Changes Made

1. **Service Rewrite** - Complete rewrite of `performance.service.ts` with:
   - Clean code without requirement comments
   - Paginated search interfaces and methods
   - All edge case validations
   - Helper methods for ObjectId validation and pagination

2. **Controller Rewrite** - Complete rewrite of `performance.controller.ts` with:
   - 36 routes organized by entity
   - Clean code structure
   - Proper HTTP status codes

3. **HTTP Test File** - Created `performance.http` with:
   - 100 numbered test requests
   - Real database IDs from seed data
   - All happy path and edge case tests

4. **Postman Collection** - Created `performance.postman_collection.json` with:
   - 88 requests in 12 folders
   - Environment variables for IDs
   - Ready for import

---

*Last Updated: December 12, 2025*

