import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface smallMenu {
    showSmallMenu: boolean
}

const initialState: smallMenu = {
    showSmallMenu: false
}

const smallMenuSlice = createSlice({
    name: 'showSmallMenu',
    initialState,
    reducers: {
        setShowSmallMenu(state, action: PayloadAction<boolean>) {
            state.showSmallMenu = action.payload;
        }
    }
})

export const {setShowSmallMenu} = smallMenuSlice.actions;
export default smallMenuSlice.reducer