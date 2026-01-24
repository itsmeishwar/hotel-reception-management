export interface Payment {
  id: string;
  guestId: string;
  guestName: string;
  amount: number;
  method: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
  invoiceId?: string;
  notes?: string;
}

// Mock Data
let mockPayments: Payment[] = [
  {
    id: 'PAY-001',
    guestId: 'G001',
    guestName: 'Rajesh Sharma',
    amount: 5310,
    method: 'Credit Card',
    date: '2026-01-03',
    status: 'Paid',
    invoiceId: 'INV-001',
    notes: 'Full payment for stay'
  },
  {
    id: 'PAY-002',
    guestId: 'G002',
    guestName: 'Priya Singh',
    amount: 2500,
    method: 'Cash',
    date: '2026-01-05',
    status: 'Pending',
    invoiceId: 'INV-002',
    notes: 'Advance payment'
  }
];

export async function fetchPayments(): Promise<Payment[]> {
  // Simulate API delay
  return new Promise(resolve => setTimeout(() => resolve([...mockPayments]), 500));
}

export async function createPayment(payment: Payment): Promise<Payment> {
  mockPayments.push(payment);
  return new Promise(resolve => setTimeout(() => resolve(payment), 300));
}

export async function updatePayment(id: string, updated: Partial<Payment>): Promise<Payment | null> {
  const idx = mockPayments.findIndex(p => p.id === id);
  if (idx === -1) return null;
  mockPayments[idx] = { ...mockPayments[idx], ...updated };
  return new Promise(resolve => setTimeout(() => resolve(mockPayments[idx]), 300));
}

export async function deletePayment(id: string): Promise<boolean> {
  const idx = mockPayments.findIndex(p => p.id === id);
  if (idx === -1) return false;
  mockPayments.splice(idx, 1);
  return new Promise(resolve => setTimeout(() => resolve(true), 300));
}
