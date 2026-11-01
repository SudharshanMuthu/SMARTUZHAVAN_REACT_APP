import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const errorMsg = (location.state as any)?.error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">Administrator Access Denied</h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          The signed-in account is not authorized to access the Smart Uzhavan Administration Portal.
        </p>

        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-left">
          <p className="text-xs text-gray-500 font-semibold uppercase">Signed In As</p>
          <p className="text-sm font-mono text-gray-800 mt-0.5">{user?.email || 'Unknown User'}</p>
          {errorMsg && <p className="text-xs text-red-600 mt-1">{errorMsg}</p>}
        </div>

        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900">
          <p className="font-semibold mb-1">To Authorize an Administrator:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Add this email address to <code className="bg-amber-100 px-1 rounded">ADMIN_EMAILS</code> in the backend <code className="bg-amber-100 px-1 rounded">.env</code> file.
            </li>
            <li>Or set the Firebase Custom Claim <code className="bg-amber-100 px-1 rounded">&#123; admin: true &#125;</code> using the Firebase Admin SDK.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
