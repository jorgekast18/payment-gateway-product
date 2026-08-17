import { Money } from '../shared/money';

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  imageUrl: string;
  stock: number;
}

export class Product {
  constructor(private readonly props: ProductProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  get stock(): number {
    return this.props.stock;
  }

  get price(): Money {
    return Money.fromCents(this.props.priceInCents);
  }

  get priceInCents(): number {
    return this.props.priceInCents;
  }

  hasStockFor(quantity: number): boolean {
    return quantity > 0 && this.props.stock >= quantity;
  }
}
