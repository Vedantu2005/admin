import React, { useState } from 'react';
import { Product } from '../Dashboard'; // Import the Product type
import { Pencil, Trash2, Plus } from 'lucide-react'; // Import icons for better UI

// Define props interface
interface ProductListProps {
  products: Product[];
  onDeleteProduct: (firestoreId: string) => void;
  onNavigateToAddProduct: () => void;
  onEditProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  onDeleteProduct, 
  onNavigateToAddProduct, 
  onEditProduct 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Safe filtering ensuring product and category exist
  const filteredProducts = products.filter(product => 
    product?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesToShow;
  const indexOfFirstEntry = indexOfLastEntry - entriesToShow;
  const currentEntries = filteredProducts.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredProducts.length / entriesToShow);

  const calculateDiscount = (actual: number, selling: number) => {
    return actual > 0 ? Math.round(((actual - selling) / actual) * 100) : 0;
  };

  // Handler to safely trigger edit
  const handleEditClick = (product: Product) => {
    console.log('Editing product:', product);
    onEditProduct(product);
  };

  // Handler to safely trigger delete
  const handleDeleteClick = (firestoreId: string) => {
    console.log('Deleting product with firestoreId:', firestoreId);
    onDeleteProduct(firestoreId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product list</h1>
        <button 
          onClick={onNavigateToAddProduct} 
          className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-md transition hover:bg-[#5a2701]" 
          style={{ backgroundColor: '#703102' }}
        >
          <Plus size={18} />
          ADD PRODUCT
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Show</span>
          <select 
            value={entriesToShow}
            onChange={(e) => { setEntriesToShow(Number(e.target.value)); setCurrentPage(1); }}
            className="p-1 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-[#703102]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="text-gray-600">entries</span>
        </div>
        <div className="relative">
          <input 
            type="search" 
            placeholder="Search by category or name..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="p-2 pl-10 border border-gray-300 rounded-md w-64 focus:outline-none focus:border-[#703102]"
          />
          <svg className="w-4 h-4 text-gray-500 absolute top-1/2 left-3 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {/* Product Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
            <tr>
              <th className="p-4">S No.</th>
              <th className="p-4">Image</th>
              <th className="p-4">Product Name / Category</th>
              <th className="p-4">Actual MRP</th>
              <th className="p-4">Selling MRP</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Variants</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentEntries.length > 0 ? (
              currentEntries.map((product, index) => (
                <tr key={product.firestoreId} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-600 font-medium">{indexOfFirstEntry + index + 1}</td>
                  <td className="p-4">
                    <img 
                      src={product.mainImage || product.image || 'https://via.placeholder.com/40'} 
                      alt={product.category} 
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200" 
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{product.productName}</div>
                    <div className="text-xs text-gray-500">{product.category}</div>
                  </td>
                  <td className="p-4 text-gray-600">₹{product.actualMRP}</td>
                  <td className="p-4 font-medium text-gray-800">₹{product.sellingMRP}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-semibold">
                      {calculateDiscount(product.actualMRP, product.sellingMRP)}%
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-center">{product.variants}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditClick(product)} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Edit Product"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(product.firestoreId || '')} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
          <span className="text-sm text-gray-600">
            Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredProducts.length)} of {filteredProducts.length} entries
          </span>
          <div className="flex space-x-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1} 
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Logic to show simple page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(currentPage - page) <= 1)
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 py-1 text-gray-400">...</span>}
                  <button 
                    onClick={() => setCurrentPage(page)} 
                    className={`px-3 py-1 border rounded-md transition-colors ${
                      currentPage === page 
                        ? 'bg-[#703102] text-white border-[#703102]' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages} 
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;