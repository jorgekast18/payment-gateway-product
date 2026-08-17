import { ReactNode } from 'react';
import { Steps } from './Steps';

interface FrameProps {
  step: number;
  children: ReactNode;
}

export const Frame = ({ step, children }: FrameProps) => (
  <div className="app-shell">
    <aside className="brand-aside" aria-hidden="true">
      <div className="brand-aside__logo">
        Pay<span>Gate</span> Store
      </div>
      <h2 className="brand-aside__headline">Secure checkout, in seconds.</h2>
      <p className="brand-aside__text">
        Pay by card with confidence. Your progress is saved and your data stays protected end to
        end.
      </p>
    </aside>
    <div className="frame">
      <header className="frame__header">
        <div className="frame__brand">
          Pay<span>Gate</span> Store
        </div>
        <Steps current={step} />
      </header>
      <div className="frame__body">{children}</div>
    </div>
  </div>
);
