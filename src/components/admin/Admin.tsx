import Nav from "./Nav";
import adminPic from "../../assets/admin.png";
import notificationIcon from "../../assets/notificationIcon.svg";
import summaryIcon from "../../assets/summaryIcon.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { IoClose } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import { setNavMenu} from "../../Redux/features/smallMenuSlice";
import SmallNav from "./SmallNav";

const Admin = () => {
  
    const dispatch = useDispatch()

    const showNavMenu = useSelector(
    (state: RootState) => state.data.smallMenu.navMenu
  );

  const handleSmallMenu = () => {
    dispatch(setNavMenu(!showNavMenu));

  };

  return (
    <div className="min-h-screen font-urbanist max-w-full text-black bg-nb1 cursor-default  flex">
        <SmallNav />
      <div className="hidden lg:block w-[15%]">
        <Nav />
      </div>
      <div className="w-full flex flex-col px-6 py-10">
        <div className=" w-full lg:w-auto flex flex-col-reverse lg:flex-row items-center gap-6">
          <div className="w-full lg:w-70%] flex justify-between items-center ">
            <div className="text-xl font-[600]">Dashboard</div>
            <input
              type="search"
              placeholder="search"
              className="bg-white rounded-lg p-1 px-3 w-[60%] focus:bg-primary/5"
            />
          </div>
          <div className="flex w-full lg:flex-row-reverse justify-between items-center lg:w-[30%]">
            <div className="flex gap-3 items-center">
              <img src={adminPic} className="h-12" />
              <div>
                <div className="text-lg font-semibold">Huldah Gabriels</div>
                <div className="text-sm text-[#5F5E5E]">Admin</div>
              </div>
            </div>
            <div className="flex justify-evenly gap-2 lg:gap-5">
              <img src={summaryIcon} className="h-5 cursor-pointer" />
              <img src={notificationIcon} className="h-5 cursor-pointer" />
            </div>
            <div
              className="text-nb2 text-5xl lg:hidden"
              onClick={() => handleSmallMenu()}
            >
              {showNavMenu ? <IoClose /> : <GiHamburgerMenu />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
