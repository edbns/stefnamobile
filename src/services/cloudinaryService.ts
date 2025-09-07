// Cloudinary Service - Pure HTTP wrapper for Cloudinary API calls
// NO STATE - Just makes HTTP requests and returns raw data

import { config } from '../config/environment';

export interface CloudinarySignRequest {
  folder?: string;
}

export interface CloudinarySignResponse {
  cloudName: string;
  apiKey: string;
  cloud_name: string; // Snake case for compatibility
  api_key: string;    // Snake case for compatibility
  timestamp: number;
  signature: string;
  folder: string;
  error?: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// Pure HTTP functions - no state, no business logic, just API calls
export const cloudinaryService = {
  // Get Cloudinary signature for direct upload
  async getSignature(request?: CloudinarySignRequest): Promise<CloudinarySignResponse> {
    const response = await fetch(`${config.API_BASE_URL}/.netlify/functions/cloudinary-sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request || {}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get Cloudinary signature');
    }

    return data;
  },

  // Upload image directly to Cloudinary
  async uploadImage(
    imageUri: string,
    signatureData: CloudinarySignResponse
  ): Promise<CloudinaryUploadResult> {
    // Create form data for upload
    const formData = new FormData();

    // Add signature data
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('signature', signatureData.signature);
    formData.append('api_key', signatureData.api_key);
    formData.append('folder', signatureData.folder);

    // Add the image file
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const fileType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: fileType,
    } as any);

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Upload failed');
    }

    return result;
  },
};
