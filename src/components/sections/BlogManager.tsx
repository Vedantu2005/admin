import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, X } from 'lucide-react';
import JoditEditor from 'jodit-react';
import { BlogService } from '../../firebase/productService';
import { uploadImageToCloudinary, validateImageFile } from '../../firebase/imageService';

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

interface FormData {
  title: string;
  image: string;
  description: string;
  date: string;
  category: string;
  author: string;
  readTime: number;
  tags: string;
  detail: string;
}

interface BlogFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  uploading: boolean;
  editingBlog: Blog | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  config: {
    readonly: boolean;
    height: number;
  };
  editor: React.MutableRefObject<null>;
}

const BlogForm: React.FC<BlogFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  uploading, 
  editingBlog, 
  handleImageUpload, 
  config, 
  editor 
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input 
          type="text" 
          value={formData.title} 
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} 
          className="w-full p-2 border rounded-md" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <input 
          type="text" 
          value={formData.category} 
          onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} 
          className="w-full p-2 border rounded-md" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
        <input 
          type="text" 
          value={formData.author} 
          onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))} 
          className="w-full p-2 border rounded-md" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input 
          type="date" 
          value={formData.date} 
          onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} 
          className="w-full p-2 border rounded-md" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Read Time (minutes)</label>
        <input 
          type="number" 
          value={formData.readTime} 
          onChange={e => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 0 }))} 
          className="w-full p-2 border rounded-md" 
          required 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
        <input 
          type="text" 
          value={formData.tags} 
          onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))} 
          className="w-full p-2 border rounded-md" 
        />
      </div>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        className="w-full p-2 border rounded-md" 
      />
      <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, or WebP. Max size: 2MB.</p>
      {formData.image && (
        <img 
          src={formData.image} 
          alt="Preview" 
          className="mt-2 w-32 h-20 object-cover rounded-md" 
        />
      )}
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
      <textarea 
        value={formData.description} 
        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} 
        rows={3} 
        className="w-full p-2 border rounded-md" 
        required 
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Detail Content</label>
      <JoditEditor
        ref={editor}
        value={formData.detail}
        config={config}
        onBlur={newContent => setFormData(prev => ({ ...prev, detail: newContent }))}
      />
    </div>

    <div className="flex space-x-3">
      <button 
        type="submit" 
        disabled={uploading}
        className="px-6 py-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed" 
        style={{ backgroundColor: '#499E47' }}
      >
        {uploading ? 'Saving...' : (editingBlog ? 'Update' : 'Create')} Blog
      </button>
      <button 
        type="button" 
        onClick={onCancel} 
        disabled={uploading}
        className="px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
    </div>
  </form>
);

const BlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Load blogs from Firebase on component mount
  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const firestoreBlogs = await BlogService.getAllBlogs();
      // Convert Firestore blogs to local Blog interface
      const convertedBlogs: Blog[] = firestoreBlogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        image: blog.image,
        description: blog.description,
        date: blog.date,
        category: blog.category,
        author: blog.author,
        readTime: blog.readTime,
        tags: blog.tags,
        detail: blog.detail
      }));
      setBlogs(convertedBlogs);
    } catch (error) {
      console.error('Error loading blogs:', error);
      alert('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const editor = useRef(null);
  const initialFormState: FormData = {
    title: '', 
    image: '', 
    description: '', 
    date: '', 
    category: '', 
    author: '', 
    readTime: 5, 
    tags: '', 
    detail: ''
  };

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);

  // Configuration for the Jodit Editor
  const config = useMemo(
    () => ({
        readonly: false,
        height: 400 // Set the editor height to 400px
    }),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image;
      
      // If image is a file (base64), upload to Cloudinary
      if (imageUrl && imageUrl.startsWith('data:')) {
        // Convert base64 to File
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'blog-image.jpg', { type: 'image/jpeg' });
        
        // Validate and upload
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          alert(`Image error: ${validation.error}`);
          setUploading(false);
          return;
        }
        
        imageUrl = await uploadImageToCloudinary(file, 'dev-admin/blogs');
      }
      
      const blogData = { 
        title: formData.title,
        image: imageUrl,
        description: formData.description,
        date: formData.date,
        category: formData.category,
        author: formData.author,
        readTime: formData.readTime,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        detail: formData.detail
      };
      
      if (editingBlog) {
        // Update existing blog
        await BlogService.updateBlog(editingBlog.id, blogData);
        setBlogs(blogs.map(blog => 
          blog.id === editingBlog.id ? { ...blogData, id: editingBlog.id } : blog
        ));
      } else {
        // Add new blog
        const firestoreId = await BlogService.addBlog(blogData);
        const newBlog: Blog = { ...blogData, id: firestoreId };
        setBlogs([newBlog, ...blogs]);
      }
      
      resetForm();
      alert(editingBlog ? 'Blog updated successfully!' : 'Blog added successfully!');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog. Please try again.');
    } finally {
      setUploading(false);
    }
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }
    
    try {
      await BlogService.deleteBlog(id);
      setBlogs(blogs.filter(blog => blog.id !== id));
      alert('Blog deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFormData(prev => ({ ...prev, image: e.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#703102' }}>Blog Management</h1>
        <button 
          onClick={() => { resetForm(); setIsAddFormOpen(true); }} 
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition-all hover:shadow-lg" 
          style={{ backgroundColor: '#499E47' }}
        >
          <Plus size={20} />
          <span>Add New Blog</span>
        </button>
      </div>
      
      {isAddFormOpen && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Add New Blog</h2>
          <BlogForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            uploading={uploading}
            editingBlog={editingBlog}
            handleImageUpload={handleImageUpload}
            config={config}
            editor={editor}
          />
        </div>
      )}

      {editingBlog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={resetForm} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24}/>
            </button>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#703102' }}>Edit Blog</h2>
            <BlogForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onCancel={resetForm}
              uploading={uploading}
              editingBlog={editingBlog}
              handleImageUpload={handleImageUpload}
              config={config}
              editor={editor}
            />
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading blogs...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-xl shadow-lg overflow-hidden group border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="relative">
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button 
                    onClick={() => handleEdit(blog)} 
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(blog.id)} 
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-6">
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
      )}
    </div>
  );
};

export default BlogManager;