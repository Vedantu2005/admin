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

// Blog interface
export interface Blog {
  id: string;
  firestoreId?: string;
  title: string;
  image: string;
  description: string;
  date: string;
  category: string;
  author: string;
  readTime: number;
  tags: string[];
  detail: string;
}

// FAQ interface
export interface FAQ {
  id: string;
  firestoreId?: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  order: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Firestore FAQ interface
export interface FirestoreFAQ extends Omit<FAQ, 'id'> {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

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

// Extended Blog interface for Firestore
export interface FirestoreBlog extends Omit<Blog, 'id'> {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Service class for blog operations
export class BlogService {
  private static readonly COLLECTION = 'blogs';

  // Add a new blog to Firestore
  static async addBlog(blogData: Omit<Blog, 'id' | 'firestoreId'>): Promise<string> {
    try {
      const blogToAdd: Omit<FirestoreBlog, 'id'> = {
        ...blogData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), blogToAdd);
      console.log('Blog added with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding blog: ', error);
      throw new Error('Failed to add blog');
    }
  }

  // Get all blogs from Firestore
  static async getAllBlogs(): Promise<Blog[]> {
    try {
      const q = query(collection(db, this.COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        firestoreId: doc.id,
        ...doc.data()
      })) as Blog[];
    } catch (error) {
      console.error('Error getting blogs: ', error);
      throw new Error('Failed to fetch blogs');
    }
  }

  // Update a blog in Firestore
  static async updateBlog(firestoreId: string, blogData: Omit<Blog, 'id' | 'firestoreId'>): Promise<void> {
    try {
      const blogRef = doc(db, this.COLLECTION, firestoreId);
      await updateDoc(blogRef, { ...blogData, updatedAt: Timestamp.now() });
    } catch (error) {
      console.error('Error updating blog: ', error);
      throw new Error('Failed to update blog');
    }
  }

  // Delete a blog from Firestore
  static async deleteBlog(firestoreId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, firestoreId));
    } catch (error) {
      console.error('Error deleting blog: ', error);
      throw new Error('Failed to delete blog');
    }
  }
}

// Service class for FAQ operations
export class FAQService {
  private static COLLECTION = 'faqs';

  // Add a new FAQ to Firestore
  static async addFAQ(faqData: Omit<FAQ, 'id' | 'firestoreId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const faqToAdd: Omit<FirestoreFAQ, 'id'> = {
        ...faqData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), faqToAdd);
      console.log('FAQ added with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding FAQ: ', error);
      throw new Error('Failed to add FAQ');
    }
  }

  // Get all FAQs from Firestore
  static async getAllFAQs(): Promise<FAQ[]> {
    try {
      const q = query(collection(db, this.COLLECTION), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        firestoreId: doc.id,
        ...doc.data()
      })) as FAQ[];
    } catch (error) {
      console.error('Error getting FAQs: ', error);
      throw new Error('Failed to fetch FAQs');
    }
  }

  // Get active FAQs only
  static async getActiveFAQs(): Promise<FAQ[]> {
    try {
      const allFAQs = await this.getAllFAQs();
      return allFAQs.filter(faq => faq.isActive);
    } catch (error) {
      console.error('Error getting active FAQs: ', error);
      throw new Error('Failed to fetch active FAQs');
    }
  }

  // Get FAQs by category
  static async getFAQsByCategory(category: string): Promise<FAQ[]> {
    try {
      const allFAQs = await this.getAllFAQs();
      return allFAQs.filter(faq => faq.category.toLowerCase() === category.toLowerCase());
    } catch (error) {
      console.error('Error getting FAQs by category: ', error);
      throw new Error('Failed to fetch FAQs by category');
    }
  }

  // Update a FAQ in Firestore
  static async updateFAQ(firestoreId: string, faqData: Partial<Omit<FAQ, 'id' | 'firestoreId' | 'createdAt'>>): Promise<void> {
    try {
      const faqRef = doc(db, this.COLLECTION, firestoreId);
      const updateData = {
        ...faqData,
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(faqRef, updateData);
      console.log('FAQ updated successfully');
    } catch (error) {
      console.error('Error updating FAQ: ', error);
      throw new Error('Failed to update FAQ');
    }
  }

  // Delete a FAQ from Firestore
  static async deleteFAQ(firestoreId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, firestoreId));
      console.log('FAQ deleted successfully');
    } catch (error) {
      console.error('Error deleting FAQ: ', error);
      throw new Error('Failed to delete FAQ');
    }
  }

  // Toggle FAQ active status
  static async toggleFAQStatus(firestoreId: string, isActive: boolean): Promise<void> {
    try {
      await this.updateFAQ(firestoreId, { isActive });
      console.log(`FAQ ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling FAQ status: ', error);
      throw new Error('Failed to toggle FAQ status');
    }
  }

  // Update FAQ order for sorting
  static async updateFAQOrder(firestoreId: string, newOrder: number): Promise<void> {
    try {
      await this.updateFAQ(firestoreId, { order: newOrder });
      console.log('FAQ order updated successfully');
    } catch (error) {
      console.error('Error updating FAQ order: ', error);
      throw new Error('Failed to update FAQ order');
    }
  }
}

// Podcast interface - matches exact UI structure
export interface Podcast {
  id: string;
  firestoreId?: string;
  title: string;
  image: string;
  description: string;
  youtubeLink: string;
  adminName: string;
  date: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Firestore Podcast interface
export interface FirestorePodcast extends Omit<Podcast, 'id'> {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Collection name for podcasts
const PODCASTS_COLLECTION = 'podcasts';

// Service class for podcast operations
export class PodcastService {
  // Add a new podcast to Firestore
  static async addPodcast(podcastData: Omit<Podcast, 'id' | 'firestoreId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const podcastToAdd: Omit<FirestorePodcast, 'id'> = {
        ...podcastData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, PODCASTS_COLLECTION), podcastToAdd);
      console.log('Podcast added with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding podcast: ', error);
      throw new Error('Failed to add podcast');
    }
  }

  // Get all podcasts from Firestore
  static async getAllPodcasts(): Promise<Podcast[]> {
    try {
      const q = query(collection(db, PODCASTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const podcasts: Podcast[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestorePodcast;
        podcasts.push({
          id: data.id || doc.id,
          firestoreId: doc.id,
          title: data.title || '',
          image: data.image || '',
          description: data.description || '',
          youtubeLink: data.youtubeLink || '',
          adminName: data.adminName || '',
          date: data.date || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      return podcasts;
    } catch (error) {
      console.error('Error getting podcasts: ', error);
      throw new Error('Failed to fetch podcasts');
    }
  }

  // Update an existing podcast
  static async updatePodcast(firestoreId: string, updateData: Partial<Omit<Podcast, 'id' | 'firestoreId'>>): Promise<void> {
    try {
      const podcastRef = doc(db, PODCASTS_COLLECTION, firestoreId);
      const updatePayload = {
        ...updateData,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(podcastRef, updatePayload);
      console.log('Podcast updated successfully');
    } catch (error) {
      console.error('Error updating podcast: ', error);
      throw new Error('Failed to update podcast');
    }
  }

  // Delete a podcast
  static async deletePodcast(firestoreId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PODCASTS_COLLECTION, firestoreId));
      console.log('Podcast deleted successfully');
    } catch (error) {
      console.error('Error deleting podcast: ', error);
      throw new Error('Failed to delete podcast');
    }
  }
}