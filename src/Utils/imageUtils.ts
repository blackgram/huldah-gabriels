/**
 * Utility functions for handling image paths
 * Handles both imported assets and string paths from Firestore
 */

// Import product images for fallback
import clearLustre from "../assets/clear-lustre.jpg";
import cherryPop from "../assets/cherry-pop.jpg";
import cocoaBrown2 from "../assets/cocoa-brown2.jpg";
import nudeyPink from "../assets/nudey-pink.jpg";

// Map of product names to imported images (for fallback)
const productImageMap: Record<string, string> = {
  "Clear Lustre": clearLustre,
  "Cherry Pop": cherryPop,
  "Cocoa Brown": cocoaBrown2,
  "Nudey Pink": nudeyPink,
};

// Map of filenames to public paths
const filenameToPublicPath: Record<string, string> = {
  "clear-lustre.jpg": "/images/clear-lustre.jpg",
  "cherry-pop.jpg": "/images/cherry-pop.jpg",
  "cocoa-brown2.jpg": "/images/cocoa-brown2.jpg",
  "nudey-pink.jpg": "/images/nudey-pink.jpg",
};

/**
 * Resolves an image path to a valid URL
 * Handles:
 * - Imported assets (already URLs)
 * - Relative paths from assets folder
 * - Absolute URLs
 * - Public folder paths
 */
export const resolveImagePath = (imagePath: string, productName?: string): string => {
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a data URL, return as is
  if (imagePath.startsWith("data:")) {
    return imagePath;
  }

  // If it starts with /, it's a public path - return as is
  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  // If it contains "assets" or "../assets", extract filename and map to public path
  if (imagePath.includes("assets") || imagePath.includes("../assets") || imagePath.includes("/")) {
    // Extract filename from path
    const filename = imagePath.split("/").pop() || imagePath.split("\\").pop() || imagePath;
    
    // Check if we have a mapping for this filename
    if (filenameToPublicPath[filename]) {
      return filenameToPublicPath[filename];
    }

    // Try to match with imported images by product name
    if (productName && productImageMap[productName]) {
      return productImageMap[productName];
    }

    // Try public images folder
    return `/images/${filename}`;
  }

  // Fallback: try to use product name mapping
  if (productName && productImageMap[productName]) {
    return productImageMap[productName];
  }

  // If it's just a filename, try public images folder
  if (!imagePath.includes("/") && !imagePath.includes("\\")) {
    return `/images/${imagePath}`;
  }

  // Last resort: return as-is (might work if it's a valid path)
  return imagePath;
};

/**
 * Get image URL for a product
 * Tries multiple strategies to resolve the image
 */
export const getProductImageUrl = (product: { display: string; name?: string }): string => {
  return resolveImagePath(product.display, product.name);
};

