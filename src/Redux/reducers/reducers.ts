import { combineReducers } from '@reduxjs/toolkit';
import activeMenuSlice from '../features/activeMenuSlice';
import cartSlice from '../features/cartSlice';

const rootReducer = combineReducers({
  activeMenu: activeMenuSlice,
  cart: cartSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
