export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export const TransactionStatus = {
  Pending: 'PENDING',
  Approved: 'APPROVED',
  Declined: 'DECLINED',
  Error: 'ERROR',
} as const;
