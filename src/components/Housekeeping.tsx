import { useState, useEffect } from 'react';
import {
    Hotel,
    CheckCircle,
    Clock,
    AlertTriangle,
    Users,
    Loader,
    Filter,
    Search,
    Sparkles,
    X,
} from 'lucide-react';
import { fetchRooms, updateRoom, type Room, fetchRoomStats, type RoomStats } from '../services/roomService';
import { fetchStaff, type Staff } from '../services/staffService';

const Housekeeping = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomStats, setRoomStats] = useState<RoomStats | null>(null);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFloor, setSelectedFloor] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [roomsData, statsData, staffData] = await Promise.all([
                fetchRooms(),
                fetchRoomStats(),
                fetchStaff(),
            ]);
            setRooms(roomsData);
            setRoomStats(statsData);
            // Filter only housekeeping staff
            setStaff(staffData.filter(s => s.role === 'Housekeeping'));
        } catch (error) {
            console.error('Failed to load housekeeping data', error);
        } finally {
            setLoading(false);
        }
    };

    const floors = ['All', ...Array.from(new Set(rooms.map(r => r.floor)))];

    const filteredRooms = rooms.filter(room => {
        const matchesFloor = selectedFloor === 'All' || room.floor === selectedFloor;
        const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFloor && matchesSearch;
    });

    const handleStatusUpdate = async (roomId: string, status: Room['status']) => {
        try {
            const updates: Partial<Room> = {
                status,
                lastCleaned: status === 'Available' ? new Date().toISOString() : undefined
            };
            await updateRoom(roomId, updates);
            await loadData();
        } catch (error) {
            console.error('Failed to update room status', error);
        }
    };

    const getStatusColor = (status: Room['status']) => {
        switch (status) {
            case 'Available':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Occupied':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Cleaning':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Maintenance':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: Room['status']) => {
        switch (status) {
            case 'Available':
                return <CheckCircle size={16} />;
            case 'Occupied':
                return <Users size={16} />;
            case 'Cleaning':
                return <Sparkles size={16} />;
            case 'Maintenance':
                return <AlertTriangle size={16} />;
            default:
                return <Hotel size={16} />;
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

    const RoomCard = ({ room }: { room: Room }) => {
        const timeSinceClean = room.lastCleaned
            ? Math.floor((Date.now() - new Date(room.lastCleaned).getTime()) / (1000 * 60 * 60))
            : null;

        return (
            <div className={`bg-white rounded-xl p-4 border-2 ${getStatusColor(room.status)} hover:shadow-lg transition-all cursor-pointer`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(room.status)}
                            <h4 className="font-bold text-lg text-gray-900">{room.number}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{room.type}</p>
                        <p className="text-xs text-gray-500 mt-1">Floor: {room.floor}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                        {room.status}
                    </div>
                </div>

                {timeSinceClean !== null && (
                    <div className="mb-3 text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        <span>Cleaned {timeSinceClean}h ago</span>
                    </div>
                )}

                <div className="flex gap-2">
                    {room.status !== 'Available' && (
                        <button
                            onClick={() => handleStatusUpdate(room.id, 'Available')}
                            className="flex-1 px-3 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                        >
                            <CheckCircle size={14} />
                            Clean
                        </button>
                    )}
                    {room.status !== 'Cleaning' && (
                        <button
                            onClick={() => handleStatusUpdate(room.id, 'Cleaning')}
                            className="flex-1 px-3 py-2 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1"
                        >
                            <Sparkles size={14} />
                            Cleaning
                        </button>
                    )}
                    {room.status !== 'Maintenance' && (
                        <button
                            onClick={() => handleStatusUpdate(room.id, 'Maintenance')}
                            className="flex-1 px-3 py-2 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                        >
                            <AlertTriangle size={14} />
                            Maintenance
                        </button>
                    )}
                </div>
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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Housekeeping Management</h1>
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
                    title="Needs Cleaning"
                    value={rooms.filter(r => r.status === 'Occupied').length}
                    icon={Hotel}
                    bgColor="bg-blue-100"
                    textColor="text-blue-600"
                />
                <StatCard
                    title="In Progress"
                    value={roomStats?.cleaning || 0}
                    icon={Sparkles}
                    bgColor="bg-yellow-100"
                    textColor="text-yellow-600"
                />
                <StatCard
                    title="Clean Rooms"
                    value={roomStats?.available || 0}
                    icon={CheckCircle}
                    bgColor="bg-green-100"
                    textColor="text-green-600"
                />
                <StatCard
                    title="Maintenance"
                    value={roomStats?.maintenance || 0}
                    icon={AlertTriangle}
                    bgColor="bg-red-100"
                    textColor="text-red-600"
                />
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                {/* Floor Filter */}
                <div className="flex gap-2 overflow-x-auto">
                    {floors.map(floor => (
                        <button
                            key={floor}
                            onClick={() => setSelectedFloor(floor)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedFloor === floor
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            <Filter size={16} className="inline mr-2" />
                            {floor}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search room number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {filteredRooms.map(room => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>

            {/* Housekeeping Staff Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users size={20} />
                    Housekeeping Staff ({staff.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.map(member => (
                        <div key={member.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                    <p className="text-sm text-gray-600">{member.shift} Shift</p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${member.status === 'Active'
                                        ? 'bg-green-100 text-green-700'
                                        : member.status === 'On Leave'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {member.status}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>{member.phone}</p>
                                <p>{member.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Housekeeping;
