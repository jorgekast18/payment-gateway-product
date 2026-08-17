export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export type GatewayStatus = 'APPROVED' | 'DECLINED' | 'ERROR' | 'PENDING' | 'VOIDED';

export interface ChargeCardInput {
  amountInCents: number;
  reference: string;
  customerEmail: string;
  card: {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    holder: string;
  };
}

export interface ChargeResult {
  gatewayTransactionId: string;
  status: GatewayStatus;
}

export interface PaymentGateway {
  charge(input: ChargeCardInput): Promise<ChargeResult>;
}
