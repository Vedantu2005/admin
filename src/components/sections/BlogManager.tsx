import React, { useState, useRef, useMemo } from 'react';
import { Plus, Edit2, Trash2, Image, Calendar, User, ArrowLeft, X } from 'lucide-react';
import JoditEditor from 'jodit-react';

interface Blog {
  id: string;
  title: string;
  image: string;
  description: string;
  date: string;
  category: string;
  author: string;
  readTime: number; // in minutes
  tags: string[];
  detail: string; // Full content for the editor
}

const BlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([
     {
      id: '1',
      title: 'Wood-Pressed vs Cold-Pressed: Understanding the Difference',
      image: 'https://images.pexels.com/photos/2449665/pexels-photo-2449665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      description: 'Both methods preserve nutrients, but they have subtle differences. We break down the processes and benefits to help you choose for your kitchen.',
      date: '2025-01-19',
      category: 'Oil Processing',
      author: 'Rajesh Kumar',
      readTime: 6,
      tags: ['Wood Pressed', 'Cold Pressed', 'Traditional Methods', 'Oil Extraction'],
      detail: `<p>When it comes to extracting oils from seeds and nuts, two traditional methods stand out: <strong>wood-pressing</strong> and <strong>cold-pressing</strong>. Both methods prioritize preserving the natural qualities of oils, but they differ in their approach and results.</p><h3>Wood-Pressed Oil Extraction</h3><p>Wood-pressing, also known as "ghani" method, is an ancient technique that uses wooden churners to extract oil. The process involves:</p><ul><li>Crushing seeds/nuts using traditional wooden equipment.</li><li>Slow rotation that generates minimal heat.</li><li>Natural filtration through cloth or traditional methods.</li></ul>`
    },
    {
      id: '2',
      title: 'The Benefits of Cold Pressed Oils',
      image: 'https://images.pexels.com/photos/8438992/pexels-photo-8438992.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      description: 'Discover why this pungent oil is more than just a cooking medium. From boosting heart health to fighting inflammation, learn how it can elevate your wellness journey.',
      date: '2025-08-11',
      category: 'Health & Wellness',
      author: 'Priya Sharma',
      readTime: 5,
      tags: ['Cold Pressed', 'Health', 'Nutrition'],
      detail: '<h1>The Many Health Benefits of Cold-Pressed Oils</h1><p>Cold-pressed oils are gaining popularity for their significant health benefits...</p>'
    },
    {
      id: '3',
      title: 'Which Oil is Right For You?',
      image: 'https://images.pexels.com/photos/2449665/pexels-photo-2449665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      description: 'Both methods preserve nutrients, but they have subtle differences. We break down the processes and benefits to help you choose for your kitchen.',
      date: '2025-08-11',
      category: 'Know Your Oils',
      author: 'Meera Patel',
      readTime: 7,
      tags: ['Comparison', 'Cooking', 'Oils'],
      detail: '<p>Choosing the right oil can be confusing. This guide breaks down the key differences...</p>'
    },
  ]);

  const editor = useRef(null);
  const initialFormState = {
    title: '', image: '', description: '', date: '', category: '', author: '', readTime: 5, tags: '', detail: ''
  };

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  // Configuration for the Jodit Editor
  const config = useMemo(
    () => ({
        readonly: false,
        height: 400 // Set the editor height to 400px
    }),
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const blogData = { ...formData, tags: formData.tags.split(',').map(tag => tag.trim()) };
    if (editingBlog) {
      setBlogs(blogs.map(blog => blog.id === editingBlog.id ? { ...blogData, id: editingBlog.id } : blog));
    } else {
      setBlogs([...blogs, { ...blogData, id: Date.now().toString() }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsAddFormOpen(false);
    setEditingBlog(null);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({ ...blog, tags: blog.tags.join(', ') });
  };

  const handleDelete = (id: string) => setBlogs(blogs.filter(blog => blog.id !== id));
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFormData({ ...formData, image: e.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Reusable Blog Form Component
  const BlogForm = ({ onCancel }: { onCancel: () => void }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded-md" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded-md" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Author</label><input type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full p-2 border rounded-md" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded-md" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Read Time (minutes)</label><input type="number" value={formData.readTime} onChange={e => setFormData({ ...formData, readTime: parseInt(e.target.value) })} className="w-full p-2 border rounded-md" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label><input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full p-2 border rounded-md" /></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label><input type="file" accept="image/*" onChange={handleImageUpload} className="w-full p-2 border rounded-md" />{formData.image && <img src={formData.image} alt="Preview" className="mt-2 w-32 h-20 object-cover rounded-md" />}</div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full p-2 border rounded-md" required /></div>
        
        {/* --- JODIT EDITOR INTEGRATION --- */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Detail Content</label>
            <JoditEditor
                ref={editor}
                value={formData.detail}
                config={config}
                onBlur={newContent => setFormData(prev => ({ ...prev, detail: newContent }))}
            />
        </div>

        <div className="flex space-x-3"><button type="submit" className="px-6 py-2 rounded-lg text-white" style={{ backgroundColor: '#499E47' }}>{editingBlog ? 'Update' : 'Create'} Blog</button><button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg">Cancel</button></div>
    </form>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#703102' }}>Blog Management</h1>
        <button onClick={() => { resetForm(); setIsAddFormOpen(true); }} className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-lg" style={{ backgroundColor: '#499E47' }}><Plus size={20} /><span>Add New Blog</span></button>
      </div>
      
      {isAddFormOpen && <div className="bg-white rounded-lg shadow-lg p-6 mb-8"><h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Add New Blog</h2><BlogForm onCancel={resetForm} /></div>}
      {editingBlog && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"><button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24}/></button><h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Edit Blog</h2><BlogForm onCancel={resetForm} /></div></div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <div key={blog.id} className="bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="relative">
              <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                <button onClick={() => handleEdit(blog)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(blog.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="p-6">
              {/* --- MODIFIED SECTION --- */}
              <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                <span className="bg-yellow-100 text-yellow-800 font-medium px-2.5 py-0.5 rounded-full">{blog.category}</span>
                <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(blog.date)}</span>
                </div>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2 h-14 overflow-hidden">{blog.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogManager;