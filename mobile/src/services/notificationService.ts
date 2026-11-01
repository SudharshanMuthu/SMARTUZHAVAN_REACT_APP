import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type?: 'general' | 'order' | 'weather' | 'like';
  read: boolean;
  createdAt?: any;
}

/**
 * Send an in-app notification to a specific user
 */
export async function sendAppNotification({
  userId,
  title,
  body,
  type = 'general',
}: {
  userId: string;
  title: string;
  body: string;
  type?: 'general' | 'order' | 'weather' | 'like';
}): Promise<string> {
  const db = getFirebaseFirestore();
  const docRef = await addDoc(collection(db, 'notifications'), {
    userId,
    title,
    body,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const db = getFirebaseFirestore();
  const ref = doc(db, 'notifications', notificationId);
  await updateDoc(ref, { read: true });
}

/**
 * Mark all unread notifications for a user as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.update(d.ref, { read: true });
  });
  await batch.commit();
}
