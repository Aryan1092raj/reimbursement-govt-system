import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase';

export async function writeAuditLog(entry) {
  await addDoc(collection(firestore, 'audit_logs'), {
    ...entry,
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp()
  });
}
