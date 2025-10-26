import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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
  const allUsers = userSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
    };
  });

  // For each user, check if they have any orders
  const ordersCol = collection(db, 'orders');
  const usersWithoutOrders: User[] = [];
  for (const user of allUsers) {
    const q = query(ordersCol, where('userId', '==', user.id));
    const ordersSnapshot = await getDocs(q);
    if (ordersSnapshot.empty) {
      usersWithoutOrders.push(user);
    }
  }
  return usersWithoutOrders;
};
