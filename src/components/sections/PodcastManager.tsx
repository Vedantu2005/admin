import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, Mic,  User, CalendarDays, X } from 'lucide-react';
import { PodcastService, Podcast } from '../../firebase/productService';
import { uploadImageToCloudinary, validateImageFile } from '../../firebase/imageService';

const PodcastManager: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Load podcasts from Firebase on component mount
  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const allPodcasts = await PodcastService.getAllPodcasts();
      setPodcasts(allPodcasts);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      alert('Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  const initialFormState = useMemo(() => ({
    title: '',
    image: '',
    description: '',
    youtubeLink: '',
    adminName: '',
    date: ''
  }), []);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setIsAddFormOpen(false);
    setEditingPodcast(null);
  }, [initialFormState]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image;
      
      // If image is a file (base64), upload to Cloudinary
      if (imageUrl && imageUrl.startsWith('data:')) {
        // Convert base64 to File
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'podcast-image.jpg', { type: 'image/jpeg' });
        
        // Validate and upload
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          alert(`Image error: ${validation.error}`);
          setUploading(false);
          return;
        }
        
        imageUrl = await uploadImageToCloudinary(file, 'dev-admin/podcasts');
      }
      
      const podcastData = {
        title: formData.title,
        image: imageUrl,
        description: formData.description,
        youtubeLink: formData.youtubeLink,
        adminName: formData.adminName,
        date: formData.date
      };
      
      if (editingPodcast) {
        // Update existing podcast
        await PodcastService.updatePodcast(editingPodcast.firestoreId || editingPodcast.id, podcastData);
        await loadPodcasts();
        alert('Podcast updated successfully!');
      } else {
        // Add new podcast
        await PodcastService.addPodcast(podcastData);
        await loadPodcasts();
        alert('Podcast added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving podcast:', error);
      alert('Failed to save podcast. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [formData, editingPodcast, resetForm]);

  const handleEdit = (podcast: Podcast) => {
    setEditingPodcast(podcast);
    setFormData(podcast);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this podcast?')) {
      return;
    }
    
    try {
      await PodcastService.deletePodcast(id);
      await loadPodcasts();
      alert('Podcast deleted successfully!');
    } catch (error) {
      console.error('Error deleting podcast:', error);
      alert('Failed to delete podcast. Please try again.');
    }
  };

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Helper to format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handler functions for form inputs
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleAdminNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, adminName: e.target.value }));
  }, []);

  const handleYoutubeLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, youtubeLink: e.target.value }));
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  }, []);

  // Reusable Form Component - Memoized to prevent re-renders
  const renderPodcastForm = useMemo(() => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Podcast Title</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={handleTitleChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name</label>
          <input 
            type="text" 
            value={formData.adminName} 
            onChange={handleAdminNameChange} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
            required 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image
          <span className="block text-xs text-blue-600 mt-1">
            Recommended: <span className="font-semibold">800×800 px, square, under 2MB</span>
          </span>
        </label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"/>
        {formData.image && <img src={formData.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Link</label>
        <input 
          type="url" 
          value={formData.youtubeLink} 
          onChange={handleYoutubeLinkChange} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
          placeholder="https://youtube.com/watch?v=..." 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <input 
          type="date" 
          value={formData.date} 
          onChange={handleDateChange} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
          required 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea 
          value={formData.description} 
          onChange={handleDescriptionChange} 
          rows={4} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
          required 
        />
      </div>

      <div className="flex space-x-3">
        <button 
          type="submit" 
          disabled={uploading}
          className="px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          style={{ backgroundColor: '#499E47' }}
        >
          {uploading ? 'Saving...' : (editingPodcast ? 'Update' : 'Create')} Podcast
        </button>
        <button 
          type="button" 
          onClick={resetForm} 
          disabled={uploading}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  ), [formData, uploading, editingPodcast, handleSubmit, handleTitleChange, handleAdminNameChange, handleImageUpload, handleYoutubeLinkChange, handleDateChange, handleDescriptionChange, resetForm]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#703102' }}>Podcast Management</h1>
        <button
          onClick={() => { resetForm(); setIsAddFormOpen(true); }}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-lg"
          style={{ backgroundColor: '#499E47' }}
        >
          <Plus size={20} />
          <span>Add New Podcast</span>
        </button>
      </div>

      {/* --- ADD NEW FORM (TOP) --- */}
      {isAddFormOpen && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Add New Podcast</h2>
          {renderPodcastForm}
        </div>
      )}

      {/* --- EDIT MODAL (POPUP) --- */}
      {editingPodcast && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Edit Podcast</h2>
            {renderPodcastForm}
          </div>
        </div>
      )}

      {/* --- PODCAST CARDS DISPLAY --- */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading podcasts...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcasts.map((podcast) => (
            <div key={podcast.id} className="bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100 transition-shadow duration-300" style={{ backgroundColor: '#000000' }}>
              <div className="relative">
                <img src={podcast.image} alt={podcast.title} className="w-full h-48 object-cover" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button onClick={() => handleEdit(podcast)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(podcast.firestoreId || podcast.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-6 text-white">
                <div className="flex items-center text-sm mb-2" style={{ color: '#AE5D01' }}>
                  <User size={16} className="mr-2" />
                  <span>{podcast.adminName}</span>
                  <CalendarDays size={16} className="ml-14 mr-2" />
                  <span>{formatDate(podcast.date)}</span>
                </div>
                <h3 className="font-bold text-xl mb-2">{podcast.title}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {podcast.description}
                </p>
                {/* --- MODIFIED BUTTON SECTION --- */}
                <div className="flex justify-center mt-4"> {/* Added flex justify-center */}
                  <a
                    href={podcast.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    style={{ backgroundColor: '#703102', color: 'white' }}
                  >
                    {/* Removed Mic icon */}
                    BROWSE PODCAST
                  </a>
                </div>
              </div>
            </div>
          ))}
          {podcasts.length === 0 && !loading && (
            <div className="text-center py-12 col-span-full">
              <Mic className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No podcasts</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new podcast.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PodcastManager;