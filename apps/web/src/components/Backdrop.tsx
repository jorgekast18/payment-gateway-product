import { ReactNode } from 'react';

export const Backdrop = ({ children }: { children: ReactNode }) => (
  <div className="backdrop" role="dialog" aria-modal="true">
    <div className="backdrop__sheet">{children}</div>
  </div>
);
