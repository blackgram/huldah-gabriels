import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../Redux/store";

import adminPic from "../../assets/admin.png";
import logout from "../../assets/logout.png";
import summaryIcon from "../../assets/summaryWhite.png";
import dashIcon from "../../assets/dash-icon.png";
import { useState } from "react";
import { setNavMenu } from "../../Redux/features/smallMenuSlice";

const SmallNav = () => {
    const dispatch: AppDispatch = useDispatch();

    
  const showNavMenu = useSelector(
    (state: RootState) => state.data.smallMenu.navMenu
  );

  const [activeMenu, setActiveMenu] = useState("overview");

  const handleMenuChange = (menu: "overview" | "summary") => {
    setActiveMenu(menu);
    // dispatch(setNavMenu(false))

  }

  return (
    <div className="">
        <div
        onClick={() => dispatch(setNavMenu(false))}
        className={`${
          showNavMenu ? "fixed top-0 left-0 w-full h-screen bg-black/20" : "hidden"
        }`}
      />
      <div
        className={`fixed top-0 left-0 w-[50%] h-screen bg-black/50 transform transition-transform duration-300 ease-in-out ${
          showNavMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="min-h-screen cursor-default w-full text-white bg-nb2 flex flex-col justify-between text-center py-12">
          <div className="flex flex-col gap-16">
            <div className="text-xl font-bold">Huldah Gabriels</div>
            <div className="flex flex-col justify-center gap-7 items-start text-left">
              <div
                onClick={() => handleMenuChange("overview")}
                className={`   flex  w-full py-2 gap-2 font-semibold px-6 relative  rounded-r-md ${
                  activeMenu !== "overview"
                    ? "hover:text-slate-200 hover:shadow-sm hover:shadow-white cursor-pointer"
                    : " cursor-default"
                }`}
              >
                <div
                  className={`bg-nb3 w-[115%] rounded-r-full h-full absolute left-0 top-0 z-0 flex items-center justify-end px-4 border-y border-nb1 transform transition-transform duration-300 ease-in-out ${
                    showNavMenu && activeMenu == "overview"
                      ? "translate-x-0"
                      : "-translate-x-full"
                  }`}
                >
                  <div
                    className={`bg-nb1 w-3 h-3 rounded-full transform transition-transform duration-100 ease-in-out ${
                      activeMenu == "overview" ? "scale-100" : "scale-0"
                    }`}
                  />
                </div>
                <img src={dashIcon} alt="Overview" className="z-10" />
                <div className="z-10">Overview</div>
              </div>
              <div
                onClick={() => handleMenuChange("summary")}
                className={` relative  flex w-full py-2 gap-2 font-semibold px-6 border-white rounded-r-md ${
                  activeMenu !== "summary"
                    ? "hover:text-slate-200 hover:shadow-sm hover:shadow-white cursor-pointer"
                    : " cursor-default"
                }`}
              >
                <div
                  className={`bg-nb3 w-[115%] rounded-r-full h-full absolute left-0 top-0 z-0 flex items-center justify-end px-4 border-y border-nb1 transform transition-transform duration-300 ease-in-out ${
                    showNavMenu && activeMenu == "summary"
                      ? "translate-x-0"
                      : "-translate-x-full"
                  }`}
                >
                  <div
                    className={`bg-nb1 w-3 h-3 flex items-center rounded-full transform transition-transform duration-100 ease-in-out ${
                      activeMenu == "summary" ? "scale-100" : "scale-0"
                    }`}
                  />
                </div>
                <img
                  src={summaryIcon}
                  className="text-white z-10 h-fit w-fit"
                  alt="summary"
                />
                <div className="z-10">Order Summary</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-3 items-center cursor-default">
              <img src={adminPic} className="h-12" />
              <div>
                {/* <div className="text-base font-semibold">Huldah Gabriels</div> */}
                <div className="text-sm text-white">Admin</div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full justify-center items-center cursor-pointer hover:text-red-600">
              <img src={logout} alt="logout" />
              <div>Log Out</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmallNav;
