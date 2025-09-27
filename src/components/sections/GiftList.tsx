import React, { useState } from 'react';
import { GiftProduct } from '../Dashboard';

interface GiftListProps {
  products: GiftProduct[];
  onDeleteProduct: (id: number) => void;
  onNavigateToAddProduct: () => void;
  onEditProduct: (product: GiftProduct) => void;
}

const GiftList: React.FC<GiftListProps> = ({ products, onDeleteProduct, onNavigateToAddProduct, onEditProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = products.filter(product => 
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastEntry = currentPage * entriesToShow;
  const indexOfFirstEntry = indexOfLastEntry - entriesToShow;
  const currentEntries = filteredProducts.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredProducts.length / entriesToShow);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gifting Product List</h1>
        <button 
          onClick={onNavigateToAddProduct} 
          className="px-4 py-2 text-white font-semibold rounded-md transition" 
          style={{ backgroundColor: '#703102' }}
        >
          ADD GIFTING PRODUCT
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
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-3">S No.</th>
              <th className="p-3">Image</th>
              <th className="p-3">Category</th>
              <th className="p-3">MRP</th>
              <th className="p-3">Contents</th>
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
                <td className="p-3">₹{product.mrp}</td>
                <td className="p-3 text-gray-600">{product.contents}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="p-3 flex space-x-2">
                  <button onClick={() => onEditProduct(product)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => onDeleteProduct(product.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default GiftList;