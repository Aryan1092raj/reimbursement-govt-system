// SLA Engine - determines claim timing status

function calculateSLAStatus(claim) {
  const now = new Date();
  const submittedAt = new Date(claim.submittedAt);

  const elapsedTime =
    (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24); // days

  if (elapsedTime > claim.slaSnapshot.approvalDays) {
    return 'BREACHED';
  }

  return 'ACTIVE';
}

module.exports = { calculateSLAStatus };