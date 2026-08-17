import { render, screen } from '@testing-library/react';
import { Field } from './Field';

describe('Field', () => {
  it('renders a labelled input', () => {
    render(<Field label="Email" name="email" value="" onChange={() => undefined} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('shows an error and marks the input invalid', () => {
    render(
      <Field label="Email" name="email" value="" onChange={() => undefined} error="Required" />,
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders an adornment', () => {
    render(
      <Field
        label="Card"
        name="card"
        value=""
        onChange={() => undefined}
        adornment={<span data-testid="adornment">VISA</span>}
      />,
    );
    expect(screen.getByTestId('adornment')).toBeInTheDocument();
  });
});
