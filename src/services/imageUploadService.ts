export interface UploadOptions {
  maxSizeMB?: number; // Maximum file size in MB before compression (default: 10MB)
  allowedTypes?: string[]; // Allowed MIME types (default: ['image/jpeg', 'image/png', 'image/webp'])
  maxWidth?: number; // Maximum width in pixels (default: 1200px)
  maxHeight?: number; // Maximum height in pixels (default: 1200px)
  quality?: number; // JPEG quality 0-1 (default: 0.8)
  maxBase64SizeKB?: number; // Maximum base64 size in KB (default: 700KB to stay under Firestore 1MB limit)
}

export interface UploadResult {
  url: string; // Base64 data URL (images are stored as base64 in Firestore)
  storagePath?: string; // Not used (kept for API compatibility)
  isBase64: boolean; // Always true (images are stored as base64)
}

/**
 * Compress and resize image using Canvas API
 */
const compressImage = (
  file: File,
  options: UploadOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const maxWidth = options.maxWidth || 1200;
    const maxHeight = options.maxHeight || 1200;
    const maxBase64SizeKB = options.maxBase64SizeKB || 700; // Target 700KB to stay under 1MB Firestore limit
    const initialQuality = options.quality || 0.8;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        const compressWithQuality = (quality: number): Promise<string> => {
          return new Promise((resolveCompress, rejectCompress) => {
            // Determine output format (prefer JPEG for better compression)
            const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  rejectCompress(new Error('Failed to compress image'));
                  return;
                }

                // Convert blob to base64
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = reader.result as string;
                  const sizeKB = (base64.length * 3) / 4 / 1024; // Approximate base64 size

                  // If size is acceptable or quality is too low, return
                  if (sizeKB <= maxBase64SizeKB || quality <= 0.1) {
                    resolveCompress(base64);
                  } else {
                    // Reduce quality and try again
                    const newQuality = Math.max(0.1, quality - 0.1);
                    compressWithQuality(newQuality).then(resolveCompress).catch(rejectCompress);
                  }
                };
                reader.onerror = rejectCompress;
                reader.readAsDataURL(blob);
              },
              outputFormat,
              quality
            );
          });
        };

        compressWithQuality(initialQuality)
          .then(resolve)
          .catch(reject);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};


/**
 * Validate file before upload
 */
const validateFile = (file: File, options: UploadOptions): { valid: boolean; error?: string } => {
  const maxSizeMB = options.maxSizeMB || 5;
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. Current size: ${fileSizeMB.toFixed(2)}MB`
    };
  }
  
  return { valid: true };
};

/**
 * Upload product image
 * Converts image to base64 data URL and stores it in Firestore
 * 
 * @param file - The image file to upload
 * @param _productId - Optional product ID (kept for API consistency, not currently used)
 * @param options - Upload options
 * @returns Upload result with base64 URL
 */
export const uploadProductImage = async (
  file: File,
  _productId?: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  // Validate file
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error || 'File validation failed');
  }
  
  // Compress and convert to base64
  try {
    const base64Url = await compressImage(file, options);
    const sizeKB = (base64Url.length * 3) / 4 / 1024;
    
    // Final check - if still too large, throw error
    if (sizeKB > 900) { // 900KB base64 ≈ 675KB binary, leaving room for other fields
      throw new Error(`Image is too large even after compression (${sizeKB.toFixed(2)}KB). Please use a smaller image or reduce quality.`);
    }
    
    return {
      url: base64Url,
      isBase64: true
    };
  } catch (error) {
    console.error('[ImageUploadService] Image compression/conversion error:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete image (placeholder)
 * Since images are stored as base64 in Firestore, deletion is handled
 * by updating the product document in Firestore
 */
export const deleteProductImage = async (_storagePath?: string): Promise<void> => {
  // Images are stored as base64 in Firestore, so deletion is handled
  // by updating the product document. This function is kept for API consistency.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void _storagePath; // Suppress unused parameter warning
};

/**
 * Check if a URL is a base64 data URL
 */
export const isBase64Url = (url: string): boolean => {
  return url.startsWith('data:image/');
};

/**
 * Check if a URL is a Firebase Storage URL
 * Note: Currently not used since we're using base64, but kept for compatibility
 */
export const isFirebaseStorageUrl = (url: string): boolean => {
  return url.includes('firebasestorage.googleapis.com') || url.includes('firebase.storage');
};

