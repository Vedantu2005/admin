import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Mic, Youtube, User, CalendarDays, ExternalLink, X } from 'lucide-react';

interface Podcast {
  id: string;
  title: string;
  image: string;
  description: string;
  youtubeLink: string;
  adminName: string; // Changed from 'Dev Natural Oils' to be dynamic
  date: string;
}

const PodcastManager: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([
    {
      id: '1',
      title: 'Wood Pressed Wisdom: Unlock the Secrets of Pure Oils',
      image: '/podcast.png',
      description: 'Learn how wood pressed oils are crafted, their health benefits, and simple ways to identify genuine products. Discover the science behind cold extraction, compare nutrition with regular oils, and hear expert insights.',
      youtubeLink: 'https://www.youtube.com/watch?v=your_video_id_1', // Placeholder YouTube link
      adminName: 'Dev Natural Oils',
      date: '2025-08-21'
    },
    {
      id: '2',
      title: 'The Art of Traditional Indian Cooking Oils',
      image: 'https://images.pexels.com/photos/10368560/pexels-photo-10368560.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      description: 'Dive into the rich history and cultural significance of traditional Indian cooking oils. From mustard to sesame, explore unique flavors, health properties, and authentic recipes that have been passed down through generations.',
      youtubeLink: 'https://www.youtube.com/watch?v=your_video_id_2', // Placeholder YouTube link
      adminName: 'Dev Natural Oils',
      date: '2025-08-15'
    },
    {
      id: '3',
      title: 'Beyond the Kitchen: Uses of Natural Oils',
      image: '/podcast.png',
      description: 'Uncover the versatile applications of natural oils beyond culinary uses. Explore their benefits in skincare, hair care, and traditional remedies. Learn how to incorporate these pure oils into your daily wellness routine for holistic health.',
      youtubeLink: 'https://www.youtube.com/watch?v=your_video_id_3', // Placeholder YouTube link
      adminName: 'Dev Natural Oils',
      date: '2025-08-08'
    },
  ]);

  const initialFormState = {
    title: '',
    image: '',
    description: '',
    youtubeLink: '',
    adminName: '',
    date: ''
  };

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPodcast) {
      setPodcasts(podcasts.map(podcast =>
        podcast.id === editingPodcast.id
          ? { ...formData, id: editingPodcast.id }
          : podcast
      ));
    } else {
      setPodcasts([...podcasts, { ...formData, id: Date.now().toString() }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsAddFormOpen(false);
    setEditingPodcast(null);
  };

  const handleEdit = (podcast: Podcast) => {
    setEditingPodcast(podcast);
    setFormData(podcast);
  };

  const handleDelete = (id: string) => {
    setPodcasts(podcasts.filter(podcast => podcast.id !== id));
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

  // Helper to format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Reusable Form Component
  const PodcastForm = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Podcast Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name</label>
          <input type="text" value={formData.adminName} onChange={(e) => setFormData({ ...formData, adminName: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"/>
        {formData.image && <img src={formData.image} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Link</label>
        <input type="url" value={formData.youtubeLink} onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="https://youtube.com/watch?v=..." required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
        <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" required />
      </div>

      <div className="flex space-x-3">
        <button type="submit" className="px-6 py-2 rounded-lg text-white transition-colors" style={{ backgroundColor: '#499E47' }}>{editingPodcast ? 'Update' : 'Create'} Podcast</button>
        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
      </div>
    </form>
  );

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
          <PodcastForm onCancel={resetForm} />
        </div>
      )}

      {/* --- EDIT MODAL (POPUP) --- */}
      {editingPodcast && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Edit Podcast</h2>
            <PodcastForm onCancel={resetForm} />
          </div>
        </div>
      )}

      {/* --- PODCAST CARDS DISPLAY --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {podcasts.map((podcast) => (
          <div key={podcast.id} className="bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100 transition-shadow duration-300" style={{ backgroundColor: '#000000' }}>
            <div className="relative">
              <img src={podcast.image} alt={podcast.title} className="w-full h-48 object-cover" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button onClick={() => handleEdit(podcast)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(podcast.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button>
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
        {podcasts.length === 0 && (
          <div className="text-center py-12 col-span-full">
            <Mic className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No podcasts</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new podcast.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastManager;