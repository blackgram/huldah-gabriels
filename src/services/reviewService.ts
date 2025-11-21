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
    
    console.log('[ReviewService] Attempting to add review:', reviewData);
    console.log('[ReviewService] Collection path: reviews');
    console.log('[ReviewService] Firebase Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
    
    const docRef = await addDoc(reviewsRef, reviewData);
    
    console.log('[ReviewService] ✅ Review added successfully!');
    console.log('[ReviewService] Document ID:', docRef.id);
    console.log('[ReviewService] Collection: reviews');
    console.log('[ReviewService] You can now see this in Firestore Console → reviews collection');
    
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
  const startTime = performance.now();
  console.log(`[ReviewService] Starting to fetch reviews for product ID: ${productId}${productName ? `, name: ${productName}` : ''}`);
  
  try {
    console.log(`[ReviewService] Creating Firestore collection reference...`);
    const reviewsRef = collection(db, 'reviews');
    console.log(`[ReviewService] Collection reference created`);
    
    // Try querying by productName first (more reliable for migrated products)
    // If productName is provided, use it; otherwise fall back to productId
    let reviews: Review[] = [];
    
    if (productName) {
      console.log(`[ReviewService] Attempting to query by productName: ${productName}...`);
      try {
        const nameQuery = query(
          reviewsRef,
          where('productName', '==', productName),
          orderBy('timestamp', 'desc')
        );
        const nameSnapshot = await getDocs(nameQuery);
        console.log(`[ReviewService] Found ${nameSnapshot.size} review(s) by productName`);
        
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
        console.warn(`[ReviewService] Query by productName failed, trying fallback...`);
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
          console.warn(`[ReviewService] Fallback query by productName also failed`);
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
      console.log(`[ReviewService] Returning ${reviews.length} review(s) found by productName`);
      return reviews;
    }
    
    // Otherwise, try querying by productId
    console.log(`[ReviewService] Building query with orderBy for productId=${productId}...`);
    const q = query(
      reviewsRef, 
      where('productId', '==', productId),
      orderBy('timestamp', 'desc')
    );
    console.log(`[ReviewService] Query built successfully`);
    
    console.log(`[ReviewService] Executing Firestore query...`);
    const queryStartTime = performance.now();
    
    try {
      const querySnapshot = await getDocs(q);
      const queryEndTime = performance.now();
      console.log(`[ReviewService] Query completed in ${(queryEndTime - queryStartTime).toFixed(2)}ms`);
      console.log(`[ReviewService] Found ${querySnapshot.size} review(s)`);
      
      console.log(`[ReviewService] Processing review documents...`);
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
      
      console.log(`[ReviewService] Processed ${reviews.length} review(s)`);
      
      const endTime = performance.now();
      console.log(`[ReviewService] Successfully fetched reviews in ${(endTime - startTime).toFixed(2)}ms`);
      
      return reviews;
    } catch (queryError) {
      const queryEndTime = performance.now();
      console.warn(`[ReviewService] Query with orderBy failed after ${(queryEndTime - queryStartTime).toFixed(2)}ms, trying fallback query...`);
      
      // Fallback: Query without orderBy (no index required)
      if (queryError && typeof queryError === 'object' && 'code' in queryError) {
        const firebaseError = queryError as { code: string; message?: string };
        if (firebaseError.code === 'failed-precondition') {
          console.warn('[ReviewService] Missing Firestore index! Using fallback query without orderBy.');
          console.warn('[ReviewService] To fix: Create a composite index for reviews collection on (productId, timestamp)');
        }
      }
      
      const fallbackQuery = query(
        reviewsRef,
        where('productId', '==', productId)
      );
      
      const fallbackStartTime = performance.now();
      const fallbackSnapshot = await getDocs(fallbackQuery);
      const fallbackEndTime = performance.now();
      console.log(`[ReviewService] Fallback query completed in ${(fallbackEndTime - fallbackStartTime).toFixed(2)}ms`);
      console.log(`[ReviewService] Found ${fallbackSnapshot.size} review(s)`);
      
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
      
      const endTime = performance.now();
      console.log(`[ReviewService] Successfully fetched reviews (fallback) in ${(endTime - startTime).toFixed(2)}ms`);
      
      return reviews;
    }
  } catch (error) {
    const endTime = performance.now();
    console.error(`[ReviewService] Error getting reviews by product ID (took ${(endTime - startTime).toFixed(2)}ms):`, error);
    
    // Check for permission errors
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string; message?: string };
      if (firebaseError.code === 'permission-denied') {
        console.error('[ReviewService] ❌ PERMISSION DENIED - Firestore security rules are blocking access!');
        console.error('[ReviewService] 📝 To fix: Go to Firebase Console → Firestore Database → Rules');
        console.error('[ReviewService] 📝 Add these rules for the reviews collection:');
        console.error('[ReviewService]    match /reviews/{reviewId} {');
        console.error('[ReviewService]      allow read: if true;');
        console.error('[ReviewService]      allow create: if true;');
        console.error('[ReviewService]    }');
      }
    }
    
    throw error;
  }
};

