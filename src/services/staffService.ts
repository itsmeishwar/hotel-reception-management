export interface Staff {
  id: string;
  name: string;
  role: 'Manager' | 'Receptionist' | 'Housekeeping' | 'Chef' | 'Waiter' | 'Security';
  status: 'Active' | 'On Leave' | 'Inactive';
  phone: string;
  email: string;
  salary: number;
  shift: 'Morning' | 'Evening' | 'Night';
  dateJoined: string;
}

export interface StaffStats {
  totalStaff: number;
  active: number;
  onLeave: number;
  departments: Record<string, number>;
}

let staffMembers: Staff[] = [
  { id: '1', name: 'John Doe', role: 'Manager', status: 'Active', phone: '+91 9876543210', email: 'john@hotel.com', salary: 50000, shift: 'Morning', dateJoined: '2022-01-15' },
  { id: '2', name: 'Jane Smith', role: 'Receptionist', status: 'Active', phone: '+91 9876543211', email: 'jane@hotel.com', salary: 25000, shift: 'Morning', dateJoined: '2022-03-20' },
  { id: '3', name: 'Mike Johnson', role: 'Chef', status: 'Active', phone: '+91 9876543212', email: 'mike@hotel.com', salary: 35000, shift: 'Evening', dateJoined: '2022-02-10' },
  { id: '4', name: 'Sarah Wilson', role: 'Housekeeping', status: 'On Leave', phone: '+91 9876543213', email: 'sarah@hotel.com', salary: 15000, shift: 'Morning', dateJoined: '2022-05-15' },
  { id: '5', name: 'David Brown', role: 'Waiter', status: 'Active', phone: '+91 9876543214', email: 'david@hotel.com', salary: 18000, shift: 'Night', dateJoined: '2022-06-01' },
];

export const fetchStaff = async (): Promise<Staff[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...staffMembers]), 500);
  });
};

export const fetchStaffStats = async (): Promise<StaffStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const departments: Record<string, number> = {};
      staffMembers.forEach(s => {
        departments[s.role] = (departments[s.role] || 0) + 1;
      });

      resolve({
        totalStaff: staffMembers.length,
        active: staffMembers.filter(s => s.status === 'Active').length,
        onLeave: staffMembers.filter(s => s.status === 'On Leave').length,
        departments
      });
    }, 500);
  });
};

export const createStaff = async (staff: Omit<Staff, 'id'>): Promise<Staff> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newStaff = { ...staff, id: Math.random().toString(36).substr(2, 9) };
      staffMembers = [newStaff, ...staffMembers];
      resolve(newStaff);
    }, 500);
  });
};

export const updateStaff = async (id: string, updates: Partial<Staff>): Promise<Staff> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = staffMembers.findIndex(s => s.id === id);
      if (index !== -1) {
        staffMembers[index] = { ...staffMembers[index], ...updates };
        resolve(staffMembers[index]);
      } else {
        reject(new Error('Staff not found'));
      }
    }, 500);
  });
};

export const deleteStaff = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      staffMembers = staffMembers.filter(s => s.id !== id);
      resolve();
    }, 500);
  });
};
