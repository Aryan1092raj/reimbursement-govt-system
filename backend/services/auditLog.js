const { db, FieldValue } = require('../firebase');

// In-memory append-only store (for demo and fast access)
const auditLogStore = [];

/**
 * Append a new audit log entry
 * @param {Object} entry - audit log entry
 * @returns {Object} frozenEntry - immutable in-memory entry
 */
function appendAuditLog(entry) {
  // Freeze to enforce immutability
  const frozenEntry = Object.freeze({ ...entry });

  // Append to in-memory store
  auditLogStore.push(frozenEntry);

  // Fire-and-forget write to Firestore with serverTimestamp
  void db
    .collection('audit_logs')
    .add({
      ...entry,
      timestamp: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    })
    .catch((err) => {
      console.error('Failed to write audit log to Firestore', err);
    });

  return frozenEntry;
}

/**
 * Return a copy of in-memory audit logs
 * @returns {Array} logs
 */
function getAuditLogs() {
  return auditLogStore.slice();
}

/**
 * Fetch audit logs from Firestore
 * @returns {Promise<Array>} logs
 */
async function fetchAuditLogsFromFirestore() {
  try {
    const snap = await db.collection('audit_logs').orderBy('createdAt', 'asc').get();
    return snap.docs.map((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : null;
      const timestamp = data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : null;

      return {
        id: doc.id,
        ...data,
        createdAt,
        timestamp
      };
    });
  } catch (err) {
    console.error('Failed to fetch audit logs from Firestore', err);
    throw new Error('Failed to fetch audit logs');
  }
}

module.exports = {
  appendAuditLog,
  getAuditLogs,
  fetchAuditLogsFromFirestore
};
