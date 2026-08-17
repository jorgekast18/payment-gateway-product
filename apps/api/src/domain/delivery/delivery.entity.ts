export type DeliveryStatus = 'PENDING' | 'ASSIGNED';

export interface DeliveryProps {
  id?: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  status: DeliveryStatus;
}

export class Delivery {
  constructor(private readonly props: DeliveryProps) {}

  static createPending(props: Omit<DeliveryProps, 'status' | 'id'>): Delivery {
    return new Delivery({ ...props, status: 'PENDING' });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get address(): string {
    return this.props.address;
  }

  get city(): string {
    return this.props.city;
  }

  get region(): string {
    return this.props.region;
  }

  get postalCode(): string {
    return this.props.postalCode;
  }

  get status(): DeliveryStatus {
    return this.props.status;
  }
}
