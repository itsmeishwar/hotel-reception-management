import React from "react";
import { CheckCircle2 } from "lucide-react";

const transactions = [
  { name: "Stellar Dynamics", id: "#12547", date: "14 Jan 2025", amount: "+$245", type: "Basic" },
  { name: "Quantum Nexus", id: "#65974", date: "10 Jan 2025", amount: "+$395", type: "Enterprise" },
  { name: "Aurora Technologies", id: "#22447", date: "08 Jan 2025", amount: "+$145", type: "Advanced" },
  { name: "TerraFusion Energy", id: "#43412", date: "06 Jan 2025", amount: "+$758", type: "Enterprise" },
  { name: "Epicurean Delights", id: "#43667", date: "03 Jan 2025", amount: "+$977", type: "Premium" },
];

const RecentTransactions: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-4 flex-1">
    <div className="flex justify-between items-center mb-2">
      <span className="font-semibold">Recent Transactions</span>
      <a href="#" className="text-blue-500 text-sm">View All</a>
    </div>
    <ul className="divide-y divide-gray-100">
      {transactions.map((tx) => (
        <li key={tx.id} className="py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="font-medium text-gray-700">{tx.name}</span>
            <span className="text-blue-500 text-xs">{tx.id}</span>
            <span className="text-gray-400 text-xs">{tx.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{tx.amount}</span>
            <span className="text-xs text-gray-400">{tx.type}</span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentTransactions;
