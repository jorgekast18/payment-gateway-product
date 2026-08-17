import { ChangeEvent, FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createPendingTransaction, setContact } from '../features/checkout/checkoutSlice';
import { CardInput } from '../api/types';
import {
  CardErrors,
  detectBrand,
  formatCardNumber,
  onlyDigits,
  validateCard,
} from '../domain/card';
import { Frame } from '../components/Frame';
import { Field } from '../components/Field';
import { Button } from '../components/Button';
import { CardBadge } from '../components/CardBadge';

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
}

const emptyForm: FormState = {
  fullName: '',
  email: '',
  phone: '',
  number: '',
  expMonth: '',
  expYear: '',
  cvc: '',
  address: '',
  city: '',
  region: '',
  postalCode: '',
};

type FormErrors = CardErrors & Partial<Record<keyof FormState, string>>;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const CardDeliveryPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) => state.checkout.product);
  const status = useAppSelector((state) => state.checkout.status);
  const apiError = useAppSelector((state) => state.checkout.error);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  if (!product) {
    return <Navigate to="/" replace />;
  }

  const update =
    (key: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const value =
        key === 'number' ? formatCardNumber(event.target.value) : event.target.value;
      setForm((current) => ({ ...current, [key]: value }));
    };

  const validate = (card: CardInput): FormErrors => {
    const nextErrors: FormErrors = { ...validateCard(card) };
    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Required';
    }
    if (!EMAIL_PATTERN.test(form.email)) {
      nextErrors.email = 'Enter a valid email';
    }
    if (!form.phone.trim()) {
      nextErrors.phone = 'Required';
    }
    (['address', 'city', 'region', 'postalCode'] as const).forEach((key) => {
      if (!form[key].trim()) {
        nextErrors[key] = 'Required';
      }
    });
    return nextErrors;
  };

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const card: CardInput = {
      number: onlyDigits(form.number),
      cvc: form.cvc,
      expMonth: form.expMonth,
      expYear: form.expYear,
      holder: form.fullName.trim(),
    };
    const nextErrors = validate(card);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    dispatch(
      setContact({
        customer: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        delivery: {
          address: form.address.trim(),
          city: form.city.trim(),
          region: form.region.trim(),
          postalCode: form.postalCode.trim(),
        },
        card,
      }),
    );

    try {
      await dispatch(createPendingTransaction()).unwrap();
      navigate('/summary');
    } catch {
      /* the failure is surfaced from the store state */
    }
  };

  const brand = detectBrand(form.number);

  return (
    <Frame step={2}>
      <h1 className="title">Payment details</h1>
      <p className="subtitle">Enter your card and delivery information.</p>

      <form className="stack" onSubmit={submit} noValidate>
        <Field
          label="Full name"
          name="fullName"
          autoComplete="name"
          value={form.fullName}
          onChange={update('fullName')}
          error={errors.fullName}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />
        <Field
          label="Phone"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={update('phone')}
          error={errors.phone}
        />

        <Field
          label="Card number"
          name="number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={form.number}
          onChange={update('number')}
          error={errors.number}
          adornment={form.number.length > 0 ? <CardBadge brand={brand} /> : undefined}
        />

        <div className="grid-2">
          <Field
            label="Expiry month"
            name="expMonth"
            inputMode="numeric"
            placeholder="08"
            maxLength={2}
            value={form.expMonth}
            onChange={update('expMonth')}
            error={errors.expMonth}
          />
          <Field
            label="Expiry year"
            name="expYear"
            inputMode="numeric"
            placeholder="28"
            maxLength={2}
            value={form.expYear}
            onChange={update('expYear')}
            error={errors.expYear}
          />
        </div>
        <Field
          label="CVC"
          name="cvc"
          inputMode="numeric"
          placeholder="123"
          maxLength={4}
          value={form.cvc}
          onChange={update('cvc')}
          error={errors.cvc}
        />

        <Field
          label="Address"
          name="address"
          autoComplete="street-address"
          value={form.address}
          onChange={update('address')}
          error={errors.address}
        />
        <div className="grid-2">
          <Field
            label="City"
            name="city"
            value={form.city}
            onChange={update('city')}
            error={errors.city}
          />
          <Field
            label="Region"
            name="region"
            value={form.region}
            onChange={update('region')}
            error={errors.region}
          />
        </div>
        <Field
          label="Postal code"
          name="postalCode"
          inputMode="numeric"
          value={form.postalCode}
          onChange={update('postalCode')}
          error={errors.postalCode}
        />

        {apiError && <div className="alert">{apiError}</div>}

        <Button type="submit" block loading={status === 'creating'}>
          Review order
        </Button>
      </form>
    </Frame>
  );
};
