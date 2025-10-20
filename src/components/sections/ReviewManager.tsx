import React, { useEffect, useState } from 'react';
import { fetchReviews, approveReview, disapproveReview, deleteReview, Review } from '../../firebase/reviewService';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const ReviewManager: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (e) {
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await approveReview(id);
    await loadReviews();
  };

  const handleDisapprove = async (id: string) => {
    await disapproveReview(id);
    await loadReviews();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReview(id);
      await loadReviews();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: '#703102' }}>Review Management</h1>
        <div className="text-sm text-gray-600">Total Reviews: {reviews.length}</div>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#FCE289' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Approved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words max-w-xs">{review.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} className="text-yellow-400" />)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {review.approved ? (
                      <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-1" /> Approved</span>
                    ) : (
                      <span className="flex items-center text-red-600"><XCircle size={16} className="mr-1" /> Not Approved</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {review.approved ? (
                      <button onClick={() => handleDisapprove(review.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded mr-2">Disapprove</button>
                    ) : (
                      <button onClick={() => handleApprove(review.id)} className="px-2 py-1 bg-green-100 text-green-700 rounded mr-2">Approve</button>
                    )}
                    <button onClick={() => handleDelete(review.id)} className="px-2 py-1 bg-gray-100 text-gray-700 rounded"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <div className="text-center py-12">
              <XCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews</h3>
              <p className="mt-1 text-sm text-gray-500">Reviews will appear here when submitted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewManager;
