import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { ProductService, ComboProductService, GiftProductService } from '../firebase/productService';

// Import your actual components
import BannerManager from './sections/BannerManager';
import BlogManager from './sections/BlogManager';
import PodcastManager from './sections/PodcastManager';
import TestimonialManager from './sections/TestimonialManager';
import BulkOrderManager from './sections/BulkOrderManager';
import ContactManager from './sections/ContactManager';
import FaqManager from './sections/FaqManager';
import AddProduct from './sections/AddProduct';
import ProductList from './sections/ProductList';
import AddComboProduct from './sections/AddComboProduct';
import ComboProductList from './sections/ComboProductList';
import AddGift from './sections/AddGift';
import GiftList from './sections/GiftList';
import BestSeller from './sections/BestSeller';
import ProductOfTheDay from './sections/ProductOfTheDay';
import Slider from './sections/Slider';
import UserManager from './sections/UserManager';

// --- Product Data and Type Definitions ---
export interface ProductVariant {
  id: number;
  bottleSize: string;
  actualMRP: number;
  sellingMRP: number;
  discount: number;
  pricePerLiter: number;
}

export interface ProductFaq {
  id: number;
  question: string;
  answer: string;
}

export interface Product {
  id: number;
  firestoreId?: string; // Add Firestore ID for operations
  
  // Basic product info
  productName: string;
  category: string;
  shortDescription: string;
  rating: string;
  longDescription: string;
  
  // Pricing (legacy compatibility)
  actualMRP: number;
  sellingMRP: number;
  variants: number; // Count of variants
  status: 'Active' | 'Inactive';
  
  // Images
  image?: string; // For backward compatibility
  mainImage?: string;
  otherImages?: string[];
  
  // Product info
  ingredients?: string;
  benefits?: string;
  storageInfo?: string;
  
  // Variants and FAQs
  productVariants?: ProductVariant[];
  productFaqs?: ProductFaq[];
}

