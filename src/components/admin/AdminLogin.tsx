/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logoHG.png";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { loginUser } from "../../services/authService";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loginTrue, setLoginTrue] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Get auth state from Redux
  const { isLoading, error, user } = useSelector((state: RootState) => state.data.user);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLoginTrue(true);
      setTimeout(() => {
        navigate("/admin");
      }, 300);
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      // This validation can now be handled by the loginUser function
      return;
    }
    
    // Login through our Redux-connected service
    const success = await loginUser(email, password);
    
    if (success) {
      setLoginTrue(true);
    }
  };

  return (
    <div className="font-urbanist min-h-screen w-full bg-nb1 flex items-center justify-center">
      <div
        className={`fixed z-10 right-0 min-h-screen transform transition-transform duration-300 ease-in-out bg-primary ${
          loginTrue ? "w-0" : "w-[50%]"
        } `}
      />
      <div
        className={`bg-nb1 z-20 w-[80%] h-[25rem] rounded-3xl rounded-br-[150px] rounded-tr-[150px] shadow-lg flex flex-col items-center justify-center p-10 gap-10 transform transition-transform duration-300 ease-in-out ${
          loginTrue ? "opacity-0" : " opacity-100 "
        }`}
      >
        <div className="h-[4rem]">
          <img src={logo} alt="logo" className="w-24 h-full" />
        </div>
        {error && (
          <div className="text-red-500 text-sm -mt-4">{error}</div>
        )}
        <form
          onSubmit={handleLogin}
          className="flex flex-col items-center justify-center gap-4 text-lg"
        >
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full bg-nb1 rounded border border-primary/70 py-1 px-3"
              disabled={isLoading}
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-nb1 rounded border border-primary/70 py-1 px-3"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`bg-primary text-white w-1/2 py-2 rounded ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;