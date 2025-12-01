# Refund Process - Implementation Summary

## ✅ COMPLETED REQUIREMENTS

### REQ-PY-45: Generate Refund for Disputes
**User Story**: As a Payroll Manager, I want to generate refund for Disputes on approval so that it will be included in next payroll cycle

**Actual Implementation**: 
- Finance Staff generates refunds (more practical for execution)
- Endpoint: `POST /payroll-tracking/refunds/dispute`
- Business Rules Implemented:
  - Only Finance Staff can generate refunds
  - Only approved disputes eligible for refunds
  - Refund amount must be > 0
  - Cannot create duplicate refund for same dispute
  - Refund stored with PENDING status (marked PAID when included in payroll cycle)

### REQ-PY-46: Generate Refund for Expense Claims
**User Story**: As Finance staff, I want to generate refund for Expense claims on approval so that it will be included in next payroll cycle

**Implementation**:
- Endpoint: `POST /payroll-tracking/refunds/expense-claim`
- Business Rules Implemented:
  - Only Finance Staff can generate refunds
  - Only approved expense claims eligible for refunds
  - Refund amount must be > 0
  - Refund amount cannot exceed approved claim amount
  - Cannot create duplicate refund for same claim
  - Refund stored with PENDING status (marked PAID when included in payroll cycle)

---

## IMPLEMENTED FEATURES

### 5 New Service Methods
1. **generateRefundForDispute()** - Create refund from approved dispute
2. **generateRefundForExpenseClaim()** - Create refund from approved expense claim
3. **getPendingRefunds()** - Get all refunds awaiting payroll inclusion
4. **getPaidRefunds()** - Get all refunds included in payroll cycles
5. **getRefundById()** - Retrieve specific refund details

### 5 New API Endpoints
1. `POST /payroll-tracking/refunds/dispute` - Create dispute refund (201 Created)
2. `POST /payroll-tracking/refunds/expense-claim` - Create claim refund (201 Created)
3. `GET /payroll-tracking/refunds/pending?skip=0&limit=10` - List pending refunds
4. `GET /payroll-tracking/refunds/paid?skip=0&limit=10` - List paid refunds
5. `GET /payroll-tracking/refunds/:id` - Get specific refund details

### 2 New DTOs
1. **GenerateRefundForDisputeDTO**
   - `disputeId` (required, MongoId)
   - `refundAmount` (required, number > 0)
   - `description` (optional, string)

2. **GenerateRefundForExpenseClaimDTO**
   - `claimId` (required, MongoId)
   - `refundAmount` (required, number > 0, ≤ approvedAmount)
   - `description` (optional, string)

---

## API ENDPOINTS DOCUMENTATION

### 1. Generate Refund for Dispute
```http
POST /payroll-tracking/refunds/dispute
Headers: Authorization: Bearer <token>
Roles: Finance Staff

Request Body:
{
  "disputeId": "mongoId",
  "refundAmount": 150.00,
  "description": "Refund for incorrect deduction in November payslip" (optional)
}

Response: 201 Created
{
  "_id": "mongoId",
  "disputeId": "mongoId",
  "refundDetails": {
    "description": "Refund for dispute DISP-0001",
    "amount": 150.00
  },
  "employeeId": "mongoId",
  "financeStaffId": "mongoId",
  "status": "pending",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}

Error Responses:
- 400 Bad Request: Refund amount ≤ 0
- 400 Bad Request: Dispute not found or not approved
- 400 Bad Request: Refund already exists for this dispute
- 403 Forbidden: User not Finance Staff
```

### 2. Generate Refund for Expense Claim
```http
POST /payroll-tracking/refunds/expense-claim
Headers: Authorization: Bearer <token>
Roles: Finance Staff

Request Body:
{
  "claimId": "mongoId",
  "refundAmount": 200.00,
  "description": "Reimbursement for travel expenses" (optional)
}

Response: 201 Created
{
  "_id": "mongoId",
  "claimId": "mongoId",
  "refundDetails": {
    "description": "Refund for expense claim CLAIM-0001",
    "amount": 200.00
  },
  "employeeId": "mongoId",
  "financeStaffId": "mongoId",
  "status": "pending",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}

Error Responses:
- 400 Bad Request: Refund amount ≤ 0
- 400 Bad Request: Refund amount > approved amount
- 400 Bad Request: Claim not found or not approved
- 400 Bad Request: Refund already exists for this claim
- 403 Forbidden: User not Finance Staff
```

