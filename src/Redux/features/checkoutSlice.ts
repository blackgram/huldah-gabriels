import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CheckoutI {
    showModal: boolean,
    orderTotalAmount: number
}


const initialState: CheckoutI = {
    showModal: false,
    orderTotalAmount: 0
}

const checkoutSlice = createSlice({
    name: "checkout",
    initialState,
    reducers: {
        setShowModal(state, action: PayloadAction<boolean>) {
            state.showModal = action.payload
        },
        setOrderTotalAmount(state, action: PayloadAction<number>) {
            state.orderTotalAmount = action.payload
        }
    }
})

export const {setShowModal, setOrderTotalAmount} = checkoutSlice.actions;
export default checkoutSlice.reducer