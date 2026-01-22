export interface Room {
  id: string;
  number: string;
  type: 'Single' | 'Double' | 'Suite' | 'Deluxe';
  price: number; // Price per night
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';
  amenities: string[];
  floor: string;
  lastCleaned?: string;
}

export interface RoomStats {
  totalRooms: number;
  available: number;
  occupied: number;
  cleaning: number;
  maintenance: number;
}

let rooms: Room[] = [
  { id: '1', number: '101', type: 'Single', price: 100, status: 'Available', amenities: ['TV', 'WiFi', 'AC'], floor: '1st', lastCleaned: '2023-10-26 10:00' },
  { id: '2', number: '102', type: 'Double', price: 150, status: 'Occupied', amenities: ['TV', 'WiFi', 'AC', 'Mini Fridge'], floor: '1st', lastCleaned: '2023-10-25 14:00' },
  { id: '3', number: '201', type: 'Suite', price: 300, status: 'Available', amenities: ['TV', 'WiFi', 'AC', 'Mini Fridge', 'Balcony', 'Jacuzzi'], floor: '2nd', lastCleaned: '2023-10-26 09:00' },
  { id: '4', number: '202', type: 'Deluxe', price: 200, status: 'Cleaning', amenities: ['TV', 'WiFi', 'AC', 'Mini Fridge', 'Balcony'], floor: '2nd', lastCleaned: '2023-10-26 11:30' },
  { id: '5', number: '301', type: 'Single', price: 100, status: 'Maintenance', amenities: ['TV', 'WiFi', 'AC'], floor: '3rd', lastCleaned: '2023-10-20 10:00' },
];

export const fetchRooms = async (): Promise<Room[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...rooms]), 500);
  });
};

export const fetchRoomStats = async (): Promise<RoomStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalRooms: rooms.length,
        available: rooms.filter(r => r.status === 'Available').length,
        occupied: rooms.filter(r => r.status === 'Occupied').length,
        cleaning: rooms.filter(r => r.status === 'Cleaning').length,
        maintenance: rooms.filter(r => r.status === 'Maintenance').length,
      });
    }, 500);
  });
};

export const createRoom = async (room: Omit<Room, 'id'>): Promise<Room> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRoom = { ...room, id: Math.random().toString(36).substr(2, 9) };
      rooms = [newRoom, ...rooms];
      resolve(newRoom);
    }, 500);
  });
};

export const updateRoom = async (id: string, updates: Partial<Room>): Promise<Room> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = rooms.findIndex(r => r.id === id);
      if (index !== -1) {
        rooms[index] = { ...rooms[index], ...updates };
        resolve(rooms[index]);
      } else {
        reject(new Error('Room not found'));
      }
    }, 500);
  });
};

export const deleteRoom = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      rooms = rooms.filter(r => r.id !== id);
      resolve();
    }, 500);
  });
};
