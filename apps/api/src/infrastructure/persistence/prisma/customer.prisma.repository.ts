import { Injectable } from '@nestjs/common';
import { Customer } from 'src/domain/customer/customer.entity';
import { CustomerRepository } from 'src/domain/customer/customer.repository';
import { PrismaService } from './prisma.service';
import { toCustomer } from './prisma.mappers';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(customer: Customer): Promise<Customer> {
    const row = await this.prisma.customer.create({
      data: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
    return toCustomer(row);
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    return row ? toCustomer(row) : null;
  }
}
