import { Delivery } from './delivery.entity';

describe('Delivery', () => {
  it('creates a pending delivery', () => {
    const delivery = Delivery.createPending({
      address: 'Calle 123',
      city: 'Bogota',
      region: 'Cundinamarca',
      postalCode: '110111',
    });

    expect(delivery.status).toBe('PENDING');
    expect(delivery.address).toBe('Calle 123');
    expect(delivery.city).toBe('Bogota');
    expect(delivery.region).toBe('Cundinamarca');
    expect(delivery.postalCode).toBe('110111');
    expect(delivery.id).toBeUndefined();
  });

  it('preserves an id and status from persistence', () => {
    const delivery = new Delivery({
      id: 'delivery-1',
      address: 'Calle 123',
      city: 'Bogota',
      region: 'Cundinamarca',
      postalCode: '110111',
      status: 'ASSIGNED',
    });

    expect(delivery.id).toBe('delivery-1');
    expect(delivery.status).toBe('ASSIGNED');
  });
});
