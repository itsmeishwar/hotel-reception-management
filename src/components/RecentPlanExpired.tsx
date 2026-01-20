import React from "react";
import { AlertCircle } from "lucide-react";

const expired = [
  { name: "Silicon Corp", date: "10 Apr 2025" },
  { name: "Hubspot", date: "12 Jun 2025" },
  { name: "Licon Industries", date: "16 Jun 2025" },
  { name: "TerraFusion Energy", date: "12 May 2025" },
  { name: "Epicurean Delights", date: "15 May 2025" },
];

const RecentPlanExpired: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-4 flex-1">
    <div className="flex justify-between items-center mb-2">
      <span className="font-semibold">Recent Plan Expired</span>
      <a href="#" className="text-blue-500 text-sm">View All</a>
    </div>
    <ul className="divide-y divide-gray-100">
      {expired.map((exp) => (
        <li key={exp.name} className="py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="font-medium text-gray-700">{exp.name}</span>
            <span className="text-xs text-gray-400">Expired : {exp.date}</span>
          </div>
          <a href="#" className="text-xs text-blue-500">Send Reminder</a>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentPlanExpired;
