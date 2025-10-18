import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './config';

export interface BulkOrder {
  id: string;
  firstName: string;
  email: string;
  mobileNo: string;
  state: string;
  productName: string;
  companyName: string;
  message: string;
}

export async function fetchBulkOrders(): Promise<BulkOrder[]> {
  const q = query(collection(db, 'bulkOrders'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      firstName: data.firstName || '',
      email: data.email || '',
      mobileNo: data.phoneNumber || data.mobileNo || '',
      state: data.state || '',
      productName: data.productName || '',
      companyName: data.companyName || '',
      message: data.message || '',
    };
  });
}
