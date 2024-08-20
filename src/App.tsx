import Header from "./components/Header";
import { useEffect, useRef, useState } from "react";
import { AppDispatch } from "./Redux/store";
import { useDispatch } from "react-redux";
import { setActiveMenu } from "./Redux/features/activeMenuSlice";
import useInView from "./components/useInView";
import Home from "./components/Home/Home";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Shop from "./components/shop/Shop";
import Cart from "./components/Cart";
import { ScaleLoader } from "react-spinners";
import SmallMenu from "./components/SmallMenu";

const App = () => {
  const productsRef = useRef(null);
  const reviewRef = useRef(null);
  const aboutRef = useRef(null);
  const homeRef = useRef(null);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === "/shop") {
      const handleStartLoading = () => {
        setIsLoading(true);
      };

      const handleEndLoading = () => {
        setIsLoading(false);
      };

      handleStartLoading();

      const timer = setTimeout(handleEndLoading, 1500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [location.pathname]);
  const inView = useInView([homeRef, productsRef, reviewRef, aboutRef], 0.3);

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
    if (currentPath !== "/") {
      navigate("/");
      ref.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <Header
        onScrollToProducts={() => scrollToSection(productsRef)}
        onScrollToReview={() => scrollToSection(reviewRef)}
        onScrollToAbout={() => scrollToSection(aboutRef)}
        onScrollToHome={() => scrollToSection(homeRef)}
      />
      <Cart />
      <SmallMenu
        onScrollToProducts={() => scrollToSection(productsRef)}
        onScrollToReview={() => scrollToSection(reviewRef)}
        onScrollToAbout={() => scrollToSection(aboutRef)}
        onScrollToHome={() => scrollToSection(homeRef)}
      />

      {isLoading ? (
        <div className="w-full min-h-screen flex items-center justify-center text-primary">
          <ScaleLoader color="#946A2E" />
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <Home
                homeRef={homeRef}
                productsRef={productsRef}
                reviewRef={reviewRef}
                aboutRef={aboutRef}
              />
            }
          />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      )}
    </div>
  );
};

export default App;
