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

// --- Placeholder Components ---
const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    <p className="text-gray-600 mt-2">This is a placeholder for the {title} section.</p>
  </div>
);

const AddGiftingProduct = () => <Placeholder title="Add Gifting Product" />;
const GiftingProductList = () => <Placeholder title="Gifting Product List" />;
const ProductOfTheDay = () => <Placeholder title="Product of the day" />;
const BestSeller = () => <Placeholder title="Best Seller" />;

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
// ComboProduct can share the same structure as Product
export type ComboProduct = Product;

const initialProducts: Product[] = [
  { id: 1, image: 'https://media.istockphoto.com/id/1303121545/photo/cold-pressed-groundnut-oil.jpg?s=612x612&w=0&k=20&c=n-3-22-p4joJ_v4j222aG212-l-6FH6_V_24_q1fSg=', category: 'Groundnut Oil', actualMRP: 140, sellingMRP: 120, variants: 3, status: 'Active' },
  { id: 2, image: 'https://media.istockphoto.com/id/1329237936/photo/mustard-oil-in-a-glass-jar-and-seeds-in-a-wooden-bowl-on-a-jute-background.jpg?s=612x612&w=0&k=20&c=6I6sVwG30_B_b-tS_01c-vVd2XbnsJ4F2jH_x-jRPTs=', category: 'Mustard Oil', actualMRP: 180, sellingMRP: 165, variants: 2, status: 'Active' },
  { id: 3, image: 'https://media.istockphoto.com/id/1392811123/photo/bottle-of-safflower-oil-and-safflower-flower-on-the-table.jpg?s=612x612&w=0&k=20&c=_I4GzY45F-Q30u2oU5b2x7L-T-I8v1Y4-qD2k1h-tB8=', category: 'Safflower Oil', actualMRP: 220, sellingMRP: 200, variants: 4, status: 'Inactive' },
];

// Initial data for Combo Products
const initialComboProducts: ComboProduct[] = [
    { id: 1, image: 'https://via.placeholder.com/150/FFC0CB/000000?Text=Combo1', category: 'Healthy Oils Combo', actualMRP: 420, sellingMRP: 360, variants: 1, status: 'Active' },
    { id: 2, image: 'https://via.placeholder.com/150/ADD8E6/000000?Text=Combo2', category: 'Cooking Essentials Pack', actualMRP: 830, sellingMRP: 780, variants: 1, status: 'Active' },
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
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
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
    if (window.confirm('Are you sure you want to delete this combo product?')) {
        setComboProducts(prev => prev.filter(p => p.id !== id));
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

  const renderActiveSection = () => {
    switch (activeSection) {
      // Standard Sections
      case 'blog': return <BlogManager />;
      case 'podcast': return <PodcastManager />;
      case 'testimonials': return <TestimonialManager />;
      case 'bulk-order': return <BulkOrderManager />;
      case 'contact': return <ContactManager />;
      case 'faq': return <FaqManager />;

      // Product Sub-Sections
      case 'product-add':
        return <AddProduct onSaveProduct={handleSaveProduct} productToEdit={productToEdit} />;
      case 'product-list':
        return <ProductList products={products} onDeleteProduct={handleDeleteProduct} onNavigateToAddProduct={handleNavigateToAddProduct} onEditProduct={handleEditProduct} />;
      
      // Combo Product Sub-Sections
      case 'product-add-combo':
        return <AddComboProduct onSaveProduct={handleSaveComboProduct} productToEdit={comboProductToEdit} />;
      case 'product-list-combo':
        return <ComboProductList products={comboProducts} onDeleteProduct={handleDeleteComboProduct} onNavigateToAddProduct={handleNavigateToAddComboProduct} onEditProduct={handleEditComboProduct} />;

      // Gifting & Other Product Sections
      case 'product-add-gifting': return <AddGiftingProduct />;
      case 'product-list-gifting': return <GiftingProductList />;
      case 'product-of-the-day': return <ProductOfTheDay />;
      case 'product-best-seller': return <BestSeller />;

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