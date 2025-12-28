const express = require('express');
const { randomUUID } = require('crypto');
const { Roles } = require('../rbac');
const { claimsStore } = require('./claims');
const { appendAuditLog } = require('../services/auditLog');

const router = express.Router();

const APPROVER_ROLES = new Set([
  Roles.DepartmentApprover,
  Roles.AccountsOfficer,
  Roles.EscalationAuthority
]);

function isAuthorizedForClaim(user, claim) {
  if (!user || !claim) return false;
  if (!APPROVER_ROLES.has(user.role)) return false;
  // Minimal assignment check: approver must match claim department
  if (user.departmentId && claim.departmentId && user.departmentId !== claim.departmentId) {
    return false;
  }
  return true;
}

router.post('/claims/:id/approve', (req, res) => {
  const user = req.user;
  const claim = claimsStore.find(c => c.id === req.params.id);

  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  if (!isAuthorizedForClaim(user, claim)) return res.status(403).json({ error: 'Forbidden' });

  const now = new Date();

  claim.status = 'APPROVED';
  claim.approvedAt = now;
  claim.approvedBy = user.id;
  claim.rejectedAt = null;
  claim.rejectedBy = null;
  claim.rejectionReason = null;
  claim.version += 1;

  const audit = appendAuditLog({
    id: randomUUID(),
    claimId: claim.id,
    userId: user.id,
    action: 'APPROVED',
    entityType: 'ReimbursementClaim',
    entityId: claim.id,
    oldValues: null,
    newValues: { status: claim.status, approvedAt: claim.approvedAt, approvedBy: claim.approvedBy, version: claim.version },
    ipAddress: null,
    userAgent: null,
    timestamp: now,
    createdAt: now
  });

  return res.status(200).json({ claim, audit });
});

router.post('/claims/:id/reject', (req, res) => {
  const user = req.user;
  const claim = claimsStore.find(c => c.id === req.params.id);
  const { reason } = req.body || {};

  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  if (!isAuthorizedForClaim(user, claim)) return res.status(403).json({ error: 'Forbidden' });
  if (!reason) return res.status(400).json({ error: 'Rejection reason required' });

  const now = new Date();

  claim.status = 'REJECTED';
  claim.rejectedAt = now;
  claim.rejectedBy = user.id;
  claim.rejectionReason = reason;
  claim.approvedAt = null;
  claim.approvedBy = null;
  claim.amountApproved = null;
  claim.version += 1;

  const audit = appendAuditLog({
    id: randomUUID(),
    claimId: claim.id,
    userId: user.id,
    action: 'REJECTED',
    entityType: 'ReimbursementClaim',
    entityId: claim.id,
    oldValues: null,
    newValues: { status: claim.status, rejectedAt: claim.rejectedAt, rejectedBy: claim.rejectedBy, rejectionReason: claim.rejectionReason, version: claim.version },
    ipAddress: null,
    userAgent: null,
    timestamp: now,
    createdAt: now
  });

  return res.status(200).json({ claim, audit });
});

module.exports = { approvalsRouter: router };