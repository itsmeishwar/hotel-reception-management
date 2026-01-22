export interface OrderItem {
  foodItemId: string;
  foodItemName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface CafeOrder {
  estimatedTime: any;
  priority: string;
  id: string;
  tableId?: string;
  tableNumber?: string;
  roomNumber?: string;
  customerName?: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  orderType: 'dine_in' | 'takeaway' | 'room_service';
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod?: 'cash' | 'card' | 'room_charge' | 'online';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: string;
  servedBy?: string;
}

export interface CafeStats {
  pendingOrders: number;
  preparingOrders: number;
  completedToday: number;
  todayRevenue: number;
}

// Mock Data
let mockOrders: CafeOrder[] = [
  {
    id: 'ORD001',
    tableId: 'T1',
    tableNumber: '1',
    items: [
      { foodItemId: 'F001', foodItemName: 'Paneer Butter Masala', quantity: 2, price: 350 },
      { foodItemId: 'F003', foodItemName: 'Butter Naan', quantity: 4, price: 60 }
    ],
    status: 'served',
    orderType: 'dine_in',
    paymentStatus: 'unpaid',
    subtotal: 940,
    tax: 122.2,
    discount: 0,
    total: 1062.2,
    createdAt: new Date().toISOString(),
    servedBy: 'Staff A'
  },
  {
    id: 'ORD002',
    roomNumber: '101',
    items: [
      { foodItemId: 'F002', foodItemName: 'Chicken Biryani', quantity: 1, price: 450 }
    ],
    status: 'preparing',
    orderType: 'room_service',
    paymentStatus: 'unpaid',
    subtotal: 450,
    tax: 58.5,
    discount: 0,
    total: 508.5,
    createdAt: new Date().toISOString(),
    servedBy: 'Staff B'
  },
  {
    id: 'ORD003',
    tableId: 'T2',
    tableNumber: '2',
    items: [
      { foodItemId: 'F004', foodItemName: 'Masala Tea', quantity: 2, price: 40 },
      { foodItemId: 'F005', foodItemName: 'Vegetable Samosa', quantity: 2, price: 30 }
    ],
    status: 'served',
    orderType: 'dine_in',
    paymentStatus: 'unpaid',
    subtotal: 140,
    tax: 18.2,
    discount: 0,
    total: 158.2,
    createdAt: new Date().toISOString(),
    servedBy: 'Staff C'
  }
];

export const fetchCafeOrders = async (): Promise<CafeOrder[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockOrders]), 500);
  });
};

export const fetchCafeStats = async (): Promise<CafeStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        pendingOrders: mockOrders.filter(o => o.status === 'pending').length,
        preparingOrders: mockOrders.filter(o => o.status === 'preparing').length,
        completedToday: mockOrders.filter(o => o.status === 'completed').length,
        todayRevenue: mockOrders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0)
      });
    }, 500);
  });
};

export const createCafeOrder = async (data: Omit<CafeOrder, 'id' | 'createdAt' | 'subtotal' | 'tax' | 'total'>): Promise<CafeOrder> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.13;
      const total = subtotal + tax - (data.discount || 0);
      
      const newOrder: CafeOrder = {
        ...data,
        id: `ORD${String(mockOrders.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        subtotal,
        tax,
        total,
      };
      mockOrders = [newOrder, ...mockOrders];
      resolve(newOrder);
    }, 500);
  });
};

export const updateOrderStatus = async (id: string, status: CafeOrder['status']): Promise<CafeOrder> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockOrders.findIndex(o => o.id === id);
      if (index === -1) {
        reject(new Error('Order not found'));
        return;
      }
      const updatedOrder = { ...mockOrders[index], status };
      mockOrders[index] = updatedOrder;
      resolve(updatedOrder);
    }, 500);
  });
};

export const deleteCafeOrder = async (id: string): Promise<void> => {
   return new Promise((resolve) => {
    setTimeout(() => {
      mockOrders = mockOrders.filter(o => o.id !== id);
      resolve();
    }, 500);
  });
};

export const processPayment = async (id: string, method: CafeOrder['paymentMethod']): Promise<CafeOrder> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
       const index = mockOrders.findIndex(o => o.id === id);
      if (index === -1) {
        reject(new Error('Order not found'));
        return;
      }
      const updatedOrder: CafeOrder = { 
        ...mockOrders[index], 
        paymentStatus: 'paid', 
        paymentMethod: method,
        status: 'completed'
      };
      mockOrders[index] = updatedOrder;
      resolve(updatedOrder);
    }, 500);
  });
};