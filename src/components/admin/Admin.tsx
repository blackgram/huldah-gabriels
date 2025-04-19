import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { IoClose } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { setNavMenu } from "../../Redux/features/smallMenuSlice";
import SmallNav from "./SmallNav";
import Nav from "./Nav";
import adminPic from "../../assets/admin.png";
import notificationIcon from "../../assets/notificationIcon.svg";
import summaryIcon from "../../assets/summaryIcon.svg";
import AdminDashboard from "./AdminDashboard";
import AdminWaitlist from "./AdminWaitList";
import AdminOrders from "./AdminOrders";
import AdminManagement from "./AdminManagement"; // Import the new component
import { useAuth } from "../../Hooks/useAuth";
import { ScaleLoader } from "react-spinners";

const Admin = () => {
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState("overview");
  const { user, isLoading, isAdmin, isSuperAdmin } = useAuth();

  const showNavMenu = useSelector(
    (state: RootState) => state.data.smallMenu.navMenu
  );

  const handleSmallMenu = () => {
    dispatch(setNavMenu(!showNavMenu));
  };

  // Function to update active view - pass this to Nav components
  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  // Render different admin content based on active view
  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <AdminDashboard />;
      case "summary":
        return <AdminOrders />;
      case "waitlist":
        return <AdminWaitlist />;
      case "adminManagement":
        return <AdminManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  // Get the title for the current view
  const getViewTitle = () => {
    switch (activeView) {
      case "overview":
        return "Dashboard";
      case "summary":
        return "Order Summary";
      case "waitlist":
        return "Waitlist Manager";
      case "adminManagement":
        return "Admin Management";
      default:
        return "Dashboard";
    }
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ScaleLoader color="#946A2E" />
      </div>
    );
  }

  // Redirect if not an admin
  if (!isAdmin) {
    // This should be handled at a higher level, but included for completeness
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen font-urbanist max-w-full text-black bg-nb1 cursor-default flex">
      <SmallNav 
        activeView={activeView} 
        onViewChange={handleViewChange} 
        isSuperAdmin={isSuperAdmin}
      />
      <div className="hidden lg:block w-[15%]">
        <div className="fixed">

        <Nav 
          activeView={activeView} 
          onViewChange={handleViewChange} 
          isSuperAdmin={isSuperAdmin}
        />
        </div>
      </div>
      <div className="w-full flex flex-col px-6 py-10 lg:ml-[20%] xl:ml-0 ">
        <div className="w-full lg:w-auto flex flex-col-reverse lg:flex-row items-center gap-6 mb-6 lg:max-w-[90%] xl:max-w-[100%]">
          <div className="w-full lg:w-[70%] flex justify-between items-center">
            <div className="text-xl font-[600]">{getViewTitle()}</div>
            <input
              type="search"
              placeholder="search"
              className="bg-white rounded-lg p-1 px-3 w-[60%] focus:bg-primary/5"
            />
          </div>
          <div className="flex w-full lg:flex-row-reverse justify-between items-center lg:w-[30%]">
            <div className="flex gap-3 items-center">
              <img src={adminPic} className="h-12 lg:h-10 xl:h-12" alt="Admin" />
              <div>
                <div className="text-lg lg:text-sm xl:text-lg font-semibold">{user?.name || user?.email || "Admin User"}</div>
                <div className="text-sm lg:text-xs xl:text-sm text-[#5F5E5E]">{user?.role || "Admin"}</div>
              </div>
            </div>
            <div className="flex justify-evenly gap-2 lg:gap-5">
              <img src={summaryIcon} className="h-5 cursor-pointer" alt="Summary" />
              <img src={notificationIcon} className="h-5 cursor-pointer" alt="Notifications" />
            </div>
            <div
              className="text-nb2 text-5xl lg:hidden"
              onClick={() => handleSmallMenu()}
            >
              {showNavMenu ? <IoClose /> : <GiHamburgerMenu />}
            </div>
          </div>
        </div>
        
        {/* Content Area - renders based on active view */}
        <div className="flex-1 lg:flex-auto xl:flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;