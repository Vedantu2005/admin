import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Star, HelpCircle, Image as ImageIcon } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: Date;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  createdAt?: Date;
}

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: Date;
}

const Home: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch latest testimonials
        const testimonialsQuery = query(
          collection(db, 'testimonials'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const testimonialsSnapshot = await getDocs(testimonialsQuery);
        const testimonialsData = testimonialsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Testimonial[];

        // Fetch latest FAQs
        const faqsQuery = query(
          collection(db, 'faqs'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const faqsSnapshot = await getDocs(faqsQuery);
        const faqsData = faqsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FAQ[];

        // Fetch active banners
        const bannersQuery = query(
          collection(db, 'banners'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const bannersSnapshot = await getDocs(bannersQuery);
        const bannersData = bannersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Banner[];

        setTestimonials(testimonialsData);
        setFaqs(faqsData);
        setBanners(bannersData);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-blue-100">Manage your content, view latest updates, and monitor your platform</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <ImageIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Active Banners</h3>
              <p className="text-2xl font-bold text-blue-600">{banners.filter(b => b.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Testimonials</h3>
              <p className="text-2xl font-bold text-green-600">{testimonials.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <HelpCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">FAQs</h3>
              <p className="text-2xl font-bold text-yellow-600">{faqs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Banners */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-blue-600" />
              Recent Banners
            </h2>
          </div>
          <div className="p-6">
            {banners.length > 0 ? (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    {banner.imageUrl && (
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.title}
                        className="w-16 h-16 object-cover rounded-lg mr-4"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{banner.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{banner.description}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No banners found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Testimonials */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Star className="h-5 w-5 mr-2 text-green-600" />
              Recent Testimonials
            </h2>
          </div>
          <div className="p-6">
            {testimonials.length > 0 ? (
              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start">
                      {testimonial.imageUrl && (
                        <img 
                          src={testimonial.imageUrl} 
                          alt={testimonial.name}
                          className="w-12 h-12 object-cover rounded-full mr-3"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-gray-800 mr-2">{testimonial.name}</h3>
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{testimonial.comment}</p>
                        {testimonial.videoUrl && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Video Testimonial
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No testimonials found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent FAQs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-yellow-600" />
            Recent FAQs
          </h2>
        </div>
        <div className="p-6">
          {faqs.length > 0 ? (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{faq.answer}</p>
                  {faq.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full mt-2">
                      {faq.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No FAQs found</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
              <ImageIcon className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Manage Banners</h3>
              <p className="text-sm text-gray-600">Create and edit promotional banners</p>
            </button>
            
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
              <Star className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-gray-800">View Testimonials</h3>
              <p className="text-sm text-gray-600">Manage customer testimonials</p>
            </button>
            
            <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-left transition-colors">
              <HelpCircle className="h-8 w-8 text-yellow-600 mb-2" />
              <h3 className="font-semibold text-gray-800">Update FAQs</h3>
              <p className="text-sm text-gray-600">Add and edit frequently asked questions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;