// Media-related type definitions

export interface StoredMedia {
  id: string;
  localUri: string;
  cloudUrl?: string;
  cloudId?: string; // Cloudinary public ID for deletion
  filename: string;
  createdAt: Date;
  synced: boolean;
  generationJobId?: string;
}

export interface DeleteMediaRequest {
  mediaId: string;
  userId: string;
}

export interface DeleteMediaResponse {
  success: boolean;
  deletedId: string;
  deletedFromTable: string;
  error?: string;
}

export interface UserMediaResponse {
  media: any[];
  error?: string;
}

export interface MediaItem extends StoredMedia {
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface MediaState {
  // Media collection
  media: MediaItem[];
  isLoading: boolean;

  // Upload state
  currentUpload: {
    id: string;
    progress: number;
    fileName: string;
  } | null;

  // Error handling
  error: string | null;
}
