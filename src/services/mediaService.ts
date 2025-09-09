// Media Service - Pure HTTP wrapper for media-related API calls
// NO STATE - Just makes HTTP requests and returns raw data

import { config } from '../config/environment';
import { Alert } from 'react-native';

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
    const response = await fetch(config.apiUrl('delete-media'), {
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

  // Get user's media from cloud (userId extracted from JWT by backend)
  async getUserMedia(token: string, type?: 'photo' | 'video'): Promise<UserMediaResponse> {
    try {
      // Don't pass userId - backend will extract from JWT token
      const response = await fetch(config.apiUrl('getUserMedia'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Check response status first
      if (!response.ok) {
        const textResponse = await response.text();
        console.error('API request failed:', response.status, textResponse);
        return {
          media: [],
          error: `API request failed with status ${response.status}`,
        };
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        return {
          media: [],
          error: 'Server returned non-JSON response. Check authentication.',
        };
      }

      const data = await response.json();

      // Backend returns { success: true, items: [...], total: count, hasMore: boolean }
      // Transform to expected format { media: [...] }
      return {
        media: data.items || [],
      };
    } catch (error) {
      console.error('Load user media error:', error);
      return {
        media: [],
        error: error.message,
      };
    }
  },
};
