import { configureStore } from "@reduxjs/toolkit";
import eShopReducer from "./src/slices/eShopslice";
import cartReducer from "./src/slices/cartSlice";

export const store = configureStore({
  reducer: {
    shop: eShopReducer,
    cart: cartReducer,
  },
});

export default store;
