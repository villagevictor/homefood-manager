import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  PlusCircle,
  Calendar,
  CheckCircle,
  X,
  DollarSign,
  User,
  FileText,
} from 'lucide-react';
import { Payment, Customer, Order, BusinessSettings, PaymentMethod } from '../types';
import { initialSettings } from '../data/sampleData';

interface PaymentsViewProps {
  payments: Payment[];
  customers: Customer[];
  orders: Order[];
  settings?: BusinessSettings;
  isRecordModalOpen: boolean;
  preselectedCustomer?: Customer | null;
  onOpenRecordModal: () => void;
  onCloseRecordModal: () => void;
  onSavePayment: (payment: Payment) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  customers,
  orders,
  settings = initialSettings,
  isRecordModalOpen,
  preselectedCustomer,
  onOpenRecordModal,
  onCloseRecordModal,
  onSavePayment,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Form State
  const [customerId, setCustomerId] = useState<string>(preselectedCustomer?.id || '');
  const [orderId, setOrderId] = useState<string>('');
  const [amount, setAmount] = useState<number>(preselectedCustomer?.currentDebt || 0);
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState<string>('');

  const handleOpenModal = () => {
    if (preselectedCustomer) {
      setCustomerId(preselectedCustomer.id);
      setAmount(preselectedCustomer.currentDebt || 0);
    } else {
      setCustomerId(customers[0]?.id || '');
      setAmount(0);
    }
    setOrderId('');
    setNotes('');
    onOpenRecordModal();
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const customerUnpaidOrders = customerId
    ? orders.filter((o) => o.customerId === customerId && o.balanceDue > 0)
    : [];

  const handleCustomerChange = (newCustId: string) => {
    setCustomerId(newCustId);
    const c = customers.find((cust) => cust.id === newCustId);
    if (c) {
      setAmount(c.currentDebt > 0 ? c.currentDebt : 0);
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      onShowToast('Client Required', 'Please select a customer', 'error');
      return;
    }

    if (amount <= 0) {
      onShowToast('Invalid Amount', 'Payment amount must be greater than zero', 'error');
      return;
    }

    const receiptNum = `RCP-${500 + payments.length + 1}`;
    const selectedOrderObj = orders.find((o) => o.id === orderId);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      receiptNumber: receiptNum,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      orderId: selectedOrderObj?.id,
      orderNumber: selectedOrderObj?.orderNumber,
      amount: Number(amount),
      method,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSavePayment(newPayment);
    onCloseRecordModal();
    onShowToast('Payment Recorded', `${settings.currencySymbol}${amount.toFixed(2)} received from ${selectedCustomer.name}`, 'success');
  };

  // Calculations
  const totalCollections = payments.reduce((sum, p) => sum + p.amount, 0);

  // Filter
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.orderNumber && p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (methodFilter !== 'all') return p.method === methodFilter;
    return true;
  });

  return (
    <div id="payments-view" className="space-y-6">
      {/* Header & Total Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment Collection Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record customer settlements and track historical payment methods
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right pr-2">
            <span className="text-xs text-slate-500 font-medium">Total Collected</span>
            <p className="text-lg font-bold text-emerald-700">
              {settings.currencySymbol}{totalCollections.toFixed(2)}
            </p>
          </div>

          <button
            id="btn-record-payment-main"
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by receipt #, customer name, order #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Method filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          {['all', 'Cash', 'Mobile Money / Transfer', 'POS / Card'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                methodFilter === m
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {m === 'all' ? 'All Methods' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No payment records found</p>
            <p className="text-xs text-slate-400 mt-1">Record a payment when a customer pays cash, card, or transfer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Receipt #</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Linked Order</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900">
                      {payment.receiptNumber}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {payment.customerName}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {payment.orderNumber ? (
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {payment.orderNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">Account Balance</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {new Date(payment.createdAt).toLocaleDateString()}{' '}
                      <span className="text-[11px] text-slate-400">
                        {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-700 text-base">
                      +{settings.currencySymbol}{payment.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div
          id="record-payment-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          onClick={onCloseRecordModal}
        >
          <div
            id="record-payment-modal"
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Record Customer Payment</h3>
              <button
                onClick={onCloseRecordModal}
                className="p-1 rounded-lg text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Select Customer *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choose Client --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.currentDebt > 0 ? `(Debt: ${settings.currencySymbol}${c.currentDebt.toFixed(2)})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Outstanding Debt:</span>
                    <span className={`font-bold ${selectedCustomer.currentDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {settings.currencySymbol}{selectedCustomer.currentDebt.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {customerUnpaidOrders.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Apply to Specific Unpaid Order (Optional)
                  </label>
                  <select
                    value={orderId}
                    onChange={(e) => {
                      setOrderId(e.target.value);
                      const ord = orders.find((o) => o.id === e.target.value);
                      if (ord) setAmount(ord.balanceDue);
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- General Account Settlement --</option>
                    {customerUnpaidOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        {ord.orderNumber} - Due: {settings.currencySymbol}{ord.balanceDue.toFixed(2)} ({ord.items.map((i) => i.name).join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Payment Amount ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  min={0.01}
                  step="any"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money / Transfer">Mobile Money / Bank Transfer</option>
                  <option value="POS / Card">POS / Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Reference / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank transfer ref #98342, paid in person..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseRecordModal}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-xs transition"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
