# Campus Reimbursement Accountability System

This project addresses reimbursement delays in college campuses by focusing on
accountability, transparency, and SLA enforcement.

Unlike traditional finance or ERP systems, this platform does not handle
payments. Instead, it ensures that reimbursement requests are processed within
defined timelines and that delays are clearly visible and escalated.

---

## Problem Statement

In many campuses:
- Reimbursements take weeks or months
- There are no enforced timelines (SLAs)
- Students have no visibility into delays
- Responsibility is unclear
- Delays go untracked and unresolved

This results in money being locked, frustration for students, and lack of
administrative accountability.

---

## Proposed Solution

The Campus Reimbursement Accountability System is a governance-focused platform
that:

- Attaches a Service Level Agreement (SLA) to every reimbursement claim
- Tracks time automatically on the server
- Detects SLA breaches without manual intervention
- Escalates delayed claims automatically
- Maintains immutable audit logs for all actions

This system is designed to improve transparency and accountability rather than
process payments.

---

## MVP Overview

This repository contains an early-stage MVP built for hackathon submission.  
The focus is on system design, core logic, and governance flow.

### Included in the MVP:
- Domain model defining all core entities and rules
- Backend skeleton using Node.js
- SLA evaluation and escalation logic (stub implementation)
- Immutable audit logging structure
- Simple MVP page demonstrating system flow

---

## Project Structure


---

## Technology Stack

### Backend & Infrastructure
- Node.js
- Firebase Authentication
- Firebase Firestore
- Google Cloud Functions
- Google Cloud Run

### Analytics & Visualization
- Google Looker Studio

### AI & Automation
- Google Vertex AI
- Gemini API
- Document AI

---

## Deployment Status

- MVP page deployed using GitHub Pages
- Backend structure prepared for Cloud deployment
- Business logic and UI planned for future iterations

---

## Use Case

The system enables administrators to answer critical questions such as:
- Which departments delay reimbursements the most?
- How often are SLAs breached?
- How much money is stuck due to delays?
- What happens automatically when deadlines are missed?

---

## Hackathon Context

This project was developed as part of TechSprint hackathon submission and focuses on
demonstrating system thinking, governance design, and accountability mechanisms.


(Planned) Deployed using GitHub Pages and Cloud Run.

---

## 🚀 MVP (Live Demo)

The MVP is a lightweight web demonstration explaining the problem, solution, and workflow of the system.

🔗 Live MVP Link:  
https://aryan1092raj.github.io/reimbursement-govt-system/

---

## 🧠 System Design & Domain Model

The core of this project is a strong governance-first design focusing on:
- SLA-enforced reimbursement processing
- Time-based escalation
- Immutable audit logs
- Clear accountability across departments

Detailed domain model and entities are documented here:  
📄 `docs/domain-model.md`

---

## 🛠️ Tech Stack (Current)

- Frontend: HTML, CSS (MVP)
- Backend (Design-level): Node.js (logic stubs)
- Architecture: Domain-driven design
- Hosting: GitHub Pages

---

## 📌 Project Status

This is an early-stage hackathon MVP focused on **system design, accountability logic, and feasibility**, rather than full production deployment.