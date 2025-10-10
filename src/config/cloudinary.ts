// Cloudinary configuration
export const cloudinaryConfig = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'certiflyy', // Fallback to actual cloud name
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || '721369244799717',       // Fallback to actual API key
  api_secret: '', // Don't expose API secret in client-side code
  upload_preset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'certifly_preset' // Fallback to actual upload preset
};

// Validation to ensure configuration is set up
if (cloudinaryConfig.cloud_name === 'your-cloud-name' || 
    cloudinaryConfig.upload_preset === 'your-upload-preset') {
  console.warn('⚠️ Cloudinary configuration not set up properly. Please update src/config/cloudinary.ts or set environment variables.');
  console.log('📚 See CLOUDINARY_SETUP.md for detailed setup instructions.');
}

// For client-side uploads (unsigned preset required)
export const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`;

// Cloudinary widget configuration for client-side
export const cloudinaryWidgetConfig = {
  cloudName: cloudinaryConfig.cloud_name,
  uploadPreset: cloudinaryConfig.upload_preset,
  folder: 'dev-admin/products', // Organize images in folders
  multiple: true,
  maxFiles: 10,
  maxFileSize: 10000000, // 10MB
  resourceType: 'image',
  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  transformation: [
    { width: 1000, height: 1000, crop: 'limit', quality: 'auto:good' }
  ]
};