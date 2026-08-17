import { PrismaService } from './prisma.service';
import { PrismaProductRepository } from './product.prisma.repository';

const row = {
  id: 'p1',
  name: 'Aurora',
  description: 'headphones',
  priceInCents: 25990000,
  imageUrl: 'https://example/a.png',
  stock: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PrismaProductRepository', () => {
  it('lists products mapped to domain entities', async () => {
    const prisma = {
      product: { findMany: jest.fn().mockResolvedValue([row]), findUnique: jest.fn() },
    } as unknown as PrismaService;

    const products = await new PrismaProductRepository(prisma).findAll();

    expect(products).toHaveLength(1);
    expect(products[0].id).toBe('p1');
    expect(products[0].stock).toBe(5);
  });

  it('finds a product by id', async () => {
    const prisma = {
      product: { findMany: jest.fn(), findUnique: jest.fn().mockResolvedValue(row) },
    } as unknown as PrismaService;

    const product = await new PrismaProductRepository(prisma).findById('p1');

    expect(product?.name).toBe('Aurora');
  });

  it('returns null when a product is missing', async () => {
    const prisma = {
      product: { findMany: jest.fn(), findUnique: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService;

    expect(await new PrismaProductRepository(prisma).findById('missing')).toBeNull();
  });
});
