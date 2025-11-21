import { useNavigate } from "react-router-dom";
import { FiXCircle, FiAlertCircle } from "react-icons/fi";

const CheckoutFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
          <FiXCircle className="text-6xl text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          Your payment was not completed. No charges were made to your account.
        </p>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start space-x-3">
            <FiAlertCircle className="text-yellow-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1">What happened?</p>
              <p>
                You cancelled the payment process or encountered an issue. Your order was not placed,
                and your items remain in your cart.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Return to Cart
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Continue Shopping
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          Need help?{" "}
          <a href="mailto:support@huldahgabriels.com" className="text-primary hover:underline">
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
};

export default CheckoutFailure;

