import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  shop: null,
};

const eShopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShop(state, action) {
      state.shop = action.payload;
    },
    clearShop(state) {
      state.shop = null;
    },
  },
});

export const { setShop, clearShop } = eShopSlice.actions;

export const selectShop = (state) => state.shop.shop;

export default eShopSlice.reducer;
