export const ActionType = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  MARK_PAID: 'MARK_PAID'
};

export const Roles = {
  Student: 'Student',
  DepartmentApprover: 'DepartmentApprover',
  AccountsOfficer: 'AccountsOfficer',
  EscalationAuthority: 'EscalationAuthority',
  SuperAdmin: 'SuperAdmin'
};

const roleActionMap = {
  [Roles.Student]: [],
  [Roles.DepartmentApprover]: [ActionType.APPROVE, ActionType.REJECT],
  [Roles.AccountsOfficer]: [ActionType.APPROVE, ActionType.REJECT, ActionType.MARK_PAID],
  [Roles.EscalationAuthority]: [ActionType.APPROVE, ActionType.REJECT],
  [Roles.SuperAdmin]: []
};

const actionStatusMap = {
  [ActionType.APPROVE]: ['SUBMITTED', 'UNDER_REVIEW'],
  [ActionType.REJECT]: ['SUBMITTED', 'UNDER_REVIEW'],
  [ActionType.MARK_PAID]: ['APPROVED']
};

export function getPermittedActions(currentRole, claimStatus) {
  if (!currentRole || !claimStatus) {
    return [];
  }

  const roleActions = roleActionMap[currentRole] || [];

  return roleActions.filter(action => {
    const allowedStatuses = actionStatusMap[action] || [];
    return allowedStatuses.includes(claimStatus);
  });
}
