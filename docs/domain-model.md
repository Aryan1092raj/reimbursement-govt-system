# Campus Reimbursement Accountability System - Domain Model

## Overview

This domain model defines the core entities and relationships for a comprehensive campus reimbursement accountability system with strong audit trails, SLA compliance, and escalation workflows.

---

## Core Entities

### 1. User

Represents individuals in the system (students, faculty, staff, administrators).

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `userId` | UUID | Unique identifier | Primary Key, Immutable |
| `email` | String | User email address | Unique, Required |
| `firstName` | String | User's first name | Required |
| `lastName` | String | User's last name | Required |
| `departmentId` | UUID | Department affiliation | Foreign Key to Department |
| `status` | Enum | Account status | ACTIVE, INACTIVE, SUSPENDED |
| `createdAt` | DateTime | Account creation timestamp | Immutable |
| `updatedAt` | DateTime | Last profile update | Mutable |
| `lastLoginAt` | DateTime | Last login timestamp | Auto-updated |

**Immutable Fields:** `userId`, `createdAt`, `email`

**Relationships:**
- Belongs to one **Department**
- Has many **ReimbursementClaim** (submitter)
- Has many **AuditLog** entries (actor)
- Has many **Escalation** records (escalatedBy/escalatedTo)

**Ownership & Responsibility:**
- Self-managed (users can update profile)
- Admin can deactivate or change department
- System tracks all login activity

---

### 2. Role

Defines permissions and responsibilities within departments.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `roleId` | UUID | Unique identifier | Primary Key, Immutable |
| `roleName` | String | Role name | Unique within department, Required |
| `departmentId` | UUID | Department scope | Foreign Key, Immutable |
| `permissions` | JSON Array | List of permissions | e.g., ["approve", "escalate", "audit"] |
| `description` | String | Role description | Optional |
| `createdAt` | DateTime | Role creation timestamp | Immutable |
| `updatedAt` | DateTime | Last modification | Mutable |

**Immutable Fields:** `roleId`, `departmentId`, `createdAt`

**Relationships:**
- Belongs to one **Department**
- Has many **User** assignments (implicit through Department)

**Ownership & Responsibility:**
- Managed by Department Administrator
- Cannot delete if users are assigned
- Permission changes require audit trail entry

---

### 3. Department

Organizational units responsible for budget allocation and SLA compliance.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `departmentId` | UUID | Unique identifier | Primary Key, Immutable |
| `code` | String | Department code | Unique, e.g., "CSE", "MECH" |
| `name` | String | Department name | Required |
| `budgetAllocation` | Decimal | Annual budget limit | Mutable, >= 0 |
| `currentSpend` | Decimal | Total approved claims | Auto-calculated, Read-only |
| `manager` | UUID | Department manager | Foreign Key to User |
| `createdAt` | DateTime | Department creation | Immutable |
| `updatedAt` | DateTime | Last modification | Mutable |

**Immutable Fields:** `departmentId`, `code`, `createdAt`

**Relationships:**
- Has many **User** (department members)
- Has many **ReimbursementClaim** (department-level claims)
- Has one **SLA** (service level agreement)
- Has many **Role** definitions

**Ownership & Responsibility:**
- Managed by Admin/Finance
- Department Manager tracks budget
- Responsible for SLA compliance

---

### 4. SLA (Service Level Agreement)

Defines approval timelines, thresholds, and reimbursement policies per department.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `slaId` | UUID | Unique identifier | Primary Key, Immutable |
| `departmentId` | UUID | Applicable department | Foreign Key, Immutable, Unique |
| `claimApprovalDeadline` | Integer | Days to approve claim | Required, >= 1 |
| `escalationThreshold` | Integer | Days before escalation | Required, < claimApprovalDeadline |
| `maxReimbursement` | Decimal | Max claim amount | Required, > 0 |
| `maxAnnualPerUser` | Decimal | Annual limit per user | Optional |
| `effectiveFrom` | DateTime | Policy start date | Immutable |
| `effectiveUntil` | DateTime | Policy end date | Nullable, Mutable |
| `createdAt` | DateTime | Creation timestamp | Immutable |
| `updatedAt` | DateTime | Last modification | Mutable |

