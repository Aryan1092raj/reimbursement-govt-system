// Data model definitions (no persistence, no logic)

const models = {
  User: {
    fields: {
      id: { type: 'uuid', immutable: true, required: true },
      email: { type: 'string', immutable: true, required: true },
      firstName: { type: 'string', immutable: false, required: true },
      lastName: { type: 'string', immutable: false, required: true },
      departmentId: { type: 'uuid', immutable: false, required: true, relation: 'Department.id' },
      status: { type: 'enum(ACTIVE,INACTIVE,SUSPENDED)', immutable: false, required: true },
      lastLoginAt: { type: 'datetime', immutable: false, required: false },
      createdAt: { type: 'datetime', immutable: true, serverTime: true }
    },
    relationships: {
      belongsTo: ['Department'],
      hasMany: ['ReimbursementClaim', 'AuditLog', 'Escalation (as escalatedBy/escalatedTo)']
    }
  },

  Role: {
    fields: {
      id: { type: 'uuid', immutable: true, required: true },
      roleName: { type: 'string', immutable: false, required: true },
      departmentId: { type: 'uuid', immutable: true, required: true, relation: 'Department.id' },
      permissions: { type: 'json[]', immutable: false, required: true },
      description: { type: 'string', immutable: false, required: false },
      createdAt: { type: 'datetime', immutable: true, serverTime: true }
    },
    relationships: {
      belongsTo: ['Department'],
      assignedTo: ['User (via department scope)']
    }
  },

  Department: {
    fields: {
      id: { type: 'uuid', immutable: true, required: true },
      code: { type: 'string', immutable: true, required: true },
      name: { type: 'string', immutable: false, required: true },
      budgetAllocation: { type: 'decimal', immutable: false, required: true },
      currentSpend: { type: 'decimal', immutable: false, required: true },
      manager: { type: 'uuid', immutable: false, required: false, relation: 'User.id' },
      createdAt: { type: 'datetime', immutable: true, serverTime: true }
    },
    relationships: {
      hasMany: ['User', 'ReimbursementClaim', 'Role'],
      hasOne: ['SLA']
    }
  },

  ReimbursementClaim: {
    fields: {
      id: { type: 'uuid', immutable: true, required: true },
      userId: { type: 'uuid', immutable: true, required: true, relation: 'User.id' },
      departmentId: { type: 'uuid', immutable: true, required: true, relation: 'Department.id' },
      slaId: { type: 'uuid', immutable: true, required: true, relation: 'SLA.id' },
      amount: { type: 'decimal', immutable: false, required: true },
      currency: { type: 'string', immutable: false, required: true },
      description: { type: 'string', immutable: false, required: true },
      category: { type: 'enum(TRAVEL,SUPPLIES,CONFERENCE,OTHER)', immutable: false, required: true },
      status: { type: 'enum(DRAFT,SUBMITTED,UNDER_REVIEW,APPROVED,REJECTED,PAID)', immutable: false, required: true },
      attachments: { type: 'json[]', immutable: false, required: false },
      amountApproved: { type: 'decimal', immutable: false, required: false },
      rejectionReason: { type: 'string', immutable: false, required: false },
      submittedAt: { type: 'datetime', immutable: true, required: true, serverTime: true },
      approvedAt: { type: 'datetime', immutable: false, required: false },
      approvedBy: { type: 'uuid', immutable: false, required: false, relation: 'User.id' },
      rejectedAt: { type: 'datetime', immutable: false, required: false },
      rejectedBy: { type: 'uuid', immutable: false, required: false, relation: 'User.id' },
      paidAt: { type: 'datetime', immutable: false, required: false },
      dueDate: { type: 'datetime', immutable: true, required: true },
      escalationDueDate: { type: 'datetime', immutable: true, required: true },
      version: { type: 'integer', immutable: true, required: true },
      createdAt: { type: 'datetime', immutable: true, serverTime: true }
    },
    relationships: {
      belongsTo: ['User', 'Department', 'SLA'],
      hasMany: ['Escalation', 'AuditLog']
    }
  },

  SLA: {
    fields: {
      id: { type: 'uuid', immutable: true, required: true },
      departmentId: { type: 'uuid', immutable: true, required: true, relation: 'Department.id' },
      claimApprovalDeadline: { type: 'integer(days)', immutable: false, required: true },
      escalationThreshold: { type: 'integer(days)', immutable: false, required: true },
      maxReimbursement: { type: 'decimal', immutable: false, required: true },
      maxAnnualPerUser: { type: 'decimal', immutable: false, required: false },
      effectiveFrom: { type: 'datetime', immutable: true, required: true },
      effectiveUntil: { type: 'datetime', immutable: false, required: false },
      createdAt: { type: 'datetime', immutable: true, serverTime: true }
    },
    relationships: {
      belongsTo: ['Department'],
      referencedBy: ['ReimbursementClaim']
    }
  },

  Escalation: {
    fields: {
      id: { type: 'uuid', immutable: true, required: true },
      claimId: { type: 'uuid', immutable: true, required: true, relation: 'ReimbursementClaim.id' },
      escalatedAt: { type: 'datetime', immutable: true, required: true, serverTime: true },
      escalatedBy: { type: 'uuid', immutable: true, required: true, relation: 'User.id' },
      escalatedTo: { type: 'uuid', immutable: true, required: true, relation: 'User.id' },
      level: { type: 'integer', immutable: true, required: true },
      reason: { type: 'enum(DEADLINE_MISSED,HIGH_AMOUNT,INCOMPLETE_DOCS,USER_REQUEST)', immutable: true, required: true },
      details: { type: 'string', immutable: true, required: false },
      resolution: { type: 'string', immutable: false, required: false },
      resolvedAt: { type: 'datetime', immutable: false, required: false },
      createdAt: { type: 'datetime', immutable: true, serverTime: true }
    },
    relationships: {
      belongsTo: ['ReimbursementClaim'],
      references: ['User (escalatedBy)', 'User (escalatedTo)']
    }
  },

  AuditLog: {
    fields: {
      id: { type: 'uuid', immutable: true, required: true },
      claimId: { type: 'uuid', immutable: true, required: false, relation: 'ReimbursementClaim.id' },
      userId: { type: 'uuid', immutable: true, required: true, relation: 'User.id' },
      action: { type: 'enum(CREATED,SUBMITTED,APPROVED,REJECTED,ESCALATED,PAID,DOCUMENT_ADDED,SLA_UPDATED)', immutable: true, required: true },
      entityType: { type: 'string', immutable: true, required: true },
      entityId: { type: 'uuid', immutable: true, required: true },
      oldValues: { type: 'json', immutable: true, required: false },
      newValues: { type: 'json', immutable: true, required: false },
      ipAddress: { type: 'string', immutable: true, required: false },
      userAgent: { type: 'string', immutable: true, required: false },
      timestamp: { type: 'datetime', immutable: true, required: true, serverTime: true },
      createdAt: { type: 'datetime', immutable: true, serverTime: true }
    },
    relationships: {
      references: ['ReimbursementClaim', 'User']
    }
  }
};

module.exports = { models };