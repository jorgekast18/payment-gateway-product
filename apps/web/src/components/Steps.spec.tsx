import { render, screen } from '@testing-library/react';
import { Steps } from './Steps';

describe('Steps', () => {
  it('marks the completed steps as active', () => {
    const { container } = render(<Steps current={2} />);
    expect(screen.getByLabelText('Step 2 of 4')).toBeInTheDocument();
    expect(container.querySelectorAll('.steps__item--active')).toHaveLength(2);
  });
});