// Function to get the latest 10 reviews across all products
export const getLatestReviews = async (limitCount: number = 10): Promise<Review[]> => {
  const startTime = performance.now();
  console.log(`[ReviewService] Starting to fetch latest ${limitCount} reviews`);
  
  try {
    console.log(`[ReviewService] Creating Firestore collection reference...`);
    const reviewsRef = collection(db, 'reviews');
    console.log(`[ReviewService] Collection reference created`);
    
    console.log(`[ReviewService] Building query for latest reviews...`);
    const q = query(
      reviewsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    console.log(`[ReviewService] Query built successfully`);
    
    console.log(`[ReviewService] Executing Firestore query...`);
    const queryStartTime = performance.now();
    
    try {
      const querySnapshot = await getDocs(q);
      const queryEndTime = performance.now();
      console.log(`[ReviewService] Query completed in ${(queryEndTime - queryStartTime).toFixed(2)}ms`);
      console.log(`[ReviewService] Found ${querySnapshot.size} review(s)`);
      
      console.log(`[ReviewService] Processing review documents...`);
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
      console.log(`[ReviewService] Processed ${reviews.length} review(s)`);
      
      const endTime = performance.now();
      console.log(`[ReviewService] Successfully fetched latest reviews in ${(endTime - startTime).toFixed(2)}ms`);
      
      return reviews;
    } catch (queryError) {
      const queryEndTime = performance.now();
      console.warn(`[ReviewService] Query with orderBy failed after ${(queryEndTime - queryStartTime).toFixed(2)}ms, trying fallback query...`);
      
      // Fallback: Get all reviews and sort in memory
      if (queryError && typeof queryError === 'object' && 'code' in queryError) {
        const firebaseError = queryError as { code: string; message?: string };
        if (firebaseError.code === 'failed-precondition') {
          console.warn('[ReviewService] Missing Firestore index! Using fallback query.');
          console.warn('[ReviewService] To fix: Create an index for reviews collection on timestamp field');
        }
      }
      
      const fallbackStartTime = performance.now();
      const fallbackSnapshot = await getDocs(reviewsRef);
      const fallbackEndTime = performance.now();
      console.log(`[ReviewService] Fallback query completed in ${(fallbackEndTime - fallbackStartTime).toFixed(2)}ms`);
      console.log(`[ReviewService] Found ${fallbackSnapshot.size} review(s)`);
      
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
      
      const limitedReviews = reviews.slice(0, limitCount);
      console.log(`[ReviewService] Processed and limited to ${limitedReviews.length} review(s)`);
      
      const endTime = performance.now();
      console.log(`[ReviewService] Successfully fetched latest reviews (fallback) in ${(endTime - startTime).toFixed(2)}ms`);
      
      return limitedReviews;
    }
  } catch (error) {
    const endTime = performance.now();
    console.error(`[ReviewService] Error getting latest reviews (took ${(endTime - startTime).toFixed(2)}ms):`, error);
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
  const startTime = performance.now();
  console.log(`[ReviewService] Calculating average rating for product ID: ${productId}`);
  
  try {
    const reviews = await getReviewsByProductId(productId);
    
    if (reviews.length === 0) {
      console.log(`[ReviewService] No reviews found, returning 0`);
      return 0;
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;
    
    const endTime = performance.now();
    console.log(`[ReviewService] Average rating calculated: ${average.toFixed(2)} (took ${(endTime - startTime).toFixed(2)}ms)`);
    
    return average;
  } catch (error) {
    const endTime = performance.now();
    console.error(`[ReviewService] Error calculating average rating (took ${(endTime - startTime).toFixed(2)}ms):`, error);
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

