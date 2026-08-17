import { Product } from './product.entity';

const build = (stock: number): Product =>
  new Product({
    id: 'product-1',
    name: 'Aurora',
    description: 'headphones',
    priceInCents: 25990000,
    imageUrl: 'https://example/img.png',
    stock,
  });

describe('Product', () => {
  it('exposes its properties', () => {
    const product = build(5);
    expect(product.id).toBe('product-1');
    expect(product.name).toBe('Aurora');
    expect(product.description).toBe('headphones');
    expect(product.imageUrl).toBe('https://example/img.png');
    expect(product.priceInCents).toBe(25990000);
    expect(product.stock).toBe(5);
    expect(product.price.cents).toBe(25990000);
  });

  it('has stock for a quantity within availability', () => {
    expect(build(5).hasStockFor(5)).toBe(true);
  });

  it('does not have stock for a quantity above availability', () => {
    expect(build(2).hasStockFor(3)).toBe(false);
  });

  it('rejects a non-positive quantity', () => {
    expect(build(5).hasStockFor(0)).toBe(false);
  });
});
