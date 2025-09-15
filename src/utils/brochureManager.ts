import { BROCHURE_CONFIG } from '@/config/brochureConfig';
import { validateBrochureFile } from '@/types/brochure';

export class BrochureManager {

  /**
   * Validates a brochure file against production requirements
   * Delegates to centralized validation function
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    return validateBrochureFile(file);
  }

  /**
   * Formats file size for human-readable display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Creates a safe preview URL for the file
   */
  static createPreviewUrl(file: File): string {
    try {
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Error creating preview URL:', error);
      throw new Error('Failed to create file preview');
    }
  }

  /**
   * Safely revokes a preview URL
   */
  static revokePreviewUrl(url: string): void {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error revoking preview URL:', error);
    }
  }

  /**
   * Extracts Firebase Storage path from download URL
   */
  static extractStoragePath(downloadUrl: string): string | null {
    try {
      const url = new URL(downloadUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)(\?|$)/);
      return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
    } catch (error) {
      console.error('Error extracting storage path:', error);
      return null;
    }
  }

  /**
   * Validates Firebase Storage URL format
   */
  static isValidStorageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes('firebasestorage.googleapis.com') &&
        urlObj.pathname.includes('/o/')
      );
    } catch {
      return false;
    }
  }
}

// Production-ready error messages
export const BROCHURE_ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds 10MB limit. Please compress your PDF or use a smaller file.',
  INVALID_FILE_TYPE: 'Only PDF files are supported. Please select a .pdf file.',
  UPLOAD_FAILED: 'Failed to upload brochure. Please check your internet connection and try again.',
  DELETE_FAILED: 'Failed to remove brochure. The file may have already been deleted.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection and try again.',
  SINGLE_FILE_LIMIT: 'Only one brochure per product is allowed. Remove the current brochure first.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again or contact support.',
} as const;

// Success messages
export const BROCHURE_SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'Brochure uploaded successfully',
  DELETE_SUCCESS: 'Brochure removed successfully',
  UPDATE_SUCCESS: 'Brochure updated successfully',
} as const;
