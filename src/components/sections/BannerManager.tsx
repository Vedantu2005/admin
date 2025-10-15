import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadImageToCloudinary } from '../../firebase/imageService';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';

interface Banner {
  id: string;
  imageUrl: string;
  createdAt: Date;
}

const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const bannersQuery = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(bannersQuery);
      const bannersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Banner[];
      setBanners(bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(selectedFile, 'dev-admin/banners');
      
      // Save only the image URL to Firestore
      await addDoc(collection(db, 'banners'), {
        imageUrl,
        createdAt: new Date()
      });

      setSelectedFile(null);
      fetchBanners();
      alert('Banner uploaded successfully!');
      
      // Reset file input
      const fileInput = document.getElementById('bannerFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Error uploading banner. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteDoc(doc(db, 'banners', bannerId));
        fetchBanners();
        alert('Banner deleted successfully!');
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Error deleting banner');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Banner Manager</h1>

        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Banner</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Banner Image
            </label>
            <input
              id="bannerFile"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            {selectedFile && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Selected:</strong> {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload Banner
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Uploaded Banners ({banners.length})</h2>
        </div>
        
        {banners.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="relative group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                >
                  <img
                    src={banner.imageUrl}
                    alt="Banner"
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Overlay with delete button */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all duration-200"
                      title="Delete Banner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {/* Image info */}
                  <div className="p-3">
                    <p className="text-xs text-gray-500">
                      Uploaded: {banner.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No banners uploaded yet</h3>
            <p className="text-gray-600 mb-4">Upload your first banner image to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManager;