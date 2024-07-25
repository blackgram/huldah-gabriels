import { combineReducers } from '@reduxjs/toolkit';
import activeMenuSlice from '../features/activeMenuSlice';

const rootReducer = combineReducers({
  activeMenu: activeMenuSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
