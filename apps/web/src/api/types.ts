export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string;
  stock: number;
}

export interface Transaction {
  id: string;
  reference: string;
  status: TransactionStatus;
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  amountInCents: number;
  cardBrand: string | null;
  cardLastFour: string | null;
  productId: string;
}

export interface CustomerInput {
  fullName: string;
  email: string;
  phone: string;
}

export interface DeliveryInput {
  address: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface CardInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  holder: string;
}

export interface CreateTransactionPayload {
  productId: string;
  quantity: number;
  customer: CustomerInput;
  delivery: DeliveryInput;
}
