import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  block?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  block = false,
  loading = false,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps) => (
  <button
    className={`btn btn--${variant}${block ? ' btn--block' : ''}${className ? ` ${className}` : ''}`}
    disabled={disabled ?? loading}
    {...rest}
  >
    {loading && <span className="spinner" aria-hidden="true" />}
    {children}
  </button>
);
