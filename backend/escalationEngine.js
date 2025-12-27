function triggerEscalation(claim) {
  return {
    claimId: claim.claimId,
    escalatedAt: new Date(),
    reason: 'SLA_BREACHED',
    level: 1
  };
}

module.exports = { triggerEscalation };