import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Fetch all users together with their orders.
 * Returns an array of rows where each row represents either a user with no order
 * (order fields empty) or a user + one of their orders.
 */
export async function fetchUsersWithOrders(): Promise<Array<Record<string, unknown>>> {
  const db = getFirestore();
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const users = userSnapshot.docs.map(u => ({ id: u.id, ...(u.data() as Record<string, unknown> || {}) }));

  const ordersCol = collection(db, 'orders');

  const rows: Array<Record<string, unknown>> = [];
  for (const user of users) {
    const q = query(ordersCol, where('userId', '==', user.id));
    const ordersSnapshot = await getDocs(q);
    if (ordersSnapshot.empty) {
      const u = user as Record<string, unknown>;
      const uName = (u['name'] as string) || '';
      const uEmail = (u['email'] as string) || '';
      const uPhone = (u['phone'] as string) || '';
      rows.push({
        userId: user.id,
        userName: uName,
        userEmail: uEmail,
        userPhone: uPhone,
        orderId: '',
        orderData: '',
      });
    } else {
      const u = user as Record<string, unknown>;
      const uName = (u['name'] as string) || '';
      const uEmail = (u['email'] as string) || '';
      const uPhone = (u['phone'] as string) || '';
      ordersSnapshot.docs.forEach(o => {
        const od = (o.data() as Record<string, unknown>) || {};
        const orderCreatedAt = (od['createdAt'] as unknown) || '';
        const orderTotal = (od['total'] as unknown) || (od['amount'] as unknown) || '';
        const orderStatus = (od['status'] as string) || '';
        rows.push({
          userId: user.id,
          userName: uName,
          userEmail: uEmail,
          userPhone: uPhone,
          orderId: o.id,
          orderCreatedAt,
          orderTotal,
          orderStatus,
          orderData: JSON.stringify(od),
        });
      });
    }
  }

  return rows;
}

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
