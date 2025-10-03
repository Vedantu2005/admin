import React, { useState } from 'react';
import { uploadImageToCloudinary, validateImageFile } from '../firebase/imageService';

/**
 * CloudinaryTest Component
 * A simple component to test Cloudinary image upload functionality
 * Remove this component after confirming Cloudinary integration works
 */
const CloudinaryTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');
      const url = await uploadImageToCloudinary(selectedFile, 'dev-admin/test');
      setUploadedUrl(url);
      console.log('✅ Image uploaded successfully:', url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      console.error('❌ Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 Cloudinary Test</h2>
      <p className="text-sm text-gray-600 mb-4">
        Use this component to test your Cloudinary integration. Remove after testing.
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image to Test Upload
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            <p><strong>File:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Test Upload to Cloudinary'}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {uploadedUrl && (
          <div className="space-y-2">
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              <strong>✅ Success!</strong> Image uploaded to Cloudinary
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Cloudinary URL:</strong></p>
              <a 
                href={uploadedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {uploadedUrl}
              </a>
            </div>
            <img 
              src={uploadedUrl} 
              alt="Uploaded test" 
              className="w-full h-48 object-contain border border-gray-300 rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudinaryTest;