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
import { ConfirmModal } from '../components/ConfirmModal';
import { Search, Sprout, MapPin, Trash2, Eye, X, Plus, Edit2, RefreshCw } from 'lucide-react';

export const CropsPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [deletingPost, setDeletingPost] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Create / Edit modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cropName: '',
    variety: '',
    quantity: 100,
    unit: 'kg',
    price: 35,
    location: 'Trichy',
    userName: 'Admin Listing',
    description: '',
    imageUrl: '',
    status: 'active',
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.getPosts({ search }).catch(() => null);
      if (res && res.success && res.data) {
        setPosts(res.data);
      } else {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setPosts(docs);
      }
    } catch (err) {
      console.warn('Posts fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const crop = (p.cropName || '').toLowerCase();
    const farmer = (p.userName || '').toLowerCase();
    const location = (p.location || '').toLowerCase();
    return crop.includes(q) || farmer.includes(q) || location.includes(q);
  });

  const handleOpenCreate = () => {
    setEditingPostId(null);
    setFormData({
      cropName: '',
      variety: '',
      quantity: 100,
      unit: 'kg',
      price: 35,
      location: 'Trichy',
      userName: 'Smart Uzhavan Admin',
      description: 'Verified farm harvest available for direct procurement.',
      imageUrl: '',
      status: 'active',
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingPostId(p.id);
    setFormData({
      cropName: p.cropName || '',
      variety: p.variety || '',
      quantity: p.quantity || 100,
      unit: p.unit || 'kg',
      price: p.price || 0,
      location: p.location || '',
      userName: p.userName || 'Farmer',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      status: p.status || 'active',
    });
    setShowFormModal(true);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPostId) {
        await api.updateCrop(editingPostId, formData);
      } else {
        await api.createCrop(formData);
      }
      setShowFormModal(false);
      fetchPosts();
    } catch (err: any) {
      alert(`Save failed: ${err.message || 'Error saving listing'}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;
    try {
      setActionLoading(true);
      await api.deletePost(deletingPost.id, 'Admin moderation removal');
      setPosts((prev) => prev.filter((p) => p.id !== deletingPost.id));
      setDeletingPost(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Error deleting listing'}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crop Harvest Marketplace</h2>
          <p className="text-sm text-gray-500 mt-1">
            Central moderation directory for farmer harvest postings, pricing, tonnage, and buyer inquiries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Listing</span>
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
            placeholder="Search crop, farmer or district..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">
          {filteredPosts.length} Listings
        </span>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Produce</th>
                <th className="px-6 py-4">Farmer / Producer</th>
                <th className="px-6 py-4">Rate & Lot Size</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Loading crop harvest listings from Firestore...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No matching marketplace crop listings found.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.cropName}
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center border border-green-100">
                            <Sprout className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{p.cropName}</div>
                          {p.variety && <div className="text-xs text-green-700">{p.variety}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{p.userName || 'Local Producer'}</div>
                      <div className="text-xs text-gray-400">{p.userPhone || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">₹{p.price} <span className="text-xs font-normal text-gray-400">/{p.unit || 'kg'}</span></div>
                      <div className="text-xs text-gray-500 font-medium">Available: {p.quantity} {p.unit || 'kg'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{p.location || 'Tamil Nadu'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        {p.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPost(p)}
                          className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Listing"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingPost(p)}
                          className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete Listing"
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

      {/* Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Crop Listing Details</h3>

            {selectedPost.imageUrl && (
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.cropName}
                className="w-full h-44 rounded-xl object-cover mb-4 border"
              />
            )}

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase">Crop & Variety</span>
                <p className="font-bold text-gray-900">{selectedPost.cropName} {selectedPost.variety ? `(${selectedPost.variety})` : ''}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase">Pricing & Lot Quantity</span>
                <p className="font-bold text-green-700">₹{selectedPost.price} / {selectedPost.unit || 'kg'} • {selectedPost.quantity} {selectedPost.unit || 'kg'} in stock</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase">Farmer Contact</span>
                <p className="font-semibold text-gray-900">{selectedPost.userName || 'Unnamed'} • {selectedPost.userPhone || 'No phone'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 font-semibold uppercase">Location / Market</span>
                <p className="font-semibold text-gray-800">{selectedPost.location}</p>
              </div>

              {selectedPost.description && (
                <div className="p-3 bg-gray-50 rounded-xl">
                  <span className="text-xs text-gray-500 font-semibold uppercase">Description</span>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">{selectedPost.description}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Listing Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPostId ? 'Edit Harvest Listing' : 'Publish Crop Harvest Listing'}
            </h3>

            <form onSubmit={handleSaveListing} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    placeholder="e.g. Organic Ponni Paddy"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Variety</label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder="e.g. BPT 5204 Samba"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  >
                    <option value="kg">kg</option>
                    <option value="Quintal">Quintal</option>
                    <option value="Ton">Ton</option>
                    <option value="Bag">Bag</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location / District</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Trichy"
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Farmer / Seller</label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/crop.jpg"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold shadow-sm"
                >
                  {editingPostId ? 'Save Changes' : 'Publish to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingPost)}
        title="Remove Harvest Listing"
        message={`Are you sure you want to moderate and remove ${deletingPost?.cropName} by ${deletingPost?.userName}? This action removes it immediately from mobile marketplace search.`}
        confirmLabel="Delete Listing"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPost(null)}
      />
    </div>
  );
};
