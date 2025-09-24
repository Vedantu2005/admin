import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  message: string;
}

const ContactManager: React.FC = () => {
  // Sample data with Indian details
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      firstName: 'Rohan',
      lastName: 'Joshi',
      email: 'rohan.joshi@example.com',
      mobileNo: '+91 9820098200',
      message: 'I would like to know more about your services.'
    },
    {
      id: '2',
      firstName: 'Isha',
      lastName: 'Mehra',
      email: 'isha@company.co.in',
      mobileNo: '+91 9930099300',
      message: 'Can you provide a quote for your premium package?'
    },
    {
      id: '3',
      firstName: 'Arjun',
      lastName: 'Nair',
      email: 'arjun.nair@email.com',
      mobileNo: '+91 9819098190',
      message: 'Interested in scheduling a consultation for our upcoming project. Please contact me at your earliest convenience.'
    },
    {
      id: '4',
      firstName: 'Saanvi',
      lastName: 'Reddy',
      email: 'saanvi@business.in',
      mobileNo: '+91 9870098700',
      message: 'Need technical support for implementation. Having some issues with the setup process.'
    },
    {
      id: '5',
      firstName: 'Kabir',
      lastName: 'Malhotra',
      email: 'kabir@company.org',
      mobileNo: '+91 9892098920',
      message: 'Would like to discuss partnership opportunities. Our company is interested in collaboration.'
    },
    {
      id: '6',
      firstName: 'Diya',
      lastName: 'Chopra',
      email: 'diya@solutions.com',
      mobileNo: '+91 9867098670',
      message: 'Question about pricing and availability for enterprise solutions. Need detailed information.'
    },
    {
      id: '7',
      firstName: 'Advik',
      lastName: 'Verma',
      email: 'advik.v@webmail.in',
      mobileNo: '+91 9987099870',
      message: 'Following up on our previous conversation regarding the project timeline.'
    },
    {
      id: '8',
      firstName: 'Myra',
      lastName: 'Gupta',
      email: 'myra.gupta@personal.com',
      mobileNo: '+91 9967099670',
      message: 'I have a billing inquiry that needs to be resolved.'
    },
    {
      id: '9',
      firstName: 'Aarav',
      lastName: 'Singh',
      email: 'aarav@singhenterprises.com',
      mobileNo: '+91 9167091670',
      message: 'Request for a demo of your latest software update.'
    },
    {
      id: '10',
      firstName: 'Zara',
      lastName: 'Khan',
      email: 'zara.khan@fashion.co.in',
      mobileNo: '+91 9029090290',
      message: 'Inquiring about vendor registration and policies.'
    },
    {
      id: '11',
      firstName: 'Vivaan',
      lastName: 'Agarwal',
      email: 'vivaan.a@tradecorp.in',
      mobileNo: '+91 9320093200',
      message: 'Need to update my contact information in your records.'
    }
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  // --- MODIFIED: Set items per page to 5 to show pagination ---
  const itemsPerPage = 10;
  const totalPages = Math.ceil(contacts.length / itemsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return contacts.slice(startIndex, endIndex);
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
        <h1 className="text-3xl font-bold" style={{ color: '#703102' }}>Contact Management</h1>
        <div className="text-sm text-gray-600">
          Total Contacts: {contacts.length}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#FCE289' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Mobile No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageData().map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.firstName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.mobileNo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words max-w-xs">
                    {contact.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {contacts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts</h3>
              <p className="mt-1 text-sm text-gray-500">Contact messages will appear here when submitted.</p>
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
                    {Math.min(currentPage * itemsPerPage, contacts.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{contacts.length}</span>
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

export default ContactManager;