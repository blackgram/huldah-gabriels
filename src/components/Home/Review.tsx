import { forwardRef, useState, useEffect, useCallback } from "react";
import { CgProfile } from "react-icons/cg";
import { MdOutlineCircle, MdCircle } from "react-icons/md";
import { getLatestReviews, type Review } from "../../services/reviewService";
import star from "../../assets/star.svg";
import starOutline from "../../assets/star-outline.svg";

const Review = forwardRef<HTMLDivElement>((_, ref) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch latest reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const startTime = performance.now();
      console.log(`[Home Review] Starting to fetch latest 10 reviews`);
      
      setIsLoading(true);
      try {
        console.log(`[Home Review] Calling getLatestReviews(10)...`);
        const fetchStartTime = performance.now();
        const latestReviews = await getLatestReviews(10);
        const fetchEndTime = performance.now();
        console.log(`[Home Review] Reviews fetched in ${(fetchEndTime - fetchStartTime).toFixed(2)}ms, found ${latestReviews.length} review(s)`);
        
        setReviews(latestReviews);
        
        const endTime = performance.now();
        console.log(`[Home Review] Successfully loaded reviews in ${(endTime - startTime).toFixed(2)}ms`);
      } catch (error) {
        const endTime = performance.now();
        console.error(`[Home Review] Error fetching reviews (took ${(endTime - startTime).toFixed(2)}ms):`, error);
        
        // Check for specific Firebase errors
        if (error && typeof error === 'object' && 'code' in error) {
          const firebaseError = error as { code: string; message?: string };
          if (firebaseError.code === 'failed-precondition') {
            console.error('[Home Review] Missing Firestore index! Check the error message for the index creation link.');
          }
        }
      } finally {
        setIsLoading(false);
        console.log(`[Home Review] Loading state set to false`);
      }
    };

    fetchReviews();
  }, []);

  const nextReview = useCallback(() => {
    if (!isTransitioning && reviews.length > 0) {
      setIsTransitioning(true);
      setCurrentReviewIndex((prevIndex) => 
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }
  }, [isTransitioning, reviews.length]);

  const goToReview = (index: number) => {
    if (!isTransitioning && index !== currentReviewIndex) {
      setIsTransitioning(true);
      setCurrentReviewIndex(index);
    }
  };

  // Reset transition state after animation completes
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // Auto-advance carousel
  useEffect(() => {
    if (reviews.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      nextReview();
    }, 5000); // Change review every 5 seconds

    return () => clearInterval(interval);
  }, [reviews.length, isPaused, nextReview]);

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((starNum) => (
          <img
            key={starNum}
            src={starNum <= rating ? star : starOutline}
            alt="star"
            className="w-4 h-4 xl:w-6 xl:h-6"
          />
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    const date = (timestamp as { toDate?: () => Date }).toDate 
      ? (timestamp as { toDate: () => Date }).toDate() 
      : new Date(timestamp as string | number);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Show placeholder if no reviews
  if (isLoading) {
    return (
      <div className="p-5 xl:p-14 flex flex-col gap-3 xl:gap-10 items-center justify-center font-urbanist">
        <div ref={ref} className="text-xl font-gentium xl:text-4xl">Customer Reviews</div>
        <div className="text-center py-8">Loading reviews...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-5 xl:p-14 flex flex-col gap-3 xl:gap-10 items-center justify-center font-urbanist">
        <div ref={ref} className="text-xl font-gentium xl:text-4xl">Customer Reviews</div>
        <div className="bg-white shadow-xl border rounded-xl text-center p-10 xl:p-36 text-primary text-sm font-light flex flex-col items-center justify-center gap-10 xl:gap-16">
          <div className="font-light text-[10px] xl:text-xl">
            No reviews yet. Check back soon for customer feedback!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 xl:p-14 flex flex-col gap-3 xl:gap-10 items-center justify-center font-urbanist">
      <div ref={ref} className="text-xl font-gentium xl:text-4xl">Customer Reviews</div>
      
      {/* Carousel Container */}
      <div 
        className="w-full max-w-4xl relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carousel */}
        <div className="overflow-hidden rounded-xl shadow-xl relative">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
          >
            {reviews.map((review) => (
              <div key={review.id} className="min-w-full flex-shrink-0">
                <div className="bg-white shadow-xl border rounded-xl text-center p-10 xl:p-36 text-primary text-sm font-light flex flex-col items-center justify-center gap-6 xl:gap-16">
                  {/* Product Name */}
                  <div className="text-xs xl:text-base text-gray-500 font-semibold">
                    {review.productName}
                  </div>
                  
                  {/* Stars */}
                  {renderStars(review.rating)}
                  
                  {/* Review Text */}
                  <div className="font-light text-[10px] xl:text-xl italic">
                    "{review.comment}"
                  </div>
                  
                  {/* Reviewer Info */}
                  <div className="flex flex-col md:flex-row md:gap-5 items-center justify-center gap-3">
                    <div className="bg-[#D9D9D9] text-primary rounded-full p-2 xl:text-3xl flex flex-col items-center justify-center">
                      <CgProfile />
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <div className="text-[10px] xl:text-2xl font-semibold">{review.userName}</div>
                      <div className="text-[8px] xl:text-sm text-gray-500">{formatDate(review.timestamp)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Carousel Indicators */}
        {reviews.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {reviews.map((_, index) => (
              <button 
                key={index} 
                onClick={() => goToReview(index)}
                className="focus:outline-none transition-transform hover:scale-110"
                disabled={isTransitioning}
              >
                {index === currentReviewIndex ? (
                  <MdCircle className="text-primary" size={16} />
                ) : (
                  <MdOutlineCircle className="text-gray-400" size={16} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default Review;
