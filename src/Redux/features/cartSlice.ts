import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProductI {
  id: number;
  name: string;
  desc: string;
  reviews: never[];
  display: string;
  price: number;
}

interface SetCartItemsPayload {
  product: ProductI;
  quantity: number;
}

export interface CartDetails {
  cartTotal: number;
  showCart: boolean;
  cartItems: { product: ProductI; quantity: number }[];
}

const initialState: CartDetails = {
  cartTotal: 0,
  showCart: false,
  cartItems: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartDetails(state, action: PayloadAction<number>) {
      state.cartTotal = action.payload;
    },
    setShowCart(state, action: PayloadAction<boolean>) {
      state.showCart = action.payload;
    },
    setCartItems(state, action: PayloadAction<SetCartItemsPayload>) {
      const { product, quantity } = action.payload;
      const existingItem = state.cartItems?.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        state.cartTotal += quantity;
      } else {
        state.cartItems?.push({ product, quantity });
        state.cartTotal += quantity;
      }
    },
    increaseProdQuantity(state, action: PayloadAction<number>) {
      const productId = action.payload;
      const selectItem = state.cartItems?.find(
        (item) => item.product.id === productId
      );

      if (selectItem) {
        selectItem.quantity += 1;
        state.cartTotal += 1;
      }
    },
    decreaseProdQuantity(state, action: PayloadAction<number>) {
      const productId = action.payload;
      const selectItem = state.cartItems?.find(
        (item) => item.product.id === productId
      );

      if (selectItem && selectItem.quantity > 1) {
        selectItem.quantity -= 1;
        state.cartTotal -= 1;
      } else if (selectItem && selectItem.quantity === 1) {
        state.cartItems = state.cartItems.filter(
          (item) => item.product.id !== productId
        );
        state.cartTotal -= 1;
      }
    },
    deleteCartItem(state, action: PayloadAction<number>) {
      const productId = action.payload;
      const selectItem = state.cartItems?.find(
        (item) => item.product.id === productId
      );

      state.cartItems = state.cartItems.filter(
        (item) => item.product.id !== productId
      );

      state.cartTotal -= selectItem!.quantity;
    },
    clearCart(state) {
        state.cartItems= []
        state.cartTotal = 0
    }
  },
});

export const {
  setCartDetails,
  setShowCart,
  setCartItems,
  decreaseProdQuantity,
  increaseProdQuantity,
  deleteCartItem,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
