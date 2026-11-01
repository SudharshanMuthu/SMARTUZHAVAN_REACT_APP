import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layers, Plus, Trash2, RefreshCw, Save, CheckCircle2 } from 'lucide-react';

interface AppContent {
  cropCategories: string[];
  districts: string[];
  banners: Array<{ id: string; title: string; active: boolean }>;
}

export const ContentPage: React.FC = () => {
  const [content, setContent] = useState<AppContent>({
    cropCategories: [],
    districts: [],
    banners: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New item inputs
  const [newCategory, setNewCategory] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newBannerTitle, setNewBannerTitle] = useState('');

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await api.getAppContent();
      if (res && res.data) {
        setContent(res.data);
      }
    } catch {
      // Empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.saveAppContent(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save app configuration.');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    if (content.cropCategories.includes(newCategory.trim())) return;
    setContent({
      ...content,
      cropCategories: [...content.cropCategories, newCategory.trim()],
    });
    setNewCategory('');
  };

  const removeCategory = (cat: string) => {
    setContent({
      ...content,
      cropCategories: content.cropCategories.filter((c) => c !== cat),
    });
  };

  const addDistrict = () => {
    if (!newDistrict.trim()) return;
    if (content.districts.includes(newDistrict.trim())) return;
    setContent({
      ...content,
      districts: [...content.districts, newDistrict.trim()],
    });
    setNewDistrict('');
  };

  const removeDistrict = (dist: string) => {
    setContent({
      ...content,
      districts: content.districts.filter((d) => d !== dist),
    });
  };

  const addBanner = () => {
    if (!newBannerTitle.trim()) return;
    const newB = {
      id: `banner_${Date.now()}`,
      title: newBannerTitle.trim(),
      active: true,
    };
    setContent({
      ...content,
      banners: [...content.banners, newB],
    });
    setNewBannerTitle('');
  };

  const removeBanner = (id: string) => {
    setContent({
      ...content,
      banners: content.banners.filter((b) => b.id !== id),
    });
  };

  const toggleBanner = (id: string) => {
    setContent({
      ...content,
      banners: content.banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Content & Configurations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Centrally manage crop categories, supported market districts, and mobile app announcements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchContent}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved to App!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Categories Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-700" />
                <span>Crop Categories</span>
              </h2>
              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full font-bold text-gray-600">
                {content.cropCategories.length} Categories
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {content.cropCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-800 border border-green-200 text-sm font-semibold"
                >
                  <span>{cat}</span>
                  <button
                    onClick={() => removeCategory(cat)}
                    className="text-green-600 hover:text-red-700 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Millets, Pulses..."
              className="flex-1 px-3 py-2 border rounded-xl text-sm"
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
            <button
              onClick={addCategory}
              className="px-3.5 py-2 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Supported Mandi Districts Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-700" />
                <span>Supported Mandi Districts</span>
              </h2>
              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded-full font-bold text-gray-600">
                {content.districts.length} Districts
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {content.districts.map((dist) => (
                <span
                  key={dist}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-sm font-semibold"
                >
                  <span>{dist}</span>
                  <button
                    onClick={() => removeDistrict(dist)}
                    className="text-blue-600 hover:text-red-700 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <input
              type="text"
              value={newDistrict}
              onChange={(e) => setNewDistrict(e.target.value)}
              placeholder="e.g. Madurai, Salem..."
              className="flex-1 px-3 py-2 border rounded-xl text-sm"
              onKeyDown={(e) => e.key === 'Enter' && addDistrict()}
            />
            <button
              onClick={addDistrict}
              className="px-3.5 py-2 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Informational App Banners */}
        <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Mobile Home Banners & Bulletins</h2>
            <span className="text-xs text-gray-500 font-medium">Synchronized with mobile hero ticker</span>
          </div>

          <div className="space-y-2.5 mb-4">
            {content.banners.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${b.active ? 'bg-green-600' : 'bg-gray-300'}`}
                  />
                  <span className="font-medium text-sm text-gray-800">{b.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBanner(b.id)}
                    className="text-xs px-2.5 py-1 rounded-lg border bg-white font-semibold hover:bg-gray-100"
                  >
                    {b.active ? 'Active' : 'Disabled'}
                  </button>
                  <button
                    onClick={() => removeBanner(b.id)}
                    className="p-1 text-gray-400 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <input
              type="text"
              value={newBannerTitle}
              onChange={(e) => setNewBannerTitle(e.target.value)}
              placeholder="Enter new announcement banner text..."
              className="flex-1 px-3 py-2 border rounded-xl text-sm"
            />
            <button
              onClick={addBanner}
              className="px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Banner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
