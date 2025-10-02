import React, { useState, useEffect } from 'react';
import { ProductService } from '../firebase/productService';
import { Product } from '../components/Dashboard';

// Demo component to test Firebase integration
const FirebaseDemo: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const productsData = await ProductService.getAllProducts();
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load products. Make sure Firebase is configured.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addSampleProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const sampleProduct = {
        productName: 'Sample Oil',
        category: 'Sample Oil',
        shortDescription: 'A sample oil for testing',
        rating: '5',
        longDescription: 'This is a sample oil product for testing Firebase integration.',
        mainImage: 'https://example.com/sample.jpg',
        actualMRP: 100,
        sellingMRP: 80,
        variants: 1,
        status: 'Active' as const,
      };
      
      await ProductService.addProduct(sampleProduct);
      await loadProducts(); // Reload products
    } catch (err) {
      setError('Failed to add product. Make sure Firebase is configured.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Integration Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <button 
          onClick={addSampleProduct} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          Add Sample Product
        </button>
        <button 
          onClick={loadProducts} 
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Reload Products
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-3">Products ({products.length})</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products found. Try adding a sample product.</p>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded p-3">
                <h3 className="font-medium">{product.productName || product.category}</h3>
                <p className="text-sm text-gray-600">
                  MRP: ₹{product.sellingMRP} (was ₹{product.actualMRP})
                </p>
                <p className="text-sm text-gray-600">
                  Status: {product.status} | Variants: {product.variants}
                </p>
                {product.shortDescription && (
                  <p className="text-xs text-gray-500 mt-1">{product.shortDescription}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseDemo;