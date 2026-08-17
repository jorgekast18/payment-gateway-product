import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children and handles clicks', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Pay now</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Pay now' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and shows a spinner while loading', () => {
    const { container } = render(<Button loading>Pay now</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('applies the ghost and block modifiers', () => {
    render(
      <Button variant="ghost" block>
        Back
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Back' });
    expect(button).toHaveClass('btn--ghost');
    expect(button).toHaveClass('btn--block');
  });
});
