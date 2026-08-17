import { DomainError } from '../../shared/domain-error';

export class InvalidCreditCardError extends DomainError {
  readonly code = 'INVALID_CREDIT_CARD';

  constructor(reason: string) {
    super(`Invalid credit card: ${reason}`);
  }
}

export class PaymentGatewayError extends DomainError {
  readonly code = 'PAYMENT_GATEWAY_ERROR';

  constructor(reason: string) {
    super(`Payment gateway error: ${reason}`);
  }
}