export type ComboProduct = Product;
export interface GiftProduct {
    id: number;
    firestoreId?: string; // Add Firestore ID for operations
    image: string;
    category: string;
    mrp: number;
    contents: string;
    description?: string; // Product description
    otherImages?: string[]; // Array of additional image URLs
    productFaqs?: ProductFaq[]; // Product FAQs
    status: 'Active' | 'Inactive';
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('banners');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for Regular Products
  const [products, setProducts] = useState<Product[]>([]);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  // State for Combo Products
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);
  const [comboProductToEdit, setComboProductToEdit] = useState<ComboProduct | null>(null);

  // State for Gifting Products
  const [giftProducts, setGiftProducts] = useState<GiftProduct[]>([]);
  const [giftProductToEdit, setGiftProductToEdit] = useState<GiftProduct | null>(null);

  // Load data from Firestore on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, comboProductsData, giftProductsData] = await Promise.all([
        ProductService.getAllProducts(),
        ComboProductService.getAllComboProducts(),
        GiftProductService.getAllGiftProducts()
      ]);
      
      setProducts(productsData);
      setComboProducts(comboProductsData);
      setGiftProducts(giftProductsData);
    } catch (err) {
      setError('Failed to load data from database');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Regular Products ---
  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'status' | 'firestoreId'>, id: number | null) => {
    setLoading(true);
    setError(null);
    try {
      if (id && productToEdit?.firestoreId) {
        // Update existing product
        await ProductService.updateProduct(productToEdit.firestoreId, productData);
        setProducts(prev => prev.map(p => 
          p.id === id ? { ...p, ...productData, id } : p
        ));
      } else {
        // Add new product
        const firestoreId = await ProductService.addProduct({ ...productData, status: 'Active' });
        const newProduct: Product = { 
          ...productData, 
          id: Date.now(), 
          status: 'Active',
          firestoreId 
        };
        setProducts(prev => [newProduct, ...prev]);
      }
      setProductToEdit(null);
      setActiveSection('product-list');
    } catch (err) {
      setError('Failed to save product');
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      setError(null);
      try {
        const product = products.find(p => p.id === id);
        if (product?.firestoreId) {
          await ProductService.deleteProduct(product.firestoreId);
          setProducts(prev => prev.filter(p => p.id !== id));
        }
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setActiveSection('product-add');
  };

  const handleNavigateToAddProduct = () => {
    setProductToEdit(null);
    setActiveSection('product-add');
  };

  // --- Handlers for Combo Products ---
  const handleSaveComboProduct = async (productData: Omit<ComboProduct, 'id' | 'status' | 'firestoreId'>, id: number | null) => {
    setLoading(true);
    setError(null);
    try {
      if (id && comboProductToEdit?.firestoreId) {
        await ComboProductService.updateComboProduct(comboProductToEdit.firestoreId, productData);
        setComboProducts(prev => prev.map(p => 
          p.id === id ? { ...p, ...productData, id } : p
        ));
      } else {
        const firestoreId = await ComboProductService.addComboProduct({ ...productData, status: 'Active' });
        const newProduct: ComboProduct = { 
          ...productData, 
          id: Date.now(), 
          status: 'Active',
          firestoreId 
        };
        setComboProducts(prev => [newProduct, ...prev]);
      }
      setComboProductToEdit(null);
      setActiveSection('product-list-combo');
    } catch (err) {
      setError('Failed to save combo product');
      console.error('Error saving combo product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComboProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this combo product?')) {
      setLoading(true);
      setError(null);
      try {
        const product = comboProducts.find(p => p.id === id);
        if (product?.firestoreId) {
          await ComboProductService.deleteComboProduct(product.firestoreId);
          setComboProducts(prev => prev.filter(p => p.id !== id));
        }
      } catch (err) {
        setError('Failed to delete combo product');
        console.error('Error deleting combo product:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditComboProduct = (product: ComboProduct) => {
    setComboProductToEdit(product);
    setActiveSection('product-add-combo');
  };

  const handleNavigateToAddComboProduct = () => {
    setComboProductToEdit(null);
    setActiveSection('product-add-combo');
  };
  
  // --- Handlers for Gifting Products ---
  const handleSaveGiftProduct = async (productData: Omit<GiftProduct, 'id' | 'status' | 'firestoreId'>, id: number | null) => {
    setLoading(true);
    setError(null);
    try {
      if (id && giftProductToEdit?.firestoreId) {
        await GiftProductService.updateGiftProduct(giftProductToEdit.firestoreId, productData);
        setGiftProducts(prev => prev.map(p => 
          p.id === id ? { ...p, ...productData, id } : p
        ));
      } else {
        const firestoreId = await GiftProductService.addGiftProduct({ ...productData, status: 'Active' });
        const newProduct: GiftProduct = { 
          ...productData, 
          id: Date.now(), 
          status: 'Active',
          firestoreId 
        };
        setGiftProducts(prev => [newProduct, ...prev]);
      }
      setGiftProductToEdit(null);
      setActiveSection('product-list-gifting');
    } catch (err) {
      setError('Failed to save gift product');
      console.error('Error saving gift product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGiftProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this gift product?')) {
      setLoading(true);
      setError(null);
      try {
        const product = giftProducts.find(p => p.id === id);
        if (product?.firestoreId) {
          await GiftProductService.deleteGiftProduct(product.firestoreId);
          setGiftProducts(prev => prev.filter(p => p.id !== id));
        }
      } catch (err) {
        setError('Failed to delete gift product');
        console.error('Error deleting gift product:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditGiftProduct = (product: GiftProduct) => {
    setGiftProductToEdit(product);
    setActiveSection('product-add-gifting');
  };

  const handleNavigateToAddGiftProduct = () => {
    setGiftProductToEdit(null);
    setActiveSection('product-add-gifting');
  };

  const renderActiveSection = () => {
    // Helper to create the combined list for dropdowns
    const getAllItemsForDropdown = () => [
    ...products.map(p => ({ 
      id: p.firestoreId || p.id, 
      name: p.productName,
      collection: 'products'
    })),
    ...comboProducts.map(p => ({ 
      id: p.firestoreId || p.id, 
      name: p.productName,
      collection: 'comboProducts'
    })),
    ...giftProducts.map(p => ({ 
      id: p.firestoreId || p.id, 
      name: p.productName || p.category,
      collection: 'giftProducts'
    }))
  ];

    // Show loading or error states
    if (loading) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600">{error}</div>
            <button 
              onClick={loadAllData}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'banners': return <BannerManager />;
      case 'faq': return <FaqManager />;
      case 'testimonials': return <TestimonialManager />;
      case 'slider': return <Slider />;
      case 'blog': return <BlogManager />;
      case 'podcast': return <PodcastManager />;
      case 'bulk-order': return <BulkOrderManager />;
      case 'contact': return <ContactManager />;
      case 'product-add': return <AddProduct onSaveProduct={handleSaveProduct} productToEdit={productToEdit} />;
      case 'product-list': return <ProductList products={products} onDeleteProduct={handleDeleteProduct} onNavigateToAddProduct={handleNavigateToAddProduct} onEditProduct={handleEditProduct} />;
      case 'product-add-combo': return <AddComboProduct onSaveProduct={handleSaveComboProduct} productToEdit={comboProductToEdit} />;
      case 'product-list-combo': return <ComboProductList products={comboProducts} onDeleteProduct={handleDeleteComboProduct} onNavigateToAddProduct={handleNavigateToAddComboProduct} onEditProduct={handleEditComboProduct} />;
      case 'product-add-gifting': return <AddGift onSaveProduct={handleSaveGiftProduct} productToEdit={giftProductToEdit} />;
      case 'product-list-gifting': return <GiftList products={giftProducts} onDeleteProduct={handleDeleteGiftProduct} onNavigateToAddProduct={handleNavigateToAddGiftProduct} onEditProduct={handleEditGiftProduct} />;
      
      case 'product-of-the-day': 
        return <ProductOfTheDay allItems={getAllItemsForDropdown()} />;

      case 'product-best-seller': 
        return <BestSeller allItems={getAllItemsForDropdown()} />;

  case 'user': return <UserManager />;
  default: return <BlogManager />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;