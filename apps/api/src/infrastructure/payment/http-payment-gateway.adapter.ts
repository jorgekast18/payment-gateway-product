import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  ChargeCardInput,
  ChargeResult,
  GatewayStatus,
  PaymentGateway,
} from 'src/domain/payment/payment-gateway.port';
import { PAYMENT_GATEWAY_CONFIG, PaymentGatewayConfig } from './payment-gateway.config';

interface MerchantResponse {
  data: {
    presigned_acceptance: { acceptance_token: string };
    presigned_personal_data_auth: { acceptance_token: string };
  };
}

interface TokenizeResponse {
  data: { id: string };
}

interface TransactionResponse {
  data: { id: string; status: string };
}

interface AuthorizationTokens {
  acceptance: string;
  personalDataAuth: string;
}

const TERMINAL_STATUSES: readonly string[] = ['APPROVED', 'DECLINED', 'ERROR', 'VOIDED'];

class GatewayHttpError extends Error {
  constructor(readonly status: number) {
    super(`payment gateway responded with status ${status}`);
  }
}

const isClientError = (error: unknown): boolean =>
  error instanceof GatewayHttpError && error.status >= 400 && error.status < 500;

@Injectable()
export class HttpPaymentGateway implements PaymentGateway {
  constructor(@Inject(PAYMENT_GATEWAY_CONFIG) private readonly config: PaymentGatewayConfig) {}

  async charge(input: ChargeCardInput): Promise<ChargeResult> {
    try {
      const tokens = await this.fetchAuthorizationTokens();
      const cardToken = await this.tokenizeCard(input.card);

      const created = await this.request<TransactionResponse>(
        'POST',
        '/transactions',
        {
          amount_in_cents: input.amountInCents,
          currency: this.config.currency,
          customer_email: input.customerEmail,
          reference: input.reference,
          acceptance_token: tokens.acceptance,
          accept_personal_auth: tokens.personalDataAuth,
          signature: this.buildSignature(input.reference, input.amountInCents),
          payment_method: {
            type: 'CARD',
            token: cardToken,
            installments: this.config.installments,
          },
        },
        this.config.privateKey,
      );

      return await this.waitForResolution(created.data.id);
    } catch (error) {
      // A 4xx means the gateway rejected the card data: model it as a declined
      // payment (a normal business outcome) instead of an infrastructure failure.
      if (isClientError(error)) {
        return { gatewayTransactionId: '', status: 'DECLINED' };
      }
      throw error;
    }
  }

  private async fetchAuthorizationTokens(): Promise<AuthorizationTokens> {
    const merchant = await this.request<MerchantResponse>(
      'GET',
      `/merchants/${this.config.publicKey}`,
    );
    return {
      acceptance: merchant.data.presigned_acceptance.acceptance_token,
      personalDataAuth: merchant.data.presigned_personal_data_auth.acceptance_token,
    };
  }

  private async tokenizeCard(card: ChargeCardInput['card']): Promise<string> {
    const response = await this.request<TokenizeResponse>(
      'POST',
      this.config.tokenizePath,
      {
        number: card.number,
        cvc: card.cvc,
        exp_month: card.expMonth,
        exp_year: card.expYear,
        card_holder: card.holder,
      },
      this.config.publicKey,
    );
    return response.data.id;
  }

  private buildSignature(reference: string, amountInCents: number): string {
    const raw = `${reference}${amountInCents}${this.config.currency}${this.config.integritySecret}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  private async waitForResolution(gatewayTransactionId: string): Promise<ChargeResult> {
    let lastStatus = 'PENDING';
    for (let attempt = 0; attempt < this.config.pollAttempts; attempt += 1) {
      const payload = await this.request<TransactionResponse>(
        'GET',
        `/transactions/${gatewayTransactionId}`,
        undefined,
        this.config.privateKey,
      );
      lastStatus = payload.data.status;
      if (TERMINAL_STATUSES.includes(lastStatus)) {
        return { gatewayTransactionId, status: this.toGatewayStatus(lastStatus) };
      }
      await this.delay(this.config.pollDelayMs);
    }
    return { gatewayTransactionId, status: this.toGatewayStatus(lastStatus) };
  }

  private toGatewayStatus(status: string): GatewayStatus {
    switch (status) {
      case 'APPROVED':
        return 'APPROVED';
      case 'DECLINED':
        return 'DECLINED';
      case 'VOIDED':
        return 'VOIDED';
      case 'PENDING':
        return 'PENDING';
      default:
        return 'ERROR';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    bearer?: string,
  ): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (bearer) {
      headers.Authorization = `Bearer ${bearer}`;
    }

    const response = await fetch(`${this.config.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => null)) as unknown;
    if (!response.ok) {
      throw new GatewayHttpError(response.status);
    }
    return payload as T;
  }
}
