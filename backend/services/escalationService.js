const { randomUUID } = require('crypto');
const { getSLAStatus } = require('./slaService');
const { Roles } = require('../rbac');
const { appendAuditLog } = require('./auditLog');

// In-memory escalation store (no persistence wired yet)
const escalationsStore = [];

// Trigger escalation if SLA is breached; no side effects beyond in-memory records
function triggerEscalationIfBreached({ claim, sla, escalatedByUserId, escalatedToUserId }) {
  const status = getSLAStatus(claim, sla);

  if (!status.breached) {
    return { escalated: false, status };
  }

  const now = new Date();
  const escalation = {
    id: randomUUID(),
    claimId: claim.id,
    escalatedAt: now,
    escalatedBy: escalatedByUserId,
    escalatedTo: escalatedToUserId,
    level: 1,
    reason: 'DEADLINE_MISSED',
    details: null,
    resolution: null,
    resolvedAt: null,
    createdAt: now
  };

  escalationsStore.push(escalation);

  const auditEntry = {
    id: randomUUID(),
    claimId: claim.id,
    userId: escalatedByUserId,
    action: 'ESCALATED',
    entityType: 'ReimbursementClaim',
    entityId: claim.id,
    oldValues: null,
    newValues: escalation,
    ipAddress: null,
    userAgent: null,
    timestamp: now,
    createdAt: now
  };

  const storedAudit = appendAuditLog(auditEntry);

  return {
    escalated: true,
    status,
    escalation,
    audit: storedAudit,
    nextAssigneeRole: Roles.EscalationAuthority
  };
}

module.exports = {
  escalationsStore,
  triggerEscalationIfBreached
};