import { ReactElement } from 'react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { render, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import products from '../features/products/productsSlice';
import checkout from '../features/checkout/checkoutSlice';

const rootReducer = combineReducers({ products, checkout });

type RootStateShape = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootStateShape>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootStateShape | undefined,
  });

export type AppStore = ReturnType<typeof makeStore>;

interface Options {
  route?: string;
  store?: AppStore;
}

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', store = makeStore() }: Options = {},
): RenderResult & { store: AppStore } => ({
  store,
  ...render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  ),
});
