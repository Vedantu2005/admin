import { getFirestore, collection, getDocs } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export const fetchUsers = async (): Promise<User[]> => {
  const db = getFirestore();
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  return userSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
    };
  });
};
