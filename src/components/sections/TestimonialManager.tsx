import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Play, X } from 'lucide-react';
import { TestimonialService, Testimonial } from '../../firebase/productService';
import { uploadImageToCloudinary, validateImageFile } from '../../firebase/imageService';

const TestimonialManager: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Load testimonials from Firebase on component mount
  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const allTestimonials = await TestimonialService.getAllTestimonials();
      setTestimonials(allTestimonials);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      alert('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image;
      let videoUrl = formData.videoFile;
      
      // Upload image to Cloudinary if it's a file (base64)
      if (imageUrl && imageUrl.startsWith('data:')) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'testimonial-image.jpg', { type: 'image/jpeg' });
        
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          alert(`Image error: ${validation.error}`);
          setUploading(false);
          return;
        }
        
        // Show warning about compression if file is large
        if (validation.warning) {
          console.log(`Image compression: ${validation.warning}`);
          // You could show a toast notification here if you have a toast system
        }
        
        console.log(`Starting upload for image: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        imageUrl = await uploadImageToCloudinary(file, 'dev-admin/testimonials');
        console.log(`Upload successful: ${imageUrl}`);
      }
      
      // Upload video to Cloudinary if it's a file (base64) and type is video
      if (formData.type === 'video' && videoUrl && videoUrl.startsWith('data:')) {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'testimonial-video.mp4', { type: 'video/mp4' });
        
        videoUrl = await uploadImageToCloudinary(file, 'dev-admin/testimonials/videos');
      }
      
      const testimonialData = {
        name: formData.name,
        image: imageUrl,
        location: formData.location,
        description: formData.description,
        rating: formData.rating,
        type: formData.type,
        ...(formData.type === 'video' && videoUrl ? { videoFile: videoUrl } : {}),
      };
      
      if (editingTestimonial) {
        await TestimonialService.updateTestimonial(editingTestimonial.firestoreId || editingTestimonial.id, testimonialData);
        alert('Testimonial updated successfully!');
      } else {
        await TestimonialService.addTestimonial(testimonialData);
        alert('Testimonial added successfully!');
      }
      
      await loadTestimonials();
      resetForm();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save testimonial. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('File size too large')) {
          errorMessage = 'Image file is too large even after compression. Please try a smaller image (under 5MB recommended).';
        } else if (error.message.includes('Cloudinary')) {
          errorMessage = 'Failed to upload image. Please check your internet connection and try again.';
        } else if (error.message.includes('Firebase')) {
          errorMessage = 'Failed to save to database. Please try again.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
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

  const handleDelete = async (testimonial: Testimonial) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await TestimonialService.deleteTestimonial(testimonial.firestoreId || testimonial.id);
        await loadTestimonials();
        alert('Testimonial deleted successfully!');
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        alert('Failed to delete testimonial. Please try again.');
      }
    }
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

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold" style={{ color: '#703102' }}>Loading testimonials...</div>
        </div>
      </div>
    );
  }

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
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, or WebP. Max size: 2MB.</p>
              {formData.image && <img src={formData.image} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-full" />}
            </div>
            {formData.type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video</label>
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                <p className="text-xs text-gray-500 mt-1">MP4 or compatible. Max size: 15MB.</p>
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
              <textarea 
                value={formData.description}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 230);
                  setFormData({ ...formData, description: value });
                }}
                maxLength={230}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
              <div className="text-xs text-gray-500 mt-1">{formData.description.length}/230 characters</div>
            </div>
            <div className="flex space-x-3">
              <button 
                type="submit" 
                disabled={uploading}
                className="px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ backgroundColor: uploading ? '#6b7280' : '#499E47' }}
              >
                {uploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading & Saving...
                  </span>
                ) : 'Create Testimonial'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDIT MODAL (POPUP) --- */}
      {editingTestimonial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Edit Testimonial</h2>
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
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, or WebP. Max size: 50MB. Images over 10MB will be compressed.</p>
                {formData.image && <img src={formData.image} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-full" />}
              </div>
              {formData.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video</label>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                  <p className="text-xs text-gray-500 mt-1">MP4 or compatible. Max size: 100MB.</p>
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
                <textarea 
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 230);
                    setFormData({ ...formData, description: value });
                  }}
                  maxLength={230}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">{formData.description.length}/230 characters</div>
              </div>
              <div className="flex space-x-3">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: uploading ? '#6b7280' : '#499E47' }}
                >
                  {uploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating & Saving...
                    </span>
                  ) : 'Update Testimonial'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              </div>
            </form>
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
                <button onClick={() => handleDelete(testimonial)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button>
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
                  <button onClick={() => handleDelete(testimonial)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button>
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