import { formatCurrency } from './money';

describe('formatCurrency', () => {
  it('formats integer cents as Colombian pesos without decimals', () => {
    const formatted = formatCurrency(25990000);
    expect(formatted).toContain('259.900');
    expect(formatted).not.toContain(',00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });
});
