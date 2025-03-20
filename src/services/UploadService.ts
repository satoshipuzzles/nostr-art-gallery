import axios from 'axios';
import { UnsignedEvent } from '../types';

/**
 * Service for handling image uploads to nostr.build using NIP-98 authentication
 */
class UploadService {
  // API endpoint for nostr.build v2
  private readonly NOSTR_BUILD_API_URL = 'https://nostr.build/api/v2/upload/files';
  
  // CORS proxy for development
  private readonly CORS_PROXY = 'https://corsproxy.io/?';
  
  // Check if we're in development mode
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  
  /**
   * Uploads an image file to nostr.build using NIP-98 authentication
   * @param file The file to upload
   * @param pubkey The user's public key
   * @returns A promise that resolves to the URL of the uploaded image
   */
  async uploadImage(file: File, pubkey: string): Promise<string> {
    try {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are supported');
      }
      
      // Check if nostr is available
      if (!window.nostr) {
        throw new Error('Nostr extension not found. Please install a Nostr browser extension.');
      }
      
      // Create a timestamp for the event
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Create a proper NIP-98 authentication event
      const eventToSign: UnsignedEvent = {
        kind: 27235, // NIP-98 HTTP Auth event kind
        pubkey: pubkey,
        created_at: timestamp,
        tags: [
          ["u", this.NOSTR_BUILD_API_URL], // URL to access
          ["method", "POST"]               // HTTP method
        ],
        content: "",  // Content is empty for NIP-98 auth
      };
      
      console.log('NIP-98 auth event:', eventToSign);
      
      // Sign the event with the user's key
      const signedEvent = await window.nostr.signEvent(eventToSign);
      console.log('Signed NIP-98 event:', signedEvent);
      
      // Base64 encode the signed event for the Authorization header
      const authToken = btoa(JSON.stringify(signedEvent));
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Log details
      console.log('Uploading file:', file.name, file.type, file.size);
      console.log('Using API URL:', this.NOSTR_BUILD_API_URL);
      
      // Determine if we need to use a CORS proxy
      const apiUrl = this.isDevelopment 
        ? `${this.CORS_PROXY}${encodeURIComponent(this.NOSTR_BUILD_API_URL)}`
        : this.NOSTR_BUILD_API_URL;
      
      // Upload to nostr.build with NIP-98 Authorization header
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Nostr ${authToken}`
        }
      });
      
      console.log('nostr.build API response:', response.data);
      
      // Handle various response formats
      if (response.data && response.data.status === 'success' && response.data.data) {
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          // API v2 returns an array of uploaded files
          return response.data.data[0].url;
        } else if (response.data.data.url) {
          // Single file response
          return response.data.data.url;
        }
      } else if (response.data && typeof response.data === 'string' && response.data.startsWith('https://')) {
        // Direct URL string response from legacy API
        return response.data;
      }
      
      // Fallback attempt - try different property paths
      if (response.data) {
        if (response.data.url) {
          return response.data.url;
        } else if (response.data.data && response.data.data.url) {
          return response.data.data.url;
        }
      }
      
      console.error('Invalid response format from nostr.build:', response.data);
      throw new Error('Invalid response from nostr.build');
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  
  /**
   * Creates a local preview URL for an image file
   * @param file The image file
   * @returns A local object URL for the image
   */
  createImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }
  
  /**
   * Releases the resources associated with a preview URL
   * @param previewUrl The preview URL to revoke
   */
  revokeImagePreview(previewUrl: string): void {
    URL.revokeObjectURL(previewUrl);
  }
}

// Create a singleton instance of the service
const uploadService = new UploadService();
export default uploadService; 