import aurora from './aurora.svg';
import nimbus from './nimbus.svg';
import pulse from './pulse.svg';
import terra from './terra.svg';

const productImages: Record<string, string> = {
  '6f9d1c2a-1f3b-4a7e-9c11-000000000001': aurora,
  '6f9d1c2a-1f3b-4a7e-9c11-000000000002': nimbus,
  '6f9d1c2a-1f3b-4a7e-9c11-000000000003': pulse,
  '6f9d1c2a-1f3b-4a7e-9c11-000000000004': terra,
};

export const imageForProduct = (productId: string, fallback: string): string =>
  productImages[productId] ?? fallback;
