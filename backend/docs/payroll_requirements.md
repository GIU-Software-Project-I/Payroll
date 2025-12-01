# Payroll Requirements Matrix

This document maps payroll execution requirements (REQ-PY) to user stories, required inputs from other subsystems, downstream consumers, and key business rules (BRs). It is intended for reviewers, developers, and QA to use as a single source of truth during implementation.

## How to read this matrix
- Phase: High-level step within payroll processing.
- Requirement Name: Short description of requirement.
- User Stories Needed: IDs/titles that implement or validate the requirement.
- Inputs Needed from Other Sub‑Systems: Events/data the payroll module consumes.
- Downstream Sub‑Systems Depending on This Output: Consumers of the payroll output.
- Key BRs: Business rule IDs most relevant to the requirement.

---

### Phase 0 — Needed reviews/approvals before start of payroll initiation

- **Requirement:** Signing bonus review (approve or reject)
  - **User Stories Needed:** REQ-PY-28
  - **Inputs Needed from Other Sub‑Systems:** N/A (driven from payroll UI / employee profile)
  - **Downstream Sub‑Systems:** N/A
  - **Key BRs:** BR24, BR56

- **Requirement:** Signing bonus edit (givenAmount in the schema)
  - **User Stories Needed:** REQ-PY-29
  - **Inputs Needed from Other Sub‑Systems:** N/A
  - **Downstream Sub‑Systems:** N/A
  - **Key BRs:** BR25, BR56

- **Requirement:** Termination and Resignation benefits review (approve or reject)
  - **User Stories Needed:** REQ-PY-31
  - **Inputs Needed from Other Sub‑Systems:** N/A (review step before payroll initiation)
  - **Downstream Sub‑Systems:** N/A
  - **Key BRs:** BR26, BR29, BR56

- **Requirement:** Termination and Resignation benefits edit (givenAmount in the schema)
  - **User Stories Needed:** REQ-PY-32
  - **Inputs Needed from Other Sub‑Systems:** N/A
  - **Downstream Sub‑Systems:** N/A
  - **Key BRs:** BR27, BR29, BR56

---

### Phase 1 — Initiate Run (goal: draft version of payroll)

- **Requirement:** Review Payroll period (Approve or Reject) — frontend only flow
  - **User Stories Needed:** REQ-PY-24
  - **Inputs Needed from Other Sub‑Systems:** N/A
  - **Downstream Sub‑Systems:** N/A
  - **Key BRs:** BR3, BR63

- **Requirement:** Edit payroll initiation (period) if rejected
  - **User Stories Needed:** REQ-PY-26
  - **Inputs Needed from Other Sub‑Systems:** N/A
  - **Downstream Sub‑Systems:** N/A
  - **Key BRs:** BR3, BR63

- **Requirement:** Start automatic processing of payroll initiation
  - **User Stories Needed:** REQ-PY-23
  - **Inputs Needed from Other Sub‑Systems:** N/A (triggers internal pipeline)
  - **Downstream Sub‑Systems:** Payroll draft generation pipeline
  - **Key BRs:** BR63, BR3

#### 1.1 Payroll Draft Generation

- **Requirement:** Payroll Draft Generation (automatic calculations)
  - **User Stories Needed:** REQ-PY-1, REQ-PY-4
  - **Inputs Needed from Other Sub‑Systems:** Employee contracts, Payroll Area/Schema configuration
  - **Downstream Sub‑Systems:** Review/Approval workflows, Payslip generator, Accounting
  - **Key BRs:** BR64, BR63, BR66, BR36, BR31, BR2, BR46, BR59, BR17

##### 1.1.A Fetch employees and check HR Events

- **Requirement:** Check HR Events (new hire, termination, resigned)
  - **User Stories Needed:** REQ-PY-2
  - **Inputs Needed from Other Sub‑Systems:** Onboarding, Offboarding, Employee Profile
  - **Downstream Sub‑Systems:** Draft generation, bonus/benefits processors
  - **Key BRs:** BR56, BR29, BR2, BR31

- **Requirement:** Auto process signing bonus in case of new hire
  - **User Stories Needed:** REQ-PY-27
  - **Inputs Needed from Other Sub‑Systems:** Onboarding (bonus flag/value), Employee Profile (eligibility)
  - **Downstream Sub‑Systems:** Draft payroll, Approvals
  - **Key BRs:** BR28, BR24, BR56, BR25

- **Requirement:** Auto process resignation and termination benefits
  - **User Stories Needed:** REQ-PY-30, REQ-PY-33
  - **Inputs Needed from Other Sub‑Systems:** Offboarding status, contract terms, unused leave balances
  - **Downstream Sub‑Systems:** Draft payroll, Approvals
  - **Key BRs:** BR56, BR29, BR26, BR27, BR35

##### 1.1.B Salary calculations (Gross to Net)

