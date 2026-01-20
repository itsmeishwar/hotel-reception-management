import React from "react";
import { User2 } from "lucide-react";

const registered = [
  { name: "Pitch", type: "Basic (Monthly)", users: 150 },
  { name: "Initech", type: "Enterprise (Yearly)", users: 200 },
  { name: "Umbrella Corp", type: "Advanced (Monthly)", users: 108 },
  { name: "Capital Partners", type: "Enterprise (Monthly)", users: 110 },
  { name: "Massive Dynamic", type: "Premium (Yearly)", users: 120 },
];

const RecentlyRegistered: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-4 flex-1">
    <div className="flex justify-between items-center mb-2">
      <span className="font-semibold">Recently Registered</span>
      <a href="#" className="text-blue-500 text-sm">View All</a>
    </div>
    <ul className="divide-y divide-gray-100">
      {registered.map((reg) => (
        <li key={reg.name} className="py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User2 className="w-4 h-4 text-purple-500" />
            <span className="font-medium text-gray-700">{reg.name}</span>
            <span className="text-xs text-gray-400">{reg.type}</span>
          </div>
          <span className="text-xs text-gray-500">{reg.users} Users</span>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentlyRegistered;
