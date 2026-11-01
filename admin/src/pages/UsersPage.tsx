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
import type { UserAccount } from '../types/admin';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { Search, Ban, CheckCircle, Eye, X, Edit2 } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [blockingUser, setBlockingUser] = useState<UserAccount | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Attempt backend API first
      const res = await api.getUsers({ role: roleFilter !== 'all' ? roleFilter : undefined, search }).catch(() => null);
      if (res && res.success && res.data) {
        setUsers(res.data);
      } else {
        // Direct Firestore fallback
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as UserAccount[];
        setUsers(docs);
      }
    } catch (err) {
      console.warn('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && (u.role || '').toLowerCase() !== roleFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    }
    return true;
  });

  const handleOpenDetails = async (u: UserAccount) => {
    setSelectedUser(u);
    try {
      const res = await api.getUser(u.id);
      if (res && res.data) {
        setSelectedUser(res.data);
      }
    } catch {
      // Use existing user data
    }
  };

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setEditName(u.name || '');
    setEditPhone(u.phone || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditSaving(true);
    try {
      await api.updateUser(editingUser.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
      });
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, name: editName.trim(), phone: editPhone.trim() } : u))
      );
      if (selectedUser?.id === editingUser.id) {
        setSelectedUser({ ...selectedUser, name: editName.trim(), phone: editPhone.trim() });
      }
      setEditingUser(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message || 'Error updating profile'}`);
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmToggleBlock = async () => {
    if (!blockingUser) return;
    try {
      setActionLoading(true);
      await api.toggleBlockUser(blockingUser.id, !blockingUser.blocked);
      setUsers((prev) =>
        prev.map((u) => (u.id === blockingUser.id ? { ...u, blocked: !blockingUser.blocked } : u))
      );
      setBlockingUser(null);
    } catch (err: any) {
      alert(`Action failed: ${err.message || 'Error updating status'}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Accounts Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Complete management for Farmers, Wholesale Buyers, Freight Transporters, and Warehouse Operators.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 self-start sm:self-auto">
          {filteredUsers.length} Accounts Found
        </span>
      </div>

      {/* Role Quick Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {[
          { key: 'all', label: 'All Users' },
          { key: 'farmer', label: 'Farmers' },
          { key: 'buyer', label: 'Wholesale Buyers' },
          { key: 'transporter', label: 'Transporters' },
          { key: 'warehouse', label: 'Warehouse Owners' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRoleFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              roleFilter === tab.key
                ? 'bg-green-700 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by full name, registered email address, or phone..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Contact Phone</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Loading users from Firestore...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No matching user accounts located.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{u.name || 'Unnamed User'}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-xs text-gray-800 uppercase tracking-wider px-2.5 py-1 rounded-md bg-gray-100">
                        {u.role || 'Farmer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-600">
                      {u.phone || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.blocked ? 'blocked' : 'active'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetails(u)}
                          className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition"
                          title="View Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Permitted Fields"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setBlockingUser(u)}
                          className={`p-1.5 rounded-lg transition ${
                            u.blocked
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                          title={u.blocked ? 'Unblock User' : 'Block / Restrict'}
                        >
                          {u.blocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">User Profile & Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 font-semibold uppercase">Full Name</span>
                  <p className="font-semibold text-gray-900">{selectedUser.name || 'Not provided'}</p>
                </div>
                <button
                  onClick={() => {
                    handleOpenEdit(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="text-xs font-bold text-green-700 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase">Email Address</span>
                <p className="font-semibold text-gray-900">{selectedUser.email || 'Not provided'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase">Contact Phone</span>
                <p className="font-semibold text-gray-900">{selectedUser.phone || 'Not provided'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase">Ecosystem Role</span>
                <p className="font-bold text-green-800">{selectedUser.role || 'Farmer'}</p>
              </div>

              {/* Activity Summary Badges */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-green-50/60 rounded-xl border border-green-100 text-center">
                  <span className="text-xs text-green-800 font-semibold">Listings</span>
                  <p className="font-black text-green-900 text-lg">{selectedUser.listingsCount || 0}</p>
                </div>
                <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
                  <span className="text-xs text-blue-800 font-semibold">Orders / Trips</span>
                  <p className="font-black text-blue-900 text-lg">{selectedUser.ordersCount || 0}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase">Account Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedUser.blocked ? 'blocked' : 'active'} />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Edit User Profile</h3>
            <p className="text-xs text-gray-500 mb-4">Modify supported profile fields stored in Firestore.</p>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold"
                >
                  {editSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block/Unblock Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(blockingUser)}
        title={blockingUser?.blocked ? 'Unblock User Account' : 'Restrict User Account'}
        message={
          blockingUser?.blocked
            ? `Are you sure you want to restore full platform access for ${blockingUser.email || blockingUser.name}?`
            : `Are you sure you want to block ${blockingUser?.email || blockingUser?.name}? They will be prevented from placing orders or creating harvest posts.`
        }
        confirmLabel={blockingUser?.blocked ? 'Unblock User' : 'Block User'}
        isDestructive={!blockingUser?.blocked}
        loading={actionLoading}
        onConfirm={handleConfirmToggleBlock}
        onCancel={() => setBlockingUser(null)}
      />
    </div>
  );
};
