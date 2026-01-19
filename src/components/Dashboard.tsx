import { useState, useEffect } from 'react';
import { 
  BedDouble, 
  Users, 
  DollarSign, 
  CalendarCheck, 
  CalendarX, 
  TrendingUp,
  CheckCircle,
  Sparkles,
  ArrowUpRight,
  X,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  LogIn,
  LogOut,
  Search,
  Eye,
  Loader
} from 'lucide-react';
import { 
  fetchBookings, 
  createBooking, 
  updateBooking, 
  deleteBooking, 
  updateBookingStatus, 
  fetchBookingStats 
} from '../services/bookingService';
import { fetchBillingStats } from '../services/billingService';
import type { Booking, BookingStats } from '../services/bookingService';

// Types for Dashboard
type ModalType = 'none' | 'newBooking' | 'checkIn' | 'checkOut' | 'addGuest' | 'viewBooking' | 'editBooking';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<{ totalRevenue: number } | null>(null);

  const [newBookingForm, setNewBookingForm] = useState({
    guestName: '',
    phone: '',
    email: '',
    room: '', 
    checkIn: '',
    checkOut: '',
    amount: '',
  });

  const [newGuestForm, setNewGuestForm] = useState({
    name: '',
    phone: '',
    email: '',
    idType: 'Aadhar',
    idNumber: '',
    address: '',
  });

  // Available rooms for booking (Mock)
  const availableRooms = ['101', '102', '110', '203', '205', '301', '308', '401', '405'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsData, bStats, rStats] = await Promise.all([
        fetchBookings(),
        fetchBookingStats(),
        fetchBillingStats()
      ]);
      setBookings(bookingsData);
      setBookingStats(bStats);
      setRevenueStats({ totalRevenue: rStats.totalRevenue });
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreateBooking = async () => {
    if (!newBookingForm.guestName || !newBookingForm.room || !newBookingForm.checkIn || !newBookingForm.checkOut) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      const newBooking: Booking = {
        id: '', // Service generates ID
        guestId: `G${Math.floor(Math.random() * 1000)}`, // Mock guest ID generation
        guestName: newBookingForm.guestName,
        roomId: newBookingForm.room,
        room: `Room ${newBookingForm.room}`,
        checkIn: newBookingForm.checkIn,
        checkOut: newBookingForm.checkOut,
        nights: Math.ceil((new Date(newBookingForm.checkOut).getTime() - new Date(newBookingForm.checkIn).getTime()) / (1000 * 3600 * 24)),
        status: 'pending',
        amount: newBookingForm.amount || '0',
        payment: 'pending'
      };
      
      await createBooking(newBooking);
      await loadDashboardData();
      setNewBookingForm({ guestName: '', phone: '', email: '', room: '', checkIn: '', checkOut: '', amount: '' });
      setActiveModal('none');
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking");
    }
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      await updateBooking(selectedBooking.id, selectedBooking);
      await loadDashboardData();
      setSelectedBooking(null);
      setActiveModal('none');
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(id);
        await loadDashboardData();
      } catch (error) {
         console.error("Error deleting booking:", error);
         alert("Failed to delete booking");
      }
    }
  };

  const handleConfirmBooking = async (id: string) => {
    try {
      await updateBookingStatus(id, 'confirmed');
      await loadDashboardData();
    } catch (error) {
      console.error("Error confirming booking:", error);
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await updateBookingStatus(id, 'cancelled');
      await loadDashboardData();
    } catch (error) {
       console.error("Error cancelling booking:", error);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await updateBookingStatus(id, 'checked-in');
      alert(`Guest for booking ${id} has been checked in successfully!`);
      await loadDashboardData();
      setActiveModal('none');
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await updateBookingStatus(id, 'checked-out');
      alert(`Guest for booking ${id} has been checked out successfully!`);
      await loadDashboardData();
      setActiveModal('none');
    } catch (error) {
      console.error("Error checking out:", error);
    }
  };

  const handleAddGuest = () => {
    if (!newGuestForm.name || !newGuestForm.phone) {
      alert('Please fill all required fields');
      return;
    }
    // In a real app, this would call guestService.createGuest
    alert(`Guest ${newGuestForm.name} has been added successfully!`);
    setNewGuestForm({ name: '', phone: '', email: '', idType: 'Aadhar', idNumber: '', address: '' });
    setActiveModal('none');
  };

  // Filter bookings for check-in/check-out
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const checkedInBookings = bookings.filter(b => b.status === 'checked-in');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Derived Statistics from real data
  const roomStats = {
    total: 50, // Mock total
    occupied: bookings.filter(b => b.status === 'checked-in').length,
    available: 50 - bookings.filter(b => b.status === 'checked-in').length,
    cleaning: 3, // Mock
    occupancyRate: Math.round((bookings.filter(b => b.status === 'checked-in').length / 50) * 100)
  };

  // Today's activity (Mock/Derived logic)
  const todayActivity = {
    checkIns: bookings.filter(b => b.status === 'checked-in').length,
    checkOuts: bookings.filter(b => b.status === 'checked-out').length,
    newBookings: bookingStats?.totalBookings || 0,
    cancellations: bookings.filter(b => b.status === 'cancelled').length
  };

  // Recent bookings display list
  const recentBookingsList = bookings;

  // Today's check-ins (Mock data for now, ideally filter from bookings where checkIn date is today)
  // For demo, we just show pending/confirmed bookings as "Check-ins"
  const todayCheckIns = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in').slice(0, 4);
  const todayCheckOuts = bookings.filter(b => b.status === 'checked-out' || (b.status === 'checked-in' && b.checkOut === new Date().toISOString().split('T')[0])).slice(0, 3);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'checked-in': return 'bg-blue-100 text-blue-700';
      case 'checked-out': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader size={32} className="text-[#FF8C42] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full overflow-y-auto">
      {/* Welcome Banner */}
      <div className="bg-linear-to-br from-[#FF8C42] to-[#FF6B35] rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm mb-1">{formatDate(currentTime)}</p>
              <h2 className="text-2xl font-bold mb-2">Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋</h2>
              <p className="text-white/90">Here's what's happening at Dreams Hotel today</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatTime(currentTime)}</div>
              <div className="flex items-center gap-2 mt-2 bg-white/20 rounded-lg px-3 py-1.5">
                <Sparkles size={16} />
                <span className="text-sm font-medium">{roomStats.occupancyRate}% Occupancy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Available Rooms */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Available Rooms</p>
              <p className="text-3xl font-bold text-gray-900">{roomStats.available}</p>
              <p className="text-xs text-gray-400 mt-1">of {roomStats.total} total rooms</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <BedDouble size={24} className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-full">{roomStats.available} Available</span>
            <span className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full">{roomStats.cleaning} Cleaning</span>
          </div>
        </div>

        {/* Occupied Rooms */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Occupied Rooms</p>
              <p className="text-3xl font-bold text-gray-900">{roomStats.occupied}</p>
              <p className="text-xs text-gray-400 mt-1">{roomStats.occupancyRate}% occupancy rate</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${roomStats.occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Today's Check-ins */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Today's Check-ins</p>
              <p className="text-3xl font-bold text-gray-900">{todayActivity.checkIns}</p>
              <p className="text-xs text-gray-400 mt-1">{todayActivity.checkOuts} check-outs</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <CalendarCheck size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <ArrowUpRight size={14} className="text-green-500" />
            <span className="text-xs text-green-600 font-medium">+{todayActivity.newBookings} new bookings</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Today's Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹{(revenueStats?.totalRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Growth: +15%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <DollarSign size={24} className="text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-xs text-green-600 font-medium">+15.5% vs last month</span>
          </div>
        </div>
      </div>

      {/* Room Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={24} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-green-700">{roomStats.available}</p>
              <p className="text-sm text-green-600">Available</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users size={24} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-blue-700">{roomStats.occupied}</p>
              <p className="text-sm text-blue-600">Occupied</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles size={24} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-orange-700">{roomStats.cleaning}</p>
              <p className="text-sm text-orange-600">Cleaning</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <BedDouble size={24} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-700">{roomStats.total}</p>
              <p className="text-sm text-gray-600">Total Rooms</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveModal('newBooking')}
              className="w-full py-3 px-4 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              New Booking
            </button>
            <button 
              onClick={() => setActiveModal('checkIn')}
              className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              Check-in Guest
            </button>
            <button 
              onClick={() => setActiveModal('checkOut')}
              className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Check-out Guest
            </button>
            <button 
              onClick={() => setActiveModal('addGuest')}
              className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              Add Guest
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl">
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <button 
                onClick={() => setActiveModal('newBooking')}
                className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 font-medium flex items-center gap-1"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Guest</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Room</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Check-in</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Amount</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookingsList
                  .filter(b => b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {booking.guestName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{booking.guestName}</p>
                          <p className="text-xs text-gray-400">{booking.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-900 font-medium">
                        {typeof booking.room === 'string' ? booking.room : booking.room.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">{booking.amount}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => { setSelectedBooking(booking); setActiveModal('viewBooking'); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedBooking(booking); setActiveModal('editBooking'); }}
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="space-y-5">
          {/* Check-ins */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-green-500" />
                <h3 className="font-semibold text-gray-900">Today's Check-ins</h3>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {todayCheckIns.length} guests
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {todayCheckIns.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-medium text-sm">{item.guestName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.guestName}</p>
                      <p className="text-xs text-gray-400">Room {typeof item.room === 'string' ? item.room : item.room.name}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              ))}
              {todayCheckIns.length === 0 && <p className="p-4 text-sm text-gray-500 text-center">No check-ins today</p>}
            </div>
          </div>

          {/* Check-outs */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CalendarX size={18} className="text-orange-500" />
                <h3 className="font-semibold text-gray-900">Today's Check-outs</h3>
              </div>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                {todayCheckOuts.length} guests
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {todayCheckOuts.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-700 font-medium text-sm">{item.guestName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.guestName}</p>
                      <p className="text-xs text-gray-400">Room {typeof item.room === 'string' ? item.room : item.room.name}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              ))}
              {todayCheckOuts.length === 0 && <p className="p-4 text-sm text-gray-500 text-center">No check-outs today</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            
            {/* New Booking Modal */}
            {activeModal === 'newBooking' && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Create New Booking</h3>
                  <button onClick={() => setActiveModal('none')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                    <input
                      type="text"
                      value={newBookingForm.guestName}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, guestName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="Enter guest name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newBookingForm.phone}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newBookingForm.email}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="guest@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
                    <select
                      value={newBookingForm.room}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, room: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      <option value="">Select a room</option>
                      {availableRooms.map(room => (
                        <option key={room} value={room}>Room {room}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date *</label>
                      <input
                        type="date"
                        value={newBookingForm.checkIn}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, checkIn: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date *</label>
                      <input
                        type="date"
                        value={newBookingForm.checkOut}
                        onChange={(e) => setNewBookingForm({ ...newBookingForm, checkOut: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input
                      type="number"
                      value={newBookingForm.amount}
                      onChange={(e) => setNewBookingForm({ ...newBookingForm, amount: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100">
                  <button
                    onClick={() => setActiveModal('none')}
                    className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBooking}
                    className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                  >
                    Create Booking
                  </button>
                </div>
              </>
            )}

            {/* View Booking Modal */}
            {activeModal === 'viewBooking' && selectedBooking && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                  <button onClick={() => { setActiveModal('none'); setSelectedBooking(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="w-14 h-14 bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedBooking.guestName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedBooking.guestName}</h4>
                      <p className="text-sm text-gray-500">{selectedBooking.id}</p>
                    </div>
                    <span className={`ml-auto text-xs px-3 py-1 rounded-full font-medium capitalize ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Room</p>
                      <p className="font-semibold text-gray-900">{typeof selectedBooking.room === 'string' ? selectedBooking.room : selectedBooking.room.name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="font-semibold text-gray-900">{selectedBooking.amount}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Check-in</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Check-out</p>
                      <p className="font-semibold text-gray-900">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100">
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => { handleConfirmBooking(selectedBooking.id); setActiveModal('none'); setSelectedBooking(null); }}
                      className="flex-1 py-2.5 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                    >
                      Confirm Booking
                    </button>
                  )}
                  {selectedBooking.status !== 'cancelled' && (
                    <button
                      onClick={() => { handleCancelBooking(selectedBooking.id); setActiveModal('none'); setSelectedBooking(null); }}
                      className="flex-1 py-2.5 px-4 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50"
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button
                    onClick={() => setActiveModal('editBooking')}
                    className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                  >
                    Edit
                  </button>
                </div>
              </>
            )}

            {/* Edit Booking Modal */}
            {activeModal === 'editBooking' && selectedBooking && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Booking</h3>
                  <button onClick={() => { setActiveModal('none'); setSelectedBooking(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={selectedBooking.guestName}
                      onChange={(e) => setSelectedBooking({ ...selectedBooking, guestName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <select
                      value={typeof selectedBooking.room === 'string' ? selectedBooking.roomId : selectedBooking.room.id}
                      onChange={(e) => setSelectedBooking({ ...selectedBooking, room: `Room ${e.target.value}`, roomId: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    >
                      {availableRooms.map(room => (
                        <option key={room} value={room}>Room {room}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                      <input
                        type="date"
                        value={selectedBooking.checkIn}
                        onChange={(e) => setSelectedBooking({ ...selectedBooking, checkIn: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                      <input
                        type="date"
                        value={selectedBooking.checkOut}
                        onChange={(e) => setSelectedBooking({ ...selectedBooking, checkOut: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                      <input
                        type="text"
                        value={selectedBooking.amount}
                        onChange={(e) => setSelectedBooking({ ...selectedBooking, amount: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={selectedBooking.status}
                        onChange={(e) => setSelectedBooking({ ...selectedBooking, status: e.target.value as Booking['status'] })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="checked-in">Checked In</option>
                        <option value="checked-out">Checked Out</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100">
                  <button
                    onClick={() => { setActiveModal('none'); setSelectedBooking(null); }}
                    className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateBooking}
                    className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}

            {/* Check-in Modal */}
            {activeModal === 'checkIn' && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Guest Check-in</h3>
                  <button onClick={() => setActiveModal('none')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-4">Select a booking to check-in the guest:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {confirmedBookings.length === 0 ? (
                      <p className="text-center text-gray-400 py-8">No confirmed bookings available for check-in</p>
                    ) : (
                      confirmedBookings.map(booking => (
                        <div
                          key={booking.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-colors"
                          onClick={() => handleCheckIn(booking.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-700 font-medium">{booking.guestName.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{booking.guestName}</p>
                                <p className="text-xs text-gray-500">Room {typeof booking.room === 'string' ? booking.room : booking.room.name}</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{booking.checkIn}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Check-out Modal */}
            {activeModal === 'checkOut' && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Guest Check-out</h3>
                  <button onClick={() => setActiveModal('none')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-sm text-gray-500 mb-4">Select a booking to check-out the guest:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {checkedInBookings.length === 0 ? (
                      <p className="text-center text-gray-400 py-8">No guests currently checked in</p>
                    ) : (
                      checkedInBookings.map(booking => (
                        <div
                          key={booking.id}
                          className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-colors"
                          onClick={() => handleCheckOut(booking.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-700 font-medium">{booking.guestName.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{booking.guestName}</p>
                                <p className="text-xs text-gray-500">Room {typeof booking.room === 'string' ? booking.room : booking.room.name}</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{booking.checkOut}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Add Guest Modal */}
            {activeModal === 'addGuest' && (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Guest</h3>
                  <button onClick={() => setActiveModal('none')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={newGuestForm.name}
                      onChange={(e) => setNewGuestForm({ ...newGuestForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="Enter guest name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={newGuestForm.phone}
                        onChange={(e) => setNewGuestForm({ ...newGuestForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newGuestForm.email}
                        onChange={(e) => setNewGuestForm({ ...newGuestForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="guest@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                      <select
                        value={newGuestForm.idType}
                        onChange={(e) => setNewGuestForm({ ...newGuestForm, idType: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="Aadhar">Aadhar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Voter ID">Voter ID</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                      <input
                        type="text"
                        value={newGuestForm.idNumber}
                        onChange={(e) => setNewGuestForm({ ...newGuestForm, idNumber: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        placeholder="XXXX XXXX XXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={newGuestForm.address}
                      onChange={(e) => setNewGuestForm({ ...newGuestForm, address: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      rows={3}
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
                <div className="flex gap-3 p-5 border-t border-gray-100">
                  <button
                    onClick={() => setActiveModal('none')}
                    className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGuest}
                    className="flex-1 py-2.5 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                  >
                    Add Guest
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

export default Dashboard;
