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
    <div className="fixed w-full top-0 left-0 p-3 shadow-md lg:px-4 xl:px-14 flex items-center justify-between text-white font-urbanist bg-white z-50 transition-all ease-in-out duration-500">
      <div className=" cursor-pointer " onClick={() => navigate("/")}>
        <img src={logo} className=" w-20 lg:w-12 xl:w-16" />
      </div>
      <div className="hidden lg:flex justify-evenly xl:gap-5 bg-primary rounded-b-2xl text-[10px] sm:text-[12px] xl:text-[20px] px-4 border-b-primary border-b border-t border-t-primary">
        <div
          className={`p-2 xl:p-3 cursor-pointer ${
            activeMenu === "home" && "font-bold "
          }`}
          onClick={onScrollToHome}
        >
          Home
        </div>
        <div
          className={`p-2 xl:p-3 cursor-pointer ${
            activeMenu === "products" && "font-bold  "
          }`}
          onClick={onScrollToProducts}
        >
          Products
        </div>
        <div
          className={`p-2 xl:p-3 cursor-pointer ${
            activeMenu === "review" && "font-bold  "
          }`}
          onClick={onScrollToReview}
        >
          Review
        </div>
        <div
          className={`p-2 xl:p-3 cursor-pointer ${
            activeMenu === "about" && "font-bold  "
          }`}
          onClick={onScrollToAbout}
        >
          About Us
        </div>
      </div>

      <div className="flex gap-2 items-center justify-center">
        <div
          onClick={() => handleCart()}
          className="relative border-b border-r border-l border-primary rounded-b-lg cursor-pointer lg:flex lg:text-black lg:items-center lg:justify-center lg:px-5"
        >
          {showCart ? (
            <IoClose className="text-[35px] text-primary" />
          ) : (
            <div className="relative lg:flex lg:text-black lg:items-center lg:justify-center lg:px-5">
              <img src={cart} className="p-2 w-10 xl:w-14" />
              <div className="hidden lg:flex">Checkout</div>
              <div className="absolute top-0 right-0.5 bg-red-600 text-[8px] rounded-full p-1">
                {cartTotal}
              </div>
            </div>
          )}
        </div>
        <div
          className="text-primary text-5xl lg:hidden"
          onClick={() => handleSmallMenu()}
        >
          {showSmallMenu ? <IoClose /> : <GiHamburgerMenu />}
        </div>
      </div>
    </div>
  );
};

export default Header;
