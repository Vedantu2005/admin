import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { Product, GiftProduct } from '../components/Dashboard';

// Collection name for products
const PRODUCTS_COLLECTION = 'products';

// Extended Product interface for Firestore (includes Firestore metadata)
export interface FirestoreProduct extends Omit<Product, 'id'> {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  image?: string; // For backward compatibility
}

// Service class for product operations
export class ProductService {
  // Add a new product to Firestore
  static async addProduct(productData: Omit<Product, 'id' | 'firestoreId'>): Promise<string> {
    try {
      const productToAdd: Omit<FirestoreProduct, 'id'> = {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productToAdd);
      console.log('Product added with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product: ', error);
      throw new Error('Failed to add product');
    }
  }

  // Get all products from Firestore
  static async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreProduct;
        products.push({
          id: parseInt(doc.id.slice(-8), 16), // Convert Firestore ID to number for compatibility
          firestoreId: doc.id, // Keep original Firestore ID for operations
          
          // Basic product info
          productName: data.productName || data.category || '',
          category: data.category || '',
          shortDescription: data.shortDescription || '',
          rating: data.rating || '',
          longDescription: data.longDescription || '',
          
          // Pricing (for backward compatibility with ProductList)
          actualMRP: data.actualMRP || 0,
          sellingMRP: data.sellingMRP || 0,
          variants: data.variants || (data.productVariants?.length || 0),
          status: data.status || 'Active',
          
          // Images (backward compatibility)
          image: data.mainImage || data.image || '',
          mainImage: data.mainImage,
          otherImages: data.otherImages,
          
          // Product info
          ingredients: data.ingredients,
          benefits: data.benefits,
          storageInfo: data.storageInfo,
          
          // Variants and FAQs
          productVariants: data.productVariants,
          productFaqs: data.productFaqs,
        } as Product & { firestoreId: string });
      });
      
      return products;
    } catch (error) {
      console.error('Error getting products: ', error);
      throw new Error('Failed to fetch products');
    }
  }

  // Update a product in Firestore
  static async updateProduct(firestoreId: string, productData: Partial<Omit<Product, 'id' | 'firestoreId'>>): Promise<void> {
    try {
      const productRef = doc(db, PRODUCTS_COLLECTION, firestoreId);
      const updateData = {
        ...productData,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(productRef, updateData);
      console.log('Product updated successfully');
    } catch (error) {
      console.error('Error updating product: ', error);
      throw new Error('Failed to update product');
    }
  }

  // Delete a product from Firestore
  static async deleteProduct(firestoreId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, firestoreId));
      console.log('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product: ', error);
      throw new Error('Failed to delete product');
    }
  }
}

// Service class for combo products
export class ComboProductService {
  private static COLLECTION = 'comboProducts';

  static async addComboProduct(productData: Omit<Product, 'id' | 'firestoreId'>): Promise<string> {
    try {
      const productToAdd = {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), productToAdd);
      return docRef.id;
    } catch (error) {
      console.error('Error adding combo product: ', error);
      throw new Error('Failed to add combo product');
    }
  }

  static async getAllComboProducts(): Promise<Product[]> {
    try {
      const q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: parseInt(doc.id.slice(-8), 16),
          firestoreId: doc.id,
          ...data,
        } as Product & { firestoreId: string });
      });
      
      return products;
    } catch (error) {
      console.error('Error getting combo products: ', error);
      throw new Error('Failed to fetch combo products');
    }
  }

  static async updateComboProduct(firestoreId: string, productData: Partial<Omit<Product, 'id' | 'firestoreId'>>): Promise<void> {
    try {
      const productRef = doc(db, this.COLLECTION, firestoreId);
      await updateDoc(productRef, { ...productData, updatedAt: Timestamp.now() });
    } catch (error) {
      console.error('Error updating combo product: ', error);
      throw new Error('Failed to update combo product');
    }
  }

  static async deleteComboProduct(firestoreId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, firestoreId));
    } catch (error) {
      console.error('Error deleting combo product: ', error);
      throw new Error('Failed to delete combo product');
    }
  }
}

// Service class for gift products
export class GiftProductService {
  private static COLLECTION = 'giftProducts';

  static async addGiftProduct(productData: Omit<GiftProduct, 'id' | 'firestoreId'>): Promise<string> {
    try {
      const productToAdd = {
        ...productData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), productToAdd);
      return docRef.id;
    } catch (error) {
      console.error('Error adding gift product: ', error);
      throw new Error('Failed to add gift product');
    }
  }

  static async getAllGiftProducts(): Promise<GiftProduct[]> {
    try {
      const q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const products: GiftProduct[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: parseInt(doc.id.slice(-8), 16),
          firestoreId: doc.id,
          ...data,
        } as GiftProduct & { firestoreId: string });
      });
      
      return products;
    } catch (error) {
      console.error('Error getting gift products: ', error);
      throw new Error('Failed to fetch gift products');
    }
  }

  static async updateGiftProduct(firestoreId: string, productData: Partial<Omit<GiftProduct, 'id' | 'firestoreId'>>): Promise<void> {
    try {
      const productRef = doc(db, this.COLLECTION, firestoreId);
      await updateDoc(productRef, { ...productData, updatedAt: Timestamp.now() });
    } catch (error) {
      console.error('Error updating gift product: ', error);
      throw new Error('Failed to update gift product');
    }
  }

  static async deleteGiftProduct(firestoreId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, firestoreId));
    } catch (error) {
      console.error('Error deleting gift product: ', error);
      throw new Error('Failed to delete gift product');
    }
  }
}