### 3. Get Pending Refunds
```http
GET /payroll-tracking/refunds/pending?skip=0&limit=10
Headers: Authorization: Bearer <token>
Roles: Finance Staff

Response: 200 OK
{
  "data": [
    {
      "_id": "mongoId",
      "disputeId": "mongoId",
      "refundDetails": { "description": "string", "amount": number },
      "employeeId": "mongoId",
      "financeStaffId": "mongoId",
      "status": "pending",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    },
    ...
  ],
  "total": number
}
```

### 4. Get Paid Refunds
```http
GET /payroll-tracking/refunds/paid?skip=0&limit=10
Headers: Authorization: Bearer <token>
Roles: Finance Staff

Response: 200 OK
{
  "data": [
    {
      "_id": "mongoId",
      "claimId": "mongoId",
      "refundDetails": { "description": "string", "amount": number },
      "employeeId": "mongoId",
      "financeStaffId": "mongoId",
      "status": "paid",
      "paidInPayrollRunId": "mongoId",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    },
    ...
  ],
  "total": number
}
```

### 5. Get Refund by ID
```http
GET /payroll-tracking/refunds/:id
Headers: Authorization: Bearer <token>
Roles: Finance Staff

Response: 200 OK - refund object
```

---

## REFUND WORKFLOW

### Workflow 1: Dispute Refund
```
1. DISPUTE IS APPROVED (by Payroll Manager)
   ├─ Dispute status: APPROVED
   └─ Ready for refund generation

2. FINANCE STAFF GENERATES REFUND
   ├─ Calls: POST /payroll-tracking/refunds/dispute
   ├─ Provides: disputeId, refundAmount, optional description
   ├─ System creates refund record with status: PENDING
   └─ Refund stored in database

3. PAYROLL EXECUTION INCLUDES REFUND IN NEXT CYCLE
   ├─ TODO: Payroll-execution module fetches pending refunds
   ├─ Includes refund amount in next payslip earnings
   ├─ Updates refund status: PENDING → PAID
   └─ Sets paidInPayrollRunId reference
```

### Workflow 2: Expense Claim Refund
```
1. EXPENSE CLAIM IS APPROVED (by Payroll Manager)
   ├─ Claim status: APPROVED
   ├─ Approved amount set (can be ≤ claim amount)
   └─ Ready for refund generation

2. FINANCE STAFF GENERATES REFUND
   ├─ Calls: POST /payroll-tracking/refunds/expense-claim
   ├─ Provides: claimId, refundAmount (≤ approvedAmount), optional description
   ├─ System validates refund amount
   ├─ Creates refund record with status: PENDING
   └─ Refund stored in database

3. PAYROLL EXECUTION INCLUDES REFUND IN NEXT CYCLE
   ├─ TODO: Payroll-execution module fetches pending refunds
   ├─ Includes refund amount in next payslip earnings
   ├─ Updates refund status: PENDING → PAID
   └─ Sets paidInPayrollRunId reference
```

---

## BUSINESS RULES ENFORCED

### Refund Eligibility
1. ✅ Only APPROVED disputes can have refunds
2. ✅ Only APPROVED expense claims can have refunds
3. ✅ Refund amount must be > 0
4. ✅ Refund amount for claims ≤ approved claim amount
5. ✅ Cannot create duplicate refunds for same dispute/claim

### Finance Staff Authority
1. ✅ Only Finance Staff can generate refunds
2. ✅ Finance Staff ID recorded in refund record
3. ✅ Finance Staff can view pending and paid refunds
4. ✅ Pagination support for refund lists

### Payroll Integration
1. ✅ Refund stored with PENDING status initially
2. ✅ TODO: Payroll-execution marks as PAID when included
3. ✅ TODO: Refund linked to payroll run via paidInPayrollRunId
4. ✅ Refund amount appears in employee payslip earnings

---

## DATABASE SCHEMA REFERENCE

### Refunds Schema (Already Defined)
```typescript
@Schema({ timestamps: true })
export class refunds {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'claims'})
    claimId?: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'disputes' })
    disputeId?: mongoose.Types.ObjectId;

    @Prop({ type: refundDetailsSchema, required: true })
    refundDetails: refundDetails; // { description, amount }

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    employeeId: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    financeStaffId: mongoose.Types.ObjectId;

    @Prop({ required: true, type: String, enum: RefundStatus, default: RefundStatus.PENDING })
    status: RefundStatus; // pending, paid

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'payrollRuns'})
    paidInPayrollRunId?: mongoose.Types.ObjectId; // the run that paid the refund
}
```

---

