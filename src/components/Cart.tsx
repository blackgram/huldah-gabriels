import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Redux/store";
import {
  clearCart,
  decreaseProdQuantity,
  deleteCartItem,
  increaseProdQuantity,
  setShowCart,
} from "../Redux/features/cartSlice";
import bin from ".././assets/bin.svg";
import { useEffect, useState } from "react";
import {
  setShowModal,
  setOrderTotalAmount,
} from "../Redux/features/checkoutSlice";
import { getProductImageUrl } from "../Utils/imageUtils";
import { isSaleActive, getDisplayPrice, getOriginalPrice } from "../Utils/discountUtils";

const Cart = () => {
  const dispatch: AppDispatch = useDispatch();
  const showCart = useSelector((state: RootState) => state.data.cart.showCart);
  const cartItems = useSelector(
    (state: RootState) => state.data.cart.cartItems
  );
  const cartTotal = useSelector(
    (state: RootState) => state.data.cart.cartTotal
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    localStorage.setItem("cartTotal", JSON.stringify(cartTotal));
  }, [cartItems]);

  const [vat, setVat] = useState<number | undefined>(undefined);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  const totalPrice = cartItems.reduce((total, item) => {
    const displayPrice = getDisplayPrice(item.product);
    return total + displayPrice * item.quantity;
  }, 0);

  const shippingFee = 15;
  const vatRate = 0.1;

  useEffect(() => {
    if (totalPrice > 9.9) {
      setVat(vatRate * totalPrice);
    }
  }, [totalPrice]);

  useEffect(() => {
    if (totalPrice > 0) {
      setOrderTotal(totalPrice + shippingFee + vat!);
    }
  }, [totalPrice, shippingFee, vat]);

  const handleCheckout = () => {
    dispatch(setOrderTotalAmount(orderTotal));

    dispatch(setShowModal(true));
    dispatch(setShowCart(false));
  };

  return (
    <div className="min-w-full min-h-full font-urbanist">
      <div
        onClick={() => dispatch(setShowCart(false))}
        className={`${
          showCart ? "fixed top-0 left-0 w-full h-screen bg-black/50" : "hidden"
        }`}
      />
      <div
        className={`fixed top-0 right-0 z-40 h-full max-h-[100vh] flex flex-col lg:flex-row lg:gap-10 overflow-y-scroll w-[90%] lg:w-[70%] xl:w-[50%] p-5 pt-24  bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          showCart ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-[60%] lg:h-full p-5 w-full border-[1px] border-black/50 rounded-2xl flex flex-col justify-between">
          <div className="w-full text-xs flex justify-between items-center">
            <div className="font-bold">My Cart</div>
            <div onClick={() => dispatch(clearCart())}>Clear All</div>
          </div>

          <div className=" products h-full overflow-y-scroll scrollbar-thin lg:scrollbar-none  max-w-full py-8">
            {cartItems.length < 1 && (
              <div className="w-full text-center">
                Cart is empty!. Keep Shopping
              </div>
            )}
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex flex-col lg:px-4">
                <div className="flex w-full h-12 justify-between items-center ">
                  <div className="flex gap-2">
                    <img
                      src={bin}
                      className="w-3"
                      onClick={() => dispatch(deleteCartItem(item.product.id))}
                    />
                    <img
                      src={getProductImageUrl(item.product)}
                      alt={item.product.name}
                      className="rounded-lg max-w-[50px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/vite.svg';
                      }}
                    />
                    <div>
                      <div className="font-bold">{item.product.name}</div>
                      {isSaleActive(item.product) ? (
                        <div className="flex flex-col">
                          <div className="text-primary font-semibold">
                            ${getDisplayPrice(item.product).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400 line-through">
                            ${getOriginalPrice(item.product).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <div>${item.product.price.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className=" bg-[#EEE9E9B2] w-full h-9 rounded-xl flex justify-evenly px-2 items-center text-xs lg:text-lg font-bold">
                      <button
                        className="p-2 cursor-pointer"
                        onClick={() =>
                          dispatch(decreaseProdQuantity(item.product.id))
                        }
                      >
                        -
                      </button>
                      <div className="w-[60%] p-2 h-9 bg-white rounded-2xl flex items-center justify-center">
                        {item.quantity}
                      </div>
                      <button
                        className="p-2 cursor-pointer"
                        onClick={() =>
                          dispatch(increaseProdQuantity(item.product.id))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-black/30 my-4" />
              </div>
            ))}
          </div>

          <div className="w-full bg-primary text-white rounded-2xl p-4 flex justify-between">
            <div>Total</div>
            <div>{`$${totalPrice}`}</div>
          </div>
        </div>

        <div className="h-full p-5 w-full lg:w-[50%] lg:border-[1px] border-black/50 rounded-2xl flex flex-col gap-3 ">
          <div className="font-bold text-xs">Order Summary</div>
          <div className="w-full p-1 overflow-y-scroll lg:scrollbar-none ">
            {cartItems.map((item) => {
              const displayPrice = getDisplayPrice(item.product);
              return (
                <div key={item.product.id} className="w-full flex justify-between text-sm">
                  <div className="flex flex-col">
                    <div>{`${item.quantity}x ${item.product.name}`}</div>
                    {isSaleActive(item.product) && (
                      <div className="text-xs text-red-600 font-semibold">
                        Sale: -{item.product.discountPercentage}%
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-semibold">${(displayPrice * item.quantity).toFixed(2)}</div>
                    {isSaleActive(item.product) && (
                      <div className="text-xs text-gray-400 line-through">
                        ${(getOriginalPrice(item.product) * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="w-full h-[1px] bg-black my-4" />

            <div className="w-full text-sm font-bold flex justify-between">
              <div>Shipping Fee</div>
              <div>{`$${shippingFee}`}</div>
            </div>
            {vat && (
              <div className="w-full text-sm font-bold flex justify-between">
                <div>VAT</div>
                <div>{`$${vat}`}</div>
              </div>
            )}
          </div>

          <div className="flex justify-between w-full text-sm p-1 font-bold">
            <div>Order Total</div>
            <div>{`$${orderTotal}`}</div>
          </div>

          <div className="w-full  flex flex-col gap-2">
            <button
              onClick={() => {
                dispatch(clearCart());
                dispatch(setShowCart(!showCart));
              }}
              className="w-full p-5  border-[1px] border-black rounded-xl flex items-center justify-center"
            >
              Cancel Order
            </button>
            <button
              onClick={() => handleCheckout()}
              className="w-full p-5 flex items-center justify-center bg-primary rounded-xl text-white"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
