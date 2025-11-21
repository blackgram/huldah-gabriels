/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from "./components/Header";
import { useEffect, useRef, useState } from "react";
import { AppDispatch } from "./Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setActiveMenu } from "./Redux/features/activeMenuSlice";
import useInView from "./components/useInView";
import Home from "./components/Home/Home";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Shop from "./components/shop/Shop";
import Cart from "./components/Cart";
import { ScaleLoader } from "react-spinners";
import SmallMenu from "./components/SmallMenu";
import { setShowSmallMenu } from "./Redux/features/smallMenuSlice";
import CheckoutModal from "./components/CheckoutModal";
import CheckoutSuccess from "./components/CheckoutSuccess";
import CheckoutFailure from "./components/CheckoutFailure";
import AdminLogin from "./components/admin/AdminLogin";
import Admin from "./components/admin/Admin";
import Waitlist from "./components/WaitList";
import { checkUserSession } from "./services/authService";
import { RootState } from "./Redux/store";

const App = () => {
  // Set this to false for waitlist mode, true for full application
  const SITE_LAUNCHED = true;

  const productsRef = useRef(null);
  const reviewRef = useRef(null);
  const aboutRef = useRef(null);
  const homeRef = useRef(null);

  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  
  // Handle checkout redirects
  const checkoutStatus = searchParams.get("checkout");

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Get user and auth status from Redux
  const { user, isLoading: isUserLoading } = useSelector((state: RootState) => state.data.user);
  const isAdmin = !!user && (user.role === 'admin' || user.role === 'superadmin');

  // Check session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      if (currentPath.includes("admin")) {
        await checkUserSession();
      }
      setIsAuthChecking(false);
    };
    
    initializeAuth();
  }, [currentPath]);

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
      dispatch(setShowSmallMenu(false));
    } else {
      ref.current?.scrollIntoView({ behavior: "smooth" });
      dispatch(setShowSmallMenu(false));
    }
  };

  // Show loading state while checking authentication
  if ((isAuthChecking || isUserLoading) && currentPath.includes("admin")) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-primary">
        <ScaleLoader color="#946A2E" />
      </div>
    );
  }

  // If on admin path and not authenticated, show login
  if (currentPath.includes("admin") && !isAdmin) {
    return <AdminLogin />;
  }

  // If on admin path and authenticated, show admin panel
  if (currentPath.includes("admin") && isAdmin) {
    return <Admin />;
  }

  // If site is not launched, show waitlist with admin access link
  if (!SITE_LAUNCHED) {
    return (
      // <>
      //   <Waitlist />
      //   {/* Hidden link for admin access */}
      //   <div className="fixed bottom-4 right-4 opacity-30 hover:opacity-100 transition-opacity">
      //     <button 
      //       onClick={() => navigate("/admin")}
      //       className="text-xs text-gray-500 p-2"
      //     >
      //       Admin
      //     </button>
      //   </div>
      // </>
      <Routes>
        <Route path="/" element={<Waitlist />} />
        <Route 
          path="/admin" 
          element={<AdminLogin />} 
        />
        <Route path="*" element={<Waitlist />} />
      </Routes>
    );
  }

  // Check if we're on a checkout page (full-page experience)
  const isCheckoutPage = checkoutStatus === "success" || 
                         checkoutStatus === "canceled" || 
                         currentPath === "/checkout/success" || 
                         currentPath === "/checkout/failure";

  // Otherwise, show the regular application
  return (
    <div>
      {!isCheckoutPage && (
        <>
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

          <CheckoutModal />
        </>
      )}

      {isLoading ? (
        <div className="w-full min-h-screen flex items-center justify-center text-primary">
          <ScaleLoader color="#946A2E" />
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              checkoutStatus === "success" ? (
                <CheckoutSuccess />
              ) : checkoutStatus === "canceled" ? (
                <CheckoutFailure />
              ) : (
                <Home
                  homeRef={homeRef}
                  productsRef={productsRef}
                  reviewRef={reviewRef}
                  aboutRef={aboutRef}
                />
              )
            }
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/failure" element={<CheckoutFailure />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
};

export default App;