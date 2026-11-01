import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, Search, RefreshCw, Send, ShieldAlert } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';

interface AlertItem {
  id: string;
  title: string;
  titleTa?: string;
  message: string;
  messageTa?: string;
  category: 'Weather' | 'Pest' | 'Scheme' | 'Market' | 'System';
  targetRole: 'All' | 'Farmer' | 'Transporter' | 'Warehouse' | 'Buyer';
  active: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt?: string;
}

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleTa: '',
    message: '',
    messageTa: '',
    category: 'Weather' as AlertItem['category'],
    targetRole: 'All' as AlertItem['targetRole'],
    priority: 'normal' as AlertItem['priority'],
    active: true,
  });

  const [deleteTarget, setDeleteTarget] = useState<AlertItem | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts();
      if (res && res.data && res.data.length > 0) {
        setAlerts(res.data);
      } else {
        // Fallback default sample alerts
        setAlerts([
          {
            id: 'alt_1',
            title: 'Heavy Rainfall Alert — Delta Region',
            titleTa: 'கனமழை எச்சரிக்கை — காவிரி டெல்டா மாவட்டங்கள்',
            message: 'IMD forecasts heavy rain across Thanjavur, Tiruvarur & Nagapattinam. Secure harvested paddy in covered warehouses.',
            messageTa: 'அடுத்த 48 மணி நேரத்தில் கனமழை பெய்யக்கூடும் என்பதால் அறுவடை செய்த நெல்லை பாதுகாப்பான கிடங்குகளில் சேமிக்கவும்.',
            category: 'Weather',
            targetRole: 'Farmer',
            priority: 'urgent',
            active: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'alt_2',
            title: 'Subsidized Solar Pump Scheme 2026',
            titleTa: 'முதலமைச்சரின் சூரியசக்தி பம்ப் செட் திட்டம்',
            message: 'AED Department invites online applications for 70% capital subsidy on PM-KUSUM Component B standalone solar pumps.',
            messageTa: '70% மானியத்தில் விவசாய சோலார் பம்புசெட்டுகள் பெற வேளாண் பொறியியல் துறை மூலம் விண்ணப்பிக்கலாம்.',
            category: 'Scheme',
            targetRole: 'Farmer',
            priority: 'high',
            active: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'alt_3',
            title: 'Inter-district Freight Corridor Advisory',
            titleTa: 'மாவட்டங்களுக்கிடையேயான சரக்கு போக்குவரத்து வழிகாட்டுதல்',
            message: 'Special agricultural green corridor operating smoothly between Trichy and Koyambedu terminal.',
            messageTa: 'திருச்சி - சென்னை கோயம்பேடு மார்க்கத்தில் சரக்கு வாகனங்களுக்கான சிறப்பு வழித்தடம் செயல்படுகிறது.',
            category: 'System',
            targetRole: 'Transporter',
            priority: 'normal',
            active: true,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      titleTa: '',
      message: '',
      messageTa: '',
      category: 'Weather',
      targetRole: 'All',
      priority: 'normal',
      active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: AlertItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      titleTa: item.titleTa || '',
      message: item.message,
      messageTa: item.messageTa || '',
      category: item.category,
      targetRole: item.targetRole,
      priority: item.priority,
      active: item.active,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveAlert({
        id: editingId || undefined,
        ...formData,
      });
      setShowModal(false);
      fetchAlerts();
    } catch (err: any) {
      alert(err.message || 'Failed to save alert.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteAlert(deleteTarget.id);
      setDeleteTarget(null);
      fetchAlerts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete alert.');
    }
  };

  const handleToggleActive = async (item: AlertItem) => {
    try {
      await api.saveAlert({
        id: item.id,
        ...item,
        active: !item.active,
      });
      fetchAlerts();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle alert status.');
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchRole = roleFilter === 'all' || a.targetRole.toLowerCase() === roleFilter.toLowerCase();
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Broadcast weather warnings, government subsidies, and ecosystem advisories to mobile app users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAlerts}
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
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-bold">Ecosystem In-App Broadcast System</p>
          <p className="mt-0.5">
            Active alerts synchronize immediately to the mobile app's Notification Hub and Agricultural Alerts feed.
            Native push notification delivery depends on individual handset Firebase Cloud Messaging (FCM) permissions.
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by title or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white font-medium"
        >
          <option value="all">All Target Audiences</option>
          <option value="farmer">Farmers Only</option>
          <option value="transporter">Transporters Only</option>
          <option value="warehouse">Warehouse Owners</option>
          <option value="buyer">Buyers Only</option>
        </select>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-green-700" />
            <span>Loading broadcast notifications...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border">
            No matching broadcast alerts found.
          </div>
        ) : (
          filteredAlerts.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition bg-white shadow-sm flex flex-col justify-between ${
                item.active ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                        item.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-600">
                      {item.category}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                {item.titleTa && (
                  <p className="text-xs font-medium text-green-800 mt-0.5">{item.titleTa}</p>
                )}
                <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">{item.message}</p>
                {item.messageTa && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">{item.messageTa}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">Target: <strong className="text-gray-800">{item.targetRole}</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-100"
                  >
                    {item.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-gray-500 hover:text-green-700 rounded-lg hover:bg-green-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1 text-gray-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Broadcast Notification' : 'Compose In-App Advisory / Alert'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Unseasonal Rain Warning"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title (Tamil / தமிழ்)</label>
                <input
                  type="text"
                  value={formData.titleTa}
                  onChange={(e) => setFormData({ ...formData, titleTa: e.target.value })}
                  placeholder="எ.கா: பருவமழை முன்னெச்சரிக்கை"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message (English)</label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter detailed alert instruction..."
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message (Tamil / தமிழ்)</label>
                <textarea
                  rows={2}
                  value={formData.messageTa}
                  onChange={(e) => setFormData({ ...formData, messageTa: e.target.value })}
                  placeholder="விவரமான செய்தி..."
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-medium"
                  >
                    <option value="Weather">Weather</option>
                    <option value="Pest">Pest Attack</option>
                    <option value="Scheme">Govt Scheme</option>
                    <option value="Market">Market Price</option>
                    <option value="System">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-medium"
                  >
                    <option value="All">All Users</option>
                    <option value="Farmer">Farmers</option>
                    <option value="Transporter">Transporters</option>
                    <option value="Warehouse">Warehouses</option>
                    <option value="Buyer">Buyers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-medium"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
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
                  className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Broadcast to App'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Delete Broadcast Notification"
          message={`Are you sure you want to permanently remove "${deleteTarget.title}"?`}
          confirmText="Delete Alert"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDestructive={true}
        />
      )}
    </div>
  );
};