**Immutable Fields:** `slaId`, `departmentId`, `createdAt`, `effectiveFrom`

**Relationships:**
- Belongs to one **Department** (1:1)
- Referenced by many **ReimbursementClaim**

**Ownership & Responsibility:**
- Managed by Admin/Finance Director
- Cannot be deleted, only superseded
- Changes trigger audit trail entries

---

### 5. ReimbursementClaim

Core entity representing a submitted reimbursement request.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `claimId` | UUID | Unique identifier | Primary Key, Immutable |
| `userId` | UUID | Claimant | Foreign Key to User, Immutable |
| `departmentId` | UUID | Department of claimant | Foreign Key, Immutable |
| `slaId` | UUID | Applicable SLA | Foreign Key, Required, Immutable |
| `amount` | Decimal | Reimbursement amount | > 0, <= SLA.maxReimbursement |
| `currency` | String | Currency code | e.g., "USD", Default: "USD" |
| `description` | String | Purpose of expense | Required, Max 500 chars |
| `category` | Enum | Expense category | TRAVEL, SUPPLIES, CONFERENCE, OTHER |
| `status` | Enum | Claim status | DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID |
| `attachments` | JSON Array | Supporting documents | URLs/file references |
| `amount_approved` | Decimal | Approved amount | Null if not approved, <= amount |
| `rejectionReason` | String | Reason for rejection | Null if approved |
| `submittedAt` | DateTime | Submission timestamp | Immutable, Auto-set |
| `submittedBy` | UUID | Who submitted | Foreign Key to User, Immutable |
| `approvedAt` | DateTime | Approval timestamp | Null until approved |
| `approvedBy` | UUID | Who approved | Null until approved |
| `rejectedAt` | DateTime | Rejection timestamp | Null if approved |
| `rejectedBy` | UUID | Who rejected | Null if approved |
| `paidAt` | DateTime | Payment timestamp | Null until paid |
| `dueDate` | DateTime | Approval deadline | Calculated from SLA |
| `escalationDueDate` | DateTime | Escalation deadline | Calculated from SLA |
| `version` | Integer | Change version | Auto-incremented, Immutable |
| `createdAt` | DateTime | Record creation | Immutable |
| `updatedAt` | DateTime | Last update | Mutable |

**Immutable Fields:** `claimId`, `userId`, `departmentId`, `slaId`, `submittedAt`, `submittedBy`, `createdAt`, `version`

**Relationships:**
- Belongs to **User** (submitter)
- Belongs to **Department**
- Belongs to **SLA** (REQUIRED - cannot exist without SLA)
- Has many **Escalation** records
- Has many **AuditLog** entries

**Ownership & Responsibility:**
- Created by User (claimant)
- Updated by Department Approvers
- Finance approves final payment
- System enforces SLA deadlines

---

### 6. Escalation

Immutable records of escalated claims when deadlines are missed.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `escalationId` | UUID | Unique identifier | Primary Key, Immutable |
| `claimId` | UUID | Associated claim | Foreign Key, Immutable |
| `escalatedAt` | DateTime | Escalation timestamp | Immutable, Auto-set |
| `escalatedBy` | UUID | Who triggered escalation | Foreign Key to User, Immutable |
| `escalatedTo` | UUID | Escalation recipient | Foreign Key to User, Immutable |
| `level` | Integer | Escalation level | 1, 2, 3... (Progressive escalation) |
| `reason` | Enum | Escalation reason | DEADLINE_MISSED, HIGH_AMOUNT, INCOMPLETE_DOCS, USER_REQUEST |
| `details` | String | Escalation details | Max 1000 chars |
| `resolution` | String | How it was resolved | Nullable until resolved |
| `resolvedAt` | DateTime | Resolution timestamp | Nullable |
| `createdAt` | DateTime | Record creation | Immutable |

**Immutable Fields:** ALL FIELDS (Records are immutable - no edits or deletes allowed)

**Relationships:**
- Belongs to **ReimbursementClaim** (1:Many)
- References **User** (escalatedBy/escalatedTo)

