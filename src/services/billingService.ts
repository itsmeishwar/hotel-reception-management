export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  bookingId: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number; // calculated as subtotal + taxAmount - discount
  paidAmount: number;
  balanceDue: number; // totalAmount - paidAmount
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';
  currency: string;
  notes?: string;
  history?: {
    date: string;
    action: string;
    description?: string;
    amount?: number;
  }[];
}

export interface BillingStats {
  totalRevenue: number;
  pendingPayments: number;
  paidInvoices: number;
  overdueInvoices: number;
}

// Mock Data
let mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    bookingId: 'BK001',
    guestId: 'G001',
    guestName: 'Rajesh Sharma',
    roomNumber: '101',
    issueDate: '2026-01-02',
    dueDate: '2026-01-03',
    items: [
      { description: 'Room Charge (2 Nights)', quantity: 2, unitPrice: 2000, amount: 4000 },
      { description: 'Room Service', quantity: 1, unitPrice: 500, amount: 500 }
    ],
    subtotal: 4500,
    taxRate: 18,
    taxAmount: 810,
    discount: 0,
    totalAmount: 5310,
    paidAmount: 5310,
    balanceDue: 0,
    status: 'paid',
    currency: 'INR',
  },
  {
    id: 'INV-002',
    bookingId: 'BK002',
    guestId: 'G002',
    guestName: 'Priya Patel',
    roomNumber: '205',
    issueDate: '2026-01-05',
    dueDate: '2026-01-05',
    items: [
      { description: 'Room Charge (4 Nights)', quantity: 4, unitPrice: 2000, amount: 8000 },
      { description: 'Laundry', quantity: 2, unitPrice: 450, amount: 900 }
    ],
    subtotal: 8900,
    taxRate: 18,
    taxAmount: 1602,
    discount: 500,
    totalAmount: 10002,
    paidAmount: 0,
    balanceDue: 10002,
    status: 'sent',
    currency: 'INR',
  }
];

export const fetchInvoices = async (): Promise<Invoice[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockInvoices]), 500);
  });
};

export const fetchBillingStats = async (): Promise<BillingStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const totalRevenue = mockInvoices
        .filter(i => i.status === 'paid' || i.status === 'partial')
        .reduce((sum, i) => sum + i.paidAmount, 0);
      
      const pendingPayments = mockInvoices
        .filter(i => i.status !== 'paid' && i.status !== 'cancelled' && i.status !== 'refunded')
        .reduce((sum, i) => sum + i.balanceDue, 0);

      resolve({
        totalRevenue,
        pendingPayments,
        paidInvoices: mockInvoices.filter(i => i.status === 'paid').length,
        overdueInvoices: mockInvoices.filter(i => i.status === 'overdue').length,
      });
    }, 500);
  });
};

export const createInvoice = async (data: Omit<Invoice, 'id' | 'subtotal' | 'taxAmount' | 'totalAmount' | 'paidAmount' | 'balanceDue' | 'status'>): Promise<Invoice> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = (subtotal * data.taxRate) / 100;
      const totalAmount = subtotal + taxAmount - data.discount;
      
      const newInvoice: Invoice = {
        ...data,
        id: `INV-${String(mockInvoices.length + 1).padStart(3, '0')}`,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balanceDue: totalAmount,
        status: 'draft',
      };
      
      mockInvoices = [newInvoice, ...mockInvoices];
      resolve(newInvoice);
    }, 500);
  });
};

export const updateInvoice = async (id: string, data: Partial<Invoice>): Promise<Invoice> => {
   return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index === -1) {
        reject(new Error('Invoice not found'));
        return;
      }
      
      // Recalculate totals if items changed
      let updatedInvoice = { ...mockInvoices[index], ...data };
      if (data.items || data.taxRate !== undefined || data.discount !== undefined) {
         const items = data.items || updatedInvoice.items;
         const taxRate = data.taxRate !== undefined ? data.taxRate : updatedInvoice.taxRate;
         const discount = data.discount !== undefined ? data.discount : updatedInvoice.discount;
         
         const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
         const taxAmount = (subtotal * taxRate) / 100;
         const totalAmount = subtotal + taxAmount - discount;
         
         updatedInvoice = {
           ...updatedInvoice,
           items,
           subtotal,
           taxAmount,
           totalAmount,
           balanceDue: totalAmount - updatedInvoice.paidAmount 
         };
      }

      mockInvoices[index] = updatedInvoice;
      resolve(updatedInvoice);
    }, 500);
  });
};

export const deleteInvoice = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockInvoices = mockInvoices.filter(i => i.id !== id);
      resolve();
    }, 500);
  });
};

export const recordPayment = async (id: string, paymentData: { amount: number; paymentDate: string; paymentMethod: string; notes?: string }): Promise<Invoice> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockInvoices.findIndex(i => i.id === id);
       if (index === -1) {
        reject(new Error('Invoice not found'));
        return;
      }
      
      const invoice = mockInvoices[index];
      const newPaidAmount = invoice.paidAmount + paymentData.amount;
      const newBalanceDue = invoice.totalAmount - newPaidAmount;
      
      let newStatus: Invoice['status'] = invoice.status;
      if (newBalanceDue <= 0) newStatus = 'paid';
      else if (newPaidAmount > 0) newStatus = 'partial';
      
      const updatedInvoice = {
        ...invoice,
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus
      };
      
      mockInvoices[index] = updatedInvoice;
      resolve(updatedInvoice);
    }, 500);
  });
};

export const processRefund = async (id: string, amount: number): Promise<Invoice> => {
    return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockInvoices.findIndex(i => i.id === id);
       if (index === -1) {
        reject(new Error('Invoice not found'));
        return;
      }
      
      const invoice = mockInvoices[index];
      const newPaidAmount = invoice.paidAmount - amount;
      const newBalanceDue = invoice.totalAmount - newPaidAmount;
      
      const updatedInvoice: Invoice = {
        ...invoice,
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: 'refunded'
      };
      
      mockInvoices[index] = updatedInvoice;
      resolve(updatedInvoice);
    }, 500);
  });
};