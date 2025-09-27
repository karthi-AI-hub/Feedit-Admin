export const BROCHURE_CONFIG = {
  VALIDATION: {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    ALLOWED_MIME_TYPES: [
      'application/pdf'
    ],
    ALLOWED_EXTENSIONS: [
      '.pdf'
    ],
    MIN_FILE_SIZE: 1024, // 1KB minimum
  },

  // Firebase Storage settings
  STORAGE: {
    FOLDER_PATH: 'product-brochures',
    MAX_UPLOAD_RETRIES: 3,
    UPLOAD_TIMEOUT: 60000, // 60 seconds
  },

  // UI settings
  UI: {
    PREVIEW_ENABLED: true,
    SHOW_FILE_SIZE: true,
    SHOW_UPLOAD_PROGRESS: true,
    MAX_FILENAME_LENGTH: 100,
  },

  // Error handling
  ERROR_HANDLING: {
    RETRY_FAILED_UPLOADS: true,
    LOG_ERRORS: true,
    SHOW_DETAILED_ERRORS: process.env.NODE_ENV === 'development',
  },

  // Error messages for better user experience
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: `File size exceeds 10MB limit`,
    INVALID_TYPE: 'Only PDF files are allowed for product brochures',
    UPLOAD_FAILED: 'Failed to upload file',
    DELETE_FAILED: 'Failed to delete file',
    FETCH_FAILED: 'Failed to fetch file',
    NO_FILE_SELECTED: 'Please select a file first',
    VALIDATION_FAILED: 'File validation failed',
  },

  // Feature flags
  FEATURES: {
    MULTIPLE_BROCHURES: false, // Currently supports single brochure per product
    DRAG_AND_DROP: true,
    AUTO_COMPRESS: false, // Future feature
    VIRUS_SCAN: false, // Future feature
  },
} as const;

const PRODUCTION_CONFIG = {
  ...BROCHURE_CONFIG,
  ERROR_HANDLING: {
    ...BROCHURE_CONFIG.ERROR_HANDLING,
    LOG_ERRORS: false,
    SHOW_DETAILED_ERRORS: false,
  },
} as const;

const DEVELOPMENT_CONFIG = {
  ...BROCHURE_CONFIG,
  VALIDATION: {
    ...BROCHURE_CONFIG.VALIDATION,
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB for dev
  },
  ERROR_HANDLING: {
    ...BROCHURE_CONFIG.ERROR_HANDLING,
    SHOW_DETAILED_ERRORS: true,
  },
} as const;

// Environment-specific overrides (cached for performance)
export const getEnvironmentConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_CONFIG;
  } else if (process.env.NODE_ENV === 'development') {
    return DEVELOPMENT_CONFIG;
  }
  return BROCHURE_CONFIG;
};

// Interface for config validation section
interface ValidationConfig {
  MAX_FILE_SIZE: number;
  MIN_FILE_SIZE: number;
}

// Cached file size limits for performance
const createFileSizeLimits = (validation: ValidationConfig) => {
  const maxSizeMB = validation.MAX_FILE_SIZE / (1024 * 1024);
  const minSizeKB = validation.MIN_FILE_SIZE / 1024;
  
  return {
    maxSizeMB,
    minSizeKB,
    maxSizeFormatted: `${maxSizeMB}MB`,
    minSizeFormatted: `${minSizeKB}KB`,
  };
};

// Pre-computed limits for better performance
const PRODUCTION_LIMITS = createFileSizeLimits(PRODUCTION_CONFIG.VALIDATION);
const DEVELOPMENT_LIMITS = createFileSizeLimits(DEVELOPMENT_CONFIG.VALIDATION);
const DEFAULT_LIMITS = createFileSizeLimits(BROCHURE_CONFIG.VALIDATION);

// Helper function to get human-readable file size limits (optimized)
export const getFileSizeLimits = () => {
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_LIMITS;
  } else if (process.env.NODE_ENV === 'development') {
    return DEVELOPMENT_LIMITS;
  }
  return DEFAULT_LIMITS;
};
