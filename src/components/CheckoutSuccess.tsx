import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ScaleLoader } from "react-spinners";
import { FiCheckCircle, FiPackage, FiTruck, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import { createOrder } from "../services/orderService";
import { clearCart } from "../Redux/features/cartSlice";

interface OrderDetails {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCountry: string;
  amount: number;
  currency: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentStatus: string;
}

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  const paymentMethod = searchParams.get("payment_method");
  const reference = searchParams.get("reference");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        let data: OrderDetails | null = null;

        // Handle Paystack orders
        if (paymentMethod === "paystack") {
          // Try to get order details from sessionStorage
          const storedOrder = sessionStorage.getItem("paystack_order");
          if (storedOrder) {
            try {
              const parsedOrder = JSON.parse(storedOrder);
              data = {
                sessionId: parsedOrder.transactionReference || reference || `paystack_${Date.now()}`,
                customerName: parsedOrder.customerName,
                customerEmail: parsedOrder.customerEmail,
                customerPhone: parsedOrder.customerPhone,
                customerAddress: parsedOrder.customerAddress,
                customerCountry: parsedOrder.customerCountry,
                amount: parsedOrder.amount,
                currency: parsedOrder.currency || "cad",
                items: parsedOrder.items || [],
                paymentStatus: parsedOrder.paymentStatus || "paid",
              };
              // Clear stored order after retrieving
              sessionStorage.removeItem("paystack_order");
            } catch (parseError) {
              console.error("Error parsing stored Paystack order:", parseError);
            }
          }

          // If no stored order, create a basic one from URL params
          if (!data && reference) {
            data = {
              sessionId: reference,
              customerName: "Customer",
              customerEmail: "",
              customerPhone: "",
              customerAddress: "",
              customerCountry: "",
              amount: 0,
              currency: "cad",
              items: [],
              paymentStatus: "paid",
            };
          }
        }
        // Handle PayPal orders
        else if (paymentMethod === "paypal") {
          // Try to get order details from sessionStorage
          const storedOrder = sessionStorage.getItem("paypal_order");
          if (storedOrder) {
            try {
              const parsedOrder = JSON.parse(storedOrder);
              data = {
                sessionId: parsedOrder.transactionReference || reference || `paypal_${Date.now()}`,
                customerName: parsedOrder.customerName,
                customerEmail: parsedOrder.customerEmail,
                customerPhone: parsedOrder.customerPhone,
                customerAddress: parsedOrder.customerAddress,
                customerCountry: parsedOrder.customerCountry,
                amount: parsedOrder.amount,
                currency: parsedOrder.currency || "cad",
                items: parsedOrder.items || [],
                paymentStatus: parsedOrder.paymentStatus || "paid",
              };
              // Clear stored order after retrieving
              sessionStorage.removeItem("paypal_order");
            } catch (parseError) {
              console.error("Error parsing stored PayPal order:", parseError);
            }
          }

          // If no stored order, create a basic one from URL params
          if (!data && reference) {
            data = {
              sessionId: reference,
              customerName: "Customer",
              customerEmail: "",
              customerPhone: "",
              customerAddress: "",
              customerCountry: "",
              amount: 0,
              currency: "cad",
              items: [],
              paymentStatus: "paid",
            };
          }
        }
        // Handle Stripe orders
        else if (sessionId) {
          const response = await fetch(`/api/get-stripe-session?session_id=${sessionId}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch order details");
          }

          data = await response.json();
        }

        if (!data) {
          setError("No order details found");
          setLoading(false);
          return;
        }

        setOrderDetails(data);
        
        // Save order to Firestore (as backup if not already saved)
        try {
          await createOrder({
            paymentMethod: (paymentMethod as 'stripe' | 'paystack' | 'paypal') || 'stripe',
            transactionReference: data.sessionId || reference || `order_${Date.now()}`,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            customerAddress: data.customerAddress,
            customerCountry: data.customerCountry,
            amount: data.amount,
            currency: data.currency,
            items: data.items,
            paymentStatus: data.paymentStatus === 'paid' ? 'paid' : 'pending',
            orderStatus: 'pending',
          });
          
          // Clear cart after successful order
          dispatch(clearCart());
          // Also clear localStorage
          localStorage.removeItem("cart");
          localStorage.removeItem("cartTotal");
        } catch (orderError) {
          console.error("Failed to save order to Firestore:", orderError);
          // Don't show error to user, order was successful
          // Still clear cart even if order save fails (payment was successful)
          dispatch(clearCart());
          localStorage.removeItem("cart");
          localStorage.removeItem("cartTotal");
        }
        
        // Send confirmation email (if not already sent)
        if (paymentMethod !== "paystack") {
          try {
            await fetch("/api/send-order-confirmation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderDetails: data,
                sessionId: data.sessionId,
              }),
            });
          } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError);
            // Don't show error to user, order was successful
          }
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err instanceof Error ? err.message : "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, paymentMethod, reference]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ScaleLoader color="#946A2E" />
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Order</h1>
          <p className="text-gray-600 mb-6">{error || "Order details not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
            <FiCheckCircle className="text-6xl text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-600">Thank you for your purchase</p>
        </div>

        {/* Delivery Illustration */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                  <FiPackage className="text-3xl text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Order Packed</h3>
                  <p className="text-sm text-gray-500">Your items are being prepared</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                  <FiTruck className="text-3xl text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Out for Delivery</h3>
                  <p className="text-sm text-gray-500">Estimated delivery: 3-5 business days</p>
                </div>
              </div>
            </div>

            {/* Illustration SVG */}
            <div className="flex-1 flex justify-center">
              <svg
                width="300"
                height="200"
                viewBox="0 0 300 200"
                className="w-full max-w-md"
              >
                {/* Truck */}
                <rect x="50" y="120" width="120" height="60" fill="#946A2E" rx="5" />
                <rect x="60" y="100" width="40" height="30" fill="#B8860B" rx="3" />
                <circle cx="80" cy="180" r="15" fill="#333" />
                <circle cx="140" cy="180" r="15" fill="#333" />
                <rect x="70" y="110" width="20" height="15" fill="#fff" />
                
                {/* Package */}
                <rect x="200" y="130" width="60" height="50" fill="#946A2E" rx="3" />
                <line x1="230" y1="130" x2="230" y2="180" stroke="#B8860B" strokeWidth="2" />
                <line x1="200" y1="155" x2="260" y2="155" stroke="#B8860B" strokeWidth="2" />
                
                {/* Road */}
                <line x1="0" y1="195" x2="300" y2="195" stroke="#666" strokeWidth="4" />
                <line x1="0" y1="197" x2="300" y2="197" stroke="#fff" strokeWidth="1" strokeDasharray="5,5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Order ID:</span> {orderDetails.sessionId.substring(0, 20)}...
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="text-green-600 font-semibold capitalize">
                    {orderDetails.paymentStatus}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Total:</span>{" "}
                  <span className="font-bold text-lg">
                    {orderDetails.currency.toUpperCase()} ${orderDetails.amount.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <FiMapPin className="text-primary mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{orderDetails.customerName}</p>
                    <p className="text-gray-600">{orderDetails.customerAddress}</p>
                    <p className="text-gray-600">{orderDetails.customerCountry}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiPhone />
                  <span>{orderDetails.customerPhone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiMail />
                  <span>{orderDetails.customerEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {orderDetails.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-primary">
                {orderDetails.currency.toUpperCase()} ${orderDetails.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Email Confirmation Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <FiMail className="text-blue-600 mt-1" />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                Order confirmation email sent to {orderDetails.customerEmail}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Please check your inbox (and spam folder) for order details and tracking information.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/shop")}
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;

