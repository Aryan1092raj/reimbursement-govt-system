function logAction(action) {
  return {
    action,
    timestamp: new Date(),
    immutable: true
  };
}

module.exports = { logAction };