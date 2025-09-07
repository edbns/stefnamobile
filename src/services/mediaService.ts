// Media Service - Pure HTTP wrapper for media-related API calls
// NO STATE - Just makes HTTP requests and returns raw data

import { config } from '../config/environment';

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

// Pure HTTP functions - no state, no business logic, just API calls
export const mediaService = {
  // Delete media asset from cloud
  async deleteMedia(
    token: string,
    request: DeleteMediaRequest
  ): Promise<DeleteMediaResponse> {
    const response = await fetch(`${config.API_BASE_URL}/.netlify/functions/delete-media`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mediaId: request.mediaId,
        userId: request.userId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        deletedId: request.mediaId,
        deletedFromTable: '',
        error: data.error || 'Failed to delete media',
      };
    }

    return {
      success: true,
      deletedId: data.deletedId,
      deletedFromTable: data.deletedFromTable,
    };
  },

  // Get user's media from cloud
  async getUserMedia(token: string, type?: 'photo' | 'video'): Promise<UserMediaResponse> {
    const response = await fetch(`${config.API_BASE_URL}/.netlify/functions/getUserMedia`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        media: [],
        error: data.error || 'Failed to fetch user media',
      };
    }

    // Backend returns { success: true, items: [...], total: count, hasMore: boolean }
    // Transform to expected format { media: [...] }
    return {
      media: data.items || [],
    };
  },
};
