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

// Compress image if it's too large
const compressImage = (file: File, maxSizeInBytes = 5 * 1024 * 1024): Promise<File> => {
  return new Promise((resolve) => {
    console.log(`compressImage called for file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB, threshold: ${(maxSizeInBytes / 1024 / 1024).toFixed(2)}MB`);
    
    // If file is already small enough, return it as is
    if (file.size <= maxSizeInBytes) {
      console.log(`File is already small enough, returning original`);
      resolve(file);
      return;
    }

    console.log(`File needs compression, starting process...`);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    console.log(`Starting compression for file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    if (!ctx) {
      console.error('Failed to get 2D context, returning original file');
      resolve(file);
      return;
    }

    // Create object URL first
    const objectUrl = URL.createObjectURL(file);
    console.log(`Created object URL for ${file.type} file`);

    img.onload = () => {
      console.log('Image loaded successfully');
      URL.revokeObjectURL(objectUrl); // Clean up memory
      
      const { width, height } = img;
      console.log(`Original dimensions: ${width}x${height}`);
      
      // Check if context is valid
      if (!ctx) {
        console.error('Canvas context is null, returning original file');
        resolve(file);
        return;
      }
      
      // Calculate compression ratio based on file size
      // Target final size of 8MB maximum to stay well under Cloudinary's 10MB limit
      const targetSize = 8 * 1024 * 1024; // 8MB target
      let compressionRatio = Math.sqrt(targetSize / file.size);
      
      // More aggressive compression for very large files
      if (file.size > 20 * 1024 * 1024) {
        compressionRatio = Math.min(compressionRatio, 0.3); // Max 30% of original size
      } else if (file.size > 15 * 1024 * 1024) {
        compressionRatio = Math.min(compressionRatio, 0.4); // Max 40% of original size
      } else if (file.size > 10 * 1024 * 1024) {
        compressionRatio = Math.min(compressionRatio, 0.5); // Max 50% of original size
      } else {
        compressionRatio = Math.min(compressionRatio, 0.7); // Max 70% of original size
      }
      
      // Apply compression ratio to dimensions
      const newWidth = Math.floor(width * compressionRatio);
      const newHeight = Math.floor(height * compressionRatio);
      
      console.log(`Compressed dimensions: ${newWidth}x${newHeight} (ratio: ${compressionRatio.toFixed(2)})`);

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Set better rendering options
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Clear canvas and draw image
      ctx.clearRect(0, 0, newWidth, newHeight);
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Try different quality levels
      const attemptCompression = (quality: number, attempt: number = 1): void => {
        console.log(`Starting compression attempt ${attempt} with quality ${quality}`);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Ensure filename has .jpg extension
              const newName = file.name.replace(/\.[^/.]+$/, ".jpg");
              const compressedFile = new File([blob], newName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              console.log(`Compression attempt ${attempt}, quality ${quality}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
              
              // If still too large and we can try lower quality
              if (compressedFile.size > targetSize && quality > 0.1 && attempt < 8) {
                attemptCompression(quality - 0.1, attempt + 1);
              } else {
                console.log(`Final compressed file: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                resolve(compressedFile);
              }
            } else {
              console.error('Blob creation failed, returning original file');
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      // Start with aggressive quality based on file size
      let startingQuality: number;
      if (file.size > 15 * 1024 * 1024) {
        startingQuality = 0.3; // Very aggressive for large files
      } else if (file.size > 10 * 1024 * 1024) {
        startingQuality = 0.4;
      } else if (file.size > 8 * 1024 * 1024) {
        startingQuality = 0.5;
      } else {
        startingQuality = 0.6;
      }
      
      console.log(`Starting compression with quality ${startingQuality} for ${(file.size / 1024 / 1024).toFixed(2)}MB file`);
      attemptCompression(startingQuality);
    };

    img.onerror = (error) => {
      console.error('Image load failed:', error);
      console.error('File type:', file.type);
      console.error('File size:', file.size);
      URL.revokeObjectURL(objectUrl); // Clean up memory
      resolve(file);
    };
    
    // Set the source to start loading
    img.src = objectUrl;
  });
};

// Upload a file (image or video) to Cloudinary
export const uploadImageToCloudinary = async (file: File, folder = 'dev-admin/products'): Promise<string> => {
  try {
    // Determine if this is an image or video
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    console.log(`Uploading file: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    
    let processedFile = file;
    
    // Only compress images, not videos
    if (isImage) {
      processedFile = await compressImage(file);
      console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Compressed file size: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
    } else if (isVideo) {
      console.log(`Video file detected, skipping compression`);
      console.log(`Video file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Check if video file is too large (Cloudinary free tier has a 100MB limit for videos)
      const maxVideoSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxVideoSize) {
        throw new Error(`Video file is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 100MB.`);
      }
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
    
    const formData = new FormData();
    formData.append('file', processedFile);
    formData.append('upload_preset', cloudinaryConfig.upload_preset);
    formData.append('folder', folder);
    
    // Set resource type based on file type
    if (isVideo) {
      formData.append('resource_type', 'video');
    }

    // Use appropriate Cloudinary endpoint based on file type
    let uploadUrl: string;
    if (isVideo) {
      uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/video/upload`;
    } else {
      uploadUrl = cloudinaryUrl; // Uses the image upload endpoint
    }
    
    console.log(`Using upload endpoint: ${uploadUrl}`);

    const response = await fetch(uploadUrl, {
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
export const validateImageFile = (file: File): { isValid: boolean; error?: string; warning?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }

  // Check file size (50MB absolute limit)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes (absolute maximum)
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image size should be less than 50MB'
    };
  }

  // Warn about compression for files over 10MB
  const compressionThreshold = 10 * 1024 * 1024; // 10MB
  if (file.size > compressionThreshold) {
    return { 
      isValid: true, 
      warning: `Large file detected (${(file.size / 1024 / 1024).toFixed(1)}MB). Image will be automatically compressed for faster upload.`
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