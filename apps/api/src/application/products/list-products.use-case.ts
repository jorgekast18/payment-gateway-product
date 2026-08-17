import { Product } from '../../domain/product/product.entity';
import { ProductRepository } from '../../domain/product/product.repository';

export class ListProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  execute(): Promise<Product[]> {
    return this.products.findAll();
  }
}
