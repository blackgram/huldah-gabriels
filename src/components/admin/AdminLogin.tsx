/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logoHG.png";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../Redux/store";
import { loginUser } from "../../services/authService";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { ScaleLoader } from "react-spinners";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get auth state from Redux
  const { isLoading, error, user } = useSelector((state: RootState) => state.data.user);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle input changes with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value && value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validation
    let hasError = false;
    
    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);
    
    // Login through our Redux-connected service
    const success = await loginUser(email, password);
    
    if (!success) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-urbanist min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-primary/5 flex items-center justify-center p-4">
      {/* Back to Site Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary bg-white/80 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-white group"
      >
        <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Site</span>
      </Link>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white backdrop-blur-sm rounded-full p-4">
                <img src={logo} alt="Huldah Gabriels Logo" className="w-16 h-16 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
            <p className="text-white/90 text-sm">Sign in to manage your store</p>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fadeIn">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => {
                      if (email && !validateEmail(email)) {
                        setEmailError("Please enter a valid email address");
                      }
                    }}
                    placeholder="admin@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      emailError || error
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-primary"
                    } bg-gray-50 focus:bg-white`}
                    disabled={isLoading || isSubmitting}
                    autoComplete="email"
                  />
                </div>
                {emailError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      passwordError || error
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-primary"
                    } bg-gray-50 focus:bg-white`}
                    disabled={isLoading || isSubmitting}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  isLoading || isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <ScaleLoader color="#ffffff" height={20} width={3} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-xs text-gray-500">
                Secure admin access only. Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
