import { CardBrand } from '../domain/card';

const LABELS: Record<CardBrand, string> = {
  VISA: 'VISA',
  MASTERCARD: 'MC',
  UNKNOWN: 'CARD',
};

export const CardBadge = ({ brand }: { brand: CardBrand }) => (
  <span className={`card-badge card-badge--${brand}`} data-testid="card-badge">
    {LABELS[brand]}
  </span>
);
