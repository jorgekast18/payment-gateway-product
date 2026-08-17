import { err, ok, Result } from 'src/shared/result';
import { InvalidCreditCardError } from './payment.errors';

export type CardBrand = 'VISA' | 'MASTERCARD';

export interface CreditCardInput {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  holder: string;
}

const VISA_PATTERN = /^4[0-9]{12}(?:[0-9]{3})?$/;
const MASTERCARD_PATTERN =
  /^(?:5[1-5][0-9]{14}|2(?:22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[01][0-9]|720)[0-9]{12})$/;

const detectBrand = (number: string): CardBrand | null => {
  if (VISA_PATTERN.test(number)) {
    return 'VISA';
  }
  if (MASTERCARD_PATTERN.test(number)) {
    return 'MASTERCARD';
  }
  return null;
};

const passesLuhn = (number: string): boolean => {
  let sum = 0;
  let double = false;
  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = Number(number[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
};

const isExpired = (month: number, fullYear: number): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return fullYear < currentYear || (fullYear === currentYear && month < currentMonth);
};

export class CreditCard {
  private constructor(
    readonly number: string,
    readonly cvc: string,
    readonly expMonth: string,
    readonly expYear: string,
    readonly holder: string,
    readonly brand: CardBrand,
  ) {}

  static create(input: CreditCardInput): Result<CreditCard, InvalidCreditCardError> {
    const number = input.number.replace(/\s+/g, '');

    if (!/^[0-9]+$/.test(number)) {
      return err(new InvalidCreditCardError('the card number must contain only digits'));
    }

    const brand = detectBrand(number);
    if (brand === null) {
      return err(new InvalidCreditCardError('only VISA and Mastercard are supported'));
    }

    if (!passesLuhn(number)) {
      return err(new InvalidCreditCardError('the card number failed the checksum'));
    }

    if (!/^[0-9]{3,4}$/.test(input.cvc)) {
      return err(new InvalidCreditCardError('the cvc must be 3 or 4 digits'));
    }

    const month = Number(input.expMonth);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return err(new InvalidCreditCardError('the expiration month is out of range'));
    }

    if (!/^[0-9]{2}$/.test(input.expYear)) {
      return err(new InvalidCreditCardError('the expiration year must be two digits'));
    }
    const fullYear = 2000 + Number(input.expYear);
    if (isExpired(month, fullYear)) {
      return err(new InvalidCreditCardError('the card is expired'));
    }

    if (input.holder.trim().length === 0) {
      return err(new InvalidCreditCardError('the card holder is required'));
    }

    const expMonth = month.toString().padStart(2, '0');
    return ok(
      new CreditCard(number, input.cvc, expMonth, input.expYear, input.holder.trim(), brand),
    );
  }

  get lastFour(): string {
    return this.number.slice(-4);
  }
}
