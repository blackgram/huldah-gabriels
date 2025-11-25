import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { setShowModal } from "../Redux/features/checkoutSlice";
import { IoClose } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup"; // For form validation schema
import "./customStyles.css";
import stripe from "../assets/stripe.png";
import { useState, useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import toast from "react-hot-toast";
import { getProductImageUrl } from "../Utils/imageUtils";
import { getDisplayPrice, isSaleActive, getOriginalPrice } from "../Utils/discountUtils";
import { validateDiscountCode, DiscountCode } from "../services/discountCodeService";

const CheckoutModal = () => {
  const dispatch = useDispatch();
  const showModal = useSelector(
    (state: RootState) => state.data.checkout.showModal
  );
  const orderTotal = useSelector(
    (state: RootState) => state.data.checkout.orderTotalAmount
  );
  const cartItems = useSelector(
    (state: RootState) => state.data.cart.cartItems
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<DiscountCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [discountError, setDiscountError] = useState<string>("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);


  // Handle Stripe Checkout
  const handleStripeCheckout = async (formValues: {
    email: string;
    fullName: string;
    mobile: string;
    address: string;
    country: string;
  }) => {
    try {
      // Prepare order items for Stripe (using discounted prices)
      const orderItems = cartItems.map((item) => ({
        name: item.product.name,
        description: item.product.desc || '',
        price: getDisplayPrice(item.product),
        quantity: item.quantity,
        image: getProductImageUrl(item.product),
      }));

      // Use relative URL - Vite proxy will handle routing in dev, Vercel handles in production
      const apiUrl = '/api/create-stripe-checkout';

      // Create checkout session
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal,
          currency: 'cad',
          customerEmail: formValues.email,
          orderItems: orderItems,
          discountCode: appliedDiscountCode?.code,
          discountAmount: discountAmount,
          metadata: {
            customerName: formValues.fullName,
            customerPhone: formValues.mobile,
            customerAddress: formValues.address,
            customerCountry: formValues.country,
            orderId: `order_${Date.now()}`,
          },
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create checkout session';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Log error for debugging
        console.error('Stripe API Error:', errorMessage);
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const { url } = responseData;
      
      if (!url) {
        throw new Error('No checkout URL received from Stripe');
      }

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  };

  // Calculate order breakdown using discounted prices
  const subtotal = cartItems.reduce(
    (total, item) => {
      const displayPrice = getDisplayPrice(item.product);
      return total + displayPrice * item.quantity;
    },
    0
  );
  const shippingFee = import.meta.env.VITE_SHIPPING_FEE ? parseInt(import.meta.env.VITE_SHIPPING_FEE) : 15;
  // Check if tax is disabled via environment variable
  const isTaxDisabled = import.meta.env.VITE_DISABLE_TAX === 'true';
  const hstRate = isTaxDisabled ? 0 : 0.13;
  const hst = isTaxDisabled ? 0 : (subtotal > 9.9 ? subtotal * hstRate : 0);
  
  // Calculate final total with discount code
  const finalSubtotal = subtotal - discountAmount;
  const finalHst = isTaxDisabled ? 0 : (finalSubtotal > 9.9 ? finalSubtotal * hstRate : 0);
  const finalTotal = Math.max(0, finalSubtotal + shippingFee + finalHst);

  // Common countries list
  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Nigeria",
    "Ghana",
    "South Africa",
    "Kenya",
    "Australia",
    "Germany",
    "France",
    "Other",
  ];

  // Phone number formatter
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  // Handle discount code validation and application
  const handleApplyDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    setIsValidatingCode(true);
    setDiscountError("");

    try {
      const result = await validateDiscountCode(discountCode.trim(), subtotal + shippingFee + hst);
      
      if (result.valid && result.discountCode && result.discountAmount !== undefined) {
        setAppliedDiscountCode(result.discountCode);
        setDiscountAmount(result.discountAmount);
        toast.success(`Discount code "${result.discountCode.code}" applied!`);
      } else {
        setDiscountError(result.error || "Invalid discount code");
        setAppliedDiscountCode(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error("Error validating discount code:", error);
      setDiscountError("Error validating discount code. Please try again.");
      setAppliedDiscountCode(null);
      setDiscountAmount(0);
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Handle removing discount code
  const handleRemoveDiscountCode = () => {
    setDiscountCode("");
    setAppliedDiscountCode(null);
    setDiscountAmount(0);
    setDiscountError("");
    toast.success("Discount code removed");
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      mobile: "",
      country: "",
      address: "",
      paymentMethod: "stripe", // Auto-select Stripe
      amount: orderTotal,
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Full Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      mobile: Yup.string()
        .min(10, "Phone number must be at least 10 digits")
        .required("Mobile number is required"),
      country: Yup.string().required("Country is required"),
      address: Yup.string()
        .min(10, "Address must be at least 10 characters")
        .required("Address is required"),
      paymentMethod: Yup.string().oneOf(["stripe"], "Only Stripe payment is available").required("Payment method is required"),
    }),
    onSubmit: async (values) => {
      setIsProcessing(true);
      try {
        // Handle Stripe payment
        if (values.paymentMethod === "stripe") {
          await handleStripeCheckout(values);
          return;
        }


        // Default: Simulate payment processing for other methods
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Order placed successfully!");
        resetForm();
        dispatch(setShowModal(false));
      } catch (error) {
        console.error("Payment error:", error);
        const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const {
    values,
    handleSubmit,
    handleChange,
    errors,
    touched,
    handleBlur,
    resetForm: formikResetForm,
  } = formik;

  // Enhanced reset form that also clears discount code
  const resetForm = () => {
    formikResetForm();
    setDiscountCode("");
    setAppliedDiscountCode(null);
    setDiscountAmount(0);
    setDiscountError("");
  };


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    formik.setFieldValue("mobile", formatted);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-urbanist">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => dispatch(setShowModal(false))}
      />

      {/* Modal */}
      <div className="relative flex flex-col w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10">
          <h2 className="text-xl md:text-2xl font-bold text-primary">
            Checkout
          </h2>
          <button
            onClick={() => dispatch(setShowModal(false))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-primary text-2xl md:text-3xl"
            aria-label="Close modal"
          >
            <IoClose />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/30 hover:scrollbar-thumb-primary/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Details Section */}
              <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-primary" />
                  Delivery Details
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            touched.fullName && errors.fullName
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-primary"
                          } bg-gray-50 focus:bg-white`}
                          value={values.fullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="John Doe"
                        />
                        {touched.fullName && errors.fullName && (
                          <div className="absolute right-3 top-3">
                            <HiOutlineExclamationCircle className="text-red-500 text-xl" />
                          </div>
                        )}
                      </div>
                      {touched.fullName && errors.fullName && (
                        <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            touched.email && errors.email
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-primary"
                          } bg-gray-50 focus:bg-white`}
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="john@example.com"
                        />
                        {touched.email && errors.email && (
                          <div className="absolute right-3 top-3">
                            <HiOutlineExclamationCircle className="text-red-500 text-xl" />
                          </div>
                        )}
                      </div>
                      {touched.email && errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div>
                      <label
                        htmlFor="mobile"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="mobile"
                          id="mobile"
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none ${
                            touched.mobile && errors.mobile
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-primary"
                          } bg-gray-50 focus:bg-white`}
                          value={values.mobile}
                          onChange={handlePhoneChange}
                          onBlur={handleBlur}
                          placeholder="(123) 456-7890"
                          maxLength={14}
                        />
                        {touched.mobile && errors.mobile && (
                          <div className="absolute right-3 top-3">
                            <HiOutlineExclamationCircle className="text-red-500 text-xl" />
                          </div>
                        )}
                      </div>
                      {touched.mobile && errors.mobile && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Country *
                      </label>
                      <div className="relative">
                        <select
                          name="country"
                          id="country"
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none appearance-none ${
                            touched.country && errors.country
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-primary"
                          } bg-gray-50 focus:bg-white cursor-pointer`}
                          value={values.country}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                        {touched.country && errors.country && (
                          <div className="absolute right-8 top-3">
                            <HiOutlineExclamationCircle className="text-red-500 text-xl" />
                          </div>
                        )}
                      </div>
                      {touched.country && errors.country && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Delivery Address *
                      </label>
                      <div className="relative">
                        <textarea
                          name="address"
                          id="address"
                          rows={3}
                          className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none resize-none ${
                            touched.address && errors.address
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-primary"
                          } bg-gray-50 focus:bg-white`}
                          value={values.address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Street address, apartment, suite, etc."
                        />
                        {touched.address && errors.address && (
                          <div className="absolute right-3 top-3">
                            <HiOutlineExclamationCircle className="text-red-500 text-xl" />
                          </div>
                        )}
                      </div>
                      {touched.address && errors.address && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Payment Details Section */}
              <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-primary" />
                  Payment Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center gap-2">
                      <img src={stripe} alt="Stripe" className="h-5" />
                      <span className="text-sm font-medium">Stripe</span>
                    </div>
                    <input
                      type="hidden"
                      name="paymentMethod"
                      value="stripe"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 md:p-6 border border-primary/20 shadow-sm sticky top-4">
                <h3 className="text-lg md:text-xl font-bold text-primary mb-4">
                  Order Summary
                </h3>

                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0"
                    >
                      <img
                        src={getProductImageUrl(item.product)}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/vite.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                          {isSaleActive(item.product) && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              SALE
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        {isSaleActive(item.product) ? (
                          <div className="mt-1">
                            <p className="text-sm font-semibold text-primary">
                              ${(getDisplayPrice(item.product) * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400 line-through">
                              ${(getOriginalPrice(item.product) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-primary mt-1">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount Code Section */}
                <div className="pt-4 border-t border-gray-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Have a discount code?
                  </label>
                  {!appliedDiscountCode ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase());
                          setDiscountError("");
                        }}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isValidatingCode}
                      />
                      <button
                        type="button"
                        onClick={handleApplyDiscountCode}
                        disabled={isValidatingCode || !discountCode.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isValidatingCode ? "Applying..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-green-800">
                            Code: {appliedDiscountCode.code}
                          </div>
                          <div className="text-xs text-green-600">
                            {appliedDiscountCode.type === "percentage"
                              ? `${appliedDiscountCode.value}% off`
                              : `$${appliedDiscountCode.value.toFixed(2)} off`}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDiscountCode}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {discountError && (
                    <p className="mt-2 text-sm text-red-500">{discountError}</p>
                  )}
                </div>

                {/* Order Breakdown */}
                <div className="space-y-2 pt-4 border-t border-gray-300">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({appliedDiscountCode?.code})</span>
                      <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shippingFee.toFixed(2)}</span>
                  </div>
                  {finalHst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">HST (13%)</span>
                      <span className="font-medium">${finalHst.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span className="text-primary">Total</span>
                    <span className="text-primary">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit();
                    }}
                    disabled={
                      isProcessing ||
                      !!errors.fullName ||
                      !!errors.email ||
                      !!errors.mobile ||
                      !!errors.country ||
                      !!errors.address ||
                      !!errors.paymentMethod ||
                      !values.paymentMethod
                    }
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Redirecting to Stripe...
                      </>
                    ) : (
                      <>
                        <img src={stripe} alt="Stripe" className="h-5" />
                        Pay with Stripe
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Your personal data will be used to process your order and
                  support your experience throughout this website.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
