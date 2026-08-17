import { Money } from './money';

describe('Money', () => {
  it('creates a value from non-negative integer cents', () => {
    expect(Money.fromCents(1500).cents).toBe(1500);
  });

  it('exposes a zero value', () => {
    expect(Money.zero().cents).toBe(0);
  });

  it('rejects negative amounts', () => {
    expect(() => Money.fromCents(-1)).toThrow(RangeError);
  });

  it('rejects non-integer amounts', () => {
    expect(() => Money.fromCents(10.5)).toThrow(RangeError);
  });

  it('adds two amounts', () => {
    expect(Money.fromCents(1000).add(Money.fromCents(250)).cents).toBe(1250);
  });

  it('multiplies by a non-negative integer', () => {
    expect(Money.fromCents(1000).multiply(3).cents).toBe(3000);
  });

  it('rejects multiplying by a negative factor', () => {
    expect(() => Money.fromCents(1000).multiply(-2)).toThrow(RangeError);
  });

  it('rejects multiplying by a non-integer factor', () => {
    expect(() => Money.fromCents(1000).multiply(1.5)).toThrow(RangeError);
  });
});
