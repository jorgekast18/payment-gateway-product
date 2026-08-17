import { InputHTMLAttributes, ReactNode } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  adornment?: ReactNode;
}

export const Field = ({ label, error, adornment, id, name, ...rest }: FieldProps) => {
  const inputId = id ?? name;
  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <div className="field__control">
        <input
          id={inputId}
          name={name}
          className={`field__input${error ? ' field__input--invalid' : ''}`}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
        {adornment}
      </div>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
};