**Ownership & Responsibility:**
- System-generated or Admin-initiated
- Triggers immediate audit trail
- Cannot be modified or deleted
- Creates accountability trail

---

### 7. AuditLog

Append-only record of all system actions and changes.

**Fields:**
| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `auditId` | UUID | Unique identifier | Primary Key, Immutable |
| `claimId` | UUID | Associated claim | Foreign Key, Nullable, Immutable |
| `userId` | UUID | User performing action | Foreign Key to User, Immutable |
| `action` | Enum | Action performed | CREATED, SUBMITTED, APPROVED, REJECTED, ESCALATED, PAID, DOCUMENT_ADDED, SLA_UPDATED |
| `entityType` | String | Entity affected | "ReimbursementClaim", "SLA", "User", etc. |
| `entityId` | UUID | Primary key of entity | Immutable |
| `oldValues` | JSON Object | Previous state | For update operations |
| `newValues` | JSON Object | Current state | For update operations |
| `ipAddress` | String | Source IP address | Immutable |
| `userAgent` | String | Client information | Immutable |
| `timestamp` | DateTime | Log entry time | Immutable, Server-set |
| `createdAt` | DateTime | Entry creation | Immutable |

**Immutable Fields:** ALL FIELDS (Append-only, no updates or deletes)

**Relationships:**
- References **ReimbursementClaim** (optional)
- References **User** (action performer)

**Ownership & Responsibility:**
- System-managed only
- Cannot be modified or deleted
- Supports compliance audits
- Enables forensic analysis

---

## Domain Rules & Constraints

### Referential Integrity Rules

1. **ReimbursementClaim → SLA (REQUIRED)**
   - Every claim MUST have a valid, active SLA
   - Cannot create claim without SLA
   - Cannot delete SLA with active claims
   - Claim inherits SLA parameters at submission

2. **ReimbursementClaim → Department**
   - Claim department must match submitter's department
   - Department manager approves claims

3. **Escalation Immutability**
   - No updates or deletions allowed
   - Provides permanent accountability record
   - All escalation changes create new AuditLog entries

4. **AuditLog Immutability**
   - Append-only structure
   - No updates, no deletes, no direct modifications
   - System-enforced timestamp
   - Complete state capture for all changes

### Business Rules

**Time-Based Analysis:**
- All entities include `createdAt`, `updatedAt` for temporal tracking
- Claims have `dueDate` and `escalationDueDate` (calculated from SLA)
- Reports can analyze trends: approval time, escalation patterns, budget burn rate
- Supports SLA compliance reporting

**Status Workflows:**
```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → PAID
                          ↓
                       REJECTED
                          ↓
                      (Closed)
```

**Escalation Trigger:**
- Claim not approved before `escalationDueDate` → Auto-escalation
- Escalation creates immutable record
- System notifies escalation recipient

**Budget Enforcement:**
- Department budget limit cannot be exceeded
- Approved claims deducted from available budget
- User annual limit enforced at approval

**Orphan Prevention:**
- Claim cannot exist without SLA
- Foreign key constraints enforced at database level
- Cascading deletes prevented

---

## Data Model Summary

| Entity | Records | Purpose |
|--------|---------|---------|
| **User** | Finite, grows slowly | System participants |
| **Role** | Very few per dept | Permission definitions |
| **Department** | Finite, static | Organizational units |
| **SLA** | Few per dept, versioned | Policy management |
| **ReimbursementClaim** | Grows continuously | Business core entity |
| **Escalation** | Derived from claims | Accountability records |
| **AuditLog** | Grows continuously | Compliance trail |

---

## Implementation Considerations

### Database Design
- Use UUID primary keys for distributed systems
- Create indices on: `userId`, `departmentId`, `claimId`, `timestamp`
- Implement partitioning on `createdAt` for AuditLog
- Foreign key constraints enforce referential integrity

### API Boundaries
- ReimbursementClaim cannot be queried or modified without valid SLA context
- Escalation endpoints are read-only
- AuditLog is read-only, queryable only by authorized users

### Security
- All updates generate AuditLog entries
- Admin actions require elevated permissions
- User can only view own claims (unless approver)
- Escalation notifications trigger alerts
