import { fetchRoomStats } from './roomService';
import { fetchBookingStats } from './bookingService';

export interface DashboardStats {
    newBooking: number;
    booked: number;
    checkIn: number;
    checkOut: number;
    availableRooms: number;
    totalRooms: number;
    soldOutRooms: number;
    occupiedRooms: number;
    cleanRooms: number;
    dirtyRooms: number;
    inspectedRooms: number;
    occupancyRate: number;
}

export interface OccupancyData {
    month: string;
    rate: number;
}

// Mock occupancy data for the chart
const mockOccupancyData: OccupancyData[] = [
    { month: 'May', rate: 60 },
    { month: 'Jun', rate: 70 },
    { month: 'Jul', rate: 50 },
    { month: 'Aug', rate: 80 },
    { month: 'Sep', rate: 65 },
    { month: 'Oct', rate: 75 },
    { month: 'Nov', rate: 70 },
    { month: 'Dec', rate: 85 },
    { month: 'Jan', rate: 55 },
    { month: 'Feb', rate: 65 },
    { month: 'Mar', rate: 70 },
];

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
    const [roomStats, bookingStats] = await Promise.all([
        fetchRoomStats(),
        fetchBookingStats(),
    ]);

    // Calculate stats
    const totalRooms = 2000; // Total hotel capacity
    const availableRooms = roomStats.available * 174; // Scale up for demo
    const occupiedRooms = roomStats.occupied * 118; // Scale up for demo
    const cleanRooms = Math.floor(availableRooms * 0.25);
    const dirtyRooms = Math.floor(occupiedRooms * 0.63);
    const inspectedRooms = Math.floor(availableRooms * 0.07);
    const soldOutRooms = totalRooms - availableRooms;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

    return {
        newBooking: 872,
        booked: 480,
        checkIn: bookingStats.checkedIn * 48 + 97,
        checkOut: 40,
        availableRooms,
        totalRooms,
        soldOutRooms,
        occupiedRooms,
        cleanRooms,
        dirtyRooms,
        inspectedRooms,
        occupancyRate,
    };
};

export const fetchOccupancyData = async (): Promise<OccupancyData[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockOccupancyData), 300);
    });
};
