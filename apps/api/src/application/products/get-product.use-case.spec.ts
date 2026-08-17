import { Product } from 'src/domain/product/product.entity';
import { ProductRepository } from 'src/domain/product/product.repository';
import { GetProductUseCase } from './get-product.use-case';

const product = new Product({
  id: 'p1',
  name: 'Aurora',
  description: 'headphones',
  priceInCents: 25990000,
  imageUrl: 'https://example/a.png',
  stock: 5,
});

const repositoryReturning = (value: Product | null): ProductRepository => ({
  findAll: () => Promise.resolve([]),
  findById: () => Promise.resolve(value),
});

describe('GetProductUseCase', () => {
  it('returns the product when it exists', async () => {
    const useCase = new GetProductUseCase(repositoryReturning(product));
    const result = await useCase.execute('p1');
    expect(result.ok && result.value).toBe(product);
  });

  it('returns a not found error when the product is missing', async () => {
    const useCase = new GetProductUseCase(repositoryReturning(null));
    const result = await useCase.execute('missing');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
    }
  });
});
