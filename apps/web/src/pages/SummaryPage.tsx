import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { payTransaction } from '../features/checkout/checkoutSlice';
import { formatCurrency } from '../domain/money';
import { Frame } from '../components/Frame';
import { Backdrop } from '../components/Backdrop';
import { Button } from '../components/Button';
import { imageForProduct } from '../assets/products';

export const SummaryPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { product, transaction, card, status, error } = useAppSelector((state) => state.checkout);

  if (!product || !transaction) {
    return <Navigate to="/" replace />;
  }

  const pay = async (): Promise<void> => {
    try {
      await dispatch(payTransaction()).unwrap();
      navigate('/status');
    } catch {
      /* the failure is surfaced from the store state */
    }
  };

  return (
    <Frame step={3}>
      <h1 className="title">Order summary</h1>
      <p className="subtitle">
        {product.name} × {transaction.quantity}
      </p>
      <img
        className="product__image"
        src={imageForProduct(product.id, product.imageUrl)}
        alt={product.name}
        loading="lazy"
        width={460}
        height={460}
      />

      <Backdrop>
        <h2 className="title" style={{ fontSize: '1.1rem' }}>
          Payment
        </h2>
        <div className="summary__line">
          <span>Product ({transaction.quantity})</span>
          <span>{formatCurrency(transaction.productAmountInCents)}</span>
        </div>
        <div className="summary__line">
          <span>Base fee</span>
          <span>{formatCurrency(transaction.baseFeeInCents)}</span>
        </div>
        <div className="summary__line">
          <span>Delivery fee</span>
          <span>{formatCurrency(transaction.deliveryFeeInCents)}</span>
        </div>
        <div className="summary__total">
          <span>Total</span>
          <span>{formatCurrency(transaction.amountInCents)}</span>
        </div>

        {!card && (
          <div className="alert">For your security, please re-enter your card details.</div>
        )}
        {error && <div className="alert">{error}</div>}

        {card ? (
          <Button block loading={status === 'paying'} onClick={pay}>
            Pay {formatCurrency(transaction.amountInCents)}
          </Button>
        ) : (
          <Button block variant="ghost" onClick={() => navigate('/checkout')}>
            Back to payment details
          </Button>
        )}
      </Backdrop>
    </Frame>
  );
};
