import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedProduct {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string;
  stock: number;
}

const products: SeedProduct[] = [
  {
    id: '6f9d1c2a-1f3b-4a7e-9c11-000000000001',
    name: 'Aurora Wireless Headphones',
    description: 'Over-ear headphones with active noise cancelling and 30 hours of battery.',
    priceInCents: 25990000,
    imageUrl: 'https://picsum.photos/seed/aurora-headphones/600/600',
    stock: 15,
  },
  {
    id: '6f9d1c2a-1f3b-4a7e-9c11-000000000002',
    name: 'Nimbus Mechanical Keyboard',
    description: 'Hot-swappable mechanical keyboard with tactile switches and RGB backlight.',
    priceInCents: 34990000,
    imageUrl: 'https://picsum.photos/seed/nimbus-keyboard/600/600',
    stock: 8,
  },
  {
    id: '6f9d1c2a-1f3b-4a7e-9c11-000000000003',
    name: 'Pulse Smartwatch',
    description: 'Fitness smartwatch with heart-rate tracking, GPS and a two-week battery.',
    priceInCents: 45990000,
    imageUrl: 'https://picsum.photos/seed/pulse-smartwatch/600/600',
    stock: 5,
  },
  {
    id: '6f9d1c2a-1f3b-4a7e-9c11-000000000004',
    name: 'Terra Portable Speaker',
    description: 'Waterproof portable speaker with deep bass and a 12-hour playtime.',
    priceInCents: 18990000,
    imageUrl: 'https://picsum.photos/seed/terra-speaker/600/600',
    stock: 20,
  },
];

async function main(): Promise<void> {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        priceInCents: product.priceInCents,
        imageUrl: product.imageUrl,
        stock: product.stock,
      },
      create: product,
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
