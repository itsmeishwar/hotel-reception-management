import {
  UtensilsCrossed,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  Loader,
  Plus,
  Leaf,
  Flame,
  Check,
  Coffee,
  Star,
  TrendingUp,
  DollarSign,
  Download,
  Eye,
  Package,
  ChefHat,
  Timer,
  Shield,
  
  AlertCircle,
  
  BookOpen,
  
  
  ShoppingBag,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  fetchFoodItems,
  fetchFoodStats,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  toggleFoodAvailability,
} from "../services/foodService";
import type { FoodItem } from "../services/foodService";

interface DetailItem {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}

const FoodMenu = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [dietFilter, setDietFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [stats, setStats] = useState([
    { 
      label: "Total Items", 
      value: "0", 
      color: "bg-gradient-to-br from-blue-500 to-blue-600", 
      icon: UtensilsCrossed,
      change: "+8%",
      description: "On menu"
    },
    { 
      label: "Available Now", 
      value: "0", 
      color: "bg-gradient-to-br from-green-500 to-emerald-600", 
      icon: Check,
      change: "+12%",
      description: "Ready to serve"
    },
    { 
      label: "Top Rated", 
      value: "0", 
      color: "bg-gradient-to-br from-yellow-500 to-orange-500", 
      icon: Star,
      change: "+15%",
      description: "4+ star items"
    },
    { 
      label: "Categories", 
      value: "0", 
      color: "bg-gradient-to-br from-purple-500 to-purple-600", 
      icon: Coffee,
      change: "+5%",
      description: "Variety"
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [viewingItem, setViewingItem] = useState<FoodItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [popularItems, setPopularItems] = useState<string[]>(["Momo", "Dal Bhat", "Sel Roti"]);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    category: FoodItem['category'];
    isAvailable: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    spiceLevel: FoodItem['spiceLevel'];
    preparationTime: number;
    calories: number;
    popularity: number;
    rating: number;
    ingredients: string[];
    allergens: string[];
  }>({
    name: "",
    description: "",
    price: 0,
    category: "main_course",
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "none",
    preparationTime: 15,
    calories: 0,
    popularity: 0,
    rating: 4.0,
    ingredients: [],
    allergens: [],
  });
  const [ingredientInput, setIngredientInput] = useState("");
  const [allergenInput, setAllergenInput] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const categories = [
    { value: 'appetizer', label: 'Appetizers', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { value: 'main_course', label: 'Main Course', icon: UtensilsCrossed, color: 'from-green-500 to-emerald-600' },
    { value: 'dessert', label: 'Desserts', icon: Star, color: 'from-yellow-500 to-orange-500' },
    { value: 'beverage', label: 'Beverages', icon: Coffee, color: 'from-purple-500 to-purple-600' },
    { value: 'snack', label: 'Snacks', icon: ShoppingBag, color: 'from-pink-500 to-pink-600' },
    { value: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'from-orange-500 to-red-500' },
    { value: 'soup', label: 'Soups', icon: Package, color: 'from-teal-500 to-teal-600' },
    { value: 'salad', label: 'Salads', icon: Leaf, color: 'from-emerald-500 to-green-600' },
  ];

  const loadFoodData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [itemData, statsData] = await Promise.all([
        fetchFoodItems(),
        fetchFoodStats(),
      ]);

      setFoodItems(itemData);
      setFilteredItems(itemData);

      // Calculate popular items (mock data for now)
      const popular = itemData
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 3)
        .map(item => item.name);
      setPopularItems(popular);

      setStats([
        { 
          label: "Total Items", 
          value: (statsData?.totalItems ?? 0).toString(), 
          color: "bg-gradient-to-br from-blue-500 to-blue-600", 
          icon: UtensilsCrossed,
          change: "+8%",
          description: "On menu"
        },
        { 
          label: "Available Now", 
          value: (statsData?.availableItems ?? 0).toString(), 
          color: "bg-gradient-to-br from-green-500 to-emerald-600", 
          icon: Check,
          change: "+12%",
          description: "Ready to serve"
        },
        { 
          label: "Top Rated", 
          value: (itemData.filter(i => (i.rating || 0) >= 4).length ?? 0).toString(), 
          color: "bg-gradient-to-br from-yellow-500 to-orange-500", 
          icon: Star,
          change: "+15%",
          description: "4+ star items"
        },
        { 
          label: "Categories", 
          value: (statsData?.categories ?? 0).toString(), 
          color: "bg-gradient-to-br from-purple-500 to-purple-600", 
          icon: Coffee,
          change: "+5%",
          description: "Variety"
        },
      ]);
    } catch (err) {
      console.error("Error loading food data:", err);
      setError("Failed to load menu data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoodData();
  }, []);

  useEffect(() => {
    let result = [...foodItems];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          (item.ingredients || []).some((ing: string) => ing.toLowerCase().includes(query))
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((item) => item.category === categoryFilter);
    }

    if (availabilityFilter !== "all") {
      result = result.filter((item) => 
        availabilityFilter === "available" ? item.isAvailable : !item.isAvailable
      );
    }

    if (dietFilter !== "all") {
      result = result.filter((item) => {
        if (dietFilter === "vegetarian") return item.isVegetarian;
        if (dietFilter === "vegan") return item.isVegan;
        if (dietFilter === "gluten_free") return item.isGlutenFree;
        return true;
      });
    }

    // Tab filtering
    if (activeTab === "popular") {
      result = result.filter(item => popularItems.includes(item.name));
    } else if (activeTab === "new") {
      result = result.filter(item => (item.popularity || 0) < 10);
    } else if (activeTab === "seasonal") {
      result = result.slice(0, 6); // Mock seasonal items
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "popularity") return (b.popularity || 0) - (a.popularity || 0);
      if (sortBy === "prepTime") return a.preparationTime - b.preparationTime;
      return 0;
    });

    setFilteredItems(result);
  }, [foodItems, searchQuery, categoryFilter, availabilityFilter, dietFilter, activeTab, sortBy, popularItems]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "main_course",
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      spiceLevel: "none",
      preparationTime: 15,
      calories: 0,
      popularity: 0,
      rating: 4.0,
      ingredients: [],
      allergens: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      spiceLevel: item.spiceLevel,
      preparationTime: item.preparationTime,
      calories: item.calories || 0,
      popularity: item.popularity || 0,
      rating: item.rating || 4.0,
      ingredients: item.ingredients || [],
      allergens: item.allergens || [],
    });
    setIsModalOpen(true);
  };

  const openViewModal = (item: FoodItem) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormSubmitting(false);
  };

  const openDeleteConfirm = (itemId: string) => {
    setDeletingItemId(itemId);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingItemId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (editingItem) {
        await updateFoodItem(editingItem.id, formData);
      } else {
        await createFoodItem(formData);
      }
      closeModal();
      loadFoodData();
    } catch (err) {
      console.error("Error saving food item:", err);
      setError("Failed to save menu item. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItemId) return;

    try {
      await deleteFoodItem(deletingItemId);
      closeDeleteConfirm();
      loadFoodData();
    } catch (err) {
      console.error("Error deleting food item:", err);
      setError("Failed to delete menu item. Please try again.");
    }
  };

  const handleToggleAvailability = async (item: FoodItem) => {
    try {
      await toggleFoodAvailability(item.id, !item.isAvailable);
      loadFoodData();
    } catch (err) {
      console.error("Error toggling availability:", err);
      setError("Failed to update availability. Please try again.");
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()]
      });
      setIngredientInput("");
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const addAllergen = () => {
    if (allergenInput.trim()) {
      setFormData({
        ...formData,
        allergens: [...formData.allergens, allergenInput.trim()]
      });
      setAllergenInput("");
    }
  };

  const removeAllergen = (index: number) => {
    setFormData({
      ...formData,
      allergens: formData.allergens.filter((_, i) => i !== index)
    });
  };

  const getSpiceLevelColor = (level: string) => {
    switch (level) {
      case "none":
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700";
      case "mild":
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700";
      case "medium":
        return "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700";
      case "hot":
        return "bg-gradient-to-r from-red-50 to-red-100 text-red-700";
      case "extra_hot":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700";
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.value === category)?.color || 'from-gray-500 to-gray-600';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#FF8C42]/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#FF8C42] rounded-full animate-spin border-t-transparent"></div>
          <Loader className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#FF8C42]" size={24} />
        </div>
        <span className="mt-4 text-gray-600 font-medium">Loading menu data...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Menu Management</h1>
          <p className="text-gray-600 mt-2">Manage your restaurant menu, dishes, and categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download size={18} />
            Export Menu
          </button>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Item
          </button>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Category Tabs */}
      {/* <div className="mb-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab("popular")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "popular"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TrendingUp size={16} />
            Popular
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "new"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Sparkles size={16} />
            New Items
          </button>
          <button
            onClick={() => setActiveTab("seasonal")}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "seasonal"
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Leaf size={16} />
            Seasonal
          </button>
        </div>
      </div> */}

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
                placeholder="Search dishes, ingredients, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 focus:border-[#FF8C42] bg-white shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="popularity">Sort by Popularity</option>
                  <option value="prepTime">Sort by Prep Time</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30 bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setAvailabilityFilter("all");
                  setDietFilter("all");
                  setActiveTab("all");
                  setSortBy("name");
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors hover:border-gray-400"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Category Quick Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setAvailabilityFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                availabilityFilter === "all"
                  ? "bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setAvailabilityFilter("available")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                availabilityFilter === "available"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Check size={12} />
              Available
            </button>
            <button
              onClick={() => setDietFilter("vegetarian")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                dietFilter === "vegetarian"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Leaf size={12} />
              Vegetarian
            </button>
            <button
              onClick={() => setDietFilter("vegan")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                dietFilter === "vegan"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Vegan
            </button>
            <button
              onClick={() => setDietFilter("gluten_free")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                dietFilter === "gluten_free"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Gluten Free
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Menu Items
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
              </p>
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <ChefHat size={16} />
              <span>Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        </div>

        {/* Food Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
              <UtensilsCrossed size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No items match your current filters. Try adjusting your search or add a new menu item.
            </p>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add New Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {["Item", "Category", "Price", "Diet Info", "Prep Time", "Rating", "Status", "Actions"].map((header) => (
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
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all"
                  >
                    {/* Item Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(item.category)} flex items-center justify-center`}>
                          <UtensilsCrossed size={20} className="text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            {(item.popularity || 0) > 50 && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                                <TrendingUp size={10} />
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                          {item.calories && (
                            <div className="text-xs text-gray-400 mt-1">{item.calories} calories</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>

                    {/* Price Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] bg-clip-text text-transparent">
                        ${Number(item.price || 0).toFixed(2)}
                      </div>
                    </td>

                    {/* Diet Info Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.isVegetarian && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 text-xs rounded">
                            <Leaf size={10} />
                            Veg
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="px-2 py-1 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 text-xs rounded">
                            Vegan
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="px-2 py-1 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 text-xs rounded">
                            GF
                          </span>
                        )}
                        {item.spiceLevel !== 'none' && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${getSpiceLevelColor(item.spiceLevel)}`}>
                            <Flame size={10} />
                            {item.spiceLevel}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Prep Time Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Timer size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{item.preparationTime} min</span>
                      </div>
                    </td>

                    {/* Rating Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(item.rating || 4.0)}
                      {(item.popularity || 0) > 0 && (
                        <div className="text-xs text-gray-500 mt-1">{item.popularity} orders</div>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          item.isAvailable
                            ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:from-green-100 hover:to-green-200"
                            : "bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </button>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(item)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 rounded-xl transition-all"
                          title="Edit Item"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(item.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all"
                          title="Delete Item"
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingItem ? "Update dish details" : "Create a new dish for your menu"}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <UtensilsCrossed size={20} />
                    Basic Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder="e.g., Grilled Salmon"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder="Describe the dish..."
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <DollarSign size={20} />
                    Pricing & Category
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as FoodItem['category'] })}
                        className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">
                        Spice Level
                      </label>
                      <select
                        value={formData.spiceLevel}
                        onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value as FoodItem['spiceLevel'] })}
                        className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                      >
                        <option value="none">🌶️ None</option>
                        <option value="mild">🌶️ Mild</option>
                        <option value="medium">🌶️🌶️ Medium</option>
                        <option value="hot">🌶️🌶️🌶️ Hot</option>
                        <option value="extra_hot">🌶️🌶️🌶️🌶️ Extra Hot</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nutrition & Preparation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                    <Timer size={20} />
                    Preparation & Nutrition
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2">
                        Preparation Time (min) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.preparationTime}
                        onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2">
                        Calories
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-2">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        className="w-full px-4 py-3 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <Leaf size={20} />
                    Dietary Information
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isAvailable}
                          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                          className="w-5 h-5 text-[#FF8C42] rounded focus:ring-[#FF8C42]"
                        />
                        <span className="text-sm font-medium text-purple-700">Available</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isVegetarian}
                          onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                          className="w-5 h-5 text-[#FF8C42] rounded focus:ring-[#FF8C42]"
                        />
                        <span className="text-sm font-medium text-purple-700">Vegetarian</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isVegan}
                          onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                          className="w-5 h-5 text-[#FF8C42] rounded focus:ring-[#FF8C42]"
                        />
                        <span className="text-sm font-medium text-purple-700">Vegan</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isGlutenFree}
                          onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })}
                          className="w-5 h-5 text-[#FF8C42] rounded focus:ring-[#FF8C42]"
                        />
                        <span className="text-sm font-medium text-purple-700">Gluten Free</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients & Allergens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                    <Package size={20} />
                    Ingredients
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                        className="flex-1 px-4 py-2 bg-white border border-teal-200 rounded-xl text-sm"
                        placeholder="Add an ingredient"
                      />
                      <button
                        type="button"
                        onClick={addIngredient}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-teal-200 rounded-lg text-sm text-teal-700"
                        >
                          {ingredient}
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            className="text-teal-500 hover:text-teal-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-2xl">
                  <h4 className="text-lg font-semibold text-pink-900 mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    Allergens
                  </h4>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={allergenInput}
                        onChange={(e) => setAllergenInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
                        className="flex-1 px-4 py-2 bg-white border border-pink-200 rounded-xl text-sm"
                        placeholder="Add an allergen"
                      />
                      <button
                        type="button"
                        onClick={addAllergen}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergens.map((allergen, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-pink-200 rounded-lg text-sm text-pink-700"
                        >
                          {allergen}
                          <button
                            type="button"
                            onClick={() => removeAllergen(index)}
                            className="text-pink-500 hover:text-pink-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
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
                  disabled={formSubmitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : editingItem ? (
                    "Update Menu Item"
                  ) : (
                    "Add Menu Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {isViewModalOpen && viewingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className={`px-8 py-6 rounded-t-2xl bg-gradient-to-r ${getCategoryColor(viewingItem.category)}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">{viewingItem.name}</h3>
                  <p className="text-white/80 text-sm mt-1">{getCategoryLabel(viewingItem.category)}</p>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:text-white/80"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <p className="text-gray-600 mb-4">{viewingItem.description}</p>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] bg-clip-text text-transparent">
                    ${Number(viewingItem.price || 0).toFixed(2)}
                  </div>
                  {renderStars(viewingItem.rating || 4.0)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {(() => {
                  const items: DetailItem[] = [
                    { label: "Prep Time", value: `${viewingItem.preparationTime} min`, icon: Timer, color: '' },
                    { label: "Calories", value: viewingItem.calories ? `${viewingItem.calories} cal` : 'N/A', icon: Flame, color: '' },
                    { label: "Spice Level", value: viewingItem.spiceLevel, icon: Flame, 
                      color: getSpiceLevelColor(viewingItem.spiceLevel) },
                    { label: "Availability", value: viewingItem.isAvailable ? "Available" : "Unavailable", icon: Check, 
                      color: viewingItem.isAvailable ? 'text-green-600' : 'text-red-600' }, 
                  ];
                  return items.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <item.icon size={14} />
                        {item.label}
                      </div>
                      <div className={`text-sm font-semibold ${item.color || 'text-gray-900'}`}>
                        {item.value}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Leaf size={16} />
                    Dietary Information
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingItem.isVegetarian && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 text-sm rounded-xl">
                        Vegetarian
                      </span>
                    )}
                    {viewingItem.isVegan && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 text-sm rounded-xl">
                        Vegan
                      </span>
                    )}
                    {viewingItem.isGlutenFree && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 text-sm rounded-xl">
                        Gluten Free
                      </span>
                    )}
                  </div>
                </div>

                {viewingItem.ingredients && viewingItem.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingItem.ingredients.map((ing, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-sm rounded-xl">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingItem.allergens && viewingItem.allergens.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-red-600">⚠️ Allergens</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingItem.allergens.map((all, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 text-sm rounded-xl">
                          {all}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(viewingItem);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-semibold hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit Item
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
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-50 to-red-100 rounded-2xl flex items-center justify-center mb-6">
                <Trash2 size={28} className="text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Menu Item</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this item from the menu? This action cannot be undone and will remove it from all orders.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={closeDeleteConfirm}
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

export default FoodMenu;