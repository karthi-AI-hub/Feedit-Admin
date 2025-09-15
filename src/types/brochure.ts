export interface BrochureFile {
  file?: File;
  preview?: string;
  name: string;
  url?: string;
  isExisting: boolean;
}

export interface BrochureUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface BrochureDeleteResult {
  success: boolean;
  error?: string;
}

// Import validation constants from centralized config
import { BROCHURE_CONFIG } from '@/config/brochureConfig';

// Helper function to validate brochure file
export function validateBrochureFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  const config = BROCHURE_CONFIG.VALIDATION;
  
  if (!(config.ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { isValid: false, error: 'Only images (JPG, PNG, GIF, WebP, BMP, SVG), PDFs, and documents (DOC, DOCX, TXT) are allowed' };
  }

  if (file.size > config.MAX_FILE_SIZE) {
    const maxSizeMB = config.MAX_FILE_SIZE / (1024 * 1024);
    return { isValid: false, error: `Brochure file size must be less than ${maxSizeMB}MB` };
  }

  if (file.size < config.MIN_FILE_SIZE) {
    return { isValid: false, error: 'File appears to be corrupted or empty' };
  }

  return { isValid: true };
}

// Helper function to get file size in human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
