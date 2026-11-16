import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { productsApi } from '../api/productsApi';

export const productsStore = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(productsApi.middleware)
});

setupListeners(productsStore.dispatch);

export type ProductsState = ReturnType<typeof productsStore.getState>;
export type ProductsDispatch = typeof productsStore.dispatch;
