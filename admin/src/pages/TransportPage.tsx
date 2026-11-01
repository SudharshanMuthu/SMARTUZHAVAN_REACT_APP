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
import { Truck, MapPin, Search, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

export const TransportPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Mini Truck',
    number: '',
    capacity: 2.5,
    ratePerKm: 25,
    baseLocation: 'Trichy',
    ownerName: 'Transport Partner',
    isAvailable: true,
  });

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.getVehicles({ search }).catch(() => null);
      if (res && res.success && res.data) {
        setVehicles(res.data);
      } else {
        const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setVehicles(docs);
      }
    } catch (err) {
      console.warn('Vehicles fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'Mini Truck',
      number: 'TN-45-AZ-1024',
      capacity: 2.5,
      ratePerKm: 25,
      baseLocation: 'Trichy Mandi Hub',
      ownerName: 'Verified Freight Operator',
      isAvailable: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (v: any) => {
    setEditingId(v.id);
    setFormData({
      name: v.name || '',
      type: v.type || 'Mini Truck',
      number: v.number || '',
      capacity: v.capacity || 2.5,
      ratePerKm: v.ratePerKm || 25,
      baseLocation: v.baseLocation || '',
      ownerName: v.ownerName || 'Transporter',
      isAvailable: v.isAvailable ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateVehicle(editingId, formData);
      } else {
        await api.createVehicle(formData);
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Error saving vehicle'}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await api.deleteVehicle(deleteTarget.id);
      setDeleteTarget(null);
      fetchVehicles();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Error deleting vehicle'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAvailability = async (v: any) => {
    try {
      await api.updateVehicle(v.id, { isAvailable: !v.isAvailable });
      fetchVehicles();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const filtered = vehicles.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (v.name || '').toLowerCase();
    const number = (v.number || '').toLowerCase();
    const loc = (v.baseLocation || '').toLowerCase();
    const type = (v.type || '').toLowerCase();
    return name.includes(q) || number.includes(q) || loc.includes(q) || type.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Freight Transport Fleet</h2>
          <p className="text-sm text-gray-500 mt-1">
            Registered commercial vehicles, payload capacities, freight rates, and base corridors across Tamil Nadu.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchVehicles}
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
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicle model, reg number or base location..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">
          {filtered.length} Vehicles in Fleet
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Vehicle Model</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Registration Number</th>
                <th className="px-6 py-4">Payload Capacity</th>
                <th className="px-6 py-4">Rate / km</th>
                <th className="px-6 py-4">Base Location</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Loading registered fleet vehicles from Firestore...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No matching transport vehicles located.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div>{v.name}</div>
                          <div className="text-xs text-gray-400">{v.ownerName || 'Fleet Operator'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-xs text-gray-700 px-2.5 py-1 rounded-md bg-gray-100">
                        {v.type || 'Mini Truck'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-800">
                      {v.number || '—'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {v.capacity} Tons
                    </td>
                    <td className="px-6 py-4 font-bold text-green-700">
                      ₹{v.ratePerKm || 25}/km
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{v.baseLocation || 'Tamil Nadu'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleAvailability(v)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          v.isAvailable !== false
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {v.isAvailable !== false ? 'Active' : 'Offline'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Vehicle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(v)}
                          className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete Vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Transport Vehicle' : 'Register Freight Vehicle into Fleet'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Model / Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tata 407 LPT Heavy Hauler"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-medium"
                  >
                    <option value="Mini Truck">Mini Truck (Bolero/Ace)</option>
                    <option value="Lorry">Lorry / Multi-Axle</option>
                    <option value="Tractor">Tractor with Trailer</option>
                    <option value="Van">Cargo Van</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reg Number</label>
                  <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="TN-45-AZ-1024"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payload (Tons)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rate (₹/km)</label>
                  <input
                    type="number"
                    required
                    value={formData.ratePerKm}
                    onChange={(e) => setFormData({ ...formData, ratePerKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Base Location / Mandi Terminal</label>
                <input
                  type="text"
                  required
                  value={formData.baseLocation}
                  onChange={(e) => setFormData({ ...formData, baseLocation: e.target.value })}
                  placeholder="e.g. Trichy Agricultural Corridor"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Transporter / Operator</label>
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
                  {editingId ? 'Save Changes' : 'Register Vehicle'}
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
          title="Delete Transport Vehicle"
          message={`Are you sure you want to remove "${deleteTarget.name} (${deleteTarget.number})"? This will remove it immediately from mobile transport bookings.`}
          confirmLabel="Delete Vehicle"
          isDestructive={true}
          loading={actionLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
