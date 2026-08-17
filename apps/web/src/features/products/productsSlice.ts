import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { Product } from '../../api/types';

export type ProductsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ProductsState {
  items: Product[];
  status: ProductsStatus;
  error?: string;
}

const initialState: ProductsState = { items: [], status: 'idle' };

export const fetchProducts = createAsyncThunk('products/fetch', () => api.getProducts());

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'ready';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      });
  },
});

export default productsSlice.reducer;
