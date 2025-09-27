import React, { useState } from 'react';
import Sidebar from './Sidebar';

// Import your actual components
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

// --- Placeholder Components ---
const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <p className="text-gray-600 mt-2">This is a placeholder for the {title} section.</p>
  </div>
);

// --- Product Data and Type Definitions ---
export interface Product {
  id: number;
  image: string;
  category: string;
  actualMRP: number;
  sellingMRP: number;
  variants: number;
  status: 'Active' | 'Inactive';
}
export type ComboProduct = Product;
export interface GiftProduct {
    id: number;
    image: string;
    category: string;
    mrp: number;
    contents: string;
    status: 'Active' | 'Inactive';
}

const initialProducts: Product[] = [
    { id: 1, image: 'https://media.istockphoto.com/id/1303121545/photo/cold-pressed-groundnut-oil.jpg?s=612x612&w=0&k=20&c=n-3-22-p4joJ_v4j222aG212-l-6FH6_V_24_q1fSg=', category: 'Groundnut Oil', actualMRP: 140, sellingMRP: 120, variants: 3, status: 'Active' },
    { id: 2, image: 'https://media.istockphoto.com/id/1329237936/photo/mustard-oil-in-a-glass-jar-and-seeds-in-a-wooden-bowl-on-a-jute-background.jpg?s=612x612&w=0&k=20&c=6I6sVwG30_B_b-tS_01c-vVd2XbnsJ4F2jH_x-jRPTs=', category: 'Mustard Oil', actualMRP: 180, sellingMRP: 165, variants: 2, status: 'Active' },
    { id: 3, image: 'https://media.istockphoto.com/id/1392811123/photo/bottle-of-safflower-oil-and-safflower-flower-on-the-table.jpg?s=612x612&w=0&k=20&c=_I4GzY45F-Q30u2oU5b2x7L-T-I8v1Y4-qD2k1h-tB8=', category: 'Safflower Oil', actualMRP: 220, sellingMRP: 200, variants: 4, status: 'Inactive' },
];
const initialComboProducts: ComboProduct[] = [
    { id: 1, image: 'https://via.placeholder.com/150/FFC0CB/000000?Text=Combo1', category: 'Healthy Oils Combo', actualMRP: 420, sellingMRP: 360, variants: 1, status: 'Active' },
    { id: 2, image: 'https://via.placeholder.com/150/ADD8E6/000000?Text=Combo2', category: 'Cooking Essentials Pack', actualMRP: 830, sellingMRP: 780, variants: 1, status: 'Active' },
];
const initialGiftProducts: GiftProduct[] = [
    { id: 1, image: 'https://via.placeholder.com/150/fab1a0/000000?Text=GiftBox1', category: 'Diwali Gift Hamper', mrp: 999, contents: 'Assorted Oils, Diyas, Sweets', status: 'Active' },
    { id: 2, image: 'https://via.placeholder.com/150/74b9ff/000000?Text=GiftBox2', category: 'Corporate Wellness Box', mrp: 1499, contents: 'Premium Oil Set, Dry Fruits', status: 'Inactive' },
];

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('blog');
  
  // State for Regular Products
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  
  // State for Combo Products
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>(initialComboProducts);
  const [comboProductToEdit, setComboProductToEdit] = useState<ComboProduct | null>(null);

  // State for Gifting Products
  const [giftProducts, setGiftProducts] = useState<GiftProduct[]>(initialGiftProducts);
  const [giftProductToEdit, setGiftProductToEdit] = useState<GiftProduct | null>(null);

  // --- Handlers for Regular Products ---
  const handleSaveProduct = (productData: Omit<Product, 'id' | 'status'>, id: number | null) => {
    if (id) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData, id } : p));
    } else {
      const newProduct: Product = { ...productData, id: Date.now(), status: 'Active' };
      setProducts(prev => [newProduct, ...prev]);
    }
    setProductToEdit(null);
    setActiveSection('product-list');
  };
  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure?')) setProducts(prev => prev.filter(p => p.id !== id));
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
  const handleSaveComboProduct = (productData: Omit<ComboProduct, 'id' | 'status'>, id: number | null) => {
    if (id) {
        setComboProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData, id } : p));
    } else {
        const newProduct: ComboProduct = { ...productData, id: Date.now(), status: 'Active' };
        setComboProducts(prev => [newProduct, ...prev]);
    }
    setComboProductToEdit(null);
    setActiveSection('product-list-combo');
  };
  const handleDeleteComboProduct = (id: number) => {
    if (window.confirm('Are you sure?')) setComboProducts(prev => prev.filter(p => p.id !== id));
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
  const handleSaveGiftProduct = (productData: Omit<GiftProduct, 'id' | 'status'>, id: number | null) => {
    if (id) {
        setGiftProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData, id } : p));
    } else {
        const newProduct: GiftProduct = { ...productData, id: Date.now(), status: 'Active' };
        setGiftProducts(prev => [newProduct, ...prev]);
    }
    setGiftProductToEdit(null);
    setActiveSection('product-list-gifting');
  };
  const handleDeleteGiftProduct = (id: number) => {
    if (window.confirm('Are you sure?')) {
        setGiftProducts(prev => prev.filter(p => p.id !== id));
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
        ...products.map(p => ({ id: `prod-${p.id}`, name: p.category })),
        ...comboProducts.map(p => ({ id: `combo-${p.id}`, name: p.category })),
        ...giftProducts.map(p => ({ id: `gift-${p.id}`, name: p.category }))
    ];

    switch (activeSection) {
      case 'blog': return <BlogManager />;
      case 'podcast': return <PodcastManager />;
      case 'testimonials': return <TestimonialManager />;
      case 'bulk-order': return <BulkOrderManager />;
      case 'contact': return <ContactManager />;
      case 'faq': return <FaqManager />;
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