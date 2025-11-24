import { TiArrowBack } from "react-icons/ti";
// import clearLustre from "../../assets/clear-lustre.jpg";
import { useNavigate } from "react-router-dom";
import star from "../../assets/star.svg";
import starOutline from "../../assets/star-outline.svg";
import { FaUserCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../Redux/store";
import { ProductI, setCartItems } from "../../Redux/features/cartSlice";
import { fetchActiveProducts } from "../../Redux/features/productsSlice";
import toast from "react-hot-toast";
import { 
  addReview, 
  getReviewsByProductId,
  Review 
} from "../../services/reviewService";
import { CgProfile } from "react-icons/cg";
import { ScaleLoader } from "react-spinners";
import { getProductImageUrl } from "../../Utils/imageUtils";
import { isSaleActive, getDisplayPrice, getOriginalPrice } from "../../Utils/discountUtils";

const Shop = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  // Get products from Redux
  const { activeProducts, isLoading: isLoadingProducts, error: productsError } = useSelector(
    (state: RootState) => state.data.products
  );

  const [productCount, setProductCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductI | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('right');
  
  // Review states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    userName: '',
    comment: '',
    rating: 0
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchActiveProducts());
  }, [dispatch]);

  // Set default selected product when products are loaded
  useEffect(() => {
    if (activeProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(activeProducts[0] as ProductI);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProducts]);

  const selectProduct = (id: string | number) => {
    const findProd = activeProducts.find((prod) => prod.id === id) as ProductI | undefined;

    if (findProd && findProd.id !== selectedProduct?.id) {
      // Determine animation direction based on product order
      const currentIndex = activeProducts.findIndex(p => p.id === selectedProduct?.id);
      const newIndex = activeProducts.findIndex(p => p.id === id);
      setAnimationDirection(newIndex > currentIndex ? 'right' : 'left');
      
      setIsAnimating(true);
      
      // Small delay to allow animation to start
      setTimeout(() => {
        setSelectedProduct(findProd);
        setTimeout(() => {
          setIsAnimating(false);
        }, 50);
      }, 150);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || productCount === 0) {
      toast.error("Please select a quantity");
      return;
    }

    dispatch(
      setCartItems({ product: selectedProduct, quantity: productCount })
    );

    toast.success("Added to Cart")

    setProductCount(0);
  };

  // Fetch reviews when product changes
  useEffect(() => {
    if (!selectedProduct) return;
    
    let isCancelled = false;
    let timeoutId: NodeJS.Timeout;
    
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        // Add timeout for query
        // Pass both productId and productName for better compatibility
        const queryPromise = getReviewsByProductId(selectedProduct.id, selectedProduct.name);
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Query timeout: Firestore query took too long. Check your network connection and Firestore indexes.'));
          }, 15000); // 15 second timeout
        });
        
        const productReviews = await Promise.race([queryPromise, timeoutPromise]);
        clearTimeout(timeoutId);
        
        if (isCancelled) return;
        
        // Calculate average rating from fetched reviews
        const avgRating = productReviews.length > 0
          ? productReviews.reduce((acc, review) => acc + review.rating, 0) / productReviews.length
          : 0;
        
        if (!isCancelled) {
          setReviews(productReviews);
          setAverageRating(avgRating);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (isCancelled) return;
        
        // Check for specific Firebase errors
        if (error && typeof error === 'object' && 'code' in error) {
          const firebaseError = error as { code: string; message?: string };
          if (firebaseError.code === 'permission-denied') {
            toast.error('Permission denied. Please update Firestore security rules.');
            console.error('[Shop] Permission denied - Update Firestore Rules. See firestore-rules.txt for example rules.');
          } else if (firebaseError.code === 'failed-precondition') {
            toast.error('Database index missing. Please check console for details.');
          } else {
            toast.error(`Failed to load reviews: ${firebaseError.message || firebaseError.code}`);
          }
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to load reviews');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingReviews(false);
        }
      }
    };

    fetchReviews();
    
    // Cleanup function to cancel ongoing requests
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct?.id]);

  // Handle star rating click
  const handleStarClick = (rating: number) => {
    setReviewFormData({ ...reviewFormData, rating });
  };

  // Handle review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    
    if (!reviewFormData.userName.trim() || !reviewFormData.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (reviewFormData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmittingReview(true);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsSubmittingReview(false);
      toast.error('Request timed out. Please check your connection and try again.');
    }, 30000); // 30 second timeout

    try {
      await addReview(
        selectedProduct.id,
        selectedProduct.name,
        reviewFormData.userName,
        reviewFormData.rating,
        reviewFormData.comment
      );
      
      clearTimeout(timeoutId);
      toast.success('Review submitted successfully!');
      
      setReviewFormData({ userName: '', comment: '', rating: 0 });
      setShowReviewForm(false);
      
      // Refresh reviews
      try {
        const productReviews = await getReviewsByProductId(selectedProduct.id, selectedProduct.name);
        const avgRating = productReviews.length > 0
          ? productReviews.reduce((acc, review) => acc + review.rating, 0) / productReviews.length
          : 0;
        setReviews(productReviews);
        setAverageRating(avgRating);
      } catch (refreshError) {
        // Don't show error toast for refresh failure, review was already submitted
      }
    } catch (error) {
      clearTimeout(timeoutId);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Render stars based on rating
  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((starNum) => (
          <img
            key={starNum}
            src={starNum <= rating ? star : starOutline}
            alt="star"
            className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}
            onClick={interactive ? () => handleStarClick(starNum) : undefined}
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

  // Show loading state
  if (isLoadingProducts) {
    return (
      <div className="px-6 md:px-20 pt-[5rem] lg:pt-[6rem] font-urbanist flex flex-col items-center justify-center gap-5 min-h-screen">
        <ScaleLoader color="#946A2E" />
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  // Show error state
  if (productsError) {
    return (
      <div className="px-6 md:px-20 pt-[5rem] lg:pt-[6rem] font-urbanist flex flex-col items-center justify-center gap-5 min-h-screen">
        <p className="text-red-600 text-xl">Error loading products: {productsError}</p>
        <button
          onClick={() => dispatch(fetchActiveProducts())}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show empty state
  if (!isLoadingProducts && activeProducts.length === 0) {
    return (
      <div className="px-6 md:px-20 pt-[5rem] lg:pt-[6rem] font-urbanist flex flex-col items-center justify-center gap-5 min-h-screen">
        <p className="text-gray-600 text-xl">No products available at the moment.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Go Home
        </button>
      </div>
    );
  }

  // Show error if no product selected
  if (!selectedProduct) {
    return (
      <div className="px-6 md:px-20 pt-[5rem] lg:pt-[6rem] font-urbanist flex flex-col items-center justify-center gap-5 min-h-screen">
        <p className="text-gray-600">Please select a product</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-20 pt-[5rem] lg:pt-[6rem] font-urbanist flex flex-col items-center justify-center gap-5">
      {/* Back button */}
      <div className="flex w-full" onClick={() => navigate("/")}>
        <div className=" flex items-center gap-1 bg-[#F9F6F6] text-xs sm:text-base px-8 py-2 rounded-full">
          <TiArrowBack />
          <span>Back</span>
        </div>
      </div>

      <div className="flex flex-col px-5 gap-5  lg:flex-row lg:justify-evenly lg:items-center lg:border-[0.2px] lg:border-black/25 lg:rounded-3xl">
        <div className=" flex flex-col lg:w-1/2 lg:p-5  gap-2  border-[0.2px] border-black/25 rounded-3xl lg:border-none">
          <div className="rounded-3xl overflow-hidden relative w-full aspect-[3/4]">
            {isSaleActive(selectedProduct) && (
              <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
                SALE {selectedProduct.discountPercentage}% OFF
              </div>
            )}
            <img
              src={getProductImageUrl(selectedProduct)}
              alt={selectedProduct.name}
              className={`w-full h-full object-cover rounded-3xl transition-all duration-500 ease-in-out ${
                isAnimating 
                  ? `opacity-0 scale-95 ${animationDirection === 'right' ? 'translate-x-8' : '-translate-x-8'}`
                  : 'opacity-100 scale-100 translate-x-0'
              }`}
              onError={(e) => {
                // Fallback to a placeholder if image fails to load
                (e.target as HTMLImageElement).src = '/vite.svg';
              }}
            />
          </div>
          <div className="p-5 flex items-center justify-evenly gap-4 border rounded-3xl overflow-x-auto">
            {activeProducts.length === 0 ? (
              <p className="text-gray-500 text-center w-full">No products available</p>
            ) : (
              activeProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => selectProduct(product.id)}
                className={`w-fit rounded-md text-center transition-all duration-300 ease-in-out cursor-pointer relative ${
                  selectedProduct?.id === product.id
                    ? "border-2 border-primary scale-105 shadow-lg"
                    : "shadow-sm md:shadow-md shadow-primary/50 hover:scale-105 hover:shadow-lg"
                } ${isAnimating && selectedProduct?.id === product.id ? 'pointer-events-none' : ''}`}
              >
                {isSaleActive(product) && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl-lg font-bold z-10">
                    SALE
                  </div>
                )}
                <img
                  src={getProductImageUrl(product)}
                  alt={product.name}
                  className={`w-[5rem] h-[8rem] object-cover rounded-lg transition-transform duration-300 ${
                    selectedProduct?.id === product.id ? 'ring-2 ring-primary/30' : ''
                  }`}
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    (e.target as HTMLImageElement).src = '/vite.svg';
                  }}
                />
                <span className="text-[8px] sm:text-[10px] xl:text-sm text-primary leading-0">
                  {product.name}
                </span>
              </div>
            )))}
          </div>
        </div>

        <div className=" hidden lg:flex h-[30rem] w-[1px] bg-black/50" />

        <div className="flex flex-col lg:w-1/2 lg:p-5 gap-5 pb-6">
          <div className="flex flex-col gap-5">
            <div 
              className={`font-urbanist text-2xl sm:text-3xl font-bold transition-all duration-500 ease-in-out ${
                isAnimating 
                  ? `opacity-0 ${animationDirection === 'right' ? 'translate-x-8' : '-translate-x-8'}`
                  : 'opacity-100 translate-x-0'
              }`} 
              style={{color: selectedProduct.color}}
            >
              {selectedProduct.name}
            </div>
            <div 
              className={`text-sm sm:text-base transition-all duration-500 ease-in-out delay-75 ${
                isAnimating 
                  ? `opacity-0 ${animationDirection === 'right' ? 'translate-x-8' : '-translate-x-8'}`
                  : 'opacity-100 translate-x-0'
              }`}
            >
              {selectedProduct.desc}
            </div>
            <div 
              className={`flex items-center gap-8 transition-all duration-500 ease-in-out delay-100 ${
                isAnimating 
                  ? `opacity-0 ${animationDirection === 'right' ? 'translate-x-8' : '-translate-x-8'}`
                  : 'opacity-100 translate-x-0'
              }`}
            >
              {renderStars(Math.round(averageRating))}
              <div className="flex gap-2 items-center ">
                <div className="relative text-3xl text-gray-500">
                  {reviews.length > 0 ? (
                    reviews.slice(0, 4).map((review, idx) => {
                      const positions = ['right-0', 'right-1', 'right-2', 'right-4'];
                      const zIndexes = ['z-10', 'z-20', 'z-30', 'z-50'];
                      return (
                        <FaUserCircle 
                          key={review.id || idx} 
                          className={`absolute ${positions[idx] || 'right-0'} ${zIndexes[idx] || 'z-10'}`}
                        />
                      );
                    })
                  ) : (
                    <>
                      <FaUserCircle className="absolute right-1 z-10" />
                      <FaUserCircle className="absolute right-2 z-20" />
                      <FaUserCircle className="absolute right-4 z-30" />
                      <FaUserCircle className="z-50" />
                    </>
                  )}
                </div>
                <div className="cursor-pointer underline">
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </div>
              </div>
            </div>
            <div 
              className={`transition-all duration-500 ease-in-out delay-150 ${
                isAnimating 
                  ? `opacity-0 ${animationDirection === 'right' ? 'translate-x-8' : '-translate-x-8'}`
                  : 'opacity-100 translate-x-0'
              }`}
            >
              {isSaleActive(selectedProduct) ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">
                      ${getDisplayPrice(selectedProduct).toFixed(2)}
                    </span>
                    {selectedProduct.discountPercentage && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{selectedProduct.discountPercentage}%
                      </span>
                    )}
                  </div>
                  <span className="text-xl text-gray-400 line-through">
                    ${getOriginalPrice(selectedProduct).toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="text-3xl">
                  ${selectedProduct.price.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col gap-6">
            <div className=" bg-[#EEE9E9B2] w-full h-14 rounded-xl flex justify-evenly px-2 items-center text-lg font-bold">
              <button
                className="p-3 cursor-pointer"
                onClick={() =>
                  productCount > 0 && setProductCount(productCount - 1)
                }
              >
                -
              </button>
              <div className="w-[60%] h-full bg-white rounded-2xl flex items-center justify-center">
                {productCount}
              </div>
              <button
                className="p-3 cursor-pointer"
                onClick={() => setProductCount(productCount + 1)}
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleAddToCart()}
              className="w-full h-14 rounded-xl flex bg-primary text-white items-center justify-center"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-black/50 lg:hidden" />

      {/* Reviews Section */}
      <div className="flex flex-col w-full gap-6 px-5">
        <div className="w-full text-center underline underline-offset-8 text-xl sm:text-2xl font-bold">
          Reviews
        </div>

        {/* Add Review Button */}
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="w-full sm:w-auto mx-auto px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          {showReviewForm ? 'Cancel' : 'Write a Review'}
        </button>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="w-full bg-[#F9F6F6] rounded-xl p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Your Name</label>
              <input
                type="text"
                value={reviewFormData.userName}
                onChange={(e) => setReviewFormData({ ...reviewFormData, userName: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Rating</label>
              <div className="flex gap-2">
                {renderStars(reviewFormData.rating, true)}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Your Review</label>
              <textarea
                value={reviewFormData.comment}
                onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                placeholder="Share your thoughts about this product..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {isLoadingReviews ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white shadow-md border rounded-xl p-6 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#D9D9D9] text-primary rounded-full p-2 text-xl">
                      <CgProfile />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-semibold">{review.userName}</div>
                      <div className="text-xs text-gray-500">{formatDate(review.timestamp)}</div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <div className="text-sm text-gray-700">{review.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
