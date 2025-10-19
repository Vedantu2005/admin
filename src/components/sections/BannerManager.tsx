import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { uploadImageToCloudinary } from '../../firebase/imageService';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';

interface Banner {
  id: string;
  imageUrl: string;
  type: 'desktop' | 'tablet' | 'mobile';
  dimensions: string;
  createdAt: Date;
}

// Banner dimension requirements
const BANNER_SPECS = {
  desktop: {
    width: 1920,
    height: 600,
    label: 'Desktop Banner',
    description: '1920 × 600 px'
  },
  tablet: {
    width: 1024,
    height: 500,
    label: 'Tablet Banner',
    description: '1024 × 500 px'
  },
  mobile: {
    width: 768,
    minHeight: 320,
    maxHeight: 400,
    label: 'Mobile Banner',
    description: '768 × 320-400 px'
  }
} as const;

const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageValidation, setImageValidation] = useState<string | null>(null);

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
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        type: doc.data().type || 'desktop', // Default to desktop for existing banners
        dimensions: doc.data().dimensions || 'Unknown'
      })) as Banner[];
      setBanners(bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to validate image dimensions
  const validateImageDimensions = (file: File, bannerType: 'desktop' | 'tablet' | 'mobile'): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { width, height } = img;
        const spec = BANNER_SPECS[bannerType];
        
        let isValid = false;
        let errorMessage = '';
        
        if (bannerType === 'desktop') {
          const desktopSpec = spec as { width: number; height: number; label: string; description: string };
          isValid = width === desktopSpec.width && height === desktopSpec.height;
          if (!isValid) {
            errorMessage = `Desktop banner must be ${desktopSpec.width} × ${desktopSpec.height} pixels. Your image is ${width} × ${height} pixels.`;
          }
        } else if (bannerType === 'tablet') {
          const tabletSpec = spec as { width: number; height: number; label: string; description: string };
          isValid = width === tabletSpec.width && height === tabletSpec.height;
          if (!isValid) {
            errorMessage = `Tablet banner must be ${tabletSpec.width} × ${tabletSpec.height} pixels. Your image is ${width} × ${height} pixels.`;
          }
        } else if (bannerType === 'mobile') {
          const mobileSpec = spec as { width: number; minHeight: number; maxHeight: number; label: string; description: string };
          isValid = width === mobileSpec.width && height >= mobileSpec.minHeight && height <= mobileSpec.maxHeight;
          if (!isValid) {
            errorMessage = `Mobile banner must be ${mobileSpec.width} × ${mobileSpec.minHeight}-${mobileSpec.maxHeight} pixels. Your image is ${width} × ${height} pixels.`;
          }
        }
        
        if (!isValid) {
          setImageValidation(errorMessage);
        } else {
          setImageValidation(null);
        }
        
        resolve(isValid);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setImageValidation('Invalid image file');
        resolve(false);
      };
      
      img.src = url;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous validation error
    setImageValidation(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageValidation('Please select an image file');
      return;
    }

    // Validate image dimensions (always desktop size)
    const isValidDimensions = await validateImageDimensions(file, 'desktop');
    if (!isValidDimensions) {
      return; // Error message is set in validation function
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setImageValidation('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(selectedFile, 'dev-admin/banners');
      
      // Get image dimensions
      const img = new Image();
      const imagePromise = new Promise<{width: number, height: number}>((resolve) => {
        img.onload = () => resolve({width: img.width, height: img.height});
        img.src = URL.createObjectURL(selectedFile);
      });
      const dimensions = await imagePromise;
      
      // Save banner data to Firestore (always desktop type)
      await addDoc(collection(db, 'banners'), {
        imageUrl,
        type: 'desktop',
        dimensions: `${dimensions.width} × ${dimensions.height}`,
        createdAt: new Date()
      });

      // Reset form
      setSelectedFile(null);
      setImageValidation(null);
      
      // Refresh banners list
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
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
       
              <span className="block text-xs text-blue-600 mt-1">
                Required size:
                <span className="font-semibold"> 1920×600 px</span>
              </span>
            </label>
            <input
              id="bannerFile"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            
            {/* Image Validation Error */}
            {imageValidation && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{imageValidation}</p>
              </div>
            )}
            
            {/* Selected File Info */}
            {selectedFile && !imageValidation && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  <strong>✓ Valid:</strong> {selectedFile.name}
                </p>
                <p className="text-sm text-green-500">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || imageValidation !== null}
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
                    <p className="text-xs text-gray-600 mb-1">
                      <strong>Dimensions:</strong> {banner.dimensions || 'Unknown'}
                    </p>
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