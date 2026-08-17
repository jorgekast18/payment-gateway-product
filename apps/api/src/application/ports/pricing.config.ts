export const PRICING_CONFIG = Symbol('PRICING_CONFIG');

export interface PricingConfig {
  baseFeeInCents: number;
  deliveryFeeInCents: number;
}
