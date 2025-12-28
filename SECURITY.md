# Security Guidelines

## 🔒 Critical Security Information

This document outlines security best practices and critical files that must NEVER be committed to version control.

---

## ⚠️ NEVER COMMIT THESE FILES

The following files contain sensitive credentials and API keys. They are automatically excluded by `.gitignore`:

### Environment Files
- ❌ `.env`
- ❌ `.env.local`
- ❌ `.env.development`
- ❌ `.env.production`
- ❌ `frontend/.env`
- ❌ Any file matching `*.env`

### Firebase Credentials
- ❌ `*firebase-adminsdk*.json` (Service Account Keys)
- ❌ `*serviceAccount*.json` (Service Account Keys)
- ❌ `serviceAccountKey.json`
- ❌ `.firebaserc` (May contain project IDs)

### Other Secrets
- ❌ `*.key`, `*.pem`, `*.p12`, `*.pfx` (Private keys)
- ❌ `secrets/` directory

---

## ✅ Pre-Commit Checklist

Before pushing to GitHub, **ALWAYS** run this checklist:

### 1. Verify .gitignore Exists
```bash
cat .gitignore
```

### 2. Check Git Status
```bash
git status
```

Look for any `.env` files or `*-adminsdk-*.json` files. If you see them, **DO NOT COMMIT**.

### 3. Verify Sensitive Files Are Ignored
```bash
# Test if .env is ignored
git check-ignore -v frontend/.env

# Test if Firebase admin key is ignored
git check-ignore -v *firebase-adminsdk*.json

# Both should show the .gitignore rule that's excluding them
```

### 4. Search Git History for Secrets
```bash
# Check if secrets were ever committed
git log --all --full-history -- "*.env" "*serviceAccount*.json" "*firebase-adminsdk*.json"
```

If you see any commits, **secrets have been leaked** and need to be removed from history.

---

## 🚨 If You Accidentally Committed Secrets

### Immediate Actions

1. **Rotate ALL Credentials Immediately**
   - Go to Firebase Console → Project Settings → Service accounts
   - Delete the compromised service account key
   - Generate a new key
   - Update your local `.env` files

2. **Remove Secrets from Git History**

   **Option A: Using BFG Repo-Cleaner (Recommended)**
   ```bash
   # Install BFG
   # Download from: https://rtyley.github.io/bfg-repo-cleaner/
   
   # Remove all .env files from history
   java -jar bfg.jar --delete-files "*.env" .
   
   # Remove all Firebase admin keys from history
   java -jar bfg.jar --delete-files "*firebase-adminsdk*.json" .
   
   # Clean up and force push
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

   **Option B: Using git filter-branch**
   ```bash
   # Remove specific file from all history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch frontend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push to remote
   git push origin --force --all
   ```

3. **Verify Removal**
   ```bash
   # Check if secrets are still in history
   git log --all --full-history -- "*.env" "*firebase-adminsdk*.json"
   
   # Should return nothing
   ```

---

## 🔐 Firebase Security Rules

### Firestore Rules (Production)

Apply these rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Claims collection
    match /claims/{claimId} {
      // Students can create their own claims
      allow create: if isAuthenticated() && 
                     request.resource.data.studentId == request.auth.uid;
      
      // Users can read claims based on their role
      allow read: if isAuthenticated() && (
        // Students can read their own claims
        resource.data.studentId == request.auth.uid ||
        // Approvers can read all claims
        getUserRole() in ['DepartmentApprover', 'AccountsOfficer', 'EscalationAuthority', 'SuperAdmin']
      );
      
      // Only backend should update claims (use Admin SDK)
      allow update: if false;
      allow delete: if false; // Never allow deletion
    }
    
    // Audit logs are append-only
    match /audit_logs/{logId} {
      // Only backend can write audit logs
      allow create: if false; // Use Admin SDK only
      
      // Users can read audit logs for claims they can access
      allow read: if isAuthenticated();
      
      // Audit logs are immutable
      allow update, delete: if false;
    }
    
    // Users collection (for role management)
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Only SuperAdmin can update roles
      allow write: if getUserRole() == 'SuperAdmin';
    }
  }
}
```

### Storage Rules (If using Firebase Storage)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only allow authenticated users to upload
    match /claim_documents/{claimId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                    request.resource.size < 5 * 1024 * 1024 && // Max 5MB
                    request.resource.contentType.matches('image/.*|application/pdf');
    }
  }
}
```

---

## 🛡️ Environment Variables Best Practices

### Frontend (.env)

```env
# Firebase Configuration (Public - OK to expose)
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"

# Note: Firebase API keys are safe to expose in frontend code
# They are restricted by Firebase Security Rules
```

### Backend (.env)

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Firebase Admin SDK (CRITICAL - NEVER EXPOSE)
GOOGLE_PROJECT_ID="your-project-id"
GOOGLE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Alternative: Use service account JSON file (also NEVER COMMIT)
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"

# Authentication
AUTH_PROVIDER=firebase
```

---

## 🔍 Security Audit Checklist

### Before Each Release

- [ ] All `.env` files are in `.gitignore`
- [ ] No service account keys committed
- [ ] Firebase Security Rules are applied
- [ ] All API endpoints require authentication
- [ ] Input validation on all user inputs
- [ ] Rate limiting enabled (if using Cloud Functions)
- [ ] CORS configured properly
- [ ] HTTPS enforced in production
- [ ] Audit logs are immutable
- [ ] No sensitive data in error messages
- [ ] Dependencies updated (run `npm audit`)

### Monthly Security Review

- [ ] Review Firestore Security Rules
- [ ] Rotate service account keys
- [ ] Review audit logs for suspicious activity
- [ ] Check for outdated dependencies
- [ ] Review user permissions and roles

---

## 📚 Additional Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Git Filter Branch Documentation](https://git-scm.com/docs/git-filter-branch)

---

## 📞 Security Incident Response

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security contact immediately
3. Include details: affected versions, steps to reproduce
4. Wait for response before public disclosure

---

**Remember**: Security is everyone's responsibility. When in doubt, ask!
