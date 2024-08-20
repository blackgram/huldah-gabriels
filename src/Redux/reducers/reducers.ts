import { combineReducers } from '@reduxjs/toolkit';
import activeMenuSlice from '../features/activeMenuSlice';
import cartSlice from '../features/cartSlice';
import smallMenuSlice from '../features/smallMenuSlice';

const rootReducer = combineReducers({
  activeMenu: activeMenuSlice,
  cart: cartSlice,
  smallMenu: smallMenuSlice,
  
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
