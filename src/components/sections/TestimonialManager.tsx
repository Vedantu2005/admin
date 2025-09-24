import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Star, Video, User, Play, X } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  image: string;
  location: string;
  description: string;
  rating: number;
  type: 'text' | 'video';
  videoFile?: string;
}

const TestimonialManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      name: 'Priya Sharma',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300',
      location: 'Mumbai, Maharashtra',
      description: 'The mustard oil from Dev Natural Oils has that authentic taste I remember from my childhood. The quality is exceptional and you can really taste the difference!',
      rating: 5,
      type: 'text'
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
      location: 'Delhi, NCR',
      description: 'I have been using their coconut oil for cooking and it’s amazing. Pure, natural, and the aroma is just perfect. Highly recommended for health-conscious families.',
      rating: 4,
      type: 'text',
    },
    {
      id: '3',
      name: 'Meera Patel',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
      location: 'Ahmedabad, Gujarat',
      description: 'The groundnut oil is excellent for deep frying. It doesn’t break down at high temperatures and gives food a wonderful taste. Great quality at reasonable prices.',
      rating: 5,
      type: 'text'
    },
    {
      id: '4',
      name: 'Priya Sharma',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300',
      location: 'Mumbai, Maharashtra',
      description: 'A video message about the authentic taste of their mustard oil.',
      rating: 5,
      type: 'video',
      videoFile: 'sample-video-1.mp4'
    },
    {
      id: '5',
      name: 'Rajesh Kumar',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
      location: 'Delhi, NCR',
      description: 'A video review of their pure and natural coconut oil.',
      rating: 5,
      type: 'video',
      videoFile: 'sample-video-2.mp4'
    },
    {
      id: '6',
      name: 'Meera Patel',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300',
      location: 'Ahmedabad, Gujarat',
      description: 'A video testimonial explaining the benefits of their groundnut oil.',
      rating: 5,
      type: 'video',
      videoFile: 'sample-video-3.mp4'
    }
  ]);

  const initialFormState = {
    name: '',
    image: '',
    location: '',
    description: '',
    rating: 5,
    type: 'text' as 'text' | 'video',
    videoFile: ''
  };

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestimonial) {
      setTestimonials(testimonials.map(testimonial =>
        testimonial.id === editingTestimonial.id
          ? { ...formData, id: editingTestimonial.id }
          : testimonial
      ));
    } else {
      setTestimonials([...testimonials, { ...formData, id: Date.now().toString() }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsAddFormOpen(false);
    setEditingTestimonial(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    // Ensure videoFile is always a string, defaulting to '' if undefined
    setFormData({
      ...testimonial,
      videoFile: testimonial.videoFile || '',
    });
  };

  const handleDelete = (id: string) => {
    setTestimonials(testimonials.filter(testimonial => testimonial.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, videoFile: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const textTestimonials = testimonials.filter(t => t.type === 'text');
  const videoTestimonials = testimonials.filter(t => t.type === 'video');

  // Reusable Form Component
  const TestimonialForm = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial Type</label>
        <div className="flex space-x-4">
          <label className="flex items-center"><input type="radio" value="text" checked={formData.type === 'text'} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'video' })} className="mr-2" /> Text</label>
          <label className="flex items-center"><input type="radio" value="video" checked={formData.type === 'video'} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'text' | 'video' })} className="mr-2" /> Video</label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
        {formData.image && <img src={formData.image} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-full" />}
      </div>
      {formData.type === 'video' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video</label>
          <input type="file" accept="video/*" onChange={handleVideoUpload} className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
          {formData.videoFile && <video src={formData.videoFile} className="mt-2 w-64 h-36 object-cover rounded-lg" controls />}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <select value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required >
          {[1, 2, 3, 4, 5].map(rating => <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
      </div>
      <div className="flex space-x-3">
        <button type="submit" className="px-6 py-2 rounded-lg text-white transition-colors" style={{ backgroundColor: '#499E47' }}>{editingTestimonial ? 'Update' : 'Create'} Testimonial</button>
        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
      </div>
    </form>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#703102' }}>Testimonial Management</h1>
        <button
          onClick={() => { resetForm(); setIsAddFormOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#499E47' }}
        >
          <Plus size={20} />
          <span>Add New Testimonial</span>
        </button>
      </div>

      {/* --- ADD NEW FORM (TOP) --- */}
      {isAddFormOpen && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Add New Testimonial</h2>
          <TestimonialForm onCancel={resetForm} />
        </div>
      )}

      {/* --- EDIT MODAL (POPUP) --- */}
      {editingTestimonial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Edit Testimonial</h2>
            <TestimonialForm onCancel={resetForm} />
          </div>
        </div>
      )}

      {/* --- DISPLAY SECTIONS --- */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#703102' }}>Text Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {textTestimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-white rounded-xl shadow-md p-6 relative group border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <span className="absolute top-4 right-4 text-6xl text-yellow-400/30 font-serif">❞</span>
              <div className="flex items-center mb-4">
                <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 object-cover rounded-full mr-4 border-2 border-white shadow-sm" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{testimonial.name}</h3>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
              <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
              <p className="text-gray-600 italic">"{testimonial.description}"</p>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button onClick={() => handleEdit(testimonial)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(testimonial.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#703102' }}>Video Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videoTestimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-white rounded-xl shadow-md overflow-hidden group border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img src={testimonial.image} alt={testimonial.name} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <button className="w-16 h-16 bg-yellow-400/80 rounded-full flex items-center justify-center text-white hover:bg-yellow-400 transform transition-transform group-hover:scale-110"><Play size={28} className="fill-current" /></button>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button onClick={() => handleEdit(testimonial)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(testimonial.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-800 text-lg">{testimonial.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{testimonial.location}</p>
                <div className="flex">{renderStars(testimonial.rating)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialManager;