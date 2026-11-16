import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product } from '../types/product';

const apiBaseUrl = (process.env.NEXT_PUBLIC_FAKE_STORE_API_URL || 'https://fakestoreapi.com').replace(/\/+$/, '');

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      keepUnusedDataFor: 300
    })
  })
});

export const { useGetProductsQuery } = productsApi;
