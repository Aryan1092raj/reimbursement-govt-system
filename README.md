# Campus Reimbursement Accountability System

> A governance-focused platform for enforcing accountability and transparency in campus reimbursement workflows through automated SLA tracking, escalation, and immutable audit trails.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

In college campuses, reimbursement delays are a persistent problem that creates financial stress for students and erodes trust in administrative processes:

- **No Enforced Timelines**: Claims often remain pending for weeks or months without defined SLAs
- **Zero Visibility**: Students have no way to track claim status or understand delays
- **Unclear Accountability**: Responsibility for delays is diffuse and untrackable
- **Manual Escalation**: No automatic mechanisms to surface delayed claims
- **Lost Context**: No audit trail to understand decision history

**Result**: Money remains locked, students face financial hardship, and administrative accountability is non-existent.

---

## 💡 Solution Overview

The Campus Reimbursement Accountability System is a **governance-first platform** that enforces time-bound accountability through:

### Core Principles

1. **SLA Enforcement**: Every claim has a 7-day processing deadline tracked server-side
2. **Automatic Escalation**: Breached claims are auto-escalated to higher authorities
3. **Immutable Audit Logs**: All actions are recorded with timestamps and actor identity
4. **Role-Based Access Control**: 5-tier permission system (Student → DepartmentApprover → AccountsOfficer → EscalationAuthority → SuperAdmin)
5. **Real-Time Visibility**: Visual indicators for SLA status (Within SLA → Warning → Breached)

**Note**: This system **does not process payments**. It focuses on ensuring reimbursement requests are processed within defined timelines and delays are visible and escalated.

---

## ✨ Key Features

### For Students
- 📝 **Submit Claims**: Create reimbursement requests with department and amount
- 👀 **Track Status**: Real-time visibility into claim status and SLA countdown
- 📊 **Claim Timeline**: Visual lifecycle showing all actions taken on each claim

### For Approvers (Department/Accounts)
- ✅ **Approve/Reject Claims**: Process pending claims with audit trail
- ⚠️ **SLA Alerts**: Color-coded warnings for claims approaching deadline
- 📈 **Dashboard View**: See all claims requiring action with priority indicators

### For Escalation Authorities
- 🚨 **Breached Claims**: Automatic visibility into SLA-breached claims
- 🔍 **Audit Review**: Full history of who did what and when
- ⚡ **Override Actions**: Mark claims as paid with escalation authority

### System-Wide
- 🔒 **Role-Based UI**: Each user sees only permitted actions
- 📜 **Immutable Logs**: Complete audit trail in Firestore `/audit_logs` collection
- 🎨 **Visual Severity Cues**: Color-coded borders and badges (green/yellow/red)
- ⏱️ **Loading States**: Double-click prevention on action buttons

---

## 🏗️ Architecture

### Data Model

```
/claims/{claimId}
  ├── studentId: string
  ├── department: string
  ├── amount: number
  ├── status: "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID"
  ├── createdAt: Timestamp
  ├── updatedAt: Timestamp
  └── sla: {
      ├── deadlineAt: Timestamp
      ├── status: "WITHIN_SLA" | "WARNING" | "BREACHED"
      ├── daysRemaining: number
      └── isEscalated: boolean
    }

/audit_logs/{logId}
  ├── claimId: string
  ├── action: "CREATE" | "APPROVE" | "REJECT" | "MARK_PAID"
  ├── actor: string
  ├── role: string
  ├── createdAt: Timestamp
  └── metadata: object
```

### SLA Rules

| Threshold | Status | Visual Indicator | Action |
|-----------|--------|------------------|--------|
| 0-4 days | `WITHIN_SLA` | 🟢 Green border | Normal processing |
| 5-6 days | `WARNING` | 🟡 Yellow border | Alert approvers |
| ≥7 days | `BREACHED` | 🔴 Red border | Auto-escalate |

### Role Permissions Matrix

| Role | CREATE | APPROVE | REJECT | MARK_PAID | View All |
|------|--------|---------|--------|-----------|----------|
| Student | ✅ Own | ❌ | ❌ | ❌ | ❌ |
| DepartmentApprover | ❌ | ✅ SUBMITTED | ✅ SUBMITTED | ❌ | ✅ Department |
| AccountsOfficer | ❌ | ✅ APPROVED | ✅ APPROVED | ✅ | ✅ All |
| EscalationAuthority | ❌ | ✅ Escalated | ✅ Escalated | ✅ | ✅ All |
| SuperAdmin | ✅ Any | ✅ Any | ✅ Any | ✅ | ✅ All |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0 with Vite 7.2.5
- **State Management**: Context API (useState-based)
- **Styling**: Vanilla CSS with modern design system
- **Firebase SDK**: Web SDK v11 (Firestore + Auth ready)

