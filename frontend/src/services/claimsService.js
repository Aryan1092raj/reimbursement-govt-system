import { collection, getDocs, doc, getDoc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import { computeSLA, isEscalated } from '../utils/sla';

function buildClaimFromLogs(logs) {
  if (logs.length === 0) return null;

  const sortedLogs = logs.sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

  let claim = {};
  
  for (const log of sortedLogs) {
    if (log.newValues) {
      claim = { ...claim, ...log.newValues };
    }
  }

  return claim;
}

export async function fetchClaims() {
  const claimsSnapshot = await getDocs(collection(firestore, 'claims'));
  
  const claims = claimsSnapshot.docs.map(doc => {
    const data = doc.data();
    
    const claimData = {
      id: doc.id,
      studentId: data.studentId,
      userId: data.userId,
      departmentId: data.departmentId || data.department,
      department: data.department,
      slaId: data.slaId,
      amount: data.amount,
      currency: data.currency || 'USD',
      description: data.description,
      category: data.category,
      status: data.status,
      attachments: data.attachments,
      amountApproved: data.amountApproved,
      rejectionReason: data.rejectionReason,
      submittedAt: data.submittedAt,
      approvedAt: data.approvedAt,
      approvedBy: data.approvedBy,
      rejectedAt: data.rejectedAt,
      rejectedBy: data.rejectedBy,
      paidAt: data.paidAt,
      dueDate: data.dueDate,
      escalationDueDate: data.escalationDueDate,
      version: data.version,
      createdAt: data.createdAt
    };

    const slaResult = computeSLA(claimData);
    claimData.sla = {
      elapsedDays: slaResult.elapsedDays,
      slaStatus: slaResult.slaStatus,
      isEscalated: isEscalated(claimData, slaResult)
    };

    return claimData;
  });

  return claims;
}

export async function fetchClaimById(claimId) {
  const claimDocRef = doc(firestore, 'claims', claimId);
  const claimDoc = await getDoc(claimDocRef);
  
  if (!claimDoc.exists()) {
    throw new Error('Claim not found');
  }
  
  const data = claimDoc.data();
  
  const claimData = {
    id: claimDoc.id,
    studentId: data.studentId,
    userId: data.userId,
    departmentId: data.departmentId || data.department,
    department: data.department,
    slaId: data.slaId,
    amount: data.amount,
    currency: data.currency || 'USD',
    description: data.description,
    category: data.category,
    status: data.status,
    attachments: data.attachments,
    amountApproved: data.amountApproved,
    rejectionReason: data.rejectionReason,
    submittedAt: data.submittedAt,
    approvedAt: data.approvedAt,
    approvedBy: data.approvedBy,
    rejectedAt: data.rejectedAt,
    rejectedBy: data.rejectedBy,
    paidAt: data.paidAt,
    dueDate: data.dueDate,
    escalationDueDate: data.escalationDueDate,
    version: data.version,
    createdAt: data.createdAt
  };

  const slaResult = computeSLA(claimData);
  claimData.sla = {
    elapsedDays: slaResult.elapsedDays,
    slaStatus: slaResult.slaStatus,
    isEscalated: isEscalated(claimData, slaResult)
  };

  return claimData;
}

export async function createClaim({ studentId, department, amount }) {
  const claimData = {
    studentId,
    department,
    departmentId: department,
    amount,
    status: 'SUBMITTED',
    submittedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(firestore, 'claims'), claimData);
  
  return {
    id: docRef.id,
    ...claimData
  };
}
