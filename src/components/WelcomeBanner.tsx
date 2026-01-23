import React from "react";

const WelcomeBanner: React.FC = () => (
  <div className="bg-orange-400 rounded-lg p-6 flex justify-between items-center mb-6">
    <div>
      <h2 className="text-white text-xl font-semibold mb-1">Welcome Back, Ishwar</h2>
      <p className="text-white text-sm">14 New Companies Subscribed Today !!</p>
    </div>
    <div className="flex gap-2">
      <button className="bg-white text-orange-500 px-4 py-2 rounded font-medium shadow">Companies</button>
      <button className="bg-white text-orange-500 px-4 py-2 rounded font-medium shadow">All Packages</button>
    </div>
  </div>
);

export default WelcomeBanner;
