import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api/client';
import { CardInput, CustomerInput, DeliveryInput, Product, Transaction } from '../../api/types';
import type { RootState } from '../../app/store';

export type CheckoutStatus = 'idle' | 'creating' | 'paying' | 'error';

export interface CheckoutState {
  product?: Product;
  quantity: number;
  customer?: CustomerInput;
  delivery?: DeliveryInput;
  card?: CardInput;
  transaction?: Transaction;
  status: CheckoutStatus;
  error?: string;
}

const initialState: CheckoutState = { quantity: 1, status: 'idle' };

export interface ContactPayload {
  customer: CustomerInput;
  delivery: DeliveryInput;
  card: CardInput;
}

export const createPendingTransaction = createAsyncThunk<Transaction, void, { state: RootState }>(
  'checkout/create',
  async (_, { getState }) => {
    const { checkout } = getState();
    if (!checkout.product || !checkout.customer || !checkout.delivery) {
      throw new Error('The checkout data is incomplete');
    }
    return api.createTransaction({
      productId: checkout.product.id,
      quantity: checkout.quantity,
      customer: checkout.customer,
      delivery: checkout.delivery,
    });
  },
);

export const payTransaction = createAsyncThunk<Transaction, void, { state: RootState }>(
  'checkout/pay',
  async (_, { getState }) => {
    const { checkout } = getState();
    if (!checkout.transaction || !checkout.card) {
      throw new Error('The payment data is incomplete');
    }
    return api.payTransaction(checkout.transaction.id, checkout.card);
  },
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    selectProduct: (state, action: PayloadAction<{ product: Product; quantity: number }>) => {
      state.product = action.payload.product;
      state.quantity = action.payload.quantity;
      state.transaction = undefined;
      state.status = 'idle';
      state.error = undefined;
    },
    setContact: (state, action: PayloadAction<ContactPayload>) => {
      state.customer = action.payload.customer;
      state.delivery = action.payload.delivery;
      state.card = action.payload.card;
    },
    resetCheckout: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPendingTransaction.pending, (state) => {
        state.status = 'creating';
        state.error = undefined;
      })
      .addCase(createPendingTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.status = 'idle';
        state.transaction = action.payload;
      })
      .addCase(createPendingTransaction.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      })
      .addCase(payTransaction.pending, (state) => {
        state.status = 'paying';
        state.error = undefined;
      })
      .addCase(payTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.status = 'idle';
        state.transaction = action.payload;
      })
      .addCase(payTransaction.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      });
  },
});

export const { selectProduct, setContact, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