### Backend
- **Runtime**: Node.js 20.x with Express.js
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth (ready for integration)
- **Deployment**: Firebase Hosting + Cloud Functions (optional)

### DevOps
- **Version Control**: Git with comprehensive .gitignore
- **Package Manager**: npm
- **Build Tool**: Vite (ESBuild-based)

---

## 📁 Project Structure

```
reimbursement-govt-system/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ClaimTimeline.jsx
│   │   │   └── CreateClaimForm.jsx
│   │   ├── services/           # API layer
│   │   │   ├── claimsService.js
│   │   │   └── auditLogService.js
│   │   ├── utils/              # Business logic
│   │   │   ├── sla.js
│   │   │   └── permissions.js
│   │   ├── App.jsx             # Main application component
│   │   ├── ClaimsContext.jsx   # Global state management
│   │   ├── firebase.js         # Firebase initialization
│   │   └── main.jsx            # Application entry point
│   ├── .env                    # Environment variables (GITIGNORED)
│   └── package.json
│
├── backend/                     # Node.js backend (optional)
│   ├── routes/                 # Express routes
│   │   ├── approvals.js
│   │   ├── claims.js
│   │   └── dashboards.js
│   ├── middleware/             # Auth & RBAC middleware
│   ├── services/               # Business logic services
│   ├── app.js                  # Express application
│   └── firebase.js             # Admin SDK initialization
│
├── docs/                        # Documentation
│   └── domain-model.md         # Domain model specification
│
├── .gitignore                   # Global gitignore (SECURITY CRITICAL)
├── firebase.json                # Firebase configuration
└── README.md                    # This file
```

---

## 🚀 Getting Started


