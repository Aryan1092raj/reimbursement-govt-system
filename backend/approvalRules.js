function canApprove(user, claim) {
  if (user.userId === claim.userId) return false;
  return true;
}

module.exports = { canApprove };