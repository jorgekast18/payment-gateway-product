import { Injectable } from '@nestjs/common';
import { Product } from 'src/domain/product/product.entity';
import { ProductRepository } from 'src/domain/product/product.repository';
import { PrismaService } from './prisma.service';
import { toProduct } from './prisma.mappers';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const rows = await this.prisma.product.findMany({ orderBy: { name: 'asc' } });
    return rows.map(toProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? toProduct(row) : null;
  }
}
