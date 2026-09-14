import React, { useState } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  Calendar,
  DollarSign,
  Trash2,
  X,
  PieChart,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod, BusinessSettings } from '../types';
import { initialSettings } from '../data/sampleData';

interface ExpensesViewProps {
  expenses: Expense[];
  settings?: BusinessSettings;
  onSaveExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Ingredients & Groceries',
  'Packaging',
  'Gas & Utilities',
  'Rent & Facilities',
  'Transport & Logistics',
  'Staff & Wages',
  'Miscellaneous',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  settings = initialSettings,
  onSaveExpense,
  onDeleteExpense,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: ExpenseCategory;
    amount: number;
    paymentMethod: PaymentMethod;
    date: string;
    notes: string;
  }>({
    title: '',
    category: 'Ingredients & Groceries',
    amount: 0,
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      category: 'Ingredients & Groceries',
      amount: 0,
      paymentMethod: 'Cash',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onShowToast('Title Required', 'Please enter expense description', 'error');
      return;
    }
    if (formData.amount <= 0) {
      onShowToast('Invalid Amount', 'Expense amount must be greater than zero', 'error');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      date: formData.date,
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveExpense(newExpense);
    setIsModalOpen(false);
    onShowToast('Expense Logged', `${settings.currencySymbol}${newExpense.amount.toFixed(2)} recorded for ${newExpense.title}`, 'success');
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Filter
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (categoryFilter !== 'all') return e.category === categoryFilter;
    return true;
  });

  return (
    <div id="expenses-view" className="space-y-6">
      {/* Header & Total Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Operating Expenses</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log inventory ingredients, packaging, gas, delivery fees, and kitchen utilities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right pr-2">
            <span className="text-xs text-slate-500 font-medium">Total Expenses</span>
            <p className="text-lg font-bold text-rose-600">
              {settings.currencySymbol}{totalExpenseAmount.toFixed(2)}
            </p>
          </div>

          <button
            id="btn-add-expense-main"
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-xs transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expense description, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No expense records found</p>
            <p className="text-xs text-slate-400 mt-1">Log ingredient purchases or operational bills to track true profits.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Expense Description</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{exp.title}</p>
                      {exp.notes && <p className="text-xs text-slate-400 mt-0.5">{exp.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{exp.date}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">{exp.paymentMethod}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-rose-600 text-base">
                      -{settings.currencySymbol}{exp.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${exp.title}"?`)) {
                            onDeleteExpense(exp.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div
          id="expense-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="expense-modal"
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-rose-700 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Log Business Expense</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-rose-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Expense Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50kg Basmati Rice & Cooking Oil"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Amount ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min={0.01}
                    step="any"
                    required
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Paid With
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money / Transfer">Mobile Money / Bank Transfer</option>
                    <option value="POS / Card">POS / Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Receipt Details / Vendor Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Purchased at Central Market, Vendor stall #12..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-xs transition"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
