import { err, ok, Result } from '../../shared/result';
import { Product } from '../../domain/product/product.entity';
import { ProductRepository } from '../../domain/product/product.repository';
import { ProductNotFoundError } from '../../domain/product/product.errors';

export class GetProductUseCase {
  constructor(private readonly products: ProductRepository) {}

  async execute(productId: string): Promise<Result<Product, ProductNotFoundError>> {
    const product = await this.products.findById(productId);
    if (!product) {
      return err(new ProductNotFoundError(productId));
    }
    return ok(product);
  }
}
