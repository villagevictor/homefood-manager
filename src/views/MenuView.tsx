import React, { useState } from 'react';
import {
  Soup,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Tag,
  DollarSign,
  Layers,
} from 'lucide-react';
import { MenuItem, MenuCategory, BusinessSettings } from '../types';
import { initialSettings } from '../data/sampleData';

interface MenuViewProps {
  menuItems: MenuItem[];
  settings?: BusinessSettings;
  onSaveMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES: MenuCategory[] = [
  'Main Dishes',
  'Soups & Stews',
  'Sides & Extras',
  'Drinks & Beverages',
  'Combos & Catering',
];

export const MenuView: React.FC<MenuViewProps> = ({
  menuItems,
  settings = initialSettings,
  onSaveMenuItem,
  onDeleteMenuItem,
  onToggleAvailability,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: MenuCategory;
    price: number;
    cost: number;
    description: string;
    isAvailable: boolean;
    imageEmoji: string;
  }>({
    name: '',
    category: 'Main Dishes',
    price: 10,
    cost: 4,
    description: '',
    isAvailable: true,
    imageEmoji: '🍲',
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Main Dishes',
      price: 12,
      cost: 4.5,
      description: '',
      isAvailable: true,
      imageEmoji: '🍲',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      cost: item.cost,
      description: item.description,
      isAvailable: item.isAvailable,
      imageEmoji: item.imageEmoji || '🍲',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast('Name Required', 'Please enter food dish name', 'error');
      return;
    }

    const itemToSave: MenuItem = {
      id: editingItem ? editingItem.id : `menu-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      cost: Number(formData.cost),
      description: formData.description.trim(),
      isAvailable: formData.isAvailable,
      imageEmoji: formData.imageEmoji.trim() || '🍲',
    };

    onSaveMenuItem(itemToSave);
    setIsModalOpen(false);
    onShowToast(
      editingItem ? 'Dish Updated' : 'Dish Added',
      `${itemToSave.name} saved to menu`,
      'success'
    );
  };

  // Filter
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory !== 'All') return item.category === selectedCategory;
    return true;
  });

  return (
    <div id="menu-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Menu Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dishes, packages, selling prices, food costs, and availability
          </p>
        </div>

        <button
          id="btn-add-menu-item"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-xs transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Dish / Item</span>
        </button>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish name, ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({menuItems.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = menuItems.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
            <Soup className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No menu items found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try switching category filter or click "Add Dish" to expand your catalog.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const margin = item.price - item.cost;
            const marginPercent = item.price > 0 ? Math.round((margin / item.price) * 100) : 0;

            return (
              <div
                key={item.id}
                id={`menu-card-${item.id}`}
                className={`bg-white rounded-2xl p-5 shadow-xs border transition flex flex-col justify-between gap-3 ${
                  item.isAvailable ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl">{item.imageEmoji || '🍲'}</span>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {item.name}
                        </h3>
                        <span className="text-xs font-semibold text-orange-600">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Stock toggle switch */}
                    <button
                      onClick={() => onToggleAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title="Click to toggle availability"
                    >
                      {item.isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Sold Out</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>

                  {/* Financial Metrics */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Price:</span>{' '}
                      <span className="font-bold text-slate-900 text-sm">
                        {settings.currencySymbol}{item.price.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Cost:</span>{' '}
                      <span className="font-medium text-slate-600">
                        {settings.currencySymbol}{item.cost.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Margin:</span>{' '}
                      <span className="font-semibold text-emerald-600">
                        +{marginPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${item.name}" from menu catalog?`)) {
                        onDeleteMenuItem(item.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div
          id="menu-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="menu-modal"
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingItem ? 'Edit Dish / Package' : 'Add Food Item to Menu'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.imageEmoji}
                    onChange={(e) => setFormData({ ...formData, imageEmoji: e.target.value })}
                    className="w-full px-3 py-2 text-center text-lg bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smoky Jollof Rice"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuCategory })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Selling Price ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ingredient Cost ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Description & Ingredients
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, spice level, portion notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-available"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                />
                <label htmlFor="chk-available" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Available in stock for ordering
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-xs transition"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
