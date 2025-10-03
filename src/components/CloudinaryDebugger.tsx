import React, { useState } from 'react';
import { cloudinaryConfig, cloudinaryUrl } from '../config/cloudinary';

const CloudinaryDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const showDebugInfo = () => {
    const info = `
🔍 Cloudinary Configuration Debug:
================================

Cloud Name: ${cloudinaryConfig.cloud_name}
Upload Preset: ${cloudinaryConfig.upload_preset}
Upload URL: ${cloudinaryUrl}

Environment Variables:
- VITE_CLOUDINARY_CLOUD_NAME: ${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'NOT SET'}
- VITE_CLOUDINARY_UPLOAD_PRESET: ${import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'NOT SET'}

Issues Found:
${cloudinaryConfig.cloud_name === 'your-cloud-name' ? '❌ Cloud name not configured' : '✅ Cloud name configured'}
${cloudinaryConfig.upload_preset === 'your-upload-preset' ? '❌ Upload preset not configured' : '✅ Upload preset configured'}

Next Steps:
1. Create a .env file in your project root
2. Add your Cloudinary credentials:
   VITE_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-actual-upload-preset
3. Restart your dev server after adding .env file
    `;
    setDebugInfo(info);
  };

  const testCloudinaryConnection = async () => {
    setIsLoading(true);
    setTestResult('');

    try {
      // Test if the upload URL is accessible
      const testFormData = new FormData();
      testFormData.append('upload_preset', cloudinaryConfig.upload_preset);
      
      // Create a small test image (1x1 pixel PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 1, 1);
      }
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setTestResult('❌ Failed to create test image');
          setIsLoading(false);
          return;
        }

        testFormData.append('file', blob, 'test.png');

        try {
          const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: testFormData,
          });

          const responseText = await response.text();
          
          if (response.ok) {
            const data = JSON.parse(responseText);
            setTestResult(`✅ Cloudinary connection successful!
            
Uploaded test image:
- URL: ${data.secure_url}
- Public ID: ${data.public_id}
- Format: ${data.format}
- Bytes: ${data.bytes}

Your configuration is working correctly!`);
          } else {
            setTestResult(`❌ Cloudinary error (${response.status}):

Response: ${responseText}

Common solutions:
- Check if upload preset "${cloudinaryConfig.upload_preset}" exists
- Ensure upload preset is set to "Unsigned"
- Verify cloud name "${cloudinaryConfig.cloud_name}" is correct
- Check if upload preset allows the file type`);
          }
        } catch (error) {
          setTestResult(`❌ Network error: ${error}
          
This usually means:
- Cloud name is incorrect
- Network connectivity issues
- CORS issues (less likely with Cloudinary)`);
        }
        
        setIsLoading(false);
      }, 'image/png');
      
    } catch (error) {
      setTestResult(`❌ Test failed: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🔧 Cloudinary Configuration Debugger</h2>
      
      <div className="space-y-4">
        <button
          onClick={showDebugInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Show Configuration Details
        </button>
        
        <button
          onClick={testCloudinaryConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {isLoading ? 'Testing...' : 'Test Cloudinary Connection'}
        </button>
      </div>

      {debugInfo && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      {testResult && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-bold text-yellow-800 mb-2">Quick Setup:</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Go to <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer" className="underline">Cloudinary Console</a></li>
          <li>2. Copy your "Cloud Name" from the dashboard</li>
          <li>3. Go to Settings → Upload → Create an "Unsigned" upload preset</li>
          <li>4. Create a .env file with your credentials</li>
          <li>5. Restart your dev server</li>
        </ol>
      </div>
    </div>
  );
};

export default CloudinaryDebugger;