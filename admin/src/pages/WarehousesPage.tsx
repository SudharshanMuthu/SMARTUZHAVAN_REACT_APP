import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { api } from '../services/api';
import { Warehouse, MapPin, Search, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    warehouseName: '',
    location: '',
    capacity: 500,
    availableSpace: 350,
    ratePerDay: 5,
    ownerName: 'TNCSC Central Depot',
    latitude: 10.7905,
    longitude: 78.7047,
  });

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const res = await api.getWarehouses({ search }).catch(() => null);
      if (res && res.success && res.data) {
        setWarehouses(res.data);
      } else {
        const q = query(collection(db, 'warehouses'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setWarehouses(docs);
      }
    } catch (err) {
      console.warn('Warehouses fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      warehouseName: '',
      location: 'Trichy Mandi Corridor',
      capacity: 500,
      availableSpace: 400,
      ratePerDay: 5,
      ownerName: 'TNCSC Agri Storage Hub',
      latitude: 10.7905,
      longitude: 78.7047,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (w: any) => {
    setEditingId(w.id);
    setFormData({
      warehouseName: w.warehouseName || w.name || '',
      location: w.location || '',
      capacity: w.capacity || 0,
      availableSpace: w.availableSpace !== undefined ? w.availableSpace : w.capacity || 0,
      ratePerDay: w.ratePerDay || 5,
      ownerName: w.ownerName || 'Warehouse Owner',
      latitude: w.latitude || 10.7905,
      longitude: w.longitude || 78.7047,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateWarehouse(editingId, formData);
      } else {
        await api.createWarehouse(formData);
      }
      setShowModal(false);
      fetchWarehouses();
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Error saving warehouse facility'}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await api.deleteWarehouse(deleteTarget.id);
      setDeleteTarget(null);
      fetchWarehouses();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Error deleting warehouse facility'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = warehouses.filter((w) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (w.warehouseName || w.name || '').toLowerCase();
    const loc = (w.location || '').toLowerCase();
    return name.includes(q) || loc.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cold Storage & Warehouses</h2>
          <p className="text-sm text-gray-500 mt-1">
            Registered grain granaries, refrigeration units, and space retention rates across Tamil Nadu.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchWarehouses}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Storage Bay</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search facility name or location..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">
          {filtered.length} Facilities Listed
        </span>
      </div>

      {/* Warehouses Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Facility Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Occupancy Rate</th>
                <th className="px-6 py-4">Available / Total</th>
                <th className="px-6 py-4">Daily Rate</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Loading storage facilities from Firestore...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No matching warehouse facilities found.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const capacity = w.capacity || 0;
                  const available = w.availableSpace !== undefined ? w.availableSpace : capacity;
                  const occupied = Math.max(0, capacity - available);
                  const occPercent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;

                  return (
                    <tr key={w.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                            <Warehouse className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{w.warehouseName || w.name || 'Warehouse'}</div>
                            <div className="text-xs text-gray-400">{w.ownerName || 'Verified Operator'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{w.location || 'Tamil Nadu'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-36">
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-gray-700">{occPercent}% Occupied</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                occPercent > 80 ? 'bg-red-500' : occPercent > 50 ? 'bg-amber-500' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, occPercent))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {available} <span className="text-xs font-normal text-gray-400">/ {capacity} Tons</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₹{w.ratePerDay || 5} <span className="text-xs font-normal text-gray-400">/ton/day</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(w)}
                            className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Facility"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(w)}
                            className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Delete Facility"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Facility Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Warehouse Facility' : 'Register New Storage Bay'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={formData.warehouseName}
                  onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                  placeholder="e.g. Lalgudi Central Grain Granary"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location & District</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Trichy-Thanjavur Highway, Trichy"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Total Capacity (T)</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Free Space (T)</label>
                  <input
                    type="number"
                    required
                    value={formData.availableSpace}
                    onChange={(e) => setFormData({ ...formData, availableSpace: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rate (₹/T/Day)</label>
                  <input
                    type="number"
                    required
                    value={formData.ratePerDay}
                    onChange={(e) => setFormData({ ...formData, ratePerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Operator / Owner</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold shadow-sm"
                >
                  {editingId ? 'Save Changes' : 'Register Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Warehouse Facility"
          message={`Are you sure you want to permanently delete "${deleteTarget.warehouseName || deleteTarget.name}"? This will remove it immediately from mobile storage search.`}
          confirmLabel="Delete Facility"
          isDestructive={true}
          loading={actionLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
