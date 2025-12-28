LINK : [Reimbursement Portal](https://reimbursement-govt-system.vercel.app/)

# Campus Reimbursement Accountability System

## Overview

Delayed reimbursements in academic institutions often suffer from poor transparency, unclear ownership, and lack of enforceable timelines. This system addresses those gaps by making every reimbursement claim **traceable**, **auditable**, and **time-bound**, with clear role-based accountability.

The project is a **governance-first web application** that exposes the full lifecycle of a reimbursement claim—from student submission to approval, payment, SLA breach detection, and escalation—using a lightweight, deployable architecture suitable for student and hackathon environments.

---

## What This System Does (Truthfully)

* Allows **students** to submit reimbursement claims
* Allows **department approvers** and **accounts officers** to act on claims
* Maintains an **immutable audit trail** of every action
* Computes **SLA compliance and breaches** deterministically
* Surfaces **escalations visually** when timelines are violated
* Enforces **role-based visibility and actions**

There are **no fake flows**, **no hidden backend jobs**, and **no simulated APIs**. Everything visible in the UI corresponds to real persisted data.

---

## Architecture (As Implemented)

### Frontend

* React (Vite)
* Client-side state management
* Deployed on **Vercel**

### Backend / Data Layer

* Firebase Firestore (Spark / Free Plan)
* Two collections:

  * `/claims` – canonical state of each reimbursement claim
  * `/audit_logs` – append-only, immutable event log

### Design Choices

* **No Cloud Functions** (Spark plan constraint)
* **No backend server** (Node / Express not used)
* **No authentication** (roles are simulated for demo purposes)
* **Client-side projection** from audit logs for lifecycle and SLA tracking

These tradeoffs are intentional and documented. In a production environment, the same design would move projection logic server-side without changing the data model.

---

## Data Model

### Claim (`/claims/{claimId}`)

```
{
  id,
  studentId,
  department,
  departmentId,
  amount,
  status,          // SUBMITTED | APPROVED | REJECTED | PAID
  submittedAt
}
```

### Audit Log (`/audit_logs/{logId}`)

```
{
  entityType: "ReimbursementClaim",
  entityId: claimId,
  action: "CLAIM_SUBMITTED" | "APPROVED" | "REJECTED" | "MARK_PAID",
  actorRole,
  actorId,
  createdAt
}
```

Audit logs are **append-only**. Claims are **never mutated directly** by approvers in this MVP.

---

## SLA & Escalation Logic

* SLA duration: **7 days** from submission
* SLA status:

  * Within SLA
  * Approaching SLA
  * SLA Breached
* Escalation is **derived**, not stored:

  * Triggered when SLA is breached and claim is not PAID

SLA and escalation are computed **deterministically in the frontend** based on persisted timestamps.

---

## Roles (Simulated)

* **Student**

  * Submit claims
  * View own claims

* **Department Approver**

  * Approve or reject submitted claims

* **Accounts Officer**

  * Mark approved claims as paid

* **Escalation Authority**

  * Read-only view
  * Focused on SLA breaches and delayed claims

Role switching is part of the demo to showcase governance behavior.

---

## MVP Scope

This project is an MVP focused on reimbursement governance and accountability.

### Included
- Claim submission
- Role-based review workflow
- SLA visibility
- Immutable audit logging
- Live frontend connected to Firestore

### Not Included
- Payment processing
- Bank integration
- Automated notifications
- Authentication / IAM

## Key Features

* Full claim lifecycle visibility
* Immutable audit trail
* SLA breach detection
* Escalation highlighting
* Role-based action gating
* Timeline view of claim history

---

## Deployment

* **Frontend**: Vercel
* **Backend**: Firebase Firestore (Spark plan)

No paid infrastructure is used.

---

## Limitations (Explicit)

* No authentication or identity verification
* No server-side enforcement of state transitions
* SLA projection is client-side

These are acceptable tradeoffs for an MVP and hackathon setting and are clearly isolated for future upgrades.

---

## Future Enhancements

* Firebase Authentication
* Server-side claim projection (Cloud Functions)
* Stronger access control rules
* Analytics dashboards
* Notification system for SLA breaches

---

## Why This Matters

This project is not about building another CRUD app. It demonstrates how **accountability systems** can be designed so that delays, responsibility, and escalation are impossible to hide—even with minimal infrastructure.

---

## Live Demo

The application is deployed and functional. All interactions visible in the UI correspond to real persisted data.
