import { CardInput } from '../api/types';

export type CardBrand = 'VISA' | 'MASTERCARD' | 'UNKNOWN';

const VISA_PATTERN = /^4[0-9]{12}(?:[0-9]{3})?$/;
const MASTERCARD_PATTERN =
  /^(?:5[1-5][0-9]{14}|2(?:22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[01][0-9]|720)[0-9]{12})$/;

export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export const detectBrand = (value: string): CardBrand => {
  const number = onlyDigits(value);
  if (number.startsWith('4')) {
    return 'VISA';
  }
  if (/^(5[1-5]|22[2-9]|2[3-7])/.test(number)) {
    return 'MASTERCARD';
  }
  return 'UNKNOWN';
};

export const passesLuhn = (value: string): boolean => {
  const number = onlyDigits(value);
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
  return number.length > 0 && sum % 10 === 0;
};

export const formatCardNumber = (value: string): string =>
  onlyDigits(value)
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();

export interface CardErrors {
  number?: string;
  cvc?: string;
  expMonth?: string;
  expYear?: string;
  holder?: string;
}

const isStrongBrand = (number: string): boolean =>
  VISA_PATTERN.test(number) || MASTERCARD_PATTERN.test(number);

export const validateCard = (card: CardInput): CardErrors => {
  const errors: CardErrors = {};
  const number = onlyDigits(card.number);

  if (!isStrongBrand(number)) {
    errors.number = 'Enter a valid VISA or Mastercard number';
  } else if (!passesLuhn(number)) {
    errors.number = 'The card number is not valid';
  }

  if (!/^[0-9]{3,4}$/.test(card.cvc)) {
    errors.cvc = 'CVC must be 3 or 4 digits';
  }

  const month = Number(card.expMonth);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    errors.expMonth = 'Invalid month';
  }

  if (!/^[0-9]{2}$/.test(card.expYear)) {
    errors.expYear = 'Invalid year';
  } else {
    const fullYear = 2000 + Number(card.expYear);
    const now = new Date();
    const expired =
      fullYear < now.getFullYear() ||
      (fullYear === now.getFullYear() && month < now.getMonth() + 1);
    if (expired) {
      errors.expYear = 'The card is expired';
    }
  }

  if (card.holder.trim().length === 0) {
    errors.holder = 'The card holder is required';
  }

  return errors;
};

export const hasCardErrors = (errors: CardErrors): boolean => Object.keys(errors).length > 0;
