import { API_URL } from '../config';
import { CardInput, CreateTransactionPayload, Product, Transaction } from './types';

const extractMessage = (payload: unknown): string | null => {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: unknown }).message;
    return typeof message === 'string' ? message : null;
  }
  return null;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    throw new Error(extractMessage(payload) ?? `Request failed with status ${response.status}`);
  }
  return payload as T;
};

export const api = {
  getProducts: (): Promise<Product[]> => request<Product[]>('/products'),
  getProduct: (id: string): Promise<Product> => request<Product>(`/products/${id}`),
  createTransaction: (payload: CreateTransactionPayload): Promise<Transaction> =>
    request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(payload) }),
  payTransaction: (id: string, card: CardInput): Promise<Transaction> =>
    request<Transaction>(`/transactions/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify({ card }),
    }),
  getTransaction: (id: string): Promise<Transaction> => request<Transaction>(`/transactions/${id}`),
};
