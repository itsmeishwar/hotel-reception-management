import {
  Users,
  Search,
  Filter,
  Edit,
  AlertCircle,
  Loader,
  X,
  Trash2,
  Eye,
  Mail,
  Phone,
  Globe,
  Calendar,
  TrendingUp,
  UserPlus,
  Download,
  Star,
  ChevronRight,
  Clock,
  Shield,
  CreditCard,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  fetchGuests,
  fetchGuestStats,
  createGuest,
  updateGuest,
  deleteGuest,
} from "../services/guestService";
import type { Guest } from "../services/guestService";

const Guests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [stats, setStats] = useState([
    { 
      label: "Total Guests", 
      value: "0", 
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: Users,
      change: "+15%",
      description: "All time"
    },
    { 
      label: "Active Guests", 
      value: "0", 
      color: "bg-gradient-to-br from-green-500 to-green-600",
      icon: Users,
      change: "+8%",
      description: "Currently active"
    },
    { 
      label: "Verified", 
      value: "0", 
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      icon: Shield,
      change: "+22%",
      description: "Verified accounts"
    },
    { 
      label: "Pending Verification", 
      value: "0", 
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      icon: Clock,
      change: "-5%",
      description: "Awaiting verification"
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuestId, setDeletingGuestId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    country: string;
    verified: boolean;
    status: "active" | "pending" | "inactive";
    lastStay: string;
    loyaltyPoints: number;
    preferences: string[];
  }>({
    name: "",
    email: "",
    phone: "",
    country: "",
    verified: false,
    status: "pending",
    lastStay: "",
    loyaltyPoints: 0,
    preferences: [],
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const loadGuestData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [guestData, statsData] = await Promise.all([
        fetchGuests(),
        fetchGuestStats(),
      ]);

      setGuests(guestData);
      setFilteredGuests(guestData);

      setStats([
        {
          label: "Total Guests",
          value: statsData.totalGuests.toString(),
          color: "bg-gradient-to-br from-blue-500 to-blue-600",
          icon: Users,
          change: "+15%",
          description: "All time"
        },
        {
          label: "Active Guests",
          value: statsData.activeGuests.toString(),
          color: "bg-gradient-to-br from-green-500 to-green-600",
          icon: Users,
          change: "+8%",
          description: "Currently active"
        },
        {
          label: "Verified",
          value: statsData.verified.toString(),
          color: "bg-gradient-to-br from-purple-500 to-purple-600",
          icon: Shield,
          change: "+22%",
          description: "Verified accounts"
        },
        {
          label: "Pending Verification",
          value: statsData.pendingVerification.toString(),
          color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
          icon: Clock,
          change: "-5%",
          description: "Awaiting verification"
        },
      ]);
    } catch (err) {
      console.error("Error loading guest data:", err);
      setError("Failed to load guest data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuestData();
  }, []);

  // Filter guests when filters change
  useEffect(() => {
    let result = [...guests];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (guest) =>
          (guest.name?.toLowerCase() || '').includes(query) ||
          (guest.email?.toLowerCase() || '').includes(query) ||
          (guest.phone?.toLowerCase() || '').includes(query) ||
          (guest.id?.toLowerCase() || '').includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((guest) => guest.status === statusFilter);
    }

    if (verificationFilter !== "all") {
      const isVerified = verificationFilter === "verified";
      result = result.filter((guest) => guest.verified === isVerified);
    }

    // Tab filtering
    if (activeTab === "vip") {
      result = result.filter(guest => guest.loyaltyPoints >= 1000);
    } else if (activeTab === "frequent") {
      result = result.filter(guest => guest.bookings >= 3);
    }

    setFilteredGuests(result);
  }, [guests, searchQuery, statusFilter, verificationFilter, activeTab]);

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name || "",
      email: guest.email || "",
      phone: guest.phone || "",
      country: guest.country || "",
      verified: guest.verified || false,
      status: guest.status || "pending",
      lastStay: guest.lastStay || "",
      loyaltyPoints: guest.loyaltyPoints || 0,
      preferences: guest.preferences || [],
    });
    setIsModalOpen(true);
  };

  const openViewModal = (guest: Guest) => {
    setViewingGuest(guest);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuest(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingGuest) {
        await updateGuest(editingGuest.id, {
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone,
          country: formData.country,
          verified: formData.verified,
          status: formData.status,
          lastStay: formData.lastStay || null,
          loyaltyPoints: formData.loyaltyPoints,
          preferences: formData.preferences,
        });
      } else {
        await createGuest({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone,
          country: formData.country,
          verified: formData.verified,
          status: formData.status,
          lastStay: formData.lastStay || null,
          loyaltyPoints: formData.loyaltyPoints,
          preferences: formData.preferences,
        });
      }

      await loadGuestData();
      closeModal();
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        editingGuest ? "Failed to update guest" : "Failed to create guest"
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteClick = (guestId: string) => {
    setDeletingGuestId(guestId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingGuestId) return;

    try {
      setFormSubmitting(true);
      await deleteGuest(deletingGuestId);
      await loadGuestData();
      setIsDeleteConfirmOpen(false);
      setDeletingGuestId(null);
    } catch (err) {
      console.error("Error deleting guest:", err);
      setError("Failed to delete guest");
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200";
      case "pending":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200";
      case "inactive":
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getVerificationStatus = (verified: boolean) => {
    return verified ? (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200">
        <Shield size={14} />
        Verified
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200">
        <Clock size={14} />
        Pending
      </span>
    );
  };

  const getLoyaltyBadge = (points: number) => {
    if (points >= 1000) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200">
          <Star size={12} />
          VIP
        </span>
      );
    } else if (points >= 500) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
          <Star size={12} />
          Gold
        </span>
      );
    } else if (points >= 100) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200">
          <Star size={12} />
          Silver
        </span>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
            <p className="text-gray-600 mt-2">Manage guest profiles, preferences, and loyalty programs</p>
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
              <UserPlus size={18} />
              Add Guest
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
          <span className="mt-4 text-gray-600 font-medium">Loading guest data...</span>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
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
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Tabs and Filters Header */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-1">
                  {["all", "vip", "frequent", "verified"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeTab === tab
                          ? "bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {tab === "all" && "All Guests"}
                      {tab === "vip" && "VIP Guests"}
                      {tab === "frequent" && "Frequent Visitors"}
                      {tab === "verified" && "Verified"}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative max-w-md">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search guests by name, email, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 focus:border-[#FF8C42] bg-white shadow-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setVerificationFilter("all");
                      setActiveTab("all");
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
                    Guest Directory
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredGuests.length} {filteredGuests.length === 1 ? "guest" : "guests"} found
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  Updated just now
                </div>
              </div>
            </div>

            {/* Guests Grid/Table */}
            {filteredGuests.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No guests found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No guests match your current filters. Try adjusting your search criteria or add a new guest.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  Add New Guest
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      {["Guest", "Contact", "Details", "Bookings", "Loyalty", "Status", "Actions"].map((header) => (
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
                    {filteredGuests.map((guest) => (
                      <tr
                        key={guest.id}
                        className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all"
                      >
                        {/* Guest Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF8C42] to-[#FF6B35] flex items-center justify-center text-white text-lg font-bold shadow-sm">
                                {guest.name.charAt(0)}
                              </div>
                              {guest.verified && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-white flex items-center justify-center">
                                  <Shield size={10} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold text-gray-900">
                                  {guest.name}
                                </div>
                                {getLoyaltyBadge(guest.loyaltyPoints || 0)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">ID: {guest.id}</div>
                              {guest.lastStay && (
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Calendar size={12} />
                                  Last stay: {guest.lastStay}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {guest.email && (
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                <a
                                  href={`mailto:${guest.email}`}
                                  className="text-sm text-[#FF8C42] hover:underline truncate"
                                >
                                  {guest.email}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-900">{guest.phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Details Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Globe size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-900">{guest.country}</span>
                            </div>
                            {guest.preferences && guest.preferences.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {guest.preferences.slice(0, 2).map((pref, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                                    {pref}
                                  </span>
                                ))}
                                {guest.preferences.length > 2 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    +{guest.preferences.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Bookings Column */}
                        <td className="px-6 py-4">
                          <div className="inline-flex flex-col items-center bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-2xl">
                            <div className="text-2xl font-bold text-blue-700">{guest.bookings || 0}</div>
                            <div className="text-xs text-blue-600 font-medium">Bookings</div>
                            <div className="text-xs text-blue-500 mt-1">
                              {guest.bookings === 1 ? "1 visit" : `${guest.bookings} visits`}
                            </div>
                          </div>
                        </td>

                        {/* Loyalty Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CreditCard size={14} className="text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {guest.loyaltyPoints || 0} points
                              </span>
                            </div>
                            {guest.loyaltyPoints >= 100 && (
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] h-2 rounded-full"
                                  style={{ width: `${Math.min((guest.loyaltyPoints / 1000) * 100, 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <button
                              className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm ${getStatusColor(
                                guest.status
                              )}`}
                            >
                              <span className="capitalize">{guest.status}</span>
                            </button>
                            <div>{getVerificationStatus(guest.verified)}</div>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openViewModal(guest)}
                              className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => openEditModal(guest)}
                              className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-xl transition-all"
                              title="Edit Guest"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(guest.id)}
                              className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all"
                              title="Delete Guest"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingGuest ? "Edit Guest Profile" : "Add New Guest"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingGuest ? "Update guest information" : "Create a new guest profile"}
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
              {/* Personal Information */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+1 (555) 123-4567"
                      required
                      className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Mail size={20} />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleFormChange}
                      placeholder="United States"
                      required
                      className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    Status & Verification
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        Account Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                      <input
                        type="checkbox"
                        name="verified"
                        id="verified"
                        checked={formData.verified}
                        onChange={handleFormChange}
                        className="w-5 h-5 text-[#FF8C42] focus:ring-[#FF8C42] border-gray-300 rounded"
                      />
                      <label
                        htmlFor="verified"
                        className="text-sm font-medium text-purple-700"
                      >
                        Mark as Verified Guest
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} />
                    Loyalty Program
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2">
                        Loyalty Points
                      </label>
                      <input
                        type="number"
                        name="loyaltyPoints"
                        value={formData.loyaltyPoints}
                        onChange={handleFormChange}
                        min="0"
                        className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2">
                        Last Stay
                      </label>
                      <input
                        type="date"
                        name="lastStay"
                        value={formData.lastStay}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
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
                  ) : editingGuest ? (
                    "Update Guest"
                  ) : (
                    "Add Guest"
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

      {/* View Details Modal */}
      {isViewModalOpen && viewingGuest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {viewingGuest.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{viewingGuest.name}</h3>
                    <p className="text-white/80 text-sm mt-1">ID: {viewingGuest.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:text-white/80"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Email", value: viewingGuest.email || "N/A", icon: Mail },
                  { label: "Phone", value: viewingGuest.phone, icon: Phone },
                  { label: "Country", value: viewingGuest.country, icon: Globe },
                  { label: "Bookings", value: viewingGuest.bookings || 0, icon: Calendar },
                  { label: "Loyalty Points", value: viewingGuest.loyaltyPoints || 0, icon: CreditCard },
                  { label: "Last Stay", value: viewingGuest.lastStay || "Never", icon: Calendar },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <item.icon size={14} />
                      {item.label}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openEditModal(viewingGuest);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:shadow-md transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle size={28} className="text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Guest</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this guest? This will permanently remove their profile and all associated data.
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
                    setDeletingGuestId(null);
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
    </div>
  );
};

export default Guests;