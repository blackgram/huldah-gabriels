import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Redux/store";
import { setShowCart } from "../Redux/features/cartSlice";
import bin from ".././assets/bin.svg";
import products from "./shop/productsDetails";

const Cart = () => {
  const showCart = useSelector((state: RootState) => state.data.cart.showCart);
  const dispatch: AppDispatch = useDispatch();

  return (
    <div className="min-w-full min-h-full font-urbanist">
      <div
        onClick={() => dispatch(setShowCart(false))}
        className={`${
          showCart ? "fixed top-0 left-0 w-full h-screen bg-black/50" : "hidden"
        }`}
      />
      <div
        className={`fixed top-0 right-0 z-40 h-full w-80 p-5 pt-12 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          showCart ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-[60%] p-5 overflow-y-scroll w-full border-[1px] border-black/50 rounded-2xl flex flex-col justify-between">
          <div className="w-full text-xs flex justify-between items-center">
            <div className="font-bold">My Cart</div>
            <div>Clear All</div>
          </div>

          <div className=" products h-full max-w-full py-8">
            <div className="flex w-full h-12 justify-between ">
              <div className="flex gap-2">
                <img src={bin} className="w-3" />
                <img src={products[1].display} className="rounded-lg max-w-[50px]" />
                <div>
                  <div className="font-bold">{products[1].name}</div>
                  <div>$20.00</div>
                </div>
              </div>
              <div>Add</div>
            </div>

            <div className="w-full h-[1px] bg-black/30 my-4" />
          </div>

          <div className="w-full bg-primary text-white rounded-2xl p-4 flex justify-between">
            <div>Total</div>
            <div>$20.00</div>
          </div>
        </div>

        <div className="h-full p-5 overflow-y-scroll w-full lg:border-[1px] border-black/50 rounded-2xl flex flex-col justify-between">
          <div className="font-bold text-xs">Order Summary</div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
