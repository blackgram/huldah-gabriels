import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface smallMenu {
    showSmallMenu: boolean
    navMenu: boolean
}

const initialState: smallMenu = {
    showSmallMenu: false,
    navMenu: false
}

const smallMenuSlice = createSlice({
    name: 'showSmallMenu',
    initialState,
    reducers: {
        setShowSmallMenu(state, action: PayloadAction<boolean>) {
            state.showSmallMenu = action.payload;
        },
        setNavMenu(state, action: PayloadAction<boolean>) {
            state.navMenu = action.payload;
        }
    }
})

export const {setShowSmallMenu, setNavMenu} = smallMenuSlice.actions;
export default smallMenuSlice.reducer