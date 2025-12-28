const express = require('express');
const { Roles } = require('../rbac');
const { claimsStore } = require('./claims');
const { escalationsStore } = require('../services/escalationService');
const { getSLAStatus } = require('../services/slaService');

const router = express.Router();

function enrichWithSLA(claim) {
  if (!claim || !claim.slaSnapshot) return { slaStatus: null };
  const status = getSLAStatus(claim, claim.slaSnapshot);
  return { slaStatus: status };
}

router.get('/dashboards/student/claims', (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.role !== Roles.Student) return res.status(403).json({ error: 'Forbidden' });

  const items = claimsStore
    .filter(c => c.userId === user.id)
    .map(c => ({ claim: c, ...enrichWithSLA(c) }));

  return res.json({ claims: items });
});

router.get('/dashboards/approver/claims', (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const allowed = new Set([Roles.DepartmentApprover, Roles.AccountsOfficer, Roles.EscalationAuthority]);
  if (!allowed.has(user.role)) return res.status(403).json({ error: 'Forbidden' });

  const items = claimsStore
    .filter(c => !user.departmentId || c.departmentId === user.departmentId)
    .map(c => {
      const { slaStatus } = enrichWithSLA(c);
      return { claim: c, slaStatus };
    })
    .sort((a, b) => {
      const aUrgency = a.slaStatus ? (a.slaStatus.breached ? -1 : a.slaStatus.elapsedDays) : Number.POSITIVE_INFINITY;
      const bUrgency = b.slaStatus ? (b.slaStatus.breached ? -1 : b.slaStatus.elapsedDays) : Number.POSITIVE_INFINITY;
      return aUrgency - bUrgency;
    });

  return res.json({ claims: items });
});

router.get('/dashboards/admin/metrics', (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const adminRoles = new Set([Roles.SuperAdmin, Roles.AccountsOfficer]);
  if (!adminRoles.has(user.role)) return res.status(403).json({ error: 'Forbidden' });

  const withSla = claimsStore.filter(c => !!c.slaSnapshot);
  let totalElapsed = 0;
  let countElapsed = 0;
  let breachCount = 0;

  withSla.forEach(c => {
    const status = getSLAStatus(c, c.slaSnapshot);
    if (status) {
      totalElapsed += status.elapsedDays;
      countElapsed += 1;
      if (status.breached) breachCount += 1;
    }
  });

  const avgDelayDays = countElapsed > 0 ? totalElapsed / countElapsed : null;

  const totalClaims = claimsStore.length;
  const totalEscalations = escalationsStore.length;

  return res.json({
    metrics: {
      totalClaims,
      totalEscalations,
      breachCount,
      avgDelayDays
    }
  });
});

module.exports = { dashboardsRouter: router };