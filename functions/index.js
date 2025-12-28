const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

exports.materializeClaim = functions.firestore
  .document('audit_logs/{logId}')
  .onCreate(async (snap, context) => {
    const logData = snap.data();
    
    if (logData.entityType !== 'ReimbursementClaim') {
      return null;
    }
    
    const claimId = logData.entityId;
    const newValues = logData.newValues || {};
    const createdAt = logData.createdAt;
    
    if (!claimId) {
      return null;
    }
    
    const claimRef = db.collection('claims').doc(claimId);
    const claimDoc = await claimRef.get();
    
    if (!claimDoc.exists) {
      await claimRef.set({
        id: claimId,
        status: newValues.status || null,
        submittedAt: createdAt,
        lastUpdatedAt: createdAt,
        userId: newValues.userId || null,
        departmentId: newValues.departmentId || null,
        slaId: newValues.slaId || null,
        amount: newValues.amount || null,
        currency: newValues.currency || null,
        description: newValues.description || null,
        category: newValues.category || null,
        attachments: newValues.attachments || null,
        amountApproved: newValues.amountApproved || null,
        rejectionReason: newValues.rejectionReason || null,
        approvedAt: newValues.approvedAt || null,
        approvedBy: newValues.approvedBy || null,
        rejectedAt: newValues.rejectedAt || null,
        rejectedBy: newValues.rejectedBy || null,
        paidAt: newValues.paidAt || null,
        dueDate: newValues.dueDate || null,
        escalationDueDate: newValues.escalationDueDate || null,
        version: newValues.version || null,
        createdAt: createdAt
      });
    } else {
      const updateData = {
        lastUpdatedAt: createdAt
      };
      
      if (newValues.status !== undefined) {
        updateData.status = newValues.status;
      }
      if (newValues.amount !== undefined) {
        updateData.amount = newValues.amount;
      }
      if (newValues.currency !== undefined) {
        updateData.currency = newValues.currency;
      }
      if (newValues.description !== undefined) {
        updateData.description = newValues.description;
      }
      if (newValues.category !== undefined) {
        updateData.category = newValues.category;
      }
      if (newValues.attachments !== undefined) {
        updateData.attachments = newValues.attachments;
      }
      if (newValues.amountApproved !== undefined) {
        updateData.amountApproved = newValues.amountApproved;
      }
      if (newValues.rejectionReason !== undefined) {
        updateData.rejectionReason = newValues.rejectionReason;
      }
      if (newValues.approvedAt !== undefined) {
        updateData.approvedAt = newValues.approvedAt;
      }
      if (newValues.approvedBy !== undefined) {
        updateData.approvedBy = newValues.approvedBy;
      }
      if (newValues.rejectedAt !== undefined) {
        updateData.rejectedAt = newValues.rejectedAt;
      }
      if (newValues.rejectedBy !== undefined) {
        updateData.rejectedBy = newValues.rejectedBy;
      }
      if (newValues.paidAt !== undefined) {
        updateData.paidAt = newValues.paidAt;
      }
      if (newValues.dueDate !== undefined) {
        updateData.dueDate = newValues.dueDate;
      }
      if (newValues.escalationDueDate !== undefined) {
        updateData.escalationDueDate = newValues.escalationDueDate;
      }
      if (newValues.version !== undefined) {
        updateData.version = newValues.version;
      }
      
      await claimRef.update(updateData);
    }
    
    return null;
  });
