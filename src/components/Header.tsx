import logo from "../assets/logoHG.png";
import cart from "../assets/cart.svg";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Redux/store";
import { useNavigate } from "react-router-dom";
import { setShowCart } from "../Redux/features/cartSlice";
import { IoClose } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { setShowSmallMenu } from "../Redux/features/smallMenuSlice";

interface HeaderProps {
  onScrollToHome?: () => void;
  onScrollToProducts?: () => void;
  onScrollToReview?: () => void;
  onScrollToAbout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onScrollToProducts,
  onScrollToAbout,
  onScrollToReview,
  onScrollToHome,
}) => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const activeMenu = useSelector(
    (state: RootState) => state.data.activeMenu.active
  );
  const cartTotal = useSelector(
    (state: RootState) => state.data.cart.cartTotal
  );
  const showCart = useSelector((state: RootState) => state.data.cart.showCart);
  const showSmallMenu = useSelector(
    (state: RootState) => state.data.smallMenu.showSmallMenu
  );

  const handleSmallMenu = () => {
    if (showCart) {dispatch(setShowCart(false))}
    dispatch(setShowSmallMenu(!showSmallMenu));
  };
  
  const handleCart = () => {
    if (showSmallMenu) {dispatch(setShowSmallMenu(false))}
    dispatch(setShowCart(!showCart));
  };

  return (
    <header className="fixed w-full top-0 left-0 p-3 shadow-md lg:px-4 xl:px-14 flex items-center justify-between text-white font-urbanist bg-white z-50 transition-all ease-in-out duration-500">
      {/* Logo - Fixed width container */}
      <div className="cursor-pointer h-12 w-20 lg:w-20 flex items-center" onClick={() => navigate("/")}>
        <img src={logo} className="max-h-full max-w-full object-contain" alt="Logo" />
      </div>
      
      {/* Navigation - Desktop */}
      <nav className="hidden lg:flex justify-evenly xl:gap-5 bg-primary rounded-b-2xl text-[12px] xl:text-[20px] px-4 border-b-primary border-b border-t border-t-primary">
        <NavItem 
          active={activeMenu === "home"} 
          onClick={onScrollToHome}
          label="Home"
        />
        <NavItem 
          active={activeMenu === "products"} 
          onClick={onScrollToProducts}
          label="Products"
        />
        <NavItem 
          active={activeMenu === "review"} 
          onClick={onScrollToReview}
          label="Review"
        />
        <NavItem 
          active={activeMenu === "about"} 
          onClick={onScrollToAbout}
          label="About Us"
        />
      </nav>

      {/* Cart and Menu Controls */}
      <div className="flex gap-2 items-center justify-center">
        {/* Cart Button - Fixed height/width container */}
        <div
          onClick={handleCart}
          className="h-12 relative border-b border-r border-l border-primary rounded-b-lg cursor-pointer flex items-center justify-center"
        >
          <div className="w-12 h-12 lg:w-32 lg:h-12 flex items-center justify-center relative">
            {/* Always render both, use opacity to switch */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showCart ? 'opacity-100' : 'opacity-0'}`}>
              <IoClose className="text-[35px] text-primary" />
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showCart ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex items-center">
                <img src={cart} className="p-2 w-10" alt="Cart" />
                <span className="hidden lg:inline text-black">Checkout</span>
              </div>
              {cartTotal > 0 && (
                <div className="absolute top-0 right-0.5 bg-red-600 min-w-5 h-5 flex items-center justify-center rounded-full text-white text-[8px] lg:text-sm">
                  {cartTotal}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button - Fixed height/width container */}
        <div
          className="h-12 w-12 flex items-center justify-center text-primary text-4xl lg:hidden"
          onClick={handleSmallMenu}
        >
          {/* Always render both, use opacity to switch */}
          <div className={`absolute transition-opacity duration-300 ${showSmallMenu ? 'opacity-100' : 'opacity-0'}`}>
            <IoClose />
          </div>
          <div className={`absolute transition-opacity duration-300 ${showSmallMenu ? 'opacity-0' : 'opacity-100'}`}>
            <GiHamburgerMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

// Nav item component for consistency
const NavItem: React.FC<{
  active: boolean;
  onClick?: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <div
    className={`p-2 xl:p-3 cursor-pointer min-w-16 text-center ${active ? "font-bold" : ""}`}
    onClick={onClick}
  >
    {label}
  </div>
);

export default Header;