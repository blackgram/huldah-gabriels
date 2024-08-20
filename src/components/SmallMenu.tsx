import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Redux/store";
import { setShowSmallMenu } from "../Redux/features/smallMenuSlice";
import React from "react";

interface MenuProps {
  onScrollToHome?: () => void;
  onScrollToProducts?: () => void;
  onScrollToReview?: () => void;
  onScrollToAbout?: () => void;
}

const SmallMenu: React.FC<MenuProps> = ({
    onScrollToProducts,
    onScrollToAbout,
    onScrollToReview,
    onScrollToHome,
  }) => {
  const dispatch: AppDispatch = useDispatch();
  const showSmallMenu = useSelector(
    (state: RootState) => state.data.smallMenu.showSmallMenu
  );

  return (
    <div className="min-w-full min-h-full font-urbanist">
      <div
        onClick={() => dispatch(setShowSmallMenu(false))}
        className={`${
          showSmallMenu
            ? "fixed top-0 left-0 w-full h-screen bg-black/50"
            : "hidden"
        }`}
      />
      <div
        className={`fixed top-0 right-0 z-40 h-[40vh] rounded-xl max-h-[100vh] overflow-y-scroll w-[40%] p-5 pt-24  bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          showSmallMenu ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="w-full flex flex-col gap-4">
          <div className="shadow-sm" onClick={onScrollToHome}>Home</div>
          <div className="shadow-sm" onClick={onScrollToProducts}>Products</div>
          <div className="shadow-sm" onClick={onScrollToReview}>Reviews</div>
          <div className="shadow-sm" onClick={onScrollToAbout}>About</div>
        </div>
      </div>
    </div>
  );
};

export default SmallMenu;
