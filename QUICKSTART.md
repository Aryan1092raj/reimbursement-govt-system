# Quick Start Guide

Get the Campus Reimbursement Accountability System running locally in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier is fine)
- Git installed

## Setup Steps

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/reimbursement-govt-system.git
cd reimbursement-govt-system
cd frontend
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database (start in test mode)
4. Go to Project Settings → Your apps → Web app
5. Copy the config values

### 3. Configure Environment

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY="your-api-key-here"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abc123def456"
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Test with Demo Users

Use the role dropdown to switch between:
- `demo-student` - Submit claims
- `demo-dept-approver` - Approve/reject claims
- `demo-accounts` - Mark claims as paid
- `demo-escalation` - Handle breached claims
- `demo-admin` - Full access

## Common Issues

### "Firebase not initialized"
- Check your `.env` file exists in `frontend/` directory
- Verify all Firebase config values are correct
- Restart the dev server

### "Claims not loading"
- Open browser console (F12)
- Check for Firestore permission errors
- Verify Firestore is enabled in Firebase Console

### "Actions not working"
- Ensure you're using the correct role for the action
- Check browser console for errors

## Next Steps

- Read [README.md](README.md) for complete documentation
- Check [SECURITY.md](SECURITY.md) before deploying
- Review [docs/domain-model.md](docs/domain-model.md) for system design

## Need Help?

- Open an issue on GitHub
- Check existing discussions
- Review the troubleshooting section in README.md

---

**Total setup time: ~5 minutes** ⚡
