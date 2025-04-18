import CtaButton from "../CtaButton";
import hg1 from "../../assets/hg1.png";
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
    { id: 1, src: hg1, alt: "Lipgloss product 1" },
    // Uncomment and replace with your actual images
    // { id: 2, src: hg2, alt: "Lipgloss product 2" },
    // { id: 3, src: hg3, alt: "Lipgloss product 3" },
    // { id: 4, src: hg4, alt: "Lipgloss product 4" },
    
    // For demonstration purposes, using the same image
    { id: 2, src: hg1, alt: "Lipgloss product 2" },
    { id: 3, src: hg1, alt: "Lipgloss product 3" }
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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
        <div className="max-w-[20rem] md:max-w-none flex flex-col items-center md:items-start gap-4 md:w-fit lg:w-full md:text-left">
          <h1 className="font-gentium text-4xl lg:text-[40px] xl:text-[50px] ">
            Making You a <br /> More Confident <br />{" "}
            <span className={`text-primary font-[700] ${!showModal && 'animate-pulse'}`}>YOU.</span>
          </h1>
          <p className="text-[12px] lg:text-base xl:text-2xl leading-[14px] max-w-[280px] lg:max-w-[90%] font-urbanist">
            Our luxurious lipgloss range offers vibrant, long-lasting colors
            that glide on effortlessly, providing rich pigmentation and a satin
            finish. Elevate your beauty routine with a pop of color that speaks
            to your unique style. Because your lips deserve the best.
          </p>
          <CtaButton title="Shop Now" />
        </div>
        
        {/* Carousel Container */}
        <div 
          className="w-full md:w-fit lg:w-full relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel */}
          <div className="overflow-hidden rounded-3xl shadow-sm relative">
            <div 
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {carouselImages.map((image) => (
                <div key={image.id} className="min-w-full flex-shrink-0">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="w-full object-cover"
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