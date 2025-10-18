import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './config';

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  phoneNumber: string;
  createdAt?: any;
}

export async function fetchContacts(): Promise<Contact[]> {
  const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || '',
      email: data.email || '',
      message: data.message || '',
      phoneNumber: data.phoneNumber || '',
      createdAt: data.createdAt,
    };
  });
}
