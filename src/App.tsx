import Header from "./components/Header";
import { useEffect, useRef } from "react";
import { AppDispatch, RootState } from "./Redux/store";
import { useDispatch } from "react-redux";
import { setActiveMenu } from "./Redux/features/activeMenuSlice";
import useInView from "./components/useInView";
import Home from "./components/Home/Home";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Shop from "./components/shop/Shop";
import Cart from "./components/Cart";
import { useSelector } from "react-redux";

const App = () => {
  const productsRef = useRef(null);
  const reviewRef = useRef(null);
  const aboutRef = useRef(null);
  const homeRef = useRef(null);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const showCart = useSelector((state: RootState) => state.data.cart.showCart);


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
    if (currentPath !== "/" || "") {
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

      {/* {showCart && <Cart /> }   */}
      <Cart />

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
    </div>
  );
};

export default App;
