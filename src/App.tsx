import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./Products";
import Review from "./components/Review";
import About from "./components/About";
import { useRef } from "react";

const App =  () => {
  const productsRef = useRef(null);
  const reviewRef = useRef(null);
  const aboutRef = useRef(null);
  const homeRef = useRef(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    console.log('clicked')
  };

  return (
    <div>
      <Header
        onScrollToProducts={() => scrollToSection(productsRef)}
        onScrollToReview={() => scrollToSection(reviewRef)}
        onScrollToAbout={() => scrollToSection(aboutRef)}
        onScrollToHome={() => scrollToSection(homeRef)}
      />
      <Hero ref={homeRef}/>
      <Products ref={productsRef} />
      <Review ref={reviewRef} />
      <About ref={aboutRef} />
    </div>
  );
};

export default App;
