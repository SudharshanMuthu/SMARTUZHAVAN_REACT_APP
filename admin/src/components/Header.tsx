import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { adminUser, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Production Environment
        </span>
        <span className="text-xs text-gray-500">
          Auth: <span className="font-mono text-gray-700">{adminUser?.authMethod || 'VERIFIED'}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 text-right">
          <div className="w-8 h-8 rounded-full bg-agri-100 text-agri-700 flex items-center justify-center font-bold text-xs">
            {adminUser?.email ? adminUser.email[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight">
              {adminUser?.email || 'Administrator'}
            </p>
            <p className="text-[10px] text-gray-500 flex items-center gap-1">
              <Shield className="w-3 h-3 text-agri-600 inline" /> Super Admin
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out of Admin Portal"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
