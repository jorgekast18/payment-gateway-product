export const PAYMENT_GATEWAY_CONFIG = Symbol('PAYMENT_GATEWAY_CONFIG');

export interface PaymentGatewayConfig {
  apiUrl: string;
  publicKey: string;
  privateKey: string;
  integritySecret: string;
  currency: string;
  tokenizePath: string;
  installments: number;
  pollAttempts: number;
  pollDelayMs: number;
}
