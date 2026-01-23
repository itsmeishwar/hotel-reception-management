import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  change?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color = 'bg-gradient-to-br from-blue-500 to-blue-600',
  change,
  description,
  trend = 'neutral',
}) => {
  const getTrendColor = () => {
    if (!change) return '';
    if (trend === 'up' || change.startsWith('+')) {
      return 'bg-green-50 text-green-600';
    }
    if (trend === 'down' || change.startsWith('-')) {
      return 'bg-red-50 text-red-600';
    }
    return 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
          <Icon size={24} className="text-white" />
        </div>
        {change && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getTrendColor()}`}>
            {change}
          </span>
        )}
      </div>

      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>

      {description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
