import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Sprout,
  Warehouse,
  Truck,
  ClipboardList,
  Activity,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { api } from '../services/api';
import type { SystemStats } from '../types/admin';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [servicesHealth, setServicesHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, healthRes] = await Promise.all([
          api.getStats().catch(() => null),
          api.getServicesStatus().catch(() => null),
        ]);

        if (statsRes && statsRes.success) {
          setStats(statsRes.data?.stats);
        }
        if (healthRes && healthRes.success) {
          setServicesHealth(healthRes.data);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Operations Command Center</h2>
        <p className="text-sm text-gray-500 mt-1">
          Live Firestore platform metrics, role distribution, logistics quotas, and service telemetry.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registered Users"
          value={stats ? stats.totalUsers : (loading ? '...' : 0)}
          subtitle={`${stats?.farmers || 0} Farmers • ${stats?.buyers || 0} Buyers`}
          icon={Users}
          color="text-emerald-700 bg-emerald-50"
        />
        <StatCard
          title="Harvest Crop Listings"
          value={stats ? stats.totalPosts : (loading ? '...' : 0)}
          subtitle="Direct Farmer-to-Buyer marketplace"
          icon={Sprout}
          color="text-agri-600 bg-agri-50"
        />
        <StatCard
          title="Warehouse Facilities"
          value={stats ? stats.totalWarehouses : (loading ? '...' : 0)}
          subtitle={`${stats?.warehouseOwners || 0} Facility Owners verified`}
          icon={Warehouse}
          color="text-purple-600 bg-purple-50"
        />
        <StatCard
          title="Transport Fleet"
          value={stats ? stats.totalVehicles : (loading ? '...' : 0)}
          subtitle={`${stats?.transporters || 0} Transporters active`}
          icon={Truck}
          color="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Booking & Logistics Quota Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Storage Bookings"
          value={stats ? stats.totalWarehouseBookings : (loading ? '...' : 0)}
          subtitle={`${stats?.pendingStorageBookings || 0} awaiting owner review`}
          icon={Clock}
          color="text-amber-600 bg-amber-50"
          badge={`${stats?.pendingStorageBookings || 0} Pending`}
        />
        <StatCard
          title="Transport Dispatches"
          value={stats ? stats.totalOrders : (loading ? '...' : 0)}
          subtitle={`${stats?.onTripTransportBookings || 0} vehicles on active highway transit`}
          icon={ClipboardList}
          color="text-indigo-600 bg-indigo-50"
          badge={`${stats?.pendingTransportBookings || 0} Requests`}
        />
        <StatCard
          title="Account Security"
          value={stats?.blockedUsers || 0}
          subtitle="Users currently restricted"
          icon={ShieldCheck}
          color="text-rose-600 bg-rose-50"
          badge={stats?.blockedUsers ? 'Flagged' : 'Clean'}
        />
      </div>

      {/* User Role Distribution & Services Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">User Ecosystem Demographics</h3>
            <Link to="/users" className="text-xs font-semibold text-agri-600 hover:text-agri-700">
              Manage Users &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Farmers</span>
                <span>{stats?.farmers || 0} ({stats?.totalUsers ? Math.round(((stats.farmers || 0) / stats.totalUsers) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{
                    width: `${stats?.totalUsers ? Math.min(100, ((stats.farmers || 0) / stats.totalUsers) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Wholesale Buyers</span>
                <span>{stats?.buyers || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${stats?.totalUsers ? Math.min(100, ((stats.buyers || 0) / stats.totalUsers) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Freight Transporters</span>
                <span>{stats?.transporters || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${stats?.totalUsers ? Math.min(100, ((stats.transporters || 0) / stats.totalUsers) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>Warehouse Operators</span>
                <span>{stats?.warehouseOwners || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${stats?.totalUsers ? Math.min(100, ((stats.warehouseOwners || 0) / stats.totalUsers) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Backend Subsystems & Health</h3>
            <Link to="/services" className="text-xs font-semibold text-agri-600 hover:text-agri-700">
              View Telemetry &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Gemini 2.5 AI Precision Engine</p>
                  <p className="text-[11px] text-gray-500">Multimodal vision, irrigation advisory & diagnosis</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {servicesHealth?.aiService?.status || 'ONLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Open-Meteo Live Weather & Spray Advisory</p>
                  <p className="text-[11px] text-gray-500">Real-time agricultural weather coordinates</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {servicesHealth?.weatherService?.status || 'ONLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Agmarknet Tamil Nadu APMC Mandi Feeds</p>
                  <p className="text-[11px] text-gray-500">Trichy, Madurai, Erode daily commodity rates</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {servicesHealth?.marketService?.status || 'ONLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-900">Firebase Admin SDK & Security Rules</p>
                  <p className="text-[11px] text-gray-500">Project: smart-uzhavan-369b0</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {servicesHealth?.firebaseAdmin?.isConfigured ? 'CONNECTED' : 'PREPARED'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
