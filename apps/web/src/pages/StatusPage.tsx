import { Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { resetCheckout } from '../features/checkout/checkoutSlice';
import { fetchProducts } from '../features/products/productsSlice';
import { formatCurrency } from '../domain/money';
import { Frame } from '../components/Frame';
import { Button } from '../components/Button';

const OUTCOME = {
  APPROVED: { icon: '✓', title: 'Payment approved', detail: 'Your order is confirmed and on its way.' },
  DECLINED: { icon: '✕', title: 'Payment declined', detail: 'Your card was declined. Please try another card.' },
  ERROR: { icon: '!', title: 'Payment failed', detail: 'We could not process your payment. No charge was made.' },
} as const;

export const StatusPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const transaction = useAppSelector((state) => state.checkout.transaction);

  if (!transaction || transaction.status === 'PENDING') {
    return <Navigate to="/" replace />;
  }

  const outcome = OUTCOME[transaction.status];

  const backToStore = (): void => {
    dispatch(resetCheckout());
    void dispatch(fetchProducts());
    navigate('/');
  };

  return (
    <Frame step={4}>
      <div className={`status status--${transaction.status}`}>
        <div className="status__icon" aria-hidden="true">
          {outcome.icon}
        </div>
        <h1 className="status__title">{outcome.title}</h1>
        <p className="status__detail">{outcome.detail}</p>
        <p className="status__detail">Reference: {transaction.reference}</p>
        {transaction.cardBrand && (
          <p className="status__detail">
            {transaction.cardBrand} •••• {transaction.cardLastFour}
          </p>
        )}
        <p className="status__detail">Total: {formatCurrency(transaction.amountInCents)}</p>
      </div>
      {transaction.status === 'APPROVED' ? (
        <Button block onClick={backToStore}>
          Back to store
        </Button>
      ) : (
        <div className="stack">
          <Button block onClick={() => navigate('/checkout')}>
            Try again
          </Button>
          <Button block variant="ghost" onClick={backToStore}>
            Back to store
          </Button>
        </div>
      )}
    </Frame>
  );
};
