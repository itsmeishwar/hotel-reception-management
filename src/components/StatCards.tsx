import React from "react";
import { BarChart2, Users, UserCheck, DollarSign } from "lucide-react";

const stats = [
  {
    label: "Total Companies",
    value: "5468",
    icon: <BarChart2 className="w-6 h-6 text-blue-500" />,
    change: "+13.01%",
    color: "text-green-500",
  },
  {
    label: "Active Companies",
    value: "4598",
    icon: <UserCheck className="w-6 h-6 text-purple-500" />,
    change: "+1.2%",
    color: "text-green-500",
  },
  {
    label: "Total Subscribers",
    value: "3698",
    icon: <Users className="w-6 h-6 text-cyan-500" />,
    change: "+6%",
    color: "text-green-500",
  },
  {
    label: "Total Earnings",
    value: "$89,878,58",
    icon: <DollarSign className="w-6 h-6 text-indigo-500" />,
    change: "-16%",
    color: "text-red-500",
  },
];

const StatCards: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    {stats.map((stat) => (
      <div key={stat.label} className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
        <div className="mb-2">{stat.icon}</div>
        <div className="text-2xl font-bold mb-1">{stat.value}</div>
        <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
        <div className={`text-xs font-semibold ${stat.color}`}>{stat.change}</div>
      </div>
    ))}
  </div>
);

export default StatCards;
