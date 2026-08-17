import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ReferenceGenerator } from 'src/application/ports/reference-generator';

@Injectable()
export class UuidReferenceGenerator implements ReferenceGenerator {
  generate(): string {
    return `PGP-${randomUUID()}`;
  }
}
