import { Product } from '../../domain/product/product.entity';
import { ProductRepository } from '../../domain/product/product.repository';
import { ListProductsUseCase } from './list-products.use-case';

describe('ListProductsUseCase', () => {
  it('returns every product from the repository', async () => {
    const products = [
      new Product({
        id: 'p1',
        name: 'Aurora',
        description: 'headphones',
        priceInCents: 25990000,
        imageUrl: 'https://example/a.png',
        stock: 5,
      }),
    ];
    const repository: ProductRepository = {
      findAll: () => Promise.resolve(products),
      findById: () => Promise.resolve(null),
    };

    const useCase = new ListProductsUseCase(repository);

    await expect(useCase.execute()).resolves.toBe(products);
  });
});
