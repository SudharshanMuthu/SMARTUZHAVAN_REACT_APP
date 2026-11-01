import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Sprout,
  TrendingUp,
  Warehouse,
  Truck,
  ClipboardList,
  Bell,
  Sliders,
  Activity,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'User Management', path: '/users', icon: Users },
  { name: 'Crop Marketplace', path: '/crops', icon: Sprout },
  { name: 'Mandi Market Prices', path: '/market-prices', icon: TrendingUp },
  { name: 'Warehouse Hub', path: '/warehouses', icon: Warehouse },
  { name: 'Transport Fleet', path: '/transport', icon: Truck },
  { name: 'Bookings & Orders', path: '/bookings', icon: ClipboardList },
  { name: 'Alerts & Broadcasts', path: '/alerts', icon: Bell },
  { name: 'App Content & Config', path: '/content', icon: Sliders },
  { name: 'Service Health', path: '/services', icon: Activity },
  { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 min-h-screen border-r border-gray-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-700 to-emerald-500 flex items-center justify-center text-white shadow-sm font-black text-lg">
          U
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-wide text-white">Smart Uzhavan</h1>
          <span className="text-[10px] uppercase font-bold text-green-400 tracking-wider">
            Central Admin Console
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-green-700 text-white shadow-sm'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
        <p className="font-bold text-white">Tamil Nadu Agri Stack</p>
        <p className="text-[10px] mt-0.5 text-gray-500">Firebase: smart-uzhavan-369b0</p>
      </div>
    </aside>
  );
};
