// Cloudinary-related type definitions

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
