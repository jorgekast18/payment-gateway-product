import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProducts } from '../features/products/productsSlice';
import { selectProduct } from '../features/checkout/checkoutSlice';
import { formatCurrency } from '../domain/money';
import { Frame } from '../components/Frame';
import { Button } from '../components/Button';
import { imageForProduct } from '../assets/products';

export const ProductPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, status } = useAppSelector((state) => state.products);
  const [index, setIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    void dispatch(fetchProducts());
  }, [dispatch]);

  const product = items[index];
  const maxQuantity = product ? Math.min(product.stock, 10) : 1;

  const select = (nextIndex: number): void => {
    setIndex(nextIndex);
    setQuantity(1);
  };

  const proceed = (): void => {
    if (!product) {
      return;
    }
    dispatch(selectProduct({ product, quantity }));
    navigate('/checkout');
  };

  return (
    <Frame step={1}>
      {status === 'loading' && <p className="center-muted">Loading products…</p>}
      {status === 'error' && <div className="alert">We could not load the store products.</div>}

      {product && (
        <>
          {items.length > 1 && (
            <div className="thumbs" role="tablist">
              {items.map((item, itemIndex) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={itemIndex === index}
                  className={`thumb${itemIndex === index ? ' thumb--active' : ''}`}
                  onClick={() => select(itemIndex)}
                >
                  <img
                    src={imageForProduct(item.id, item.imageUrl)}
                    alt={item.name}
                    loading="lazy"
                    width={56}
                    height={56}
                  />
                </button>
              ))}
            </div>
          )}

          <img
            className="product__image"
            src={imageForProduct(product.id, product.imageUrl)}
            alt={product.name}
            loading="lazy"
            width={460}
            height={460}
          />
          <h1 className="product__name">{product.name}</h1>
          <p className="product__description">{product.description}</p>

          <div className="row-between">
            <span className="price">{formatCurrency(product.priceInCents)}</span>
            <span className={`stock${product.stock === 0 ? ' stock--out' : ''}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="row-between" style={{ marginTop: 20 }}>
            <span className="field__label">Quantity</span>
            <div className="qty">
              <button
                type="button"
                className="qty__btn"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <span className="qty__value" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="qty__btn"
                aria-label="Increase quantity"
                disabled={quantity >= maxQuantity}
                onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <Button block disabled={product.stock === 0} onClick={proceed}>
              Pay with credit card
            </Button>
          </div>
        </>
      )}
    </Frame>
  );
};
