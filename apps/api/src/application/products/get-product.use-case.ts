import { err, ok, Result } from 'src/shared/result';
import { Product } from 'src/domain/product/product.entity';
import { ProductRepository } from 'src/domain/product/product.repository';
import { ProductNotFoundError } from 'src/domain/product/product.errors';

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
