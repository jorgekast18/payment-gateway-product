import { Customer } from '../../../domain/customer/customer.entity';
import { PrismaService } from './prisma.service';
import { PrismaCustomerRepository } from './customer.prisma.repository';

const row = {
  id: 'c1',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+573001112233',
  createdAt: new Date(),
};

describe('PrismaCustomerRepository', () => {
  it('creates a customer and returns it with an id', async () => {
    const create = jest.fn().mockResolvedValue(row);
    const prisma = { customer: { create, findUnique: jest.fn() } } as unknown as PrismaService;

    const customer = await new PrismaCustomerRepository(prisma).create(
      new Customer({ fullName: 'Jane Doe', email: 'jane@example.com', phone: '+573001112233' }),
    );

    expect(customer.id).toBe('c1');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('finds a customer by id', async () => {
    const prisma = {
      customer: { create: jest.fn(), findUnique: jest.fn().mockResolvedValue(row) },
    } as unknown as PrismaService;

    const customer = await new PrismaCustomerRepository(prisma).findById('c1');

    expect(customer?.email).toBe('jane@example.com');
  });

  it('returns null when a customer is missing', async () => {
    const prisma = {
      customer: { create: jest.fn(), findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;

    expect(await new PrismaCustomerRepository(prisma).findById('missing')).toBeNull();
  });
});
