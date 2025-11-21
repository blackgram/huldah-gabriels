import { combineReducers } from '@reduxjs/toolkit';
import activeMenuSlice from '../features/activeMenuSlice';
import cartSlice from '../features/cartSlice';
import smallMenuSlice from '../features/smallMenuSlice';
import checkoutSlice from '../features/checkoutSlice';
import userSlice  from '../features/userSlice';
import productsSlice from '../features/productsSlice';

const rootReducer = combineReducers({
  activeMenu: activeMenuSlice,
  cart: cartSlice,
  smallMenu: smallMenuSlice,
  checkout: checkoutSlice,
  user: userSlice,
  products: productsSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
