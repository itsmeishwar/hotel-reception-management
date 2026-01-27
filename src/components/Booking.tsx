import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  X,
  Loader,
  AlertCircle,
  Trash2,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
  Download,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  fetchBookings,
  fetchBookingStats,
  createBooking,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  updatePaymentStatus,
} from "../services/bookingService";
import type { Booking } from "../services/bookingService";

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState([
    { label: "Total Bookings", value: "0", color: "bg-gradient-to-br from-blue-500 to-blue-600", icon: TrendingUp, change: "+12%" },
    { label: "Checked In", value: "0", color: "bg-gradient-to-br from-green-500 to-green-600", icon: Users, change: "+5%" },
    { label: "Pending", value: "0", color: "bg-gradient-to-br from-yellow-500 to-yellow-600", icon: Clock, change: "-3%" },
    { label: "Revenue Today", value: "$0", color: "bg-gradient-to-br from-purple-500 to-purple-600", icon: DollarSign, change: "+18%" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [statusChangeBooking, setStatusChangeBooking] = useState<Booking | null>(null);
  const [paymentChangeBooking, setPaymentChangeBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<{
    id: string;
    guestId: string;
    guestName: string;
    roomId: string;
    room: string;
    checkIn: string;
    checkInTime: string;
    checkOut: string;
    checkOutTime: string;
    nights: number;
    status: "confirmed" | "checked-in" | "pending" | "checked-out" | "cancelled";
    amount: string;
    payment: "paid" | "partial" | "pending" | "refunded";
  }>({
    id: "",
    guestId: "",
    guestName: "",
    roomId: "",
    room: "",
    checkIn: "",
    checkInTime: "14:00",
    checkOut: "",
    checkOutTime: "11:00",
    nights: 1,
    status: "pending",
    amount: "",
    payment: "pending",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookingData, statsData] = await Promise.all([
        fetchBookings(),
        fetchBookingStats(),
      ]);

      setBookings(bookingData);
      setFilteredBookings(bookingData);

      setStats([
        {
          label: "Total Bookings",
          value: statsData.totalBookings.toString(),
          color: "bg-gradient-to-br from-blue-500 to-blue-600",
          icon: TrendingUp,
          change: "+12%"
        },
        {
          label: "Checked In",
          value: statsData.checkedIn.toString(),
          color: "bg-gradient-to-br from-green-500 to-green-600",
          icon: Users,
          change: "+5%"
        },
        {
          label: "Pending",
          value: statsData.pending.toString(),
          color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
          icon: Clock,
          change: "-3%"
        },
        {
          label: "Revenue Today",
          value: `$${statsData.revenueToday.toLocaleString()}`,
          color: "bg-gradient-to-br from-purple-500 to-purple-600",
          icon: DollarSign,
          change: "+18%"
        },
      ]);
    } catch (err) {
      console.error("Error loading booking data:", err);
      setError("Failed to load booking data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookingData();
  }, []);

  useEffect(() => {
    let result = [...bookings];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (booking) =>
          booking.id.toLowerCase().includes(query) ||
          booking.guestName.toLowerCase().includes(query) ||
          (typeof booking.room === 'string' ? booking.room : booking.room.name).toLowerCase().includes(query)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((booking) => booking.status === statusFilter);
    }
    setFilteredBookings(result);
  }, [bookings, searchQuery, statusFilter]);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setFormData((prev) => ({ ...prev, nights: diffDays }));
      }
    }
  }, [formData.checkIn, formData.checkOut]);

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      id: booking.id,
      guestId: booking.guestId,
      guestName: booking.guestName,
      roomId: booking.roomId,
      room: typeof booking.room === 'object' ? booking.room.id : booking.room,
      checkIn: booking.checkIn,
      checkInTime: booking.checkInTime || "14:00",
      checkOut: booking.checkOut,
      checkOutTime: booking.checkOutTime || "11:00",
      nights: booking.nights,
      status: booking.status,
      amount: booking.amount,
      payment: booking.payment,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const openViewModal = (booking: Booking) => {
    setViewingBooking(booking);
    setIsViewModalOpen(true);
  };

  const openStatusModal = (booking: Booking) => {
    setStatusChangeBooking(booking);
    setIsStatusModalOpen(true);
  };

  const openPaymentModal = (booking: Booking) => {
    setPaymentChangeBooking(booking);
    setIsPaymentModalOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "nights" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingBooking) {
        await updateBooking(editingBooking.id, {
          guestId: formData.guestId,
          guestName: formData.guestName,
          roomId: formData.roomId,
          room: formData.room,
          checkIn: formData.checkIn,
          checkInTime: formData.checkInTime,
          checkOut: formData.checkOut,
          checkOutTime: formData.checkOutTime,
          nights: formData.nights,
          status: formData.status,
          amount: formData.amount,
          payment: formData.payment,
        });
      } else {
        await createBooking({
          id: formData.id,
          guestId: formData.guestId,
          guestName: formData.guestName,
          roomId: formData.roomId,
          room: formData.room,
          checkIn: formData.checkIn,
          checkInTime: formData.checkInTime,
          checkOut: formData.checkOut,
          checkOutTime: formData.checkOutTime,
          nights: formData.nights,
          status: formData.status,
          amount: formData.amount,
          payment: formData.payment,
        });
      }
      await loadBookingData();
      closeModal();
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        editingBooking ? "Failed to update booking" : "Failed to create booking"
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteClick = (bookingId: string) => {
    setDeletingBookingId(bookingId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBookingId) return;
    try {
      setFormSubmitting(true);
      await deleteBooking(deletingBookingId);
      await loadBookingData();
      setIsDeleteConfirmOpen(false);
      setDeletingBookingId(null);
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "confirmed" | "checked-in" | "pending" | "checked-out" | "cancelled"
  ) => {
    if (!statusChangeBooking) return;
    try {
      setFormSubmitting(true);
      await updateBookingStatus(statusChangeBooking.id, newStatus);
      await loadBookingData();
      setIsStatusModalOpen(false);
      setStatusChangeBooking(null);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update booking status");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handlePaymentChange = async (
    newPayment: "paid" | "partial" | "pending" | "refunded"
  ) => {
    if (!paymentChangeBooking) return;
    try {
      setFormSubmitting(true);
      await updatePaymentStatus(paymentChangeBooking.id, newPayment);
      await loadBookingData();
      setIsPaymentModalOpen(false);
      setPaymentChangeBooking(null);
    } catch (err) {
      console.error("Error updating payment:", err);
      setError("Failed to update payment status");
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200";
      case "checked-in":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200";
      case "pending":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200";
      case "checked-out":
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200";
      case "cancelled":
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getPaymentColor = (payment: string) => {
    switch (payment) {
      case "paid":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200";
      case "partial":
        return "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200";
      case "pending":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200";
      case "refunded":
        return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
            <p className="text-gray-600 mt-2">Manage all hotel bookings and reservations in one place</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              New Booking
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#FF8C42]/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#FF8C42] rounded-full animate-spin border-t-transparent"></div>
            <Loader size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#FF8C42]" />
          </div>
          <span className="mt-4 text-gray-600 font-medium">Loading booking data...</span>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
        </div>
      ) : (
        <>
          {/* Stats Grid - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                    <stat.icon size={24} className="text-white" />
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    stat.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <span>Updated just now</span>
                    <ChevronRight size={12} className="ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Filters and Search Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 relative max-w-xl">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search bookings by guest name, ID, or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 focus:border-[#FF8C42] bg-white shadow-sm"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked-in">Checked In</option>
                      <option value="pending">Pending</option>
                      <option value="checked-out">Checked Out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors hover:border-gray-400"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Bookings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredBookings.length} {filteredBookings.length === 1 ? "booking" : "bookings"} found
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Today: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            {filteredBookings.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No bookings match your current filters. Try adjusting your search criteria or create a new booking.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create New Booking
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      {[
                        "Booking ID",
                        "Guest",
                        "Room",
                        "Check In",
                        "Check Out",
                        "Nights",
                        "Amount",
                        "Status",
                        "Payment",
                        "Actions"
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                              <Calendar size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {booking.id}
                              </div>
                              <div className="text-xs text-gray-500">
                                Created today
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF6B35] flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                              {booking.guestName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {booking.guestName}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {booking.guestId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-xl">
                            <div className="text-sm font-medium text-gray-900">
                              {typeof booking.room === 'object' ? booking.room.id : booking.room}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {booking.checkIn}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.checkInTime || "14:00"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {booking.checkOut}
                          </div>
                          <div className="text-xs text-gray-500">
                            {booking.checkOutTime || "11:00"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm font-medium">
                            {booking.nights} night{booking.nights !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] bg-clip-text text-transparent">
                            Rs{booking.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openStatusModal(booking)}
                            className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            <span className="capitalize">{booking.status.replace('-', ' ')}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openPaymentModal(booking)}
                            className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm ${getPaymentColor(
                              booking.payment
                            )}`}
                          >
                            <span className="capitalize">{booking.payment}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openViewModal(booking)}
                              className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => openEditModal(booking)}
                              className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-xl transition-all"
                              title="Edit Booking"
                            >
                              <Edit size={18} />
                            </button>
                            {booking.status === "pending" && (
                              <button
                                onClick={() => {
                                  setStatusChangeBooking(booking);
                                  handleStatusChange("confirmed");
                                }}
                                className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-xl transition-all"
                                title="Confirm Booking"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {booking.status !== "cancelled" &&
                              booking.status !== "checked-out" && (
                                <button
                                  onClick={() => {
                                    setStatusChangeBooking(booking);
                                    handleStatusChange("cancelled");
                                  }}
                                  className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all"
                                  title="Cancel Booking"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                            <button
                              onClick={() => handleDeleteClick(booking.id)}
                              className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all"
                              title="Delete Booking"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Modal - Enhanced */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingBooking ? "Edit Booking" : "Create New Booking"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingBooking ? "Update booking details" : "Fill in the details to create a new booking"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {!editingBooking && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Booking ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleFormChange}
                    placeholder="e.g., BK001"
                    required
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Guest ID", name: "guestId", placeholder: "e.g., G001" },
                  { label: "Guest Name", name: "guestName", placeholder: "John Anderson" },
                  { label: "Room ID", name: "roomId", placeholder: "e.g., 101" },
                  { label: "Room Description", name: "room", placeholder: "101 - Deluxe Suite" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleFormChange}
                      placeholder={field.placeholder}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 focus:border-[#FF8C42]"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check In Details
                  </label>
                  <div className="space-y-3">
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30"
                    />
                    <input
                      type="time"
                      name="checkInTime"
                      value={formData.checkInTime}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check Out Details
                  </label>
                  <div className="space-y-3">
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30"
                    />
                    <input
                      type="time"
                      name="checkOutTime"
                      value={formData.checkOutTime}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Stay Details
                  </label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      name="nights"
                      value={formData.nights}
                      onChange={handleFormChange}
                      min="1"
                      required
                      className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    />
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      placeholder=""
                      required
                      className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-2xl">
                  <label className="block text-sm font-semibold text-purple-700 mb-2">
                    Status & Payment
                  </label>
                  <div className="space-y-3">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked-in">Checked In</option>
                      <option value="checked-out">Checked Out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      name="payment"
                      value={formData.payment}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    >
                      <option value="pending">Pending</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : editingBooking ? (
                    "Update Booking"
                  ) : (
                    "Create Booking"
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal - Detailed Booking View */}
      {isViewModalOpen && viewingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl my-8">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Booking #{viewingBooking.id}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(viewingBooking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(viewingBooking.status)}`}>
                  {viewingBooking.status}
                </span>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-8 py-4 border-b border-gray-200 flex gap-6">
              {['General', 'Chats', 'Activity log', 'Changes'].map((tab) => (
                <button key={tab} className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  tab === 'General' 
                    ? 'text-blue-600 border-blue-600' 
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Origin & Guest */}
              <div className="space-y-6">
                {/* Origin */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Origin</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="text-sm font-medium text-gray-900">{viewingBooking.guestName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Source</p>
                      <p className="text-sm font-medium text-gray-900">Online</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Company</p>
                      <p className="text-sm font-medium text-gray-900">-----</p>
                    </div>
                  </div>
                </div>

                {/* Guest */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Guest</h3>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {viewingBooking.guestName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{viewingBooking.guestName}</p>
                      <p className="text-xs text-gray-500">{viewingBooking.guestId}</p>
                    </div>
                    <button className="p-1 hover:bg-white rounded-lg transition-colors">
                      <Plus size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Middle Column - Details */}
              <div className="space-y-6">
                {/* Details */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Check-in</p>
                      <p className="text-sm font-medium text-gray-900">{viewingBooking.checkIn}</p>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Check-out</p>
                      <p className="text-sm font-medium text-gray-900">{viewingBooking.checkOut}</p>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Nights</p>
                      <p className="text-sm font-medium text-gray-900">{viewingBooking.nights.toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Payment info</h3>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <Plus size={16} className="text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center justify-center h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                        💳
                      </div>
                      <p className="text-xs text-gray-500">Card Payment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Balance & Comments */}
              <div className="space-y-6">
                {/* Balance */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Balance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">${parseFloat(viewingBooking.amount).toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Paid</p>
                      <p className="text-sm font-medium text-gray-900">$200</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Balance</p>
                      <p className="text-sm font-medium text-gray-900">$40</p>
                    </div>
                  </div>
                </div>

                {/* Comments and Notes */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Comments and notes</h3>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <Plus size={16} className="text-gray-400" />
                    </button>
                  </div>
                  <textarea
                    placeholder="Add notes about this booking..."
                    className="w-full h-24 p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="px-8 py-6 border-t border-gray-200 flex gap-3 justify-center">
              <button
                onClick={() => {
                  openEditModal(viewingBooking);
                  setIsViewModalOpen(false);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                Save changes
              </button>
            </div>

            {/* Accommodations Table */}
            <div className="px-8 py-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Accommodations</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Adult</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Children</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Room type</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Room</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Board</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Room rate</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Cancellation policy</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Price</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2].map((idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-4 text-gray-900">{viewingBooking.checkIn}</td>
                        <td className="px-4 py-4 text-gray-900">2</td>
                        <td className="px-4 py-4 text-gray-900">1</td>
                        <td className="px-4 py-4 text-gray-900">Double room</td>
                        <td className="px-4 py-4 text-gray-900">301</td>
                        <td className="px-4 py-4 text-gray-900">No meals</td>
                        <td className="px-4 py-4 text-gray-900">Filly Hotel</td>
                        <td className="px-4 py-4 text-gray-900">Filly Hotel</td>
                        <td className="px-4 py-4">
                          <span className="text-gray-900 font-medium">$240</span>
                          <button className="text-blue-600 hover:text-blue-700 ml-1">↗</button>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-900 font-medium">$40</span>
                          <button className="text-blue-600 hover:text-blue-700 ml-1">↗</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Enhanced */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle size={28} className="text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Booking</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this booking? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={formSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setDeletingBookingId(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal - Enhanced */}
      {isStatusModalOpen && statusChangeBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-6 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-blue-900">Change Booking Status</h3>
              <p className="text-blue-700/80 text-sm mt-1">{statusChangeBooking.id}</p>
            </div>
            
            <div className="p-6 space-y-2">
              {(
                [
                  "pending",
                  "confirmed",
                  "checked-in",
                  "checked-out",
                  "cancelled",
                ] as const
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={formSubmitting}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left capitalize transition-all flex items-center gap-3 ${
                    statusChangeBooking.status === status
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                      : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:shadow-sm"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    statusChangeBooking.status === status ? 'bg-white/20' : 'bg-white'
                  }`}>
                    {status === "confirmed" && <CheckCircle size={16} />}
                    {status === "checked-in" && <Users size={16} />}
                    {status === "pending" && <Clock size={16} />}
                    {status === "checked-out" && <Calendar size={16} />}
                    {status === "cancelled" && <XCircle size={16} />}
                  </div>
                  <span>{status.replace("-", " ")}</span>
                </button>
              ))}
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setStatusChangeBooking(null);
                }}
                className="w-full px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal - Enhanced */}
      {isPaymentModalOpen && paymentChangeBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-50 to-green-100 px-8 py-6 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-green-900">Change Payment Status</h3>
              <p className="text-green-700/80 text-sm mt-1">{paymentChangeBooking.id}</p>
            </div>
            
            <div className="p-6 space-y-2">
              {(["pending", "partial", "paid", "refunded"] as const).map(
                (payment) => (
                  <button
                    key={payment}
                    onClick={() => handlePaymentChange(payment)}
                    disabled={formSubmitting}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left capitalize transition-all flex items-center gap-3 ${
                      paymentChangeBooking.payment === payment
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm"
                        : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      paymentChangeBooking.payment === payment ? 'bg-white/20' : 'bg-white'
                    }`}>
                      {payment === "paid" && <DollarSign size={16} />}
                      {payment === "partial" && <DollarSign size={16} />}
                      {payment === "pending" && <Clock size={16} />}
                      {payment === "refunded" && <DollarSign size={16} />}
                    </div>
                    <span>{payment}</span>
                  </button>
                )
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setPaymentChangeBooking(null);
                }}
                className="w-full px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;