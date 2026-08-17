import { ReactNode } from 'react';
import { Steps } from './Steps';

interface FrameProps {
  step: number;
  children: ReactNode;
}

export const Frame = ({ step, children }: FrameProps) => (
  <div className="app-shell">
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
