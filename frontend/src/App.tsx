import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Video, Users, Settings, Menu, ChevronLeft, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Videos from './pages/Videos';
import UsersList from './pages/Users';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const SidebarItem = ({ icon: Icon, label, to }: { icon: React.ElementType; label: string; to: string }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
      <Link to={to}>
        <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
          <Icon className="w-5 h-5" />
          {!isSidebarCollapsed && <span className="font-medium">{label}</span>}
        </div>
      </Link>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  const AdminLayout = () => {
    const userEmail = localStorage.getItem('userEmail');

    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'} p-4 flex flex-col`}>
          <div className="flex items-center justify-between mb-8">
            {!isSidebarCollapsed && <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
          
          <nav className="space-y-2 flex-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
            <SidebarItem icon={Video} label="Videos" to="/videos" />
            <SidebarItem icon={Users} label="Users" to="/users" />
            <SidebarItem icon={Settings} label="Settings" to="/settings" />
          </nav>

          {!isSidebarCollapsed && (
            <div className="pt-4 border-t border-gray-200">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 truncate">{userEmail}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all`}
          >
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;