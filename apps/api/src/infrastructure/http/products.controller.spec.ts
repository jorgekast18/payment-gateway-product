import { HttpException } from '@nestjs/common';
import { GetProductUseCase } from 'src/application/products/get-product.use-case';
import { ListProductsUseCase } from 'src/application/products/list-products.use-case';
import { Product } from 'src/domain/product/product.entity';
import { ProductNotFoundError } from 'src/domain/product/product.errors';
import { err, ok } from 'src/shared/result';
import { ProductsController } from './products.controller';

const product = new Product({
  id: 'p1',
  name: 'Aurora',
  description: 'headphones',
  priceInCents: 25990000,
  imageUrl: 'https://example/a.png',
  stock: 5,
});

describe('ProductsController', () => {
  it('returns the mapped list of products', async () => {
    const list = {
      execute: jest.fn().mockResolvedValue([product]),
    } as unknown as ListProductsUseCase;
    const get = { execute: jest.fn() } as unknown as GetProductUseCase;

    const response = await new ProductsController(list, get).findAll();

    expect(response).toEqual([
      {
        id: 'p1',
        name: 'Aurora',
        description: 'headphones',
        priceInCents: 25990000,
        imageUrl: 'https://example/a.png',
        stock: 5,
      },
    ]);
  });

  it('returns a single product when found', async () => {
    const list = { execute: jest.fn() } as unknown as ListProductsUseCase;
    const get = {
      execute: jest.fn().mockResolvedValue(ok(product)),
    } as unknown as GetProductUseCase;

    const response = await new ProductsController(list, get).findOne('p1');

    expect(response.id).toBe('p1');
  });

  it('throws an HTTP exception when the product is missing', async () => {
    const list = { execute: jest.fn() } as unknown as ListProductsUseCase;
    const get = {
      execute: jest.fn().mockResolvedValue(err(new ProductNotFoundError('missing'))),
    } as unknown as GetProductUseCase;

    await expect(new ProductsController(list, get).findOne('missing')).rejects.toBeInstanceOf(
      HttpException,
    );
  });
});
