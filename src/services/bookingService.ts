export interface Booking {
  id: string;
  guestId: string;
  guestName: string;
  roomId: string;
  room: string | { id: string; name: string };
  checkIn: string;
  checkInTime?: string;
  checkOut: string;
  checkOutTime?: string;
  nights: number;
  status: 'confirmed' | 'checked-in' | 'pending' | 'checked-out' | 'cancelled';
  amount: string;
  payment: 'paid' | 'partial' | 'pending' | 'refunded';
}

export interface BookingStats {
  totalBookings: number;
  checkedIn: number;
  pending: number;
  revenueToday: number;
}

// Mock Data
let mockBookings: Booking[] = [
  {
    id: 'BK001',
    guestId: 'G001',
    guestName: 'Rajesh Sharma',
    roomId: '101',
    room: '101 - Deluxe',
    checkIn: '2026-01-01',
    checkInTime: '14:00',
    checkOut: '2026-01-05',
    checkOutTime: '11:00',
    nights: 4,
    status: 'confirmed',
    amount: '40',
    payment: 'paid'
  },
  {
    id: 'BK002',
    guestId: 'G002',
    guestName: 'Priya Patel',
    roomId: '205',
    room: '205 - Suite',
    checkIn: '2026-01-05',
    checkInTime: '15:00',
    checkOut: '2026-01-08',
    checkOutTime: '10:00',
    nights: 3,
    status: 'pending',
    amount: '1200',
    payment: 'pending'
  }
];

export const fetchBookings = async (): Promise<Booking[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockBookings]), 500);
  });
};

export const fetchBookingById = async (id: string): Promise<Booking | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const booking = mockBookings.find(b => b.id === id);
      resolve(booking || null);
    }, 500);
  });
};

export const fetchBookingStats = async (): Promise<BookingStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalBookings: mockBookings.length,
        checkedIn: mockBookings.filter(b => b.status === 'checked-in').length,
        pending: mockBookings.filter(b => b.status === 'pending').length,
        revenueToday: 1500
      });
    }, 500);
  });
};

export const createBooking = async (data: Booking): Promise<Booking> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockBookings = [data, ...mockBookings];
      resolve(data);
    }, 500);
  });
};

export const updateBooking = async (id: string, data: Partial<Booking>): Promise<Booking> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockBookings.findIndex(b => b.id === id);
      if (index === -1) {
         reject(new Error('Booking not found'));
         return;
      }
      const updated = { ...mockBookings[index], ...data };
      mockBookings[index] = updated;
      resolve(updated);
    }, 500);
  });
};

export const deleteBooking = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockBookings = mockBookings.filter(b => b.id !== id);
      resolve();
    }, 500);
  });
};

export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<Booking> => {
  return updateBooking(id, { status });
};

export const updatePaymentStatus = async (id: string, payment: Booking['payment']): Promise<Booking> => {
  return updateBooking(id, { payment });
};