- **Requirement:** Salary calculations (gross based on PayGrade) and deductions (taxes, insurance) → net salary
  - **User Stories Needed:** REQ-PY-3
  - **Inputs Needed from Other Sub‑Systems:** PayGrade, Time Management (working hours/OT), Leaves (paid/unpaid), Tax and Insurance configuration
  - **Downstream Sub‑Systems:** Audit records, Payslip generation, Accounting
  - **Key BRs:** BR11, BR34, BR1, BR2, BR35, BR60, BR64, BR63, BR36

##### 1.1.C Payroll Draft file

- **Requirement:** Draft generation and export (payroll draft file)
  - **User Stories Needed:** REQ-PY-4
  - **Inputs Needed from Other Sub‑Systems:** All calculation outputs and HR events
  - **Downstream Sub‑Systems:** Review dashboard, approval engine, archive
  - **Key BRs:** BR9, BR36, BR59

---

### Phase 2 — Exceptions (goal: payroll becomes under review)

- **Requirement:** Flag irregularities (sudden salary spikes, missing bank accounts, negative net pay)
  - **User Stories Needed:** REQ-PY-5
  - **Inputs Needed from Other Sub‑Systems:** Employee bank data, historical payroll data, calculation outputs
  - **Downstream Sub‑Systems:** Exception review workflow, escalations to Payroll Manager
  - **Key BRs:** BR63, BR59, BR60

---

### Phase 3 — Review and Approval (goal: freeze)

- **Requirement:** Payroll Specialist review in preview dashboard
  - **User Stories Needed:** REQ-PY-6
  - **Inputs Needed from Other Sub‑Systems:** Draft payroll details, breakdowns
  - **Downstream Sub‑Systems:** Approval routing, exception handling
  - **Key BRs:** BR59, BR36, BR17

- **Requirement:** Send for approval to Manager and Finance
  - **User Stories Needed:** REQ-PY-12
  - **Inputs Needed from Other Sub‑Systems:** Finalized draft, approval metadata
  - **Downstream Sub‑Systems:** Approval engine, audit logs
  - **Key BRs:** BR30, BR18

- **Requirement:** Payroll Manager resolve escalated irregularities
  - **User Stories Needed:** REQ-PY-20
  - **Inputs Needed from Other Sub‑Systems:** Exception details, supporting documentation
  - **Downstream Sub‑Systems:** Recalculation, re-draft, audit trail
  - **Key BRs:** BR59, BR27

- **Requirement:** Payroll Manager approval before distribution
  - **User Stories Needed:** REQ-PY-22
  - **Inputs Needed from Other Sub‑Systems:** Approved finance confirmation, finalized payroll
  - **Downstream Sub‑Systems:** Payment status update, payslip distribution
  - **Key BRs:** BR30, BR18, BR63

- **Requirement:** Finance staff approval (mark payments as Paid)
  - **User Stories Needed:** REQ-PY-15
  - **Inputs Needed from Other Sub‑Systems:** Approved payroll package, reconciliations
  - **Downstream Sub‑Systems:** Payslip generator, accounting entries
  - **Key BRs:** BR18, BR17

- **Requirement:** Payroll Manager view, lock and freeze finalized payroll
  - **User Stories Needed:** REQ-PY-7
  - **Inputs Needed from Other Sub‑Systems:** Final approval status
  - **Downstream Sub‑Systems:** Edit prevention, audit logging
  - **Key BRs:** BR63, BR36, BR66

- **Requirement:** Payroll Manager unfreeze payrolls (with reason)
  - **User Stories Needed:** REQ-PY-19
  - **Inputs Needed from Other Sub‑Systems:** Reason, authorizer identity
  - **Downstream Sub‑Systems:** Reopen draft, logging, reapproval workflow
  - **Key BRs:** BR27, BR63

---

### Phase 4 — Payslips Generation

- **Requirement:** Auto-generate and distribute payslips after approvals and Paid status
  - **User Stories Needed:** REQ-PY-8
  - **Inputs Needed from Other Sub‑Systems:** Paid payroll, employee contact preferences
  - **Downstream Sub‑Systems:** Email service, portal, PDF generator, HR records
  - **Key BRs:** BR17, BR59, BR64

---

## Cross-cutting rules & validations
- **Contract & Eligibility Checks:** Enforce BR1 and BR66 before processing any employee.
- **Audit & Traceability:** Persist all intermediate calculation elements and manual edits (BR36, BR27).
- **Legal & Policy Configuration:** Tax brackets, insurance percentages, minimum wage rules must be configurable (BR5, BR7, BR20, BR60).
- **Integrations Required:** Onboarding, Offboarding, Time Management, Leaves, and Employee Profile modules (see BR notes).
- **Approval Flow:** Must follow Payroll Specialist → Payroll Manager → Finance (BR30).

---

## Next steps (recommended)
- Save this file and request stakeholder sign-off.
- Create tracking issues for: Draft generation service, Approval workflow, Exception handling, Payslip generation, and BR-driven validations.
- Draft API contracts for: `POST /payroll/initiate`, `GET /payroll/draft/{id}`, `POST /payroll/{id}/approve`, `POST /payroll/{id}/freeze`, `POST /payroll/{id}/unfreeze`, `POST /payslips/generate`.

---

Document created on: 2025-12-01
