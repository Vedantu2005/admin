import { cloudinaryConfig, cloudinaryUrl } from '../config/cloudinary';

// Interface for upload response
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  type: string;
  format: string;
  version: number;
  url: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

// Upload a single image to Cloudinary
export const uploadImageToCloudinary = async (file: File, folder = 'dev-admin/products'): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.upload_preset);
    formData.append('folder', folder);
    
    // Note: Transformations must be configured in the upload preset for unsigned uploads
    // Remove transformation parameter as it's not allowed for unsigned uploads

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload error details:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        cloudName: cloudinaryConfig.cloud_name,
        uploadPreset: cloudinaryConfig.upload_preset,
        uploadUrl: cloudinaryUrl
      });
      
      let errorMessage = `Failed to upload image (${response.status}): ${response.statusText}`;
      
      // Try to parse error response for more details
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage = `Cloudinary error: ${errorData.error.message}`;
        }
      } catch {
        // If we can't parse the error, just use the response text
        if (errorText) {
          errorMessage = `Cloudinary error: ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    
    // Provide more helpful error messages based on the error
    if (error instanceof Error) {
      if (error.message.includes('400')) {
        throw new Error('Upload configuration error. Please check your Cloudinary setup (cloud name and upload preset).');
      } else if (error.message.includes('401')) {
        throw new Error('Unauthorized. Please check your upload preset is set to "Unsigned".');
      } else if (error.message.includes('403')) {
        throw new Error('Forbidden. Please check your upload preset permissions.');
      } else {
        throw error; // Re-throw the original error with detailed message
      }
    }
    
    throw new Error('Failed to upload image. Please try again.');
  }
};

// Upload multiple images to Cloudinary
export const uploadMultipleImagesToCloudinary = async (
  files: File[], 
  folder = 'dev-admin/products'
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToCloudinary(file, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw new Error('Failed to upload images. Please try again.');
  }
};

// Delete an image from Cloudinary (requires backend API call for security)
export const deleteImageFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // Note: For security reasons, image deletion should be handled by your backend
    // This is a placeholder function. In production, you would call your backend API
    console.warn('Image deletion should be handled by backend for security reasons');
    console.log('Public ID to delete:', publicId);
    return true;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
};

// Extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url: string): string => {
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.split('.')[0];
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return '';
  }
};

// Generate optimized URL with transformations
export const getOptimizedImageUrl = (
  publicId: string, 
  width?: number, 
  height?: number, 
  quality = 'auto:good'
): string => {
  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload`;
  let transformation = `q_${quality}`;
  
  if (width && height) {
    transformation += `,w_${width},h_${height},c_fill`;
  } else if (width) {
    transformation += `,w_${width},c_scale`;
  } else if (height) {
    transformation += `,h_${height},c_scale`;
  }
  
  return `${baseUrl}/${transformation}/${publicId}`;
};

// Validate image file
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image size should be less than 10MB'
    };
  }

  return { isValid: true };
};

// Upload with progress tracking (for future enhancement)
export const uploadImageWithProgress = async (
  file: File,
  folder = 'dev-admin/products',
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.upload_preset);
    formData.append('folder', folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(Math.round(progress));
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', cloudinaryUrl);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error uploading image with progress:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};