import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Bell,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  LogOut,
  Star,
  Loader,
} from 'lucide-react';
import { fetchDashboardStats, fetchOccupancyData, type DashboardStats, type OccupancyData } from '../services/dashboardService';


const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date(2023, 7)); // Aug 2023
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dashStats, occData] = await Promise.all([
          fetchDashboardStats(),
          fetchOccupancyData(),
        ]);
        setStats(dashStats);
        setOccupancyData(occData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const StatCard = ({ title, value, icon: Icon, bgColor, textColor, subtext, badge }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon size={24} className={textColor} />
        </div>
      </div>
      {badge && (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${badge.bgColor} ${badge.textColor}`}>
          {badge.icon && <badge.icon size={12} />}
          {badge.label}
        </span>
      )}
    </div>
  );

  const ReviewCard = ({ name, rating, text, image }: any) => (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <div className="flex">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-600">{text}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Title and Date */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
              <Loader size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" />
            </div>
            <span className="mt-4 text-gray-600 font-medium">Loading dashboard data...</span>
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="New Booking"
                value={stats.newBooking.toString()}
                icon={BarChart3}
                bgColor="bg-blue-100"
                textColor="text-blue-600"
                badge={{ label: '+2.5%', bgColor: 'bg-blue-50', textColor: 'text-blue-600', icon: TrendingUp }}
              />
              <StatCard
                title="Booked"
                value={stats.booked.toString()}
                icon={Users}
                bgColor="bg-purple-100"
                textColor="text-purple-600"
                badge={{ label: '+1.8%', bgColor: 'bg-purple-50', textColor: 'text-purple-600', icon: TrendingUp }}
              />
              <StatCard
                title="Check in"
                value={stats.checkIn.toString()}
                icon={LogOut}
                bgColor="bg-green-100"
                textColor="text-green-600"
                badge={{ label: '+0.4%', bgColor: 'bg-green-50', textColor: 'text-green-600', icon: TrendingUp }}
              />
              <StatCard
                title="Check out"
                value={stats.checkOut.toString()}
                icon={Clock}
                bgColor="bg-orange-100"
                textColor="text-orange-600"
                badge={{ label: '-0.2%', bgColor: 'bg-orange-50', textColor: 'text-orange-600' }}
              />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Available Rooms */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available rooms</h3>
                  <div className="flex items-end gap-6">
                    <div className="flex-1">
                      <p className="text-4xl font-bold text-gray-900 mb-1">{stats.availableRooms}</p>
                      <p className="text-sm text-gray-500">Total {stats.totalRooms} rooms</p>
                    </div>
                    <div className="h-24 w-32 bg-gradient-to-t from-blue-500 to-blue-300 rounded-lg flex items-end justify-center pb-2">
                      <div className="text-white font-bold">📊</div>
                    </div>
                  </div>
                </div>

                {/* Room Status and Sold Out */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Occupancy Statistics */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Statistics</h3>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 flex justify-between">
                        <span>100%</span>
                        <span>0%</span>
                      </p>
                      <div className="h-32 flex items-end gap-2">
                        {occupancyData.map((data, i) => {
                          const colors = [
                            'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-purple-500',
                            'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500',
                            'bg-blue-500', 'bg-purple-500', 'bg-orange-500'
                          ];
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center">
                              <div className={`${colors[i]} rounded-t-lg flex-1 w-full`} style={{ height: `${data.rate}px` }} />
                              <p className="text-xs text-gray-500 mt-1">{data.month}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sold Out */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sold out rooms for today</h3>
                    <div className="flex items-end gap-6">
                      <div className="flex-1">
                        <p className="text-4xl font-bold text-gray-900 mb-1">590</p>
                        <p className="text-sm text-gray-500">Total 5000 rooms</p>
                      </div>
                      <div className="h-24 w-32 bg-gradient-to-t from-orange-500 to-orange-300 rounded-lg flex items-end justify-center pb-2">
                        <div className="text-white font-bold">📊</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Status Bottom */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Room status table */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Room status</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occupied rooms</span>
                        <span className="font-semibold text-gray-900">590</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Clean</span>
                        <span className="font-semibold text-gray-900">219</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dirty</span>
                        <span className="font-semibold text-gray-900">371</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inspected</span>
                        <span className="font-semibold text-gray-900">60</span>
                      </div>
                    </div>
                  </div>

                  {/* Another table */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available rooms</span>
                        <span className="font-semibold text-gray-900">20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Clean</span>
                        <span className="font-semibold text-gray-900">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dirty</span>
                        <span className="font-semibold text-gray-900">19</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Inspected</span>
                        <span className="font-semibold text-gray-900">8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Calendar */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Agostus 2020</h3>
                      <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
                          <ChevronLeft size={18} className="text-gray-600" />
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
                          <ChevronRight size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx} className="text-center text-xs font-semibold text-gray-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((day, idx) => (
                        <div
                          key={idx}
                          className={`aspect-square flex items-center justify-center rounded text-xs font-medium cursor-pointer transition-colors ${day === null
                            ? ''
                            : day === 14
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Client Reviews */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Client Reviews</h3>
                  <div className="space-y-4">
                    <ReviewCard
                      name="Jason Gladys"
                      rating={5}
                      text="The best hotel ever! I spent a year and they are reliable and safe off. staff are happy."
                    />
                    <ReviewCard
                      name="Jason Gladys"
                      rating={4}
                      text="Are mostly +1 the best hotel maker I have spent time. The best hotel to have done this week."
                    />
                    <ReviewCard
                      name="Jason Gladys"
                      rating={5}
                      text="Are mostly +1 the best hotel maker I have spent time. The best hotel to have done this week."
                    />
                  </div>
                </div>

                {/* Room Status Donut */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Room Status</h3>
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-4">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          strokeDasharray="200.53 251"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">80%</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded" />
                        <span className="text-gray-600">Cleaned</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-300 rounded" />
                        <span className="text-gray-600">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </>
        ) : null}
    </div>
    </div >
  );
};

export default Dashboard;
