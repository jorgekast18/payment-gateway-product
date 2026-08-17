export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export type GatewayStatus = 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING' | 'VOIDED';

export interface CardTokenizationInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  holder: string;
}

export interface CardToken {
  token: string;
  brand: string;
  lastFour: string;
}

export interface ChargeInput {
  amountInCents: number;
  reference: string;
  customerEmail: string;
  cardToken: string;
  acceptanceToken: string;
}

export interface ChargeResult {
  gatewayTransactionId: string;
  status: GatewayStatus;
}

export interface PaymentGateway {
  getAcceptanceToken(): Promise<string>;
  tokenizeCard(input: CardTokenizationInput): Promise<CardToken>;
  charge(input: ChargeInput): Promise<ChargeResult>;
}
