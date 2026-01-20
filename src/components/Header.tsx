import React, { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  Settings, 
  Search, 
  Menu,
  User,
  LogOut,
  HelpCircle,
  ChevronDown,
  CreditCard,
  UserCircle
} from "lucide-react";

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // In a real app, this would clear auth tokens
    console.log("Logging out...");
    alert("Logged out successfully");
  };

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow-xs border-b border-gray-100 w-full z-20 relative">
      {/* Left: Search */}
      <div className="flex items-center gap-4 w-1/3">
        <button className="lg:hidden text-gray-500 hover:text-gray-700">
          <Menu size={24} />
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for bookings, guests, or rooms..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-1 md:gap-2 border-r border-gray-200 pr-2 md:pr-4 mr-2">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`p-2 rounded-lg transition-colors relative ${isNotificationsOpen ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
              title="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button className="text-xs text-orange-600 hover:text-orange-700">Mark all read</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Bell size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 font-medium">New Booking Request</p>
                          <p className="text-xs text-gray-500 mt-1">Guest John Doe requested a room for 3 nights.</p>
                          <p className="text-xs text-gray-400 mt-2">2 min ago</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-50 text-center">
                  <button className="text-sm text-gray-600 hover:text-orange-600 font-medium">View All Notifications</button>
                </div>
              </div>
            )}
          </div>

          <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors hidden sm:block" title="Help">
            <HelpCircle size={20} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors hidden sm:block" title="Settings">
            <Settings size={20} />
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors group outline-none"
          >
            <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center border border-orange-200">
              <User size={18} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Admin User</p>
              <p className="text-xs text-gray-500">Manager</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">admin@hotel.com</p>
              </div>
              
              <div className="space-y-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 flex items-center gap-2 transition-colors">
                  <UserCircle size={16} />
                  My Profile
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 flex items-center gap-2 transition-colors">
                  <CreditCard size={16} />
                  Billing
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 flex items-center gap-2 transition-colors">
                  <Settings size={16} />
                  Settings
                </button>
              </div>

              <div className="mt-1 pt-1 border-t border-gray-50">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
