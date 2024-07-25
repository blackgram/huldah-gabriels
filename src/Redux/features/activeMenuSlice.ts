import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ActiveState {
    active: string
}

const initialState: ActiveState = {
    active: 'home'
}

const activeMenuSlice = createSlice({
    name: 'activemenu',
    initialState,
    reducers: {
        setActiveMenu(state, action: PayloadAction<string>) {
            state.active = action.payload;
        }
    }
})

export const {setActiveMenu} = activeMenuSlice.actions;
export default activeMenuSlice.reducer