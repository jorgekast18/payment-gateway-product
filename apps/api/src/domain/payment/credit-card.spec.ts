import { CreditCard } from './credit-card';

const twoDigit = (value: number): string => value.toString().padStart(2, '0');
const currentYear = new Date().getFullYear();
const futureYear = twoDigit((currentYear + 3) % 100);

const validVisa = {
  number: '4242 4242 4242 4242',
  cvc: '123',
  expMonth: '8',
  expYear: futureYear,
  holder: 'Jane Doe',
};

describe('CreditCard', () => {
  it('accepts a valid VISA card and normalizes it', () => {
    const result = CreditCard.create(validVisa);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.brand).toBe('VISA');
      expect(result.value.lastFour).toBe('4242');
      expect(result.value.number).toBe('4242424242424242');
      expect(result.value.expMonth).toBe('08');
    }
  });

  it('accepts a valid Mastercard', () => {
    const result = CreditCard.create({ ...validVisa, number: '5555555555554444' });
    expect(result.ok && result.value.brand).toBe('MASTERCARD');
  });

  it('rejects a number with non-digit characters', () => {
    const result = CreditCard.create({ ...validVisa, number: '4242-abcd' });
    expect(result.ok).toBe(false);
  });

  it('rejects an unsupported brand', () => {
    const result = CreditCard.create({ ...validVisa, number: '378282246310005' });
    expect(result.ok).toBe(false);
  });

  it('rejects a number that fails the Luhn checksum', () => {
    const result = CreditCard.create({ ...validVisa, number: '4242424242424241' });
    expect(result.ok).toBe(false);
  });

  it('rejects an invalid cvc', () => {
    const result = CreditCard.create({ ...validVisa, cvc: '12' });
    expect(result.ok).toBe(false);
  });

  it('rejects an out-of-range month', () => {
    const result = CreditCard.create({ ...validVisa, expMonth: '13' });
    expect(result.ok).toBe(false);
  });

  it('rejects a non two-digit year', () => {
    const result = CreditCard.create({ ...validVisa, expYear: '2030' });
    expect(result.ok).toBe(false);
  });

  it('rejects an expired card from a past year', () => {
    const result = CreditCard.create({ ...validVisa, expMonth: '01', expYear: '20' });
    expect(result.ok).toBe(false);
  });

  it('rejects an expired card earlier in the current year', () => {
    const result = CreditCard.create({
      ...validVisa,
      expMonth: '01',
      expYear: twoDigit(currentYear % 100),
    });
    const now = new Date();
    const expected = now.getMonth() + 1 > 1;
    expect(result.ok).toBe(!expected);
  });

  it('rejects an empty holder', () => {
    const result = CreditCard.create({ ...validVisa, holder: '   ' });
    expect(result.ok).toBe(false);
  });
});
