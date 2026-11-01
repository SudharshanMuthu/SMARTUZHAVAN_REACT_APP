import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Warehouse, Truck, ShoppingCart, Filter, RefreshCw } from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'storage' | 'transport' | 'crop'>('crop');
  const [cropOrders, setCropOrders] = useState<any[]>([]);
  const [storageBookings, setStorageBookings] = useState<any[]>([]);
  const [transportOrders, setTransportOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordRes, whRes] = await Promise.all([
        api.getOrders({ limit: 100 }),
        api.getStorageBookings({ limit: 100 }),
      ]);

      const allOrders = ordRes.orders || ordRes.data || [];
      const crops = allOrders.filter((o: any) => o.type !== 'transport');
      const transports = allOrders.filter((o: any) => o.type === 'transport');
      const storages = whRes.bookings || whRes.data || [];

      setCropOrders(crops);
      setTransportOrders(transports);
      setStorageBookings(storages);
    } catch (err) {
      console.warn('Bookings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      setUpdatingId(orderId);
      await api.updateOrderStatus(orderId, nextStatus);
      setActionSuccess(`Order updated to "${nextStatus}"`);
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchData();
    } catch (err: any) {
      alert(`Failed to update order status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStorageStatus = async (bookingId: string, nextStatus: string) => {
    try {
      setUpdatingId(bookingId);
      await api.updateStorageBookingStatus(bookingId, nextStatus);
      setActionSuccess(`Storage booking updated to "${nextStatus}"`);
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchData();
    } catch (err: any) {
      alert(`Failed to update booking status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filterItems = (list: any[]) => {
    return list.filter((item) => {
      if (statusFilter === 'all') return true;
      return (item.status || '').toLowerCase() === statusFilter.toLowerCase();
    });
  };

  const filteredCrops = filterItems(cropOrders);
  const filteredStorage = filterItems(storageBookings);
  const filteredTransport = filterItems(transportOrders);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookings & Order Lifecycle</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time management for marketplace grain trades, cold storage reservations, and road transport dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {actionSuccess && (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium animate-fade-in">
              {actionSuccess}
            </span>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agri-600 text-gray-700 shadow-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="requested">Requested</option>
              <option value="accepted">Accepted / Approved</option>
              <option value="confirmed">Confirmed</option>
              <option value="on_trip">In Transit / On Trip</option>
              <option value="stored">Stored</option>
              <option value="completed">Completed / Delivered</option>
              <option value="rejected">Rejected / Cancelled</option>
            </select>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 space-x-2">
        <button
          onClick={() => setActiveTab('crop')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'crop'
              ? 'border-agri-600 text-agri-700 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Crop Orders ({cropOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'storage'
              ? 'border-agri-600 text-agri-700 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Warehouse Bookings ({storageBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transport')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'transport'
              ? 'border-agri-600 text-agri-700 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Transport Requests ({transportOrders.length})</span>
        </button>
      </div>

      {/* Tab 1: Crop Orders */}
      {activeTab === 'crop' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Produce / Crop</th>
                  <th className="px-6 py-3.5">Buyer</th>
                  <th className="px-6 py-3.5">Quantity & Value</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Admin Action</th>
                  <th className="px-6 py-3.5 text-right">Order Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      Loading crop orders...
                    </td>
                  </tr>
                ) : filteredCrops.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No marketplace crop orders found.
                    </td>
                  </tr>
                ) : (
                  filteredCrops.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {o.cropName || o.productName || 'Agricultural Produce'}
                        <p className="text-xs font-normal text-gray-500">Seller: {o.farmerName || o.farmerId || 'Farmer'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{o.buyerName || o.customerName || 'Buyer'}</p>
                        <p className="text-xs text-gray-400">{o.buyerPhone || o.shippingAddress || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          {o.quantity || 1} {o.quantityUnit || o.unit || 'kg'}
                        </div>
                        <div className="text-xs font-semibold text-agri-700">₹{o.totalAmount || o.price || 0}</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={o.status || 'pending'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {o.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'completed')}
                              disabled={updatingId === o.id}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium rounded transition"
                              title="Mark as Completed"
                            >
                              Complete
                            </button>
                          )}
                          {o.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'cancelled')}
                              disabled={updatingId === o.id}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-medium rounded transition"
                              title="Cancel Order"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-gray-400">
                        {o.id.slice(0, 8)}...
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Storage Bookings */}
      {activeTab === 'storage' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Farmer / Producer</th>
                  <th className="px-6 py-3.5">Warehouse Facility</th>
                  <th className="px-6 py-3.5">Load & Duration</th>
                  <th className="px-6 py-3.5">Total Billing</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Admin Action</th>
                  <th className="px-6 py-3.5 text-right">Booking ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Loading storage bookings...
                    </td>
                  </tr>
                ) : filteredStorage.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No storage bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredStorage.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {b.farmerName || b.farmerEmail || 'Farmer'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{b.warehouseName || 'Cold Storage Unit'}</p>
                        <p className="text-xs text-gray-400">{b.location || 'Tamil Nadu'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{b.quantity} Tons</span>
                        <span className="text-xs text-gray-500"> for {b.days || 30} Days</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-agri-700">
                        ₹{b.totalPrice || 0}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={b.status || 'requested'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {b.status === 'requested' && (
                            <button
                              onClick={() => handleUpdateStorageStatus(b.id, 'accepted')}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium rounded transition"
                            >
                              Approve
                            </button>
                          )}
                          {b.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateStorageStatus(b.id, 'stored')}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-medium rounded transition"
                            >
                              Mark Stored
                            </button>
                          )}
                          {b.status !== 'rejected' && b.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStorageStatus(b.id, 'rejected')}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-medium rounded transition"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-gray-400">
                        {b.id.slice(0, 8)}...
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Transport Orders */}
      {activeTab === 'transport' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Hauling Corridor</th>
                  <th className="px-6 py-3.5">Cargo Specs</th>
                  <th className="px-6 py-3.5">Requester</th>
                  <th className="px-6 py-3.5">Freight Fare</th>
                  <th className="px-6 py-3.5">Trip Status</th>
                  <th className="px-6 py-3.5">Admin Action</th>
                  <th className="px-6 py-3.5 text-right">Order ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Loading transport orders...
                    </td>
                  </tr>
                ) : filteredTransport.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No transport dispatches found.
                    </td>
                  </tr>
                ) : (
                  filteredTransport.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-semibold">
                          <span>{o.pickup}</span>
                          <span className="text-gray-400 mx-1.5">→</span>
                          <span>{o.drop}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{o.distanceKm || 0} km transit distance</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {o.weightTons || 0} Tons
                        <p className="text-xs font-normal text-gray-400">{o.vehicleName || o.vehicleType || 'Freight Truck'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{o.requestedByName || 'Farmer'}</p>
                        <p className="text-xs text-gray-400">{o.requestedByEmail || ''}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-agri-700">
                        ₹{o.price || 0}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={o.status || 'requested'} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {o.status === 'requested' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'accepted')}
                              disabled={updatingId === o.id}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium rounded transition"
                            >
                              Approve
                            </button>
                          )}
                          {o.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'on_trip')}
                              disabled={updatingId === o.id}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-medium rounded transition"
                            >
                              Start Trip
                            </button>
                          )}
                          {o.status === 'on_trip' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'completed')}
                              disabled={updatingId === o.id}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium rounded transition"
                            >
                              Complete
                            </button>
                          )}
                          {o.status !== 'rejected' && o.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(o.id, 'rejected')}
                              disabled={updatingId === o.id}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-medium rounded transition"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-gray-400">
                        {o.id.slice(0, 8)}...
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
