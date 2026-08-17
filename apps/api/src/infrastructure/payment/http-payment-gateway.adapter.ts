import { createHash } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  CardToken,
  CardTokenizationInput,
  ChargeInput,
  ChargeResult,
  GatewayStatus,
  PaymentGateway,
} from '../../domain/payment/payment-gateway.port';
import { PAYMENT_GATEWAY_CONFIG, PaymentGatewayConfig } from './payment-gateway.config';

interface AcceptanceResponse {
  data: { presigned_acceptance: { acceptance_token: string } };
}

interface TokenizeResponse {
  data: { id: string; brand: string; last_four: string };
}

interface TransactionResponse {
  data: { id: string; status: string };
}

const TERMINAL_STATUSES: readonly string[] = ['APPROVED', 'DECLINED', 'ERROR', 'VOIDED'];

@Injectable()
export class HttpPaymentGateway implements PaymentGateway {
  constructor(
    @Inject(PAYMENT_GATEWAY_CONFIG) private readonly config: PaymentGatewayConfig,
  ) {}

  async getAcceptanceToken(): Promise<string> {
    const payload = await this.request<AcceptanceResponse>(
      'GET',
      `/merchants/${this.config.publicKey}`,
    );
    return payload.data.presigned_acceptance.acceptance_token;
  }

  async tokenizeCard(input: CardTokenizationInput): Promise<CardToken> {
    const payload = await this.request<TokenizeResponse>(
      'POST',
      this.config.tokenizePath,
      {
        number: input.number,
        cvc: input.cvc,
        exp_month: input.expMonth,
        exp_year: input.expYear,
        card_holder: input.holder,
      },
      this.config.publicKey,
    );
    return {
      token: payload.data.id,
      brand: payload.data.brand,
      lastFour: payload.data.last_four,
    };
  }

  async charge(input: ChargeInput): Promise<ChargeResult> {
    const created = await this.request<TransactionResponse>(
      'POST',
      '/transactions',
      {
        amount_in_cents: input.amountInCents,
        currency: this.config.currency,
        customer_email: input.customerEmail,
        reference: input.reference,
        acceptance_token: input.acceptanceToken,
        signature: this.buildSignature(input.reference, input.amountInCents),
        payment_method: {
          type: 'CARD',
          token: input.cardToken,
          installments: this.config.installments,
        },
      },
      this.config.privateKey,
    );
    return this.waitForResolution(created.data.id);
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
      throw new Error(`payment gateway responded with status ${response.status}`);
    }
    return payload as T;
  }
}
