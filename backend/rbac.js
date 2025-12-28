// RBAC configuration (no logic, no routes)

// Fixed roles
const Roles = {
  Student: 'Student',
  DepartmentApprover: 'DepartmentApprover',
  AccountsOfficer: 'AccountsOfficer',
  EscalationAuthority: 'EscalationAuthority',
  SuperAdmin: 'SuperAdmin'
};

// Canonical actions (no SLA or AuditLog mutation permitted for any role)
const Actions = {
  SubmitClaim: 'SubmitClaim',
  ViewOwnClaims: 'ViewOwnClaims',
  ViewDepartmentClaims: 'ViewDepartmentClaims',
  ApproveClaim: 'ApproveClaim',
  RejectClaim: 'RejectClaim',
  EscalateClaim: 'EscalateClaim',
  ViewEscalations: 'ViewEscalations',
  ViewAuditLog: 'ViewAuditLog',
  ManageUsers: 'ManageUsers',
  ManageDepartments: 'ManageDepartments',
  ManageRoles: 'ManageRoles'
};

// Permission matrix: role -> allowed actions
// SuperAdmin is read-only: may view but not mutate claims/SLA/logs.
const RolePermissions = {
  [Roles.Student]: [
    Actions.SubmitClaim,
    Actions.ViewOwnClaims
  ],

  [Roles.DepartmentApprover]: [
    Actions.ViewDepartmentClaims,
    Actions.ApproveClaim,
    Actions.RejectClaim,
    Actions.ViewAuditLog
  ],

  [Roles.AccountsOfficer]: [
    Actions.ViewDepartmentClaims,
    Actions.ApproveClaim,
    Actions.RejectClaim,
    Actions.ViewAuditLog
  ],

  [Roles.EscalationAuthority]: [
    Actions.ViewEscalations,
    Actions.ViewDepartmentClaims,
    Actions.ApproveClaim,
    Actions.RejectClaim,
    Actions.ViewAuditLog
  ],

  [Roles.SuperAdmin]: [
    Actions.ViewDepartmentClaims,
    Actions.ViewEscalations,
    Actions.ViewAuditLog,
    Actions.ManageUsers,
    Actions.ManageDepartments,
    Actions.ManageRoles
  ]
};

module.exports = {
  Roles,
  Actions,
  RolePermissions
};