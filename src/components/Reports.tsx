import { 
  TrendingUp, 
  
  Calendar, 
  Download,
  DollarSign,
  Users,
  PieChart,
  BarChart3,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Building,
  UtensilsCrossed,
  Coffee,
  ShoppingBag,
  
  Sparkles
} from 'lucide-react';

const Reports = () => {
  // Mock Data
  const stats = [
    { 
      label: 'Total Revenue', 
      value: '₹12,45,000', 
      change: '+15.5%', 
      isPositive: true,
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      description: 'This month'
    },
    { 
      label: 'Occupancy Rate', 
      value: '78%', 
      change: '+5.2%', 
      isPositive: true,
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      description: 'Average daily'
    },
    { 
      label: 'Total Expenses', 
      value: '₹4,20,000', 
      change: '-2.1%', 
      isPositive: true, // Negative expense change is good
      icon: PieChart,
      color: 'from-yellow-500 to-orange-500',
      description: 'This month'
    },
    { 
      label: 'Net Profit', 
      value: '₹8,25,000', 
      change: '+22.4%', 
      isPositive: true,
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      description: 'Net margin 66%'
    },
  ];

  const revenueByService = [
    { label: 'Room Bookings', value: '₹8,50,000', percentage: 68, color: 'bg-gradient-to-r from-blue-500 to-blue-600', icon: Building },
    { label: 'Restaurant', value: '₹2,80,000', percentage: 22, color: 'bg-gradient-to-r from-green-500 to-emerald-600', icon: UtensilsCrossed },
    { label: 'Cafe', value: '₹75,000', percentage: 6, color: 'bg-gradient-to-r from-yellow-500 to-orange-500', icon: Coffee },
    { label: 'Other Services', value: '₹40,000', percentage: 4, color: 'bg-gradient-to-r from-purple-500 to-purple-600', icon: ShoppingBag },
  ];

  const topRevenueSources = [
    { name: 'Deluxe Suite', revenue: '₹2,45,000', bookings: 42, trend: '+12%' },
    { name: 'Executive Room', revenue: '₹1,85,000', bookings: 38, trend: '+8%' },
    { name: 'Premium Package', revenue: '₹1,65,000', bookings: 28, trend: '+18%' },
    { name: 'Weekend Special', revenue: '₹1,20,000', bookings: 24, trend: '+15%' },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF8C42]/30">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
          </div>
          <button className="px-5 py-2.5 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${
                stat.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="text-[#FF8C42]" size={20} />
                Revenue Trends
              </h3>
              <p className="text-sm text-gray-500 mt-1">Monthly revenue comparison</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="space-y-6">
            <div className="flex items-end justify-between h-48 px-4">
              {[65, 80, 70, 90, 75, 95, 85, 78, 88, 82, 92, 98].map((height, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-500 group relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      ₹{Math.round((1250000 * height) / 100).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 mt-2">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <span className="text-gray-600">This Year</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-400"></div>
                <span className="text-gray-600">Last Year</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="text-[#FF8C42]" size={20} />
                Revenue Breakdown
              </h3>
              <p className="text-sm text-gray-500 mt-1">By service category</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="space-y-5">
            {revenueByService.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center`}>
                      <item.icon size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.value}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">{item.percentage}%</div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color.split(' ')[0]} ${item.color.split(' ')[1]}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Revenue Sources */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-[#FF8C42]" size={20} />
                Top Revenue Sources
              </h3>
              <p className="text-sm text-gray-500 mt-1">Highest performing services</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {topRevenueSources.map((source, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#FF8C42]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    idx === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100' :
                    idx === 1 ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                    idx === 2 ? 'bg-gradient-to-r from-green-50 to-green-100' :
                    'bg-gradient-to-r from-purple-50 to-purple-100'
                  }`}>
                    <div className={`text-sm font-bold ${
                      idx === 0 ? 'text-yellow-700' :
                      idx === 1 ? 'text-blue-700' :
                      idx === 2 ? 'text-green-700' :
                      'text-purple-700'
                    }`}>
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{source.name}</div>
                    <div className="text-xs text-gray-500">{source.bookings} bookings</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{source.revenue}</div>
                  <div className="text-xs text-green-600 flex items-center justify-end gap-1">
                    <TrendingUp size={12} />
                    {source.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="text-[#FF8C42]" size={20} />
                Performance Metrics
              </h3>
              <p className="text-sm text-gray-500 mt-1">Key operational indicators</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-2xl font-bold text-blue-900 mb-1">4.8★</div>
              <div className="text-sm text-blue-700">Guest Rating</div>
              <div className="text-xs text-blue-600 mt-2">+0.3 from last month</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-2xl font-bold text-green-900 mb-1">92%</div>
              <div className="text-sm text-green-700">Satisfaction</div>
              <div className="text-xs text-green-600 mt-2">+5% from last month</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
              <div className="text-2xl font-bold text-yellow-900 mb-1">18 min</div>
              <div className="text-sm text-yellow-700">Avg. Check-in</div>
              <div className="text-xs text-yellow-600 mt-2">-4 min from last month</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-2xl font-bold text-purple-900 mb-1">67%</div>
              <div className="text-sm text-purple-700">Repeat Guests</div>
              <div className="text-xs text-purple-600 mt-2">+8% from last month</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Data updated: Today, 10:30 AM</span>
              <span className="text-[#FF8C42] font-medium flex items-center gap-1">
                <Clock size={14} />
                Real-time
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#FF8C42] to-[#FF6B35] rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Quick Insights</h3>
            <p className="text-white/90">Weekend occupancy expected to reach 95%. Consider adjusting pricing strategy.</p>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;