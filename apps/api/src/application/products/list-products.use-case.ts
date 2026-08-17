import { Product } from 'src/domain/product/product.entity';
import { ProductRepository } from 'src/domain/product/product.repository';

export class ListProductsUseCase {
  constructor(private readonly products: ProductRepository) {}

  execute(): Promise<Product[]> {
    return this.products.findAll();
  }
}
