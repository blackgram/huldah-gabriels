import { useNavigate } from "react-router-dom";
import CtaButton from "./CtaButton";
import logoHG from "../assets/logoHG.png";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-20 font-urbanist">
      <div className="max-w-2xl w-full text-center flex flex-col gap-8 items-center">
        {/* Logo */}
        <div className="mb-4">
          <img 
            src={logoHG} 
            alt="Huldah Gabriels Logo" 
            className="h-16 w-16 md:h-20 md:w-20 object-contain mx-auto"
            loading="eager"
            width={80}
            height={80}
          />
        </div>

        {/* 404 Text */}
        <div className="font-gentium">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-primary mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-800 mb-4">
            Page Not Found
          </h2>
        </div>

        {/* Description */}
        <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
          Oops! The page you're looking for seems to have wandered off. 
          Don't worry, let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <CtaButton 
            title="Go Home" 
            onClick={() => navigate("/")}
          />
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors duration-300"
          >
            Go Back
          </button>
        </div>

        {/* Additional Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <button
            onClick={() => navigate("/shop")}
            className="hover:text-primary transition-colors"
          >
            Shop
          </button>
          <span>•</span>
          <button
            onClick={() => navigate("/#products")}
            className="hover:text-primary transition-colors"
          >
            Products
          </button>
          <span>•</span>
          <button
            onClick={() => navigate("/#review")}
            className="hover:text-primary transition-colors"
          >
            Reviews
          </button>
          <span>•</span>
          <button
            onClick={() => navigate("/#about")}
            className="hover:text-primary transition-colors"
          >
            About
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