### Prerequisites

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (comes with Node.js)
- **Firebase Account**: Free Spark plan is sufficient ([Sign up](https://firebase.google.com/))
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reimbursement-govt-system.git
   cd reimbursement-govt-system
   ```

2. **Install root dependencies** (optional - for Firebase CLI)
   ```bash
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Setup Backend** (optional - if using Express server)
   ```bash
   cd ../backend
   npm install
   ```

---

## ⚙️ Configuration

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" and follow the wizard
   - Choose "Pay as you go" or "Spark" plan

2. **Enable Firestore**
   - Navigate to Firestore Database in Firebase Console
   - Click "Create database"
   - Start in **test mode** for development (set proper security rules for production)

3. **Get Firebase Config**
   - Go to Project Settings → Your apps
   - Click "Web" icon (</>) to add a web app
   - Copy the configuration object

4. **Configure Frontend**

   Create `frontend/.env` file:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

5. **Configure Backend** (if using Admin SDK)

   Create `.env` file in project root:
   ```env
   NODE_ENV=development
   PORT=3000
   GOOGLE_PROJECT_ID="your-project-id"
   AUTH_PROVIDER=firebase
   ```

   Download Firebase Admin SDK service account key:
   - Go to Project Settings → Service accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` (DO NOT COMMIT THIS FILE)

### Security Rules (Firestore)

Apply these rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Claims collection
    match /claims/{claimId} {
      // Students can create their own claims and read them
      allow create: if request.auth != null && 
                     request.resource.data.studentId == request.auth.uid;
      allow read: if request.auth != null;
      
      // Approvers can update claims (handled by backend in production)
      allow update: if request.auth != null;
    }
    
    // Audit logs are append-only
    match /audit_logs/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false; // Immutable
    }
  }
}
```

---

## 💻 Usage

### Running the Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Demo Users

The application currently uses hardcoded demo users for testing:

| Username | Role | Description |
|----------|------|-------------|
| `demo-student` | Student | Can create and view own claims |
| `demo-dept-approver` | DepartmentApprover | Can approve/reject SUBMITTED claims |
| `demo-accounts` | AccountsOfficer | Can mark APPROVED claims as PAID |
| `demo-escalation` | EscalationAuthority | Can handle breached claims |
| `demo-admin` | SuperAdmin | Full system access |

**Switch roles using the dropdown at the top of the page.**

### Running the Backend (Optional)

```bash
cd backend
npm start
```

Backend API will be available at `http://localhost:3000`

**Note**: The current frontend uses direct Firestore access. The backend is optional and can be used for enhanced security and server-side validation.

### Building for Production

```bash
cd frontend
npm run build
```

Production build will be in `frontend/dist/`

### Deploying to Firebase Hosting

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init hosting

# Deploy
firebase deploy --only hosting
```

---

## 🔒 Security

### Critical Files (NEVER COMMIT)

The following files contain sensitive credentials and are automatically excluded by [.gitignore](.gitignore):

- ✅ `.env` files (all environments)
- ✅ `*firebase-adminsdk*.json` (service account keys)
- ✅ `*serviceAccount*.json` (service account keys)
- ✅ `.firebaserc` (project configuration)

### Security Best Practices

1. **Never commit secrets**: Use environment variables for all API keys
2. **Use Firestore Security Rules**: Enforce read/write permissions at database level
3. **Validate on server**: Don't trust client-side validation alone
4. **Implement proper authentication**: Replace demo users with Firebase Auth
5. **Enable audit logging**: All production actions should be logged
6. **Use HTTPS**: Always use secure connections in production

### Before Pushing to GitHub

Run this checklist:

```bash
# 1. Check if .gitignore exists
cat .gitignore

# 2. Verify sensitive files are ignored
git status

# 3. Look for accidental commits of secrets
git log --all --full-history -- "*.env" "*serviceAccount*.json"

# 4. If secrets were committed, remove them from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/secret/file" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 📊 API Reference (Backend - Optional)

### Claims API

#### `POST /api/claims`
Create a new reimbursement claim

**Request**:
```json
{
  "studentId": "student-123",
  "department": "Computer Science",
  "amount": 5000
}
```

**Response**:
```json
{
  "claimId": "claim-abc123",
  "status": "SUBMITTED",
  "sla": {
    "deadlineAt": "2025-01-04T12:00:00Z",
    "status": "WITHIN_SLA"
  }
}
```

#### `GET /api/claims`
Fetch all claims (filtered by role)

#### `GET /api/claims/:claimId`
Fetch a specific claim with audit trail

#### `POST /api/approvals/:claimId/approve`
Approve a claim (requires DepartmentApprover role)

#### `POST /api/approvals/:claimId/reject`
Reject a claim (requires DepartmentApprover role)

#### `POST /api/approvals/:claimId/mark-paid`
Mark a claim as paid (requires AccountsOfficer role)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Use **ESLint** for linting JavaScript
- Follow **React best practices** (hooks, functional components)
- Write **descriptive commit messages**
- Add **comments** for complex business logic
- Update **documentation** when changing APIs

### Core Invariants (DO NOT VIOLATE)

1. **Every claim has exactly one SLA** - No manual SLA reset
2. **SLA time is server-side only** - No client-side time manipulation
3. **No deletion of claims, escalations, or logs** - Immutable audit trail
4. **All actions must be traceable** - Every mutation requires an audit log
5. **No features outside reimbursement governance** - Stay focused on core domain

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Firebase** for providing scalable backend infrastructure
- **React** team for excellent frontend framework
- **Vite** for blazing-fast development experience
- All contributors who have helped improve this system

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/reimbursement-govt-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/reimbursement-govt-system/discussions)
- **Email**: your.email@example.com

---

## 🗺️ Roadmap

### Phase 1: Core Governance (✅ Complete)
- [x] SLA tracking with 7-day deadline
- [x] Automatic escalation on breach
- [x] Immutable audit logs
- [x] Role-based permissions (5 roles)
- [x] Visual severity cues

### Phase 2: Authentication & Security (🚧 In Progress)
- [ ] Firebase Authentication integration
- [ ] Department-level filtering for approvers
- [ ] Enhanced Firestore security rules
- [ ] Role assignment workflow

### Phase 3: Enhanced Features
- [ ] Email notifications on SLA warnings
- [ ] Governance insights dashboard
- [ ] Bulk claim processing
- [ ] Export audit logs (CSV/PDF)
- [ ] Mobile-responsive design improvements

### Phase 4: Production Hardening
- [ ] Real-time updates with Firestore listeners
- [ ] Error boundary implementation
- [ ] Performance optimization (lazy loading)
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline with GitHub Actions

---

**Built with ❤️ for campus governance and student financial welfare**


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

## Google Technologies Used

- Google Firestore:
	- Used for immutable, append-only audit logs
	- Server-side timestamps ensure audit integrity

The backend is designed to be deployable on Google Cloud Run after refinement.

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

##  MVP (Live Demo)

The MVP is a lightweight web demonstration explaining the problem, solution, and workflow of the system.

 Live MVP Link:  
https://aryan1092raj.github.io/reimbursement-govt-system/

---

##  System Design & Domain Model

The core of this project is a strong governance-first design focusing on:
- SLA-enforced reimbursement processing
- Time-based escalation
- Immutable audit logs
- Clear accountability across departments

Detailed domain model and entities are documented here:  
 `docs/domain-model.md`

---

##  Tech Stack (Current)

- Frontend: HTML, CSS (MVP)
- Backend (Design-level): Node.js (logic stubs)
- Architecture: Domain-driven design
- Hosting: GitHub Pages

---

##  Project Status

This is an early-stage hackathon MVP focused on **system design, accountability logic, and feasibility**, rather than full production deployment.

## Scope Disclaimer

This project is not a payment gateway or ERP system.
It focuses strictly on accountability and governance
for campus reimbursement workflows.