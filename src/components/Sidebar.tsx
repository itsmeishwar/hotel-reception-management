import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/ishwar.svg';
import {
  LayoutDashboard,
  CalendarDays,
  Hotel,
  Users,
  UtensilsCrossed,
  Coffee,
  UserCog,
  ShieldCheck,
  Receipt,
  FileBarChart,
  Settings,
  Table
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50";
  };

  const menuItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/bookings", icon: CalendarDays, label: "Bookings" },
    { path: "/rooms", icon: Hotel, label: "Rooms" },
    { path: "/payments", icon: Receipt, label: "Payments" },
    { path: "/guests", icon: Users, label: "Guests" },
    { path: "/cafe", icon: Coffee, label: "Cafe & Orders" },
    { path: "/food-menu", icon: UtensilsCrossed, label: "Food Menu" },
    { path: "/tables", icon: Table, label: "Tables" },
    { path: "/billing", icon: Receipt, label: "Billing" },
    { path: "/staff", icon: UserCog, label: "Staff" },
    { path: "/roles", icon: ShieldCheck, label: "Roles & Access" },
    { path: "/reports", icon: FileBarChart, label: "Reports" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col flex-shrink-0 z-20">
      <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-center">
        <img src={logo} alt="Ishwar Hotel & Resort" className="h-16 w-auto object-contain" />
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(item.path)}`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
            AD
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Admin User</div>
            <div className="text-xs text-gray-500">admin@hotel.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
