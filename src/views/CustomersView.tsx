import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
  MessageSquare,
  Edit2,
  Trash2,
  X,
  CreditCard,
  History,
} from 'lucide-react';
import { Customer, Order, Payment, BusinessSettings } from '../types';
import { initialSettings } from '../data/sampleData';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
  settings?: BusinessSettings;
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onOpenRecordPaymentForCustomer: (customer: Customer) => void;
  onOpenWhatsAppReminder: (customer: Customer) => void;
  onViewOrderReceipt: (order: Order) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  payments,
  settings = initialSettings,
  onSaveCustomer,
  onDeleteCustomer,
  onOpenRecordPaymentForCustomer,
  onOpenWhatsAppReminder,
  onViewOrderReceipt,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debt' | 'zero'>('all');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    address: string;
    creditLimit: number;
    notes: string;
  }>({
    name: '',
    phone: '',
    address: '',
    creditLimit: 100,
    notes: '',
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      creditLimit: 100,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      address: c.address,
      creditLimit: c.creditLimit,
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast('Name Required', 'Please enter customer name', 'error');
      return;
    }

    const customerToSave: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      creditLimit: Number(formData.creditLimit) || 0,
      currentDebt: editingCustomer ? editingCustomer.currentDebt : 0,
      notes: formData.notes.trim(),
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    onSaveCustomer(customerToSave);
    setIsModalOpen(false);
    onShowToast(
      editingCustomer ? 'Client Updated' : 'Client Added',
      `${customerToSave.name} saved to directory`,
      'success'
    );
  };

  // Filter & Search
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'debt') return c.currentDebt > 0;
    if (filterType === 'zero') return c.currentDebt <= 0;
    return true;
  });

  // Active customer's orders and payments for profile drawer/modal
  const activeCustomerOrders = selectedCustomerProfile
    ? orders.filter((o) => o.customerId === selectedCustomerProfile.id)
    : [];
  const activeCustomerPayments = selectedCustomerProfile
    ? payments.filter((p) => p.customerId === selectedCustomerProfile.id)
    : [];

  const totalSpentByActive = activeCustomerOrders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div id="customers-view" className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client profiles, credit limits, and purchase history ({customers.length} total)
          </p>
        </div>

        <button
          id="btn-add-customer-main"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-xs transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilterType('debt')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'debt'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            Has Debt ({customers.filter((c) => c.currentDebt > 0).length})
          </button>
          <button
            onClick={() => setFilterType('zero')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'zero'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Zero Debt ({customers.filter((c) => c.currentDebt <= 0).length})
          </button>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
            <p className="text-sm font-semibold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms or add a new customer above.
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const hasDebt = customer.currentDebt > 0;
            const creditUsagePercent =
              customer.creditLimit > 0
                ? Math.min(100, Math.round((customer.currentDebt / customer.creditLimit) * 100))
                : 0;

            return (
              <div
                key={customer.id}
                id={`customer-card-${customer.id}`}
                className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-slate-300 transition flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top Name & Debt status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3
                        onClick={() => setSelectedCustomerProfile(customer)}
                        className="text-base font-bold text-slate-900 truncate hover:text-orange-600 cursor-pointer transition"
                      >
                        {customer.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{customer.phone || 'No phone'}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                        hasDebt
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {hasDebt ? (
                        <>Debt: {settings.currencySymbol}{customer.currentDebt.toFixed(2)}</>
                      ) : (
                        'Clear'
                      )}
                    </span>
                  </div>

                  {/* Address */}
                  {customer.address && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-2.5 bg-slate-50 p-2 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}

                  {/* Credit limit meter */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Credit Limit: {settings.currencySymbol}{customer.creditLimit.toFixed(0)}</span>
                      <span className={hasDebt ? 'font-semibold text-rose-600' : ''}>
                        {creditUsagePercent}% used
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          creditUsagePercent >= 90
                            ? 'bg-rose-500'
                            : creditUsagePercent > 50
                            ? 'bg-orange-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${creditUsagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Quick Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => setSelectedCustomerProfile(customer)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    title="View Full Purchase History"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>History</span>
                  </button>

                  {hasDebt && (
                    <button
                      onClick={() => onOpenRecordPaymentForCustomer(customer)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
                      title="Collect Payment"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collect</span>
                    </button>
                  )}

                  {hasDebt && (
                    <button
                      onClick={() => onOpenWhatsAppReminder(customer)}
                      className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                      title="Send WhatsApp Debt Reminder"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleOpenEdit(customer)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Edit Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
                          onDeleteCustomer(customer.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div
          id="customer-form-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="customer-form-modal"
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Adebayo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number (for Calls & WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 555 234 8901"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Delivery Address / Location
                </label>
                <textarea
                  rows={2}
                  placeholder="Street, apartment, landmarks..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Credit Limit ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Maximum debt allowed before alert or restriction.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Customer Preferences / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prefers spicy, no onions, vegetarian..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
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
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-xs transition"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Profile & Purchase History Drawer/Modal */}
      {selectedCustomerProfile && (
        <div
          id="customer-profile-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setSelectedCustomerProfile(null)}
        >
          <div
            id="customer-profile-drawer"
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                  Client Profile
                </span>
                <h3 className="text-lg font-bold">{selectedCustomerProfile.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCustomerProfile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Stats */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500">Total Spent</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {settings.currencySymbol}{totalSpentByActive.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500">Current Debt</p>
                <p className={`text-base font-bold mt-0.5 ${selectedCustomerProfile.currentDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {settings.currencySymbol}{selectedCustomerProfile.currentDebt.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500">Total Orders</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {activeCustomerOrders.length}
                </p>
              </div>
            </div>

            {/* Content Tabs: Orders & Payments */}
            <div className="p-5 space-y-5 max-h-[55vh] overflow-y-auto">
              {/* Order History */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <span>Order History</span>
                </h4>

                {activeCustomerOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 italic">No orders logged for this customer yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activeCustomerOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                            <span className="text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ord.orderStatus === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.orderStatus === 'pending'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">
                            {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            {settings.currencySymbol}{ord.total.toFixed(2)}
                          </p>
                          {ord.balanceDue > 0 ? (
                            <p className="text-rose-600 font-semibold text-[11px]">
                              Due: {settings.currencySymbol}{ord.balanceDue.toFixed(2)}
                            </p>
                          ) : (
                            <p className="text-emerald-600 font-semibold text-[11px]">Paid</p>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCustomerProfile(null);
                              onViewOrderReceipt(ord);
                            }}
                            className="text-[11px] font-semibold text-orange-600 hover:underline mt-1 block"
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Payment History</span>
                </h4>

                {activeCustomerPayments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 italic">No recorded payments.</p>
                ) : (
                  <div className="space-y-1.5">
                    {activeCustomerPayments.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">
                            {p.receiptNumber} • {p.method}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                          {p.notes && <p className="text-slate-500 text-[11px] mt-0.5">{p.notes}</p>}
                        </div>
                        <span className="font-bold text-emerald-700">
                          +{settings.currencySymbol}{p.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              {selectedCustomerProfile.currentDebt > 0 && (
                <button
                  onClick={() => {
                    const c = selectedCustomerProfile;
                    setSelectedCustomerProfile(null);
                    onOpenRecordPaymentForCustomer(c);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  Record Payment
                </button>
              )}
              <button
                onClick={() => setSelectedCustomerProfile(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
