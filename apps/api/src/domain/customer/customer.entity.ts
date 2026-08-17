export interface CustomerProps {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
}

export class Customer {
  constructor(private readonly props: CustomerProps) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string {
    return this.props.phone;
  }
}
