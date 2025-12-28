export function computeSLA(claim) {
  if (!claim || !claim.submittedAt) {
    return { elapsedDays: 0, slaStatus: 'OK' };
  }

  const submittedDate = claim.submittedAt?.toDate ? claim.submittedAt.toDate() : new Date(claim.submittedAt);
  const now = new Date();
  const diffMs = now - submittedDate;
  const elapsedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (claim.status === 'PAID') {
    return { elapsedDays, slaStatus: 'OK' };
  }

  const slaDays = 7;

  if (elapsedDays >= slaDays) {
    return { elapsedDays, slaStatus: 'BREACHED' };
  }

  if (elapsedDays >= 5) {
    return { elapsedDays, slaStatus: 'WARNING' };
  }

  return { elapsedDays, slaStatus: 'OK' };
}

export function isEscalated(claim, sla) {
  return sla.slaStatus === 'BREACHED' && claim.status !== 'PAID';
}
