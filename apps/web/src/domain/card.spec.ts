import {
  detectBrand,
  formatCardNumber,
  hasCardErrors,
  onlyDigits,
  passesLuhn,
  validateCard,
} from './card';
import { CardInput } from '../api/types';

const futureYear = ((new Date().getFullYear() + 3) % 100).toString().padStart(2, '0');

const validCard: CardInput = {
  number: '4242424242424242',
  cvc: '123',
  expMonth: '08',
  expYear: futureYear,
  holder: 'Jane Doe',
};

describe('card domain', () => {
  it('strips non-digits', () => {
    expect(onlyDigits('4242 4242-abc')).toBe('42424242');
  });

  it('detects the VISA brand', () => {
    expect(detectBrand('4242 4242 4242 4242')).toBe('VISA');
  });

  it('detects the Mastercard brand', () => {
    expect(detectBrand('5555555555554444')).toBe('MASTERCARD');
    expect(detectBrand('2221000000000009')).toBe('MASTERCARD');
  });

  it('returns unknown for other brands', () => {
    expect(detectBrand('378282246310005')).toBe('UNKNOWN');
    expect(detectBrand('')).toBe('UNKNOWN');
  });

  it('validates the Luhn checksum', () => {
    expect(passesLuhn('4242424242424242')).toBe(true);
    expect(passesLuhn('4242424242424241')).toBe(false);
    expect(passesLuhn('')).toBe(false);
  });

  it('formats the card number in groups of four', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(formatCardNumber('4242')).toBe('4242');
  });

  it('accepts a valid card', () => {
    const errors = validateCard(validCard);
    expect(hasCardErrors(errors)).toBe(false);
  });

  it('rejects an unsupported or invalid number', () => {
    expect(validateCard({ ...validCard, number: '378282246310005' }).number).toBeDefined();
    expect(validateCard({ ...validCard, number: '4242424242424241' }).number).toBeDefined();
  });

  it('rejects an invalid cvc', () => {
    expect(validateCard({ ...validCard, cvc: '1' }).cvc).toBeDefined();
  });

  it('rejects an invalid month', () => {
    expect(validateCard({ ...validCard, expMonth: '13' }).expMonth).toBeDefined();
  });

  it('rejects an invalid or expired year', () => {
    expect(validateCard({ ...validCard, expYear: '2030' }).expYear).toBeDefined();
    expect(validateCard({ ...validCard, expMonth: '01', expYear: '20' }).expYear).toBeDefined();
  });

  it('rejects an empty holder', () => {
    expect(validateCard({ ...validCard, holder: '  ' }).holder).toBeDefined();
  });
});
