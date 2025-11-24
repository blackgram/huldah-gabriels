/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

// Interface for review data
export interface Review {
  id?: string;
  productId: string | number; // Support both string (Firestore) and number (legacy)
  productName: string;
  userName: string;
  rating: number; // 1-5 stars
  comment: string;
  timestamp: any; // Firebase timestamp
}

// Function to add a new review
export const addReview = async (
  productId: string | number,
  productName: string,
  userName: string,
  rating: number,
  comment: string
): Promise<string> => {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Validate required fields
    if (!userName.trim() || !comment.trim()) {
      throw new Error('Name and comment are required');
    }

    const reviewsRef = collection(db, 'reviews');
    
    const reviewData = {
      productId,
      productName,
      userName: userName.trim(),
      rating,
      comment: comment.trim(),
      timestamp: serverTimestamp()
    };
    
    const docRef = await addDoc(reviewsRef, reviewData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    
    // Handle Firebase-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message?: string };
      if (firebaseError.code === 'permission-denied') {
        throw new Error('Permission denied. Please check your Firebase security rules.');
      }
      if (firebaseError.code === 'unavailable') {
        throw new Error('Service temporarily unavailable. Please try again.');
      }
      throw new Error(firebaseError.message || `Firebase error: ${firebaseError.code}`);
    }
    
    // Handle generic errors
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unexpected error occurred while submitting your review.');
  }
};

// Function to get reviews for a specific product
// Can query by productId (string or number) or productName
export const getReviewsByProductId = async (
  productId: string | number,
  productName?: string
): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    
    // Try querying by productName first (more reliable for migrated products)
    // If productName is provided, use it; otherwise fall back to productId
    let reviews: Review[] = [];
    
    if (productName) {
      try {
        const nameQuery = query(
          reviewsRef,
          where('productName', '==', productName),
          orderBy('timestamp', 'desc')
        );
        const nameSnapshot = await getDocs(nameQuery);
        
        nameSnapshot.forEach((doc) => {
          const data = doc.data();
          reviews.push({
            id: doc.id,
            productId: data.productId,
            productName: data.productName,
            userName: data.userName,
            rating: data.rating,
            comment: data.comment,
            timestamp: data.timestamp
          });
        });
      } catch (nameError) {
        // Fallback: query without orderBy
        try {
          const nameQueryFallback = query(
            reviewsRef,
            where('productName', '==', productName)
          );
          const nameSnapshotFallback = await getDocs(nameQueryFallback);
          nameSnapshotFallback.forEach((doc) => {
            const data = doc.data();
            reviews.push({
              id: doc.id,
              productId: data.productId,
              productName: data.productName,
              userName: data.userName,
              rating: data.rating,
              comment: data.comment,
              timestamp: data.timestamp
            });
          });
        } catch (fallbackError) {
          // Silently fail, will try productId query
        }
      }
    }
    
    // If we found reviews by name, return them
    if (reviews.length > 0) {
      reviews.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
        const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
        return timeB - timeA;
      });
      return reviews;
    }
    
    // Otherwise, try querying by productId
    const q = query(
      reviewsRef, 
      where('productId', '==', productId),
      orderBy('timestamp', 'desc')
    );
    
    try {
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          productId: data.productId,
          productName: data.productName,
          userName: data.userName,
          rating: data.rating,
          comment: data.comment,
          timestamp: data.timestamp
        });
      });
      
      // Sort by timestamp in memory (fallback if index missing)
      reviews.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
        const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
        return timeB - timeA; // Descending order
      });
      
      return reviews;
    } catch (queryError) {
      // Fallback: Query without orderBy (no index required)
      if (queryError && typeof queryError === 'object' && 'code' in queryError) {
        const firebaseError = queryError as { code: string; message?: string };
        if (firebaseError.code === 'failed-precondition') {
          console.warn('[ReviewService] Missing Firestore index. Using fallback query.');
        }
      }
      
      const fallbackQuery = query(
        reviewsRef,
        where('productId', '==', productId)
      );
      
      const fallbackSnapshot = await getDocs(fallbackQuery);
      const reviews: Review[] = [];
      fallbackSnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          productId: data.productId,
          productName: data.productName,
          userName: data.userName,
          rating: data.rating,
          comment: data.comment,
          timestamp: data.timestamp
        });
      });
      
      // Sort by timestamp in memory
      reviews.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
        const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
        return timeB - timeA; // Descending order
      });
      
      return reviews;
    }
  } catch (error) {
    console.error('[ReviewService] Error getting reviews:', error);
    
    // Check for permission errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message?: string };
      if (firebaseError.code === 'permission-denied') {
        console.error('[ReviewService] Permission denied - Check Firestore security rules.');
      }
    }
    
    throw error;
  }
};

// Function to get the latest 10 reviews across all products
export const getLatestReviews = async (limitCount: number = 10): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    try {
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          productId: data.productId,
          productName: data.productName,
          userName: data.userName,
          rating: data.rating,
          comment: data.comment,
          timestamp: data.timestamp
        });
      });
      
      return reviews;
    } catch (queryError) {
      // Fallback: Get all reviews and sort in memory
      if (queryError && typeof queryError === 'object' && 'code' in queryError) {
        const firebaseError = queryError as { code: string; message?: string };
        if (firebaseError.code === 'failed-precondition') {
          console.warn('[ReviewService] Missing Firestore index. Using fallback query.');
        }
      }
      
      const fallbackSnapshot = await getDocs(reviewsRef);
      const reviews: Review[] = [];
      fallbackSnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          productId: data.productId,
          productName: data.productName,
          userName: data.userName,
          rating: data.rating,
          comment: data.comment,
          timestamp: data.timestamp
        });
      });
      
      // Sort by timestamp in memory and limit
      reviews.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
        const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
        return timeB - timeA; // Descending order
      });
      
      return reviews.slice(0, limitCount);
    }
  } catch (error) {
    console.error('[ReviewService] Error getting latest reviews:', error);
    throw error;
  }
};

// Function to calculate average rating for a product
// Optimized version that accepts reviews array to avoid duplicate queries
export const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) {
    return 0;
  }
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
};

// Function to calculate average rating for a product (fetches reviews)
export const getAverageRating = async (productId: string | number): Promise<number> => {
  try {
    const reviews = await getReviewsByProductId(productId);
    
    if (reviews.length === 0) {
      return 0;
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  } catch (error) {
    console.error('[ReviewService] Error calculating average rating:', error);
    return 0;
  }
};

export default {
  addReview,
  getReviewsByProductId,
  getLatestReviews,
  getAverageRating,
  calculateAverageRating
};

