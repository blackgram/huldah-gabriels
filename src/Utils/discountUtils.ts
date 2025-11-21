import { Product } from '../services/productService';

/**
 * Check if a product is currently on sale based on dates
 */
export const isSaleActive = (product: Product): boolean => {
  if (!product.isOnSale) return false;
  
  const now = new Date();
  
  // Check start date
  if (product.saleStartDate) {
    const startDate = product.saleStartDate instanceof Date 
      ? product.saleStartDate 
      : new Date(product.saleStartDate);
    if (now < startDate) return false;
  }
  
  // Check end date
  if (product.saleEndDate) {
    const endDate = product.saleEndDate instanceof Date
      ? product.saleEndDate
      : new Date(product.saleEndDate);
    if (now > endDate) return false;
  }
  
  return true;
};

/**
 * Calculate the discounted price for a product
 */
export const getDiscountedPrice = (product: Product): number => {
  if (!isSaleActive(product) || !product.discountPercentage) {
    return product.price;
  }
  
  const originalPrice = product.originalPrice || product.price;
  const discountAmount = (originalPrice * product.discountPercentage) / 100;
  return Math.max(0, originalPrice - discountAmount);
};

/**
 * Get the display price (discounted if on sale, otherwise regular price)
 */
export const getDisplayPrice = (product: Product): number => {
  return isSaleActive(product) ? getDiscountedPrice(product) : product.price;
};

/**
 * Get the original price (before discount)
 */
export const getOriginalPrice = (product: Product): number => {
  return product.originalPrice || product.price;
};

/**
 * Calculate discount percentage from original and current price
 */
export const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= 0 || currentPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

