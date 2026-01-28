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
  },
  {
    id: 'BK003',
    guestId: 'G003',
    guestName: 'John Smith',
    roomId: '304',
    room: '304 - Executive',
    checkIn: '2026-01-10',
    checkInTime: '12:00',
    checkOut: '2026-01-12',
    checkOutTime: '11:00',
    nights: 2,
    status: 'checked-in',
    amount: '500',
    payment: 'paid'
  },
  {
    id: 'BK004',
    guestId: 'G004',
    guestName: 'Sarah Johnson',
    roomId: '102',
    room: '102 - Deluxe',
    checkIn: '2026-01-12',
    checkInTime: '14:30',
    checkOut: '2026-01-15',
    checkOutTime: '10:30',
    nights: 3,
    status: 'confirmed',
    amount: '350',
    payment: 'partial'
  },
  {
    id: 'BK005',
    guestId: 'G005',
    guestName: 'Michael Brown',
    roomId: '501',
    room: '501 - Presidential Suite',
    checkIn: '2026-01-20',
    checkInTime: '16:00',
    checkOut: '2026-01-25',
    checkOutTime: '12:00',
    nights: 5,
    status: 'pending',
    amount: '2500',
    payment: 'pending'
  },
  {
    id: 'BK006',
    guestId: 'G006',
    guestName: 'Emma Davis',
    roomId: '201',
    room: '201 - Suite',
    checkIn: '2026-01-18',
    checkInTime: '13:00',
    checkOut: '2026-01-19',
    checkOutTime: '11:00',
    nights: 1,
    status: 'cancelled',
    amount: '200',
    payment: 'refunded'
  },
  {
    id: 'BK007',
    guestId: 'G007',
    guestName: 'David Wilson',
    roomId: '305',
    room: '305 - Executive',
    checkIn: '2026-01-22',
    checkInTime: '14:00',
    checkOut: '2026-01-26',
    checkOutTime: '11:00',
    nights: 4,
    status: 'checked-out',
    amount: '800',
    payment: 'paid'
  },
  {
    id: 'BK008',
    guestId: 'G008',
    guestName: 'Lisa Anderson',
    roomId: '105',
    room: '105 - Deluxe',
    checkIn: '2026-01-28',
    checkInTime: '15:00',
    checkOut: '2026-01-30',
    checkOutTime: '10:00',
    nights: 2,
    status: 'confirmed',
    amount: '220',
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