import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { setShowModal } from "../Redux/features/checkoutSlice";
import { IoClose } from "react-icons/io5";

const CheckoutModal = () => {
  const dispatch = useDispatch();
  const showModal = useSelector(
    (state: RootState) => state.data.checkout.showModal
  );
  const orderTotal = useSelector((state: RootState) => state.data.checkout.orderTotalAmount)

  return (
    <div className={`min-w-full min-h-full ${showModal && 'z-50 fixed'} font-urbanist flex items-center justify-center`}>
      <div
        className={`${
          showModal
            ? "fixed top-0 left-0 w-full h-screen bg-black/50"
            : "hidden"
        }`}
      />

      <div
        className={`fixed  flex flex-col w-[80%] max-h-[80%] z-50  p-5 bg-white rounded-3xl shadow-lg transform transition-transform duration-1000 ease-in-out ${
          !showModal ? "scale-0.5 hidden" : "scale-1"
        }`}
      >
        <div
          className="w-full flex justify-end py-2 text-3xl text-primary"
          onClick={() => dispatch(setShowModal(false))}
        >
          <IoClose />
        </div>
        <div className="overflow-y-scroll flex flex-col gap-5">
          <div className=" w-full flex flex-col gap-4 ">
            <div className="text-primary text-lg font-semibold">
              Delivery Details
            </div>
            <form className="flex flex-col gap-2 p-2">
              <div>
                <label htmlFor="firstName">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="p-2 rounded-xl w-full bg-slate-200"
                />
              </div>
              <div>
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  name="email"
                  className="p-2 rounded-xl w-full bg-slate-200"
                />
              </div>
              <div>
                <label htmlFor="mobile">Mobile number</label>
                <input
                  type="text"
                  name="mobile"
                  className="p-2 rounded-xl w-full bg-slate-200"
                />
              </div>
              <div>
                <label htmlFor="address">Address</label>
                <textarea
                  rows={2}
                  name="address"
                  className="p-2 rounded-xl w-full bg-slate-200"
                />
              </div>
              <p className="text-[10px] italic">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos
                veritatis assumenda quidem aut nam nobis.
              </p>
            </form>
          </div>

          <div className="w-full min-h-[1px] bg-primary/50" />

          <div className=" w-full flex flex-col gap-4 ">
            <div className="text-primary text-lg font-semibold">
              Payment Details
            </div>
            <div className="border-[1px] rounded-2xl p-4 border-black/70 flex flex-col gap-5">
              <div className="font-bold flex justify-between">
                <div>Order Total:</div>
                <div>{`$ ${orderTotal.toFixed(2)}`}</div>
              </div>
              <div className="w-full">
                <p className="italic text-sm">select a payment method</p>
                <select className="w-full bg-slate-100 p-3">
                  <option value="">Pay with Stripe (card)</option>
                  <option value="">Paypal</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
