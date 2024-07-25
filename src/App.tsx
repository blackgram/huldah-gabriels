import Header from "./components/Header";
import Hero from "./components/Hero";
import Products from "./Products";
import Review from "./components/Review";
import About from "./components/About";
import { useEffect, useRef} from "react";
import { AppDispatch } from "./Redux/store";
import { useDispatch } from "react-redux";
import { setActiveMenu } from "./Redux/features/activeMenuSlice";
import useInView from "./components/useInView";

const App = () => {
  const productsRef = useRef(null);
  const reviewRef = useRef(null);
  const aboutRef = useRef(null);
  const homeRef = useRef(null);

  const dispatch: AppDispatch = useDispatch();

  const inView = useInView([homeRef, productsRef, reviewRef, aboutRef], 0.8);

  useEffect(() => {
    inView.forEach((isInView, ref) => {
      if (isInView) {
        if (ref === productsRef) {
          dispatch(setActiveMenu("products"));
        } else if (ref === reviewRef) {
          dispatch(setActiveMenu("review"));
        } else if (ref === aboutRef) {
          dispatch(setActiveMenu("about"));
        } else {
          dispatch(setActiveMenu("home"));
        }
      }
    });
  }, [inView, dispatch]);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div>
      <Header
        onScrollToProducts={() => scrollToSection(productsRef)}
        onScrollToReview={() => scrollToSection(reviewRef)}
        onScrollToAbout={() => scrollToSection(aboutRef)}
        onScrollToHome={() => scrollToSection(homeRef)}
      />
      <Hero ref={homeRef} />
      <Products ref={productsRef} />
      <Review ref={reviewRef} />
      <About ref={aboutRef} />
    </div>
  );
};

export default App;
