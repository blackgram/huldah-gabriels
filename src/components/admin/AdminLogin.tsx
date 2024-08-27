import { useNavigate } from "react-router-dom";
import logo from "../../assets/logoHG.png";
import { useState } from "react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loginTrue, setLoginTrue] = useState(false);

  const handleLogin = () => {
    setLoginTrue(true);
    navigate("/admin-dashboard");
  };

  return (
    <div className="font-urbanist min-h-screen w-full bg-nb1 flex items-center justify-center">
      <div
        className={`fixed z-10 right-0 min-h-screen transform transition-transform duration-300 ease-in-out   bg-nb2 ${
          loginTrue ? "w-0" : "w-[50%]"
        } `}
      />
      <div
        className={`bg-nb1 z-20 w-[80%] h-[25rem] rounded-3xl rounded-br-[150px] rounded-tr-[150px] shadow-lg flex flex-col items-center justify-center p-10 gap-10 transform transition-transform duration-300 ease-in-out ${
          loginTrue ? "opacity-0" : " opacity-100 "
        }`}
      >
        <div className="h-[4rem]">
          <img src={logo} alt="logo" className="w-fit h-full" />
        </div>
        <form
          action=""
          className="flex flex-col items-center justify-center gap-4 text-lg"
        >
          <div>
            {/* <label htmlFor="username">Username</label> */}
            <input
              type="text"
              name=""
              id=""
              placeholder="username"
              className="w-full bg-nb1 rounded border border-primary/70 py-1 px-3
                "
            />
          </div>
          <div>
            {/* <label htmlFor="username">Password</label> */}
            <input
              type="password"
              name=""
              id=""
              placeholder="password"
              className="w-full bg-nb1 rounded border border-primary/70 py-1 px-3
                "
            />
          </div>
          <button
            onClick={() => handleLogin()}
            className="bg-primary text-white  w-1/2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
