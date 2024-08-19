import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartDetails {
    cartTotal: number,
    showCart: boolean,
}

const initialState: CartDetails = {
    cartTotal: 0,
    showCart: false,
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartDetails(state, action: PayloadAction<number>) {
            state.cartTotal = action.payload;
        },
        setShowCart(state, action: PayloadAction<boolean>) {
            state.showCart = action.payload;
        },
    }
})

export const {setCartDetails, setShowCart} = cartSlice.actions;
export default cartSlice.reducer