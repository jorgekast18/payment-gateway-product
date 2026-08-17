import { Route, Routes } from 'react-router-dom';
import { ProductPage } from './pages/ProductPage';
import { CardDeliveryPage } from './pages/CardDeliveryPage';
import { SummaryPage } from './pages/SummaryPage';
import { StatusPage } from './pages/StatusPage';

export const App = () => (
  <Routes>
    <Route path="/" element={<ProductPage />} />
    <Route path="/checkout" element={<CardDeliveryPage />} />
    <Route path="/summary" element={<SummaryPage />} />
    <Route path="/status" element={<StatusPage />} />
    <Route path="*" element={<ProductPage />} />
  </Routes>
);
