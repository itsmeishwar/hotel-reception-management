import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Booking from './components/Booking';
import Rooms from './components/Rooms';
import Guests from './components/Guests';
import Cafe from './components/Cafe';
import FoodMenu from './components/FoodMenu';
import Tables from './components/Tables';
import Billing from './components/Billing';
import Payments from './components/Payments';
import Staff from './components/Staff';
import RolesAccess from './components/RolesAccess';
import Reports from './components/Reports';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/bookings" element={<Booking />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/guests" element={<Guests />} />
                <Route path="/cafe" element={<Cafe />} />
                <Route path="/food-menu" element={<FoodMenu />} />
                <Route path="/tables" element={<Tables />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/roles" element={<RolesAccess />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
