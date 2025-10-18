import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './config';

export interface ContactMessage {
  id: string;
  createdAt?: any;
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  phone: string;
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      createdAt: data.createdAt,
      email: data.email || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      message: data.message || '',
      phone: data.phone || '',
    };
  });
}
