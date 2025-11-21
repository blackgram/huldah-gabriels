import CtaButton from "../CtaButton";
import hg1 from "../../assets/hg1.png";
import b1 from "../../assets/brandPhotos/b1.jpg"
import b2 from "../../assets/brandPhotos/b2.jpg"
import b3 from "../../assets/brandPhotos/b3.jpg"
import b4 from "../../assets/brandPhotos/b4.jpg"
import b5 from "../../assets/brandPhotos/b5.jpg"
import b6 from "../../assets/brandPhotos/b6.jpg"
import b7 from "../../assets/brandPhotos/b7.jpg"
import SectionDivider from "../SectionDivider";
import { forwardRef, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
// import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdOutlineCircle, MdCircle } from "react-icons/md";

// Assuming you have more images, import them here
// For example:
// import hg2 from "../../assets/hg2.png";
// import hg3 from "../../assets/hg3.png";
// import hg4 from "../../assets/hg4.png";

const Hero = forwardRef<HTMLDivElement>((_, ref) => {
  const showModal = useSelector(
    (state: RootState) => state.data.checkout.showModal
  );

  // Create an array of images for the carousel
  // Replace with your actual images
  const carouselImages = [
    { id: 1, src: b1, alt: "Lipgloss product 2" },
    { id: 2, src: hg1, alt: "Lipgloss product 1" },
    { id: 3, src: b2, alt: "Lipgloss product 3" },
    { id: 4, src: b3, alt: "Lipgloss product 4" },
    { id: 5, src: b4, alt: "Lipgloss product 5" },
    { id: 6, src: b5, alt: "Lipgloss product 6" },
    { id: 7, src: b6, alt: "Lipgloss product 7" },
    { id: 8, src: b7, alt: "Lipgloss product 8" },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextImage = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentImageIndex((prevIndex) => 
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }
  }, [isTransitioning, carouselImages.length]);

  // const prevImage = () => {
  //   if (!isTransitioning) {
  //     setIsTransitioning(true);
  //     setCurrentImageIndex((prevIndex) => 
  //       prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
  //     );
  //   }
  // };

  const goToImage = (index: number) => {
    if (!isTransitioning && index !== currentImageIndex) {
      setIsTransitioning(true);
      setCurrentImageIndex(index);
    }
  };

  // Touch handlers for swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < carouselImages.length - 1) {
      nextImage();
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setIsTransitioning(true);
      setCurrentImageIndex((prevIndex) => prevIndex - 1);
    }
  };

  // Reset transition state after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentImageIndex]);

  // Auto-advance carousel continuously and pause on hover
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!isPaused) {
      interval = setInterval(() => {
        nextImage();
      }, 2000); // Autoplay every 1 second
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, currentImageIndex, nextImage]);

  return (
    <div className="p-5 xl:p-20">
      <div
        ref={ref}
        className="pt-14 flex flex-col md:flex-row lg:px-16 xl:px-20 justify-center md:justify-center md:items-start items-center gap-7 xl:gap-0 text-center"
      >
        <div className="w-full max-w-[22rem] sm:max-w-[28rem] md:max-w-none md:w-fit lg:w-full flex flex-col items-center md:items-start gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 text-center md:text-left">
          <h1 className="font-gentium text-3xl sm:text-4xl md:text-[36px] lg:text-[42px] xl:text-[50px] 2xl:text-[56px] leading-[1.1] sm:leading-[1.1] md:leading-[1.1] lg:leading-[1.1] xl:leading-[1.1] tracking-tight">
            Making You a <br /> More Confident <br />
            <span className={`text-primary font-[700] ${!showModal && 'animate-pulse'}`}>YOU.</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-relaxed sm:leading-relaxed md:leading-relaxed lg:leading-relaxed max-w-[90%] sm:max-w-[85%] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px] font-urbanist text-gray-700 md:text-gray-800">
            Our luxurious lipgloss range offers vibrant, long-lasting colors
            that glide on effortlessly, providing rich pigmentation and a satin
            finish. Elevate your beauty routine with a pop of color that speaks
            to your unique style. Because your lips deserve the best.
          </p>
          <div className="w-full sm:w-auto mt-2 sm:mt-0">
            <CtaButton title="Shop Now" />
          </div>
        </div>
        
        {/* Carousel Container */}
        <div 
          className="w-full md:w-fit lg:w-full relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{ maxWidth: '100%', overflow: 'hidden' }}
        >
          {/* Carousel */}
          <div 
            className="overflow-hidden rounded-3xl shadow-sm relative w-full h-[400px] md:h-[500px] xl:h-[600px]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ position: 'relative', width: '100%' }}
          >
            <div 
              className="flex h-full"
              style={{ 
                transform: `translateX(-${currentImageIndex * 100}%)`,
                transition: 'transform 500ms ease-in-out',
                willChange: 'transform',
                width: '100%'
              }}
            >
              {carouselImages.map((image) => (
                <div 
                  key={image.id} 
                  className="flex-shrink-0 h-full flex items-center justify-center bg-gray-100"
                  style={{ 
                    width: '100%',
                    minWidth: '100%',
                    maxWidth: '100%'
                  }}
                >
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="object-cover pointer-events-none select-none"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                    loading="lazy"
                    draggable={false}
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
            
            {/* Navigation Arrows
            <button 
              onClick={prevImage} 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/70 rounded-full p-2 text-primary transition-colors duration-300"
              disabled={isTransitioning}
            >
              <IoIosArrowBack size={24} />
            </button>
            
            <button 
              onClick={nextImage} 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/70 rounded-full p-2 text-primary transition-colors duration-300"
              disabled={isTransitioning}
            >
              <IoIosArrowForward size={24} />
            </button> */}
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {carouselImages.map((_, index) => (
              <button 
                key={index} 
                onClick={() => goToImage(index)}
                className="focus:outline-none"
              >
                {index === currentImageIndex ? (
                  <MdCircle className="text-primary" size={16} />
                ) : (
                  <MdOutlineCircle className="text-gray-400" size={16} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <SectionDivider />
    </div>
  );
});

export default Hero;