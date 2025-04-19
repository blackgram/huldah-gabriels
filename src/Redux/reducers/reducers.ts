import { combineReducers } from '@reduxjs/toolkit';
import activeMenuSlice from '../features/activeMenuSlice';
import cartSlice from '../features/cartSlice';
import smallMenuSlice from '../features/smallMenuSlice';
import checkoutSlice from '../features/checkoutSlice';
import userSlice  from '../features/userSlice';

const rootReducer = combineReducers({
  activeMenu: activeMenuSlice,
  cart: cartSlice,
  smallMenu: smallMenuSlice,
  checkout: checkoutSlice,
  user: userSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
