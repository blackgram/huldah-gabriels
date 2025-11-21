import { Product } from '../services/productService';
import { Timestamp } from 'firebase/firestore';

// Helper function to convert Timestamp to Date
const toDate = (date: Date | string | Timestamp | undefined): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (typeof date === 'string') return new Date(date);
  // Handle Firebase Timestamp
  if (date && typeof date === 'object' && 'toDate' in date) {
    return (date as Timestamp).toDate();
  }
  return null;
};

/**
 * Check if a product is currently on sale based on dates
 */
export const isSaleActive = (product: Product | { isOnSale?: boolean; saleStartDate?: Date | string | Timestamp; saleEndDate?: Date | string | Timestamp }): boolean => {
  if (!product.isOnSale) return false;
  
  const now = new Date();
  
  // Check start date
  if (product.saleStartDate) {
    const startDate = toDate(product.saleStartDate);
    if (startDate && now < startDate) return false;
  }
  
  // Check end date
  if (product.saleEndDate) {
    const endDate = toDate(product.saleEndDate);
    if (endDate && now > endDate) return false;
  }
  
  return true;
};

/**
 * Calculate the discounted price for a product
 */
export const getDiscountedPrice = (product: Product | { price: number; isOnSale?: boolean; discountPercentage?: number; originalPrice?: number; saleStartDate?: Date | string | Timestamp; saleEndDate?: Date | string | Timestamp }): number => {
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
export const getDisplayPrice = (product: Product | { price: number; isOnSale?: boolean; discountPercentage?: number; originalPrice?: number; saleStartDate?: Date | string | Timestamp; saleEndDate?: Date | string | Timestamp }): number => {
  return isSaleActive(product) ? getDiscountedPrice(product) : product.price;
};

/**
 * Get the original price (before discount)
 */
export const getOriginalPrice = (product: Product | { price: number; originalPrice?: number }): number => {
  return product.originalPrice || product.price;
};

/**
 * Calculate discount percentage from original and current price
 */
export const calculateDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
  if (originalPrice <= 0 || currentPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