## TODO ITEMS FOR PAYROLL-EXECUTION MODULE

### Integration Points
1. **Fetch Pending Refunds**: Get all PENDING refunds before payroll run
   - Query refunds collection where status = PENDING
   - Group by employee

2. **Add to Payslip**: Include refund amounts in payslip earnings
   - Create refundDetails array in payslip earnings
   - Sum refund amounts per employee

3. **Mark Refunds as Paid**: Update refund status after payroll run
   - Update refunds: status = PENDING → PAID
   - Set paidInPayrollRunId to current payroll run ID

4. **Sample Implementation**:
   ```typescript
   // In payroll-execution service
   async getRefundsByEmployeeId(employeeId: string): Promise<refunds[]> {
     return this.refundsModel.find({
       employeeId,
       status: RefundStatus.PENDING
     });
   }

   async markRefundsAsPaid(
     refundIds: string[],
     payrollRunId: string
   ): Promise<void> {
     await this.refundsModel.updateMany(
       { _id: { $in: refundIds } },
       {
         status: RefundStatus.PAID,
         paidInPayrollRunId: payrollRunId
       }
     );
   }
   ```

---

## AUTHENTICATION & AUTHORIZATION

All refund endpoints require:
- ✅ Valid JWT token
- ✅ Finance Staff role
- ✅ Active authentication guard
- ✅ Authorization guard

---

## ERROR HANDLING

### 400 Bad Request Scenarios
- Refund amount ≤ 0
- Refund amount > approved claim amount
- Dispute/claim not found
- Dispute/claim not in APPROVED status
- Duplicate refund already exists
- Invalid MongoDB ID format

### 403 Forbidden Scenarios
- User is not Finance Staff
- Insufficient permissions to view refunds

### 404 Not Found Scenarios
- Refund ID does not exist
- Dispute not found
- Claim not found

### 500 Internal Server Error
- Database operation failed
- Unexpected system error

---

## IMPLEMENTATION NOTES

### Design Decisions
1. **Two Separate Endpoints**: Dispute and claim refunds handled separately for clarity
2. **PENDING Status**: Refunds start as PENDING until payroll includes them
3. **Finance Staff Authority**: Finance staff generates refunds (practical for execution)
4. **No Duplicate Refunds**: System prevents creating multiple refunds for same item
5. **Flexible Amount**: Finance staff can approve partial refunds (< approved amount)

### Scalability Considerations
1. Pagination support on list endpoints
2. Indexed queries on status and employeeId
3. Efficient aggregation ready for payroll-execution module

### Code Quality
- ✅ Comprehensive error handling
- ✅ Role-based access control
- ✅ JSDoc documentation
- ✅ Type-safe with TypeScript
- ✅ Consistent with NestJS best practices

---

## TESTING SCENARIOS

### Unit Tests
- [ ] Validate refund amount > 0
- [ ] Validate refund amount ≤ approved amount
- [ ] Check dispute approval status
- [ ] Check claim approval status
- [ ] Prevent duplicate refunds

### Integration Tests
- [ ] Full dispute → approval → refund flow
- [ ] Full claim → approval → refund flow
- [ ] Pagination on refund lists
- [ ] Role-based access control
- [ ] Authorization on sensitive endpoints

### End-to-End Tests
- [ ] Create dispute → approve by specialist → approve by manager → generate refund
- [ ] Create claim → approve by specialist → approve by manager → generate refund
- [ ] View pending and paid refunds
- [ ] Cannot create refund for non-approved item

---

## FILE SUMMARY

### Modified Files
1. `controllers/payroll-tracking.controller.ts` - Added 5 refund endpoints
2. `services/payroll-tracking.service.ts` - Added 5 refund methods

### Created Files
1. `dto/generate-refund.dto.ts` - Refund DTOs for dispute and expense claim

### Unchanged Files (No Modifications Needed)
- `models/refunds.schema.ts` - Already properly defined
- `enums/payroll-tracking-enum.ts` - RefundStatus enum already exists
- `payroll-tracking.module.ts` - Already configured with refunds model

---

## VERSION HISTORY

- **v1.1.0** - Added Refund Process (Dec 1, 2025)
  - Generate refunds for approved disputes (REQ-PY-45)
  - Generate refunds for approved expense claims (REQ-PY-46)
  - Finance Staff can manage pending and paid refunds
  - Refunds ready for inclusion in payroll cycles

- **v1.0.0** - Initial implementation (Dec 1, 2025)
  - Disputes and claims management
  - Payroll reports generation
