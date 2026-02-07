import { useState, useEffect } from 'react';
import {
    Users,
    LogIn,
    LogOut,
    Bed,
    Clock,
    Search,
    CheckCircle,
    XCircle,
    Loader,
    Calendar,
    Phone,
    Mail,
    MapPin,
} from 'lucide-react';
import { fetchBookings, updateBookingStatus, type Booking } from '../services/bookingService';
import { fetchRooms, fetchRoomStats, type Room, type RoomStats } from '../services/roomService';
import { fetchGuests, type Guest } from '../services/guestService';

const FrontDesk = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomStats, setRoomStats] = useState<RoomStats | null>(null);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'arrivals' | 'departures'>('arrivals');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [bookingsData, roomsData, statsData, guestsData] = await Promise.all([
                fetchBookings(),
                fetchRooms(),
                fetchRoomStats(),
                fetchGuests(),
            ]);
            setBookings(bookingsData);
            setRooms(roomsData);
            setRoomStats(statsData);
            setGuests(guestsData);
        } catch (error) {
            console.error('Failed to load front desk data', error);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    // Filter today's arrivals (check-in date is today and status is confirmed or pending)
    const todayArrivals = bookings.filter(
        (b) => b.checkIn === today && (b.status === 'confirmed' || b.status === 'pending')
    );

    // Filter today's departures (check-out date is today and status is checked-in)
    const todayDepartures = bookings.filter(
        (b) => b.checkOut === today && b.status === 'checked-in'
    );

    const handleCheckIn = async (bookingId: string) => {
        try {
            await updateBookingStatus(bookingId, 'checked-in');
            await loadData();
        } catch (error) {
            console.error('Failed to check in', error);
        }
    };

    const handleCheckOut = async (bookingId: string) => {
        try {
            await updateBookingStatus(bookingId, 'checked-out');
            await loadData();
        } catch (error) {
            console.error('Failed to check out', error);
        }
    };

    const StatCard = ({ title, value, icon: Icon, bgColor, textColor }: any) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${bgColor}`}>
                    <Icon size={24} className={textColor} />
                </div>
            </div>
        </div>
    );

    const BookingCard = ({ booking, type }: { booking: Booking; type: 'arrival' | 'departure' }) => {
        const guest = guests.find((g) => g.id === booking.guestId);

        return (
            <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{booking.guestName}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Bed size={14} />
                            <span>{typeof booking.room === 'string' ? booking.room : booking.room.name}</span>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.payment === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : booking.payment === 'partial'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                        }`}>
                        {booking.payment}
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    {guest?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            <span>{guest.phone}</span>
                        </div>
                    )}
                    {guest?.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            <span>{guest.email}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>
                            {type === 'arrival'
                                ? `Check-in: ${booking.checkInTime || '14:00'}`
                                : `Check-out: ${booking.checkOutTime || '11:00'}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        <span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                    </div>
                </div>

                {type === 'arrival' ? (
                    <button
                        onClick={() => handleCheckIn(booking.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <LogIn size={18} />
                        Check In
                    </button>
                ) : (
                    <button
                        onClick={() => handleCheckOut(booking.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        <LogOut size={18} />
                        Check Out
                    </button>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader size={32} className="text-orange-500 animate-spin" />
            </div>
        );
    }
// return value
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Front Desk</h1>
                <p className="text-gray-500">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Today's Arrivals"
                    value={todayArrivals.length}
                    icon={LogIn}
                    bgColor="bg-green-100"
                    textColor="text-green-600"
                />
                <StatCard
                    title="Today's Departures"
                    value={todayDepartures.length}
                    icon={LogOut}
                    bgColor="bg-orange-100"
                    textColor="text-orange-600"
                />
                <StatCard
                    title="Available Rooms"
                    value={roomStats?.available || 0}
                    icon={Bed}
                    bgColor="bg-blue-100"
                    textColor="text-blue-600"
                />
                <StatCard
                    title="Occupied Rooms"
                    value={roomStats?.occupied || 0}
                    icon={Users}
                    bgColor="bg-purple-100"
                    textColor="text-purple-600"
                />
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search guests, bookings, or rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setSelectedTab('arrivals')}
                        className={`px-6 py-3 font-medium transition-colors relative ${selectedTab === 'arrivals'
                                ? 'text-orange-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Today's Arrivals ({todayArrivals.length})
                        {selectedTab === 'arrivals' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setSelectedTab('departures')}
                        className={`px-6 py-3 font-medium transition-colors relative ${selectedTab === 'departures'
                                ? 'text-orange-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Today's Departures ({todayDepartures.length})
                        {selectedTab === 'departures' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedTab === 'arrivals' ? (
                    todayArrivals.length > 0 ? (
                        todayArrivals.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} type="arrival" />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <CheckCircle size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No arrivals scheduled for today</p>
                        </div>
                    )
                ) : (
                    todayDepartures.length > 0 ? (
                        todayDepartures.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} type="departure" />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <CheckCircle size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No departures scheduled for today</p>
                        </div>
                    )
                )}
            </div>

            {/* Room Status Overview */}
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{roomStats?.available || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Available</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{roomStats?.occupied || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Occupied</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{roomStats?.cleaning || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Cleaning</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{roomStats?.maintenance || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Maintenance</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrontDesk;
