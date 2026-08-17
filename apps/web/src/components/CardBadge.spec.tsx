import { render, screen } from '@testing-library/react';
import { CardBadge } from './CardBadge';

describe('CardBadge', () => {
  it('renders the VISA label and modifier', () => {
    render(<CardBadge brand="VISA" />);
    const badge = screen.getByTestId('card-badge');
    expect(badge).toHaveTextContent('VISA');
    expect(badge).toHaveClass('card-badge--VISA');
  });

  it('renders a generic label for an unknown brand', () => {
    render(<CardBadge brand="UNKNOWN" />);
    expect(screen.getByTestId('card-badge')).toHaveTextContent('CARD');
  });
});
