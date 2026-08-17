import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListProductsUseCase } from '../../application/products/list-products.use-case';
import { GetProductUseCase } from '../../application/products/get-product.use-case';
import { ProductResponse, toProductResponse } from './dto/responses';
import { toHttpException } from './http-error.mapper';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: ProductResponse, isArray: true })
  async findAll(): Promise<ProductResponse[]> {
    const products = await this.listProducts.execute();
    return products.map(toProductResponse);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductResponse })
  async findOne(@Param('id') id: string): Promise<ProductResponse> {
    const result = await this.getProduct.execute(id);
    if (!result.ok) {
      throw toHttpException(result.error);
    }
    return toProductResponse(result.value);
  }
}
