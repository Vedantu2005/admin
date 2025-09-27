import React, { useState } from 'react';
import { Product } from '../Dashboard'; // Import the Product type

// Define props interface
interface ProductListProps {
  products: Product[];
  onDeleteProduct: (id: number) => void;
  onNavigateToAddProduct: () => void;
  onEditProduct: (product: Product) => void; // Add this new prop
}

const ProductList: React.FC<ProductListProps> = ({ products, onDeleteProduct, onNavigateToAddProduct, onEditProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = products.filter(product => 
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesToShow;
  const indexOfFirstEntry = indexOfLastEntry - entriesToShow;
  const currentEntries = filteredProducts.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredProducts.length / entriesToShow);

  const calculateDiscount = (actual: number, selling: number) => {
    return actual > 0 ? Math.round(((actual - selling) / actual) * 100) : 0;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product list</h1>
        <button 
          onClick={onNavigateToAddProduct} 
          className="px-4 py-2 text-white font-semibold rounded-md transition" 
          style={{ backgroundColor: '#703102' }} // Updated color
        >
          ADD PRODUCT
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <select 
            value={entriesToShow}
            onChange={(e) => { setEntriesToShow(Number(e.target.value)); setCurrentPage(1); }}
            className="p-1 border border-gray-300 rounded-md"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span>entries</span>
        </div>
        <div className="relative">
          <input 
            type="search" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="p-2 pl-8 border border-gray-300 rounded-md"
          />
          <svg className="w-4 h-4 text-gray-500 absolute top-1/2 left-2.5 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>
      
      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">S No.</th>
              <th className="p-3">Image</th>
              <th className="p-3">Category</th>
              <th className="p-3">Actual MRP</th>
              <th className="p-3">Selling MRP</th>
              <th className="p-3">Discount (in%)</th>
              <th className="p-3">No. of variants</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.map((product, index) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{indexOfFirstEntry + index + 1}</td>
                <td className="p-3"><img src={product.image} alt={product.category} className="w-10 h-10 rounded-md object-cover" /></td>
                <td className="p-3 font-medium">{product.category}</td>
                <td className="p-3">₹{product.actualMRP}</td>
                <td className="p-3">₹{product.sellingMRP}</td>
                <td className="p-3">{calculateDiscount(product.actualMRP, product.sellingMRP)}%</td>
                <td className="p-3">{product.variants}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="p-3 flex space-x-2">
                  {/* UPDATE: The onClick handler now calls onEditProduct */}
                  <button onClick={() => onEditProduct(product)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => onDeleteProduct(product.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
        <span className="text-sm text-gray-600">
          Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredProducts.length)} of {filteredProducts.length} entries
        </span>
        <div className="flex space-x-1">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-md disabled:opacity-50">
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 border rounded-md ${currentPage === i + 1 ? 'bg-[#703102] text-white' : ''}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;