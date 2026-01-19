import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  BedDouble, 
  Users, 
  CheckCircle,
  Wrench,
  X,
  Edit2,
  Trash2,
  Loader
} from 'lucide-react';
import { 
  fetchRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom, 
  fetchRoomStats 
} from '../services/roomService';
import type { Room, RoomStats } from '../services/roomService';

type ModalType = 'none' | 'add' | 'edit' | 'delete';

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<Partial<Room>>({
    number: '',
    type: 'Single',
    price: 0,
    status: 'Available',
    amenities: [],
    floor: '',
    lastCleaned: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, statsData] = await Promise.all([
        fetchRooms(),
        fetchRoomStats()
      ]);
      setRooms(roomsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load room data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (activeModal === 'add') {
        await createRoom(formData as Omit<Room, 'id'>);
      } else if (activeModal === 'edit' && selectedRoom) {
        await updateRoom(selectedRoom.id, formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error saving room:", error);
      alert("Failed to save room");
    }
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoom(selectedRoom.id);
      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room");
    }
  };

  const resetForm = () => {
    setActiveModal('none');
    setSelectedRoom(null);
    setFormData({
      number: '',
      type: 'Single',
      price: 0,
      status: 'Available',
      amenities: [],
      floor: ''
    });
  };

  const openEditModal = (room: Room) => {
    setSelectedRoom(room);
    setFormData(room);
    setActiveModal('edit');
  };

  const openDeleteModal = (room: Room) => {
    setSelectedRoom(room);
    setActiveModal('delete');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'Occupied': return 'bg-blue-100 text-blue-700';
      case 'Cleaning': return 'bg-orange-100 text-orange-700';
      case 'Maintenance': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesStatus = filterStatus === 'All' || room.status === filterStatus;
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          room.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-500">Manage room status, types, and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
            <Filter size={18} />
            Filter
          </button>
          <button 
            onClick={() => setActiveModal('add')}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} />
            Add Room
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Rooms</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalRooms || 0}</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <BedDouble className="text-gray-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats?.available || 0}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Occupied</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.occupied || 0}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Cleaning/Maint.</p>
            <p className="text-2xl font-bold text-orange-600">
              {(stats?.cleaning || 0) + (stats?.maintenance || 0)}
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <Wrench className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Filters & Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Available', 'Occupied', 'Cleaning', 'Maintenance'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  filterStatus === status 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full md:w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          {filteredRooms.map(room => (
            <div key={room.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1 bg-white shadow-xs rounded-lg p-1 border border-gray-100">
                    <button 
                        onClick={() => openEditModal(room)}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => openDeleteModal(room)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700 font-bold text-lg group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                  {room.number}
                </div>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">{room.type}</h3>
                <p className="text-sm text-gray-500">{room.floor} floor</p>
              </div>

              <div className="space-y-2 mb-4 h-16 overflow-hidden">
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 3).map((amenity, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      {amenity}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-lg font-bold text-gray-900">₹{room.price}</span>
                  <span className="text-xs text-gray-500">/night</span>
                </div>
                <button 
                    onClick={() => openEditModal(room)}
                    className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {activeModal === 'delete' ? (
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Room</h3>
                    <p className="text-gray-600 mb-6">Are you sure you want to delete Room {selectedRoom?.number}? This action cannot be undone.</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={resetForm}
                            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDelete}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ) : (
                <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {activeModal === 'add' ? 'Add New Room' : 'Edit Room'}
                    </h3>
                    <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                            <input
                                type="text"
                                value={formData.number}
                                onChange={(e) => setFormData({...formData, number: e.target.value})}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                placeholder="101"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as Room['status']})}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            >
                                <option value="Available">Available</option>
                                <option value="Occupied">Occupied</option>
                                <option value="Cleaning">Cleaning</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value as Room['type']})}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            >
                                <option value="Single">Single</option>
                                <option value="Double">Double</option>
                                <option value="Suite">Suite</option>
                                <option value="Deluxe">Deluxe</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                        <input
                            type="text"
                            value={formData.floor}
                            onChange={(e) => setFormData({...formData, floor: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            placeholder="e.g. 1st Floor"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
                        <textarea
                            value={formData.amenities?.join(', ')}
                            onChange={(e) => setFormData({...formData, amenities: e.target.value.split(',').map(s => s.trim())})}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            rows={3}
                            placeholder="Wifi, TV, AC..."
                        />
                    </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100">
                    <button
                        onClick={resetForm}
                        className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                    >
                        {activeModal === 'add' ? 'Create Room' : 'Save Changes'}
                    </button>
                </div>
                </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;