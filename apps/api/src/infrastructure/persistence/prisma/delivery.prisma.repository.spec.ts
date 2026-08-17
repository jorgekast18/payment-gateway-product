import { Delivery } from '../../../domain/delivery/delivery.entity';
import { PrismaService } from './prisma.service';
import { PrismaDeliveryRepository } from './delivery.prisma.repository';

const row = {
  id: 'd1',
  address: 'Calle 123',
  city: 'Bogota',
  region: 'Cundinamarca',
  postalCode: '110111',
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PrismaDeliveryRepository', () => {
  it('creates a delivery and returns it with an id', async () => {
    const create = jest.fn().mockResolvedValue(row);
    const prisma = { delivery: { create } } as unknown as PrismaService;

    const delivery = await new PrismaDeliveryRepository(prisma).create(
      Delivery.createPending({
        address: 'Calle 123',
        city: 'Bogota',
        region: 'Cundinamarca',
        postalCode: '110111',
      }),
    );

    expect(delivery.id).toBe('d1');
    expect(delivery.status).toBe('PENDING');
    expect(create).toHaveBeenCalledTimes(1);
  });
});
