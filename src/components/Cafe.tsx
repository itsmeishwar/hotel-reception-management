import {
  Coffee,
  Search,
  Filter,
  Eye,
  Trash2,
  X,
  Loader,
  Plus,
  Clock,
  DollarSign,
  ChefHat,
  CreditCard,
  Receipt,
  Users,
  Package,
  Bell,
  Download,
  BarChart3,
  Timer,
  PackageOpen,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  fetchCafeOrders,
  fetchCafeStats,
  createCafeOrder,
  updateOrderStatus,
  deleteCafeOrder,
  processPayment,
} from "../services/cafeService";
import { fetchFoodItems } from "../services/foodService";
import { fetchTables } from "../services/tableService";
import type { CafeOrder, OrderItem } from "../services/cafeService";
import type { FoodItem } from "../services/foodService";
import type { Table } from "../services/tableService";

const Cafe = () => {
  const [orders, setOrders] = useState<CafeOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CafeOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState([
    { 
      label: "Pending Orders", 
      value: "0", 
      color: "bg-gradient-to-br from-yellow-500 to-orange-500", 
      icon: Clock,
      change: "+12%",
      description: "Awaiting preparation"
    },
    { 
      label: "Active Tables", 
      value: "0", 
      color: "bg-gradient-to-br from-blue-500 to-blue-600", 
      icon: Users,
      change: "+5%",
      description: "Currently occupied"
    },
    { 
      label: "Today's Revenue", 
      value: "$0", 
      color: "bg-gradient-to-br from-green-500 to-emerald-600", 
      icon: DollarSign,
      change: "+24%",
      description: "Sales today"
    },
    { 
      label: "Avg. Prep Time", 
      value: "15m", 
      color: "bg-gradient-to-br from-purple-500 to-purple-600", 
      icon: Timer,
      change: "-8%",
      description: "Order to serve"
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<CafeOrder | null>(null);
  const [payingOrder, setPayingOrder] = useState<CafeOrder | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeTab, setActiveTab] = useState("orders");
  const [kitchenOrders, setKitchenOrders] = useState<CafeOrder[]>([]);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Table 5 waiting for 10min', time: '5 min ago' },
    { id: 2, type: 'success', message: 'Order #C123 completed', time: '8 min ago' },
    { id: 3, type: 'info', message: 'New reservation in 30min', time: '15 min ago' },
  ]);
  const [quickMenuItems] = useState([
    { id: 1, name: 'Espresso', price: 3.50, icon: Coffee, color: 'bg-gradient-to-br from-yellow-500 to-orange-500' },
    { id: 2, name: 'Cappuccino', price: 4.50, icon: Coffee, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { id: 3, name: 'Croissant', price: 2.50, icon: Package, color: 'bg-gradient-to-br from-green-500 to-emerald-600' },
    // { id: 4, name: 'Sandwich', price: 8.50, icon: Sandwich, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  ]);
  const [formData, setFormData] = useState<{
    tableId: string;
    orderType: 'dine_in' | 'takeaway' | 'room_service';
    roomNumber: string;
    customerName: string;
    items: { foodItemId: string; quantity: number; notes: string }[];
    discount: number;
    notes: string;
    priority: 'normal' | 'urgent' | 'vip';
  }>({
    tableId: "",
    orderType: "dine_in",
    roomNumber: "",
    customerName: "",
    items: [],
    discount: 0,
    notes: "",
    priority: 'normal',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [orderData, statsData, foodData, tableData] = await Promise.all([
        fetchCafeOrders(),
        fetchCafeStats(),
        fetchFoodItems(),
        fetchTables(),
      ]);

      setOrders(orderData);
      setFilteredOrders(orderData);
      setFoodItems(foodData.filter(f => f.isAvailable));
      setTables(tableData.filter(t => t.status !== 'cleaning'));
      
      // Filter orders for kitchen view (preparing/ready)
      const kitchenOrders = orderData.filter(order => 
        order.status === 'preparing' || order.status === 'ready'
      );
      setKitchenOrders(kitchenOrders);

      setStats([
        { 
          label: "Pending Orders", 
          value: (statsData?.pendingOrders ?? 0).toString(), 
          color: "bg-gradient-to-br from-yellow-500 to-orange-500", 
          icon: Clock,
          change: "+12%",
          description: "Awaiting preparation"
        },
        { 
          label: "Active Tables", 
          value: (tableData.filter(t => t.status === 'occupied')?.length ?? 0).toString(), 
          color: "bg-gradient-to-br from-blue-500 to-blue-600", 
          icon: Users,
          change: "+5%",
          description: "Currently occupied"
        },
        { 
          label: "Today's Revenue", 
          value: `$${Number(statsData?.todayRevenue ?? 0).toFixed(2)}`, 
          color: "bg-gradient-to-br from-green-500 to-emerald-600", 
          icon: DollarSign,
          change: "+24%",
          description: "Sales today"
        },
        { 
          label: "Avg. Prep Time", 
          value: "15m", 
          color: "bg-gradient-to-br from-purple-500 to-purple-600", 
          icon: Timer,
          change: "-8%",
          description: "Order to serve"
        },
      ]);
    } catch (err) {
      console.error("Error loading cafe data:", err);
      setError("Failed to load cafe data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (order) =>
          (order.id || '').toLowerCase().includes(query) ||
          (order.tableNumber || '').toLowerCase().includes(query) ||
          (order.customerName || '').toLowerCase().includes(query) ||
          (order.roomNumber || '').toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((order) => order.orderType === typeFilter);
    }

    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter, typeFilter]);

  const openNewOrderModal = () => {
    setFormData({
      tableId: "",
      orderType: "dine_in",
      roomNumber: "",
      customerName: "",
      items: [{ foodItemId: "", quantity: 1, notes: "" }],
      discount: 0,
      notes: "",
      priority: 'normal',
    });
    setIsModalOpen(true);
  };

  const openQuickMenu = () => {
    setIsQuickMenuOpen(true);
  };

  const addQuickItem = (itemId: number) => {
    const quickItem = quickMenuItems.find(item => item.id === itemId);
    const foodItem = foodItems.find(f => f.name === quickItem?.name);
    
    if (foodItem) {
      setFormData({
        ...formData,
        items: [...formData.items, { 
          foodItemId: foodItem.id, 
          quantity: 1, 
          notes: '' 
        }]
      });
    }
    setIsQuickMenuOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormSubmitting(false);
  };

  const openViewModal = (order: CafeOrder) => {
    setViewingOrder(order);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingOrder(null);
  };

  const openPaymentModal = (order: CafeOrder) => {
    setPayingOrder(order);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPayingOrder(null);
  };

  const addItemToOrder = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { foodItemId: "", quantity: 1, notes: "" }],
    });
  };

  const removeItemFromOrder = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    let subtotal = 0;
    formData.items.forEach((item) => {
      const food = foodItems.find((f) => f.id === item.foodItemId);
      if (food) {
        subtotal += food.price * item.quantity;
      }
    });
    const tax = subtotal * 0.13; // 13% tax
    const total = subtotal + tax - formData.discount;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      calculateTotal(); // Calculate for validation
      const table = tables.find((t) => t.id === formData.tableId);
      const orderItems: OrderItem[] = formData.items
        .filter((item) => item.foodItemId)
        .map((item) => {
          const food = foodItems.find((f) => f.id === item.foodItemId)!;
          return {
            foodItemId: item.foodItemId,
            foodItemName: food.name,
            quantity: item.quantity,
            price: food.price,
            notes: item.notes,
          };
        });

      await createCafeOrder({
        tableId: formData.tableId,
        tableNumber: table?.tableNumber || "",
        items: orderItems,
        status: "pending",
        orderType: formData.orderType,
        roomNumber: formData.roomNumber,
        customerName: formData.customerName,
        discount: formData.discount,
        paymentStatus: "unpaid",
        notes: formData.notes,
        priority: formData.priority,
        estimatedTime: undefined
      });

      closeModal();
      loadData();
      
      // Add notification
      setNotifications(prev => [{
        id: Date.now(),
        type: 'success',
        message: `Order #${formData.orderType.slice(0,1).toUpperCase()}${Date.now().toString().slice(-4)} created`,
        time: 'just now'
      }, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Failed to create order. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: CafeOrder['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      loadData();
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");
    }
  };

  const handlePayment = async (paymentMethod: CafeOrder['paymentMethod']) => {
    if (!payingOrder) return;

    try {
      await processPayment(payingOrder.id, paymentMethod);
      closePaymentModal();
      loadData();
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Failed to process payment. Please try again.");
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await deleteCafeOrder(orderId);
      loadData();
    } catch (err) {
      console.error("Error deleting order:", err);
      setError("Failed to cancel order. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200";
      case "preparing":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200";
      case "ready":
        return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200";
      case "served":
        return "bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 border border-teal-200";
      case "completed":
        return "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200";
      case "cancelled":
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "dine_in":
        return <Users className="text-blue-600" size={14} />;
      case "takeaway":
        return <ShoppingBag className="text-green-600" size={14} />;
      case "room_service":
        return <PackageOpen className="text-purple-600" size={14} />;
      default:
        return <Coffee className="text-orange-600" size={14} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200";
      case "vip":
        return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FF8C42]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#FF8C42] rounded-full animate-spin border-t-transparent"></div>
          <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#FF8C42]" size={24} />
        </div>
        <span className="ml-4 text-gray-600 font-medium">Loading cafe data...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cafe & Restaurant</h1>
          <p className="text-gray-600 mt-2">Real-time order management and kitchen operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          <button
            onClick={openQuickMenu}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Coffee size={18} />
            Quick Menu
          </button>
          <button
            onClick={openNewOrderModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            New Order
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <X size={20} className="text-red-600" />
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

      {/* Stats Cards */}
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

      {/* Tabs and Notifications */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Left Column - Tabs and Filters */}
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6">
              {["orders", "kitchen", "tables", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab === "orders" && "All Orders"}
                  {tab === "kitchen" && "Kitchen View"}
                  {tab === "tables" && "Table Status"}
                  {tab === "analytics" && "Analytics"}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search orders by ID, table, or customer..."
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
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="served">Served</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="dine_in">Dine In</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="room_service">Room Service</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Notifications */}
        <div className="lg:w-80">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell size={18} className="text-[#FF8C42]" />
                Notifications
              </h3>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#FF8C42]/10 text-[#FF8C42]">
                {notifications.length} new
              </span>
            </div>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-xl border ${
                    notification.type === 'warning' 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : notification.type === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <button
                      onClick={() => clearNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid/Kitchen View */}
      {activeTab === 'orders' ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} found
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                <Coffee size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                No orders match your current filters. Try adjusting your search or create a new order.
              </p>
              <button
                onClick={openNewOrderModal}
                className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create New Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {["Order ID", "Customer", "Type", "Items", "Total", "Status", "Priority", "Time", "Actions"].map((header) => (
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
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
                            <Receipt size={16} className="text-orange-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {String(order.id || '').trim() || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.createdAt ? formatTime(order.createdAt) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName || order.roomNumber 
                            ? `${order.customerName || 'Guest'}${order.roomNumber ? ` (Room ${order.roomNumber})` : ''}`
                            : 'Walk-in Customer'
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.tableNumber || 'No table'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getOrderTypeIcon(order.orderType)}
                          <span className="text-sm text-gray-900 capitalize">
                            {(order.orderType || 'dine_in').replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {(order.items || []).slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-600">
                              {item.quantity || 1}x {String(item.foodItemName || '').trim() || 'Item'}
                            </div>
                          ))}
                          {(order.items || []).length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{(order.items || []).length - 2} more items
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] bg-clip-text text-transparent">
                          ${Number(order.total || 0).toFixed(2)}
                        </div>
                        <div className={`text-xs ${
                          order.paymentStatus === 'paid' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusChange(order.id, order.status)}
                          className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-sm ${getStatusColor(order.status)}`}
                        >
                          <span className="capitalize">{order.status || 'pending'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.priority && order.priority !== 'normal' && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${getPriorityColor(order.priority)}`}>
                            {order.priority === 'urgent' ? '🚨 Urgent' : '⭐ VIP'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.createdAt ? formatTime(order.createdAt) : 'N/A'}
                        </div>
                        {order.estimatedTime && (
                          <div className="text-xs text-gray-500">
                            Est: {order.estimatedTime}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(order)}
                            className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => openPaymentModal(order)}
                              className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-xl transition-all"
                              title="Process Payment"
                            >
                              <CreditCard size={18} />
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all"
                              title="Cancel Order"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'kitchen' ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChefHat className="text-orange-600" size={20} />
                Kitchen Orders Dashboard
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  Preparing: {kitchenOrders.filter(o => o.status === 'preparing').length}
                </div>
                <div className="text-sm text-gray-600">
                  Ready: {kitchenOrders.filter(o => o.status === 'ready').length}
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kitchenOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{String(order.id || '').trim()}</h3>
                        {order.priority === 'urgent' && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 text-xs rounded-full">
                            🚨 Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{order.tableNumber || 'Takeaway'}</p>
                    </div>
                    <button
                      onClick={() => handleStatusChange(order.id, 
                        order.status === 'preparing' ? 'ready' : 'served'
                      )}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        order.status === 'preparing'
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200'
                          : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200'
                      }`}
                    >
                      {order.status === 'preparing' ? 'Mark Ready' : 'Mark Served'}
                    </button>
                  </div>
                  <div className="space-y-2 mb-3">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-800 font-medium">
                          {item.quantity || 1}x {String(item.foodItemName || '').trim()}
                        </span>
                        {item.notes && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <span>Ordered: {order.createdAt ? formatTime(order.createdAt) : 'N/A'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'preparing' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {order.status === 'preparing' ? 'Preparing' : 'Ready'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'tables' ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Table Status</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`p-4 rounded-2xl border-2 ${
                    table.status === 'occupied'
                      ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                      : table.status === 'reserved'
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                      : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-bold text-gray-900">{table.tableNumber}</div>
                    <div className={`w-3 h-3 rounded-full ${
                      table.status === 'occupied' ? 'bg-orange-500' :
                      table.status === 'reserved' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`} />
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{table.section}</div>
                  <div className="text-sm font-medium text-gray-700 capitalize">{table.status}</div>
                  {table.status === 'occupied' && (
                    <div className="mt-2 text-xs text-gray-500">
                      {table.capacity} seats • Occupied
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="text-[#FF8C42]" size={20} />
              Cafe Analytics
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-blue-900 mb-4">Top Selling Items</h3>
                <div className="space-y-3">
                  {foodItems.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">{item.name}</span>
                      <span className="font-semibold text-blue-900">${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                <h3 className="font-semibold text-green-900 mb-4">Order Types Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">Dine In</span>
                    <span className="font-semibold text-green-900">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">Takeaway</span>
                    <span className="font-semibold text-green-900">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-800">Room Service</span>
                    <span className="font-semibold text-green-900">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Menu Modal */}
      {isQuickMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Quick Menu</h3>
                <p className="text-sm text-gray-500 mt-1">Add popular items with one click</p>
              </div>
              <button
                onClick={() => setIsQuickMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addQuickItem(item.id)}
                    className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all text-center"
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <item.icon className="text-white" size={24} />
                    </div>
                    <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                    <div className="text-sm text-[#FF8C42] font-semibold">${item.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Create New Order</h3>
                <p className="text-sm text-gray-500 mt-1">Fill in order details and items</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Order Type and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Users size={20} />
                    Order Type
                  </h4>
                  <select
                    value={formData.orderType}
                    onChange={(e) => setFormData({ ...formData, orderType: e.target.value as typeof formData.orderType })}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    required
                  >
                    <option value="dine_in">🍽️ Dine In</option>
                    <option value="takeaway">🛍️ Takeaway</option>
                    <option value="room_service">🏨 Room Service</option>
                  </select>
                </div>
                
                {formData.orderType === 'dine_in' && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                    <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                      <Coffee size={20} />
                      Table Selection
                    </h4>
                    <select
                      value={formData.tableId}
                      onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                      required
                    >
                      <option value="">Select Table</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          Table {table.tableNumber} - {table.section} ({table.capacity} seats)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.orderType === 'room_service' && (
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl">
                    <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <PackageOpen size={20} />
                      Room Service
                    </h4>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      placeholder="Enter room number"
                      required
                    />
                  </div>
                )}

                {formData.orderType === 'takeaway' && (
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-2xl">
                    <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                      <ShoppingBag size={20} />
                      Customer Info
                    </h4>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                      placeholder="Customer name"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Order Priority */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl">
                <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <Sparkles size={20} />
                  Order Priority
                </h4>
                <div className="flex gap-3">
                  {(['normal', 'urgent', 'vip'] as const).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium text-center capitalize transition-all ${
                        formData.priority === priority
                          ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white'
                          : 'bg-white text-gray-700 hover:bg-white/80'
                      }`}
                    >
                      {priority === 'normal' && '⏱️ Normal'}
                      {priority === 'urgent' && '🚨 Urgent'}
                      {priority === 'vip' && '⭐ VIP'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package size={20} />
                    Order Items
                  </h4>
                  <button
                    type="button"
                    onClick={addItemToOrder}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-center bg-white p-4 rounded-xl">
                      <div className="col-span-5">
                        <select
                          value={item.foodItemId}
                          onChange={(e) => updateOrderItem(index, 'foodItemId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30"
                          required
                        >
                          <option value="">Select Item</option>
                          {foodItems.map((food) => (
                            <option key={food.id} value={food.id}>
                              {food.name} - ${Number(food.price || 0).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30"
                          required
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateOrderItem(index, 'notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30"
                          placeholder="Special instructions"
                        />
                      </div>
                      <div className="col-span-1">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemFromOrder(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-green-900 mb-4">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Subtotal</span>
                      <span className="font-semibold text-green-900">${Number(calculateTotal().subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Tax (13%)</span>
                      <span className="font-semibold text-green-900">${Number(calculateTotal().tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Discount</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                        className="w-32 px-3 py-1 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex justify-between pt-3 border-t border-green-200 text-lg font-bold">
                      <span className="text-green-900">Total</span>
                      <span className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] bg-clip-text text-transparent">
                        ${Number(calculateTotal().total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Additional Notes</h4>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full h-32 px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                    placeholder="Special instructions, allergies, delivery notes..."
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || formData.items.every(i => !i.foodItemId)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Create Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {isViewModalOpen && viewingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Order Details</h3>
                  <p className="text-white/80 text-sm mt-1">{viewingOrder.id || 'N/A'}</p>
                </div>
                <button
                  onClick={closeViewModal}
                  className="text-white hover:text-white/80"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Customer", value: viewingOrder.customerName || viewingOrder.roomNumber || 'Walk-in' },
                  { label: "Type", value: (viewingOrder.orderType || 'dine_in').replace('_', ' ') },
                  { label: "Table/Room", value: viewingOrder.tableNumber || viewingOrder.roomNumber || 'N/A' },
                  { label: "Priority", value: viewingOrder.priority || 'normal' },
                  { label: "Status", value: viewingOrder.status || 'pending', badge: getStatusColor(viewingOrder.status) },
                  { label: "Payment", value: viewingOrder.paymentStatus || 'unpaid', 
                    color: viewingOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {item.label}
                    </div>
                    {item.badge ? (
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium ${item.badge}`}>
                        {item.value}
                      </span>
                    ) : (
                      <div className={`text-sm font-semibold ${item.color || 'text-gray-900'}`}>
                        {item.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-b border-gray-200 py-6 space-y-4">
                <h4 className="font-semibold text-gray-900">Order Items</h4>
                {(viewingOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.quantity || 1}x {String(item.foodItemName || '').trim() || 'Item'}
                      </p>
                      {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Subtotal</span>
                    <span className="font-semibold text-blue-900">${Number(viewingOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700">Tax</span>
                    <span className="font-semibold text-blue-900">${Number(viewingOrder.tax || 0).toFixed(2)}</span>
                  </div>
                  {(viewingOrder.discount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${Number(viewingOrder.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-blue-200 text-lg font-bold">
                    <span className="text-blue-900">Total</span>
                    <span className="bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] bg-clip-text text-transparent">
                      ${Number(viewingOrder.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                {viewingOrder.paymentStatus !== 'paid' && viewingOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      closeViewModal();
                      openPaymentModal(viewingOrder);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} />
                    Process Payment
                  </button>
                )}
                <button
                  onClick={closeViewModal}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:shadow-md transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && payingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Process Payment</h3>
                  <p className="text-white/80 text-sm mt-1">{payingOrder.id || 'Order'}</p>
                </div>
                <button
                  onClick={closePaymentModal}
                  className="text-white hover:text-white/80"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] bg-clip-text text-transparent mb-2">
                  ${Number(payingOrder.total || 0).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Total Amount Due</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Select Payment Method</h4>
                {(['cash', 'card', 'room_charge', 'online'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => handlePayment(method as CafeOrder['paymentMethod'])}
                    className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-left capitalize hover:shadow-sm transition-all flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <CreditCard size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{method.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-500">
                        {method === 'cash' && 'Cash payment'}
                        {method === 'card' && 'Credit/Debit card'}
                        {method === 'room_charge' && 'Charge to room'}
                        {method === 'online' && 'Online payment'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={closePaymentModal}
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

export default Cafe;
