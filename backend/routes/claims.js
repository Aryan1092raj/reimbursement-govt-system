const express = require('express');
const { randomUUID } = require('crypto');
const { Roles } = require('../rbac');
const { appendAuditLog, fetchAuditLogsFromFirestore, getAuditLogs } = require('../services/auditLog');
const { escalationsStore } = require('../services/escalationService');

const router = express.Router();

// In-memory store for claims (no persistence wired yet)
const claimsStore = [];

// Minimal demo SLA snapshot helper
function getSlaSnapshot(_slaId) {
  return {
    approvalDays: 7,
    status: 'ACTIVE'
  };
}

// GET /claims — read-only
router.get('/claims', (_req, res) => {
  const claims = claimsStore.map((claim) => {
    const escalation = escalationsStore.find((e) => e.claimId === claim.id) || null;
    return {
      ...claim,
      ownerRole: claim.ownerRole || null,
      slaSnapshot: claim.slaSnapshot || null,
      escalation
    };
  });

  return res.json(claims);
});

// POST /claims — submission only
router.post('/claims', (req, res) => {
  // Demo-mode role extraction
const roleHeader = req.headers['x-role'] || req.headers['role'];

if (!roleHeader) {
  return res.status(401).json({ error: 'Unauthorized: role header missing' });
}

// Normalize role
const role = Object.values(Roles).find(
  r => r.toLowerCase() === String(roleHeader).toLowerCase()
);

if (!role) {
  return res.status(403).json({ error: 'Forbidden: invalid role' });
}

// Create temporary user object for demo
const user = {
  id: 'demo-user',   // can be fixed for smoke test
  role
};

  if (user.role !== Roles.Student) {
    return res.status(403).json({ error: 'Forbidden: only Student can submit' });
  }

  const { amount, currency, description, category, departmentId, slaId, attachments = [] } = req.body || {};

  if (!slaId) {
    return res.status(400).json({ error: 'slaId is required and must attach an SLA at creation' });
  }

  if (!departmentId) {
    return res.status(400).json({ error: 'departmentId is required' });
  }

  if (!amount || !currency || !description || !category) {
    return res.status(400).json({ error: 'amount, currency, description, category are required' });
  }

  const now = new Date();

    const claim = {
    id: randomUUID(),
    userId: user.id,
    ownerRole: user.role,              // << add this
    departmentId,
    slaId,
    slaSnapshot: getSlaSnapshot(slaId), // << add this, calls SLA service
    amount,
    currency,
    description,
    category,
    attachments,
    status: 'SUBMITTED',
    amountApproved: null,
    rejectionReason: null,
    submittedAt: now,
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    paidAt: null,
    dueDate: null, // computed by SLA engine later
    escalationDueDate: null, // computed by SLA engine later
    version: 1,
    createdAt: now
    };

  claimsStore.push(claim);

  const auditEntry = {
    claimId: claim.id,
    userId: user.id,
    action: 'SUBMITTED',
    entityType: 'ReimbursementClaim',
    entityId: claim.id,
    oldValues: null,
    newValues: claim,
    ipAddress: req.ip || null,
    userAgent: req.headers['user-agent'] || null,
    timestamp: now,
    createdAt: now
  };

  const storedAudit = appendAuditLog(auditEntry);

  return res.status(201).json({ claim, audit: storedAudit });
});

// GET /audit-logs — read-only, ordered by createdAt asc
// Tries Firestore first; falls back to in-memory if unavailable
router.get('/audit-logs', async (_req, res) => {
  try {
    const logs = await fetchAuditLogsFromFirestore();
    return res.json(logs);
  } catch (err) {
    console.error('Firestore fetch failed, falling back to in-memory logs', err);
    const inMemoryLogs = getAuditLogs();
    return res.json(inMemoryLogs);
  }
});

module.exports = { claimsRouter: router, claimsStore };