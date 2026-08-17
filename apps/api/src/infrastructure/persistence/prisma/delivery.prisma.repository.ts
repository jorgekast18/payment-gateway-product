import { Injectable } from '@nestjs/common';
import { Delivery } from 'src/domain/delivery/delivery.entity';
import { DeliveryRepository } from 'src/domain/delivery/delivery.repository';
import { PrismaService } from './prisma.service';
import { toDelivery } from './prisma.mappers';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(delivery: Delivery): Promise<Delivery> {
    const row = await this.prisma.delivery.create({
      data: {
        address: delivery.address,
        city: delivery.city,
        region: delivery.region,
        postalCode: delivery.postalCode,
        status: delivery.status,
      },
    });
    return toDelivery(row);
  }
}
