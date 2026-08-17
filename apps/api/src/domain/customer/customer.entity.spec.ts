import { Customer } from './customer.entity';

describe('Customer', () => {
  it('exposes its properties without an id', () => {
    const customer = new Customer({
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+573001112233',
    });

    expect(customer.id).toBeUndefined();
    expect(customer.fullName).toBe('Jane Doe');
    expect(customer.email).toBe('jane.doe@example.com');
    expect(customer.phone).toBe('+573001112233');
  });

  it('keeps the id when provided', () => {
    const customer = new Customer({
      id: 'customer-1',
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+573001112233',
    });

    expect(customer.id).toBe('customer-1');
  });
});
