import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

interface BulkOrder {
  id: string;
  firstName: string;
  email: string;
  mobileNo: string;
  state: string;
  productName: string;
  companyName: string;
  message: string;
}

const BulkOrderManager: React.FC = () => {
  // Sample data with Indian details (now 11 entries)
  const [bulkOrders] = useState<BulkOrder[]>([
    {
      id: '1',
      firstName: 'Aditya Sharma',
      email: 'aditya.sharma@example.com',
      mobileNo: '+91 9876543210',
      state: 'Maharashtra',
      productName: 'Widget Pro',
      companyName: 'Sharma Enterprises',
      message: 'Need 1000 units for our Diwali sales campaign.'
    },
    {
      id: '2',
      firstName: 'Priya Patel',
      email: 'priya.p@company.co.in',
      mobileNo: '+91 8765432109',
      state: 'Gujarat',
      productName: 'Super Widget',
      companyName: 'Patel Traders',
      message: 'Bulk order for annual inventory for our Ahmedabad branch.'
    },
    {
      id: '3',
      firstName: 'Rahul Kumar',
      email: 'rahul.k@techsolutions.in',
      mobileNo: '+91 7654321098',
      state: 'Delhi',
      productName: 'Premium Package',
      companyName: 'Kumar Solutions Pvt. Ltd.',
      message: 'Looking for enterprise-level bulk pricing for 500+ units. Need delivery by end of March.'
    },
    {
      id: '4',
      firstName: 'Anjali Singh',
      email: 'anjali@innovate.in',
      mobileNo: '+91 9123456789',
      state: 'Karnataka',
      productName: 'Starter Kit',
      companyName: 'Innovate India',
      message: 'Interested in a bulk purchase for our new office setup in Bengaluru. Please provide volume discounts.'
    },
    {
      id: '5',
      firstName: 'Vikram Reddy',
      email: 'vikram@globaltech.co.in',
      mobileNo: '+91 8987654321',
      state: 'Telangana',
      productName: 'Professional Suite',
      companyName: 'Global Tech Hyderabad',
      message: 'Need 750 units for Q3 rollout across multiple locations. Urgent requirement for our Hyderabad office.'
    },
    {
      id: '6',
      firstName: 'Sneha Gupta',
      email: 'sneha@startup.com',
      mobileNo: '+91 7890123456',
      state: 'Uttar Pradesh',
      productName: 'Basic Package',
      companyName: 'Startup Ventures India',
      message: 'We are a small startup from Lucknow looking for affordable bulk options. '
    },
    {
      id: '7',
      firstName: 'Kavita Iyer',
      email: 'k.iyer@corp.net',
      mobileNo: '+91 9988776655',
      state: 'Tamil Nadu',
      productName: 'Eco-Friendly Bags',
      companyName: 'Iyer & Sons',
      message: 'Requesting a quote for 10,000 eco-friendly bags for a state-wide event in Chennai.'
    },
    {
      id: '8',
      firstName: 'Sandeep Menon',
      email: 'sandeep.m@keralaexports.com',
      mobileNo: '+91 8877665544',
      state: 'Kerala',
      productName: 'Spices Combo Pack',
      companyName: 'Kerala Exports',
      message: 'Need to ship 500 spice combo packs to our international client from Kochi.'
    },
    {
      id: '9',
      firstName: 'Pooja Desai',
      email: 'pooja.desai@hospitality.com',
      mobileNo: '+91 7766554433',
      state: 'Goa',
      productName: 'Hotel Amenity Kits',
      companyName: 'Desai Hospitality',
      message: 'Bulk order for amenity kits for our chain of hotels in Goa.'
    },
    {
      id: '10',
      firstName: 'Rajesh Singhaniya',
      email: 'rajesh@singhaniya.com',
      mobileNo: '+91 9000011111',
      state: 'Rajasthan',
      productName: 'Handcrafted Textiles',
      companyName: 'Singhaniya Textiles',
      message: 'We need a large order of handcrafted textiles for our Jaipur store.'
    },
    {
      id: '11',
      firstName: 'Amitabh Ghosh',
      email: 'a.ghosh@books.co.in',
      mobileNo: '+91 8112233445',
      state: 'West Bengal',
      productName: 'Bestseller Book Set',
      companyName: 'Kolkata Book House',
      message: 'Order for 500 sets of the new bestseller for distribution across Kolkata.'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  // --- MODIFIED: Set items per page to 5 to show pagination ---
  const itemsPerPage = 5;
  const totalPages = Math.ceil(bulkOrders.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return bulkOrders.slice(startIndex, endIndex);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#703102' }}>Bulk Order Management</h1>
        <div className="text-sm text-gray-600">
          Total Orders: {bulkOrders.length}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#FCE289' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Mobile No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageData().map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.firstName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.mobileNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.state}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.productName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.companyName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words max-w-xs">
                    {order.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {bulkOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bulk orders</h3>
              <p className="mt-1 text-sm text-gray-500">Bulk orders will appear here when submitted.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, bulkOrders.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{bulkOrders.length}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkOrderManager;