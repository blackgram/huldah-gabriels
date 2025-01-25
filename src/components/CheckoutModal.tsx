import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { setShowModal } from "../Redux/features/checkoutSlice";
import { IoClose } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup"; // For form validation schema
import "./customStyles.css";
import stripe from "../assets/stripe.png";
import paypal from "../assets/PayPal.svg";
import paystackIcon from "../assets/paystack.svg";
import { useState } from "react";
import { PaystackButton } from "react-paystack";
import { IoIosArrowDown } from "react-icons/io";
import toast from "react-hot-toast";
import { convertDollarsToNaira } from "../Utils/utils";

const CheckoutModal = () => {
  const dispatch = useDispatch();
  const showModal = useSelector(
    (state: RootState) => state.data.checkout.showModal
  );
  const orderTotal = useSelector(
    (state: RootState) => state.data.checkout.orderTotalAmount
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const publicKey = "pk_test_499ba5424360c364519821294f2d435e27dd920e";

  // Formik setup
  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      mobile: "",
      country: "",
      address: "",
      paymentMethod: "",
      amount: orderTotal,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      mobile: Yup.string().required("Mobile number is required"),
      country: Yup.string().required("Country is required"),
      address: Yup.string().required("Address is required"),
      paymentMethod: Yup.string().required("Please select a payment method"),
    }),
    onSubmit: (values) => {
      // You can handle form submission here, like processing payments
      console.log("Form Submitted:", values);
      resetForm();
      dispatch(setShowModal(false));
    },
  });

  const {
    values,
    handleSubmit,
    handleChange,
    errors,
    touched,
    handleBlur,
    setFieldValue,
    resetForm,
  } = formik;

  const payStackProps = {
    email: values.email,
    amount: convertDollarsToNaira(orderTotal) * 100,
    metadata: {
      name: values.fullName,
      phoneNumber: values.mobile,
      custom_fields: [],
    },
    publicKey: publicKey,
    text: "Pay Now",
    onSuccess: () => {
      console.log("Payment successful");
      toast.success("Payment successful");
    },
    onClose: () => {
      console.log("Payment closed");
      toast.error("Payment closed");
    },
  };

  return (
    <div
      className={`min-w-full min-h-full ${
        showModal && "z-50 fixed"
      } scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 font-urbanist flex items-center justify-center`}
    >
      <div
        className={`${
          showModal
            ? "fixed top-0 left-0 w-full h-screen bg-black/50"
            : "hidden"
        }`}
      />

      <div
        className={`fixed flex flex-col w-[90%] max-h-[80%] scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 z-50 p-2 bg-white rounded-xl shadow-lg transform transition-transform duration-1000 ease-in-out ${
          !showModal ? "scale-0.5 hidden" : "scale-1"
        }`}
      >
        <div
          className="w-full flex justify-end py-2 text-3xl text-primary"
          onClick={() => dispatch(setShowModal(false))}
        >
          <IoClose />
        </div>

        <div className="overflow-y-scroll pb-20 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-primary/50 hover:scrollbar-thumb-primary scrollbar-thumb-rounded-[40px] flex flex-col gap-5 px-5">
          <div className="w-full flex flex-col gap-4">
            <div className="text-primary text-lg font-semibold">
              Delivery Details
            </div>

            <form
              className="flex flex-col lg:flex-row flex-wrap py-2"
              onSubmit={handleSubmit}
            >
              <div className="w-full lg:w-1/2 px-2">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="p-2 rounded-xl w-full bg-slate-200"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.fullName && errors.fullName && (
                  <div className="text-red-500 text-sm">{errors.fullName}</div>
                )}
              </div>

              <div className="w-full lg:w-1/2 px-2">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="p-2 rounded-xl w-full bg-slate-200"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.email && errors.email && (
                  <div className="text-red-500 text-sm">{errors.email}</div>
                )}
              </div>

              <div className="w-full lg:w-1/2 px-2">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  className="p-2 rounded-xl w-full bg-slate-200"
                  value={values.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.mobile && errors.mobile && (
                  <div className="text-red-500 text-sm">{errors.mobile}</div>
                )}
              </div>

              <div className="w-full lg:w-1/2 px-2">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  name="country"
                  className="p-2 rounded-xl w-full bg-slate-200"
                  value={values.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.country && errors.country && (
                  <div className="text-red-500 text-sm">{errors.country}</div>
                )}
              </div>

              <div className="w-full px-2">
                <label htmlFor="address">Address</label>
                <textarea
                  rows={2}
                  name="address"
                  className="p-2 rounded-xl w-full bg-slate-200"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.address && errors.address && (
                  <div className="text-red-500 text-sm">{errors.address}</div>
                )}
              </div>

              <p className="text-[10px] italic px-2">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos
                veritatis assumenda quidem aut nam nobis.
              </p>

              <div className="w-full min-h-[1px] my-10 bg-primary/50" />

              <div className="w-full flex flex-col gap-4">
                <div className="text-primary text-lg font-semibold">
                  Payment Details
                </div>
                <div className="border-[1px] rounded-2xl p-4 border-black/70 flex flex-col gap-5">
                  <div className="font-bold flex justify-between">
                    <div>Order Total:</div>
                    {values.paymentMethod === "paystack" ? (<div>{`₦ ${convertDollarsToNaira(orderTotal).toFixed(2)}`}</div>): (<div>{`$ ${orderTotal.toFixed(2)}`}</div>)}
                    {/* <div>{`$ ${orderTotal.toFixed(2)} / ₦ ${convertDollarsToNaira(orderTotal).toFixed(2)}`}</div> */}

                  </div>
                  <div className="w-full">
                    <p className="italic text-sm">Select a payment method</p>
                    <div className="flex md:flex-row flex-col md:items-end py-2 gap-5">
                      <div>
                        <div className="relative inline-block w-full">
                          <button
                            onClick={() => toggleDropdown()}
                            className="w-56 h-10 rounded-2xl bg-slate-100 p-3 text-left"
                          >
                            {/* Conditional rendering for the payment method */}
                            {values.paymentMethod === "stripe" ? (
                              <div className="flex items-center justify-between">
                                <img
                                  src={stripe}
                                  alt="Stripe"
                                  className="h-5 mr-2"
                                />
                                <IoIosArrowDown />
                              </div>
                            ) : values.paymentMethod === "paypal" ? (
                              <div className="flex items-center justify-between">
                                <img
                                  src={paypal}
                                  alt="PayPal"
                                  className="h-5 mr-2"
                                />
                                <IoIosArrowDown />
                              </div>
                            ) : values.paymentMethod === "paystack" ? (
                              <div className="flex items-center justify-between">
                                <img
                                  src={paystackIcon}
                                  alt="Paystack"
                                  className="h-5 mr-2"
                                />
                                <IoIosArrowDown />
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                Select Payment Method
                                <IoIosArrowDown />
                              </div>
                            )}
                          </button>
                          <div
                            className={` ${
                              isDropdownOpen ? "scale-y-full" : "scale-y-0"
                            } transition-all duration-200 origin-top absolute w-full  rounded-2xl bg-white shadow-lg`}
                          >
                            <div
                              className="cursor-pointer p-3 border-b hover:bg-gray-200 flex justify-center items-center"
                              onClick={() => {
                                setFieldValue("paymentMethod", "");
                                setIsDropdownOpen(false);
                              }}
                            >
                              Select payment method
                            </div>
                            <div
                              className="cursor-pointer p-3 border-b hover:bg-gray-200 flex justify-center items-center"
                              onClick={() => {
                                setFieldValue("paymentMethod", "stripe");
                                setIsDropdownOpen(false);
                              }}
                            >
                              <img
                                src={stripe}
                                alt="Stripe"
                                className="h-5 mr-2"
                              />{" "}
                            </div>
                            <div
                              className="cursor-pointer p-3 hover:bg-gray-200 flex justify-center items-center"
                              onClick={() => {
                                setFieldValue("paymentMethod", "paypal");
                                setIsDropdownOpen(false);
                              }}
                            >
                              <img
                                src={paypal}
                                alt="PayPal"
                                className="h-5 mr-2"
                              />
                            </div>
                            <div
                              className="cursor-pointer p-3 hover:bg-gray-200 flex justify-center items-center"
                              onClick={() => {
                                setFieldValue("paymentMethod", "paystack");
                                setIsDropdownOpen(false);
                              }}
                            >
                              <img
                                src={paystackIcon}
                                alt="PayPal"
                                className="h-5 mr-2"
                              />
                            </div>
                          </div>
                        </div>

                        {touched.paymentMethod && errors.paymentMethod && (
                          <div className="text-red-500 text-xs px-2">
                            {errors.paymentMethod}
                          </div>
                        )}
                      </div>
                      {values.paymentMethod === "paystack" ? (
                        <div onClick={() => handleSubmit()}>
                          <PaystackButton
                          disabled={!!errors.fullName || !!errors.email || !!errors.mobile || !!errors.country || !!errors.address || !!errors.paymentMethod}
                            className="bg-primary/90 text-white p-3 rounded-lg hover:bg-primary"
                            {...payStackProps}
                          />
                        </div>
                      ) : values.paymentMethod === "stripe" ? (
                        <button
                          type="submit"
                          className="bg-primary/90 text-white p-3 rounded-lg hover:bg-primary"
                        >
                          Proceed
                        </button>
                      ) : values.paymentMethod === "paypal" ? (
                        <button
                          type="submit"
                          className="bg-primary/90 text-white p-3 rounded-lg hover:bg-primary"
                        >
                          Proceed
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="bg-primary/90 text-white p-3 rounded-lg hover:bg-primary"
                        >
                          Proceed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
