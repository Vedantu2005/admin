import { getFirestore, collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export interface Review {
  id: string;
  name: string;
  email: string;
  description: string;
  rating: number;
  productId: string;
  approved: boolean;
  createdAt: any;
}

export const fetchReviews = async (): Promise<Review[]> => {
  const db = getFirestore();
  const reviewsCol = collection(db, 'reviews');
  const reviewSnapshot = await getDocs(reviewsCol);
  return reviewSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || '',
      email: data.email || '',
      description: data.description || '',
      rating: data.rating || 0,
      productId: data.productId || '',
      approved: data.approved ?? false,
      createdAt: data.createdAt || null,
    };
  });
};

export const approveReview = async (id: string) => {
  const db = getFirestore();
  const reviewRef = doc(db, 'reviews', id);
  await updateDoc(reviewRef, { approved: true });
};

export const disapproveReview = async (id: string) => {
  const db = getFirestore();
  const reviewRef = doc(db, 'reviews', id);
  await updateDoc(reviewRef, { approved: false });
};

export const deleteReview = async (id: string) => {
  const db = getFirestore();
  const reviewRef = doc(db, 'reviews', id);
  await deleteDoc(reviewRef);
};
