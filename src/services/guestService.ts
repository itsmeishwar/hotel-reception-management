export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  verified: boolean;
  status: 'active' | 'pending' | 'inactive';
  lastStay?: string;
  bookings: number;
}

export interface GuestStats {
  totalGuests: number;
  activeGuests: number;
  verified: number;
  pendingVerification: number;
}

// Mock Data
let mockGuests: Guest[] = [
  { 
    id: 'G001', 
    name: 'Rajesh Sharma', 
    email: 'rajesh@example.com', 
    phone: '+91 9876543210', 
    country: 'India', 
    verified: true, 
    status: 'active',
    bookings: 5,
    lastStay: '2026-01-05'
  },
  { 
    id: 'G002', 
    name: 'Priya Patel', 
    email: 'priya@example.com', 
    phone: '+91 9876543211', 
    country: 'India', 
    verified: false, 
    status: 'pending',
    bookings: 2,
    lastStay: '2025-12-25'
  },
  {
    id: 'G003',
    name: 'Amit Kumar',
    email: 'amit@example.com',
    phone: '+91 9876543212',
    country: 'India',
    verified: true,
    status: 'active',
    bookings: 1,
    lastStay: '2025-11-15'
  }
];

export const fetchGuests = async (): Promise<Guest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockGuests]), 500);
  });
};

export const fetchGuestStats = async (): Promise<GuestStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalGuests: mockGuests.length,
        activeGuests: mockGuests.filter(g => g.status === 'active').length,
        verified: mockGuests.filter(g => g.verified).length,
        pendingVerification: mockGuests.filter(g => !g.verified).length
      });
    }, 500);
  });
};

export const createGuest = async (data: Omit<Guest, 'id' | 'bookings'>): Promise<Guest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGuest: Guest = {
        ...data,
        id: `G${String(mockGuests.length + 1).padStart(3, '0')}`,
        bookings: 0
      };
      mockGuests = [newGuest, ...mockGuests];
      resolve(newGuest);
    }, 500);
  });
};

export const updateGuest = async (id: string, data: Partial<Guest>): Promise<Guest> => {
    return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockGuests.findIndex(g => g.id === id);
      if (index === -1) {
        reject(new Error('Guest not found'));
        return;
      }
      
      const updatedGuest = { ...mockGuests[index], ...data };
      mockGuests[index] = updatedGuest;
      resolve(updatedGuest);
    }, 500);
  });
};

export const deleteGuest = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockGuests = mockGuests.filter(g => g.id !== id);
      resolve();
    }, 500);
  });
};