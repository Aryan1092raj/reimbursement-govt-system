// SLA clock service: pure computation, no I/O

function computeElapsedDays(submittedAt, now = new Date()) {
  const start = new Date(submittedAt);
  return (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
}

function getSLAStatus(claim, sla, now = new Date()) {
  const elapsedDays = computeElapsedDays(claim.submittedAt, now);
  const breached = elapsedDays > sla.claimApprovalDeadline;
  return {
    elapsedDays,
    breached,
    status: breached ? 'BREACHED' : 'ACTIVE'
  };
}

module.exports = {
  computeElapsedDays,
  getSLAStatus
};