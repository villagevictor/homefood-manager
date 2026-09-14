import React, { useState } from 'react';
import {
  BookOpen,
  AlertTriangle,
  MessageSquare,
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Phone,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react';
import { Customer, Order, BusinessSettings } from '../types';
import { initialSettings } from '../data/sampleData';

interface CreditLedgerViewProps {
  customers: Customer[];
  orders: Order[];
  settings?: BusinessSettings;
  onOpenRecordPayment: (customer: Customer) => void;
  onOpenWhatsAppReminder: (customer: Customer) => void;
  onViewOrderReceipt: (order: Order) => void;
}

export const CreditLedgerView: React.FC<CreditLedgerViewProps> = ({
  customers,
  orders,
  settings = initialSettings,
  onOpenRecordPayment,
  onOpenWhatsAppReminder,
  onViewOrderReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debtors
  const debtors = customers
    .filter((c) => c.currentDebt > 0)
    .sort((a, b) => b.currentDebt - a.currentDebt);

  const totalOutstandingCredit = debtors.reduce((sum, c) => sum + c.currentDebt, 0);

  // Unpaid orders
  const unpaidOrders = orders.filter((o) => o.balanceDue > 0 && o.orderStatus !== 'cancelled');

  const filteredDebtors = debtors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="credit-ledger-view" className="space-y-6">
      {/* Top Banner & Summary Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-rose-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Receivables & Credit Ledger</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {settings.currencySymbol}
              {totalOutstandingCredit.toFixed(2)}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Total outstanding balance owed by {debtors.length} customer
              {debtors.length !== 1 ? 's' : ''} across {unpaidOrders.length} unpaid order
              {unpaidOrders.length !== 1 ? 's' : ''}.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10 text-xs space-y-1.5 self-start md:self-auto">
            <div className="flex justify-between gap-6">
              <span className="text-slate-300">Total Debtors:</span>
              <span className="font-bold text-white">{debtors.length} clients</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-300">Unsettled Invoices:</span>
              <span className="font-bold text-rose-300">{unpaidOrders.length} orders</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-300">Recovery Rate:</span>
              <span className="font-bold text-emerald-400">
                {orders.length > 0
                  ? `${(
                      ((orders.reduce((s, o) => s + o.amountPaid, 0)) /
                        (orders.reduce((s, o) => s + o.total, 0) || 1)) *
                      100
                    ).toFixed(0)}%`
                  : '100%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter debtors by client name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      {/* Debtors List with Breakdown of Unpaid Orders */}
      <div className="space-y-4">
        {filteredDebtors.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="text-base font-bold text-slate-800">
              {debtors.length === 0 ? 'No Outstanding Debts!' : 'No matching clients found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {debtors.length === 0
                ? 'All customer accounts and orders are fully settled.'
                : 'Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          filteredDebtors.map((debtor) => {
            const clientOrders = unpaidOrders.filter((o) => o.customerId === debtor.id);
            const usagePercent =
              debtor.creditLimit > 0
                ? Math.min(100, Math.round((debtor.currentDebt / debtor.creditLimit) * 100))
                : 0;

            return (
              <div
                key={debtor.id}
                id={`debtor-card-${debtor.id}`}
                className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4"
              >
                {/* Customer Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {debtor.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        Owes: {settings.currencySymbol}{debtor.currentDebt.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      {debtor.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {debtor.phone}
                        </span>
                      )}
                      <span>•</span>
                      <span>
                        Credit Limit: {settings.currencySymbol}{debtor.creditLimit.toFixed(0)} ({usagePercent}% used)
                      </span>
                    </div>
                  </div>

                  {/* Actions for this debtor */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id={`btn-remind-${debtor.id}`}
                      onClick={() => onOpenWhatsAppReminder(debtor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
                      title="Send WhatsApp payment reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Send Reminder</span>
                    </button>

                    <button
                      id={`btn-collect-${debtor.id}`}
                      onClick={() => onOpenRecordPayment(debtor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition transform active:scale-95"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collect Pay</span>
                    </button>
                  </div>
                </div>

                {/* Unpaid Orders Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Unpaid / Partial Orders ({clientOrders.length})
                  </h4>

                  {clientOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      Balance carried on customer general account without specific pending order ticket.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {clientOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{ord.orderNumber}</span>
                              <span className="text-slate-400">
                                {new Date(ord.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-600 truncate mt-0.5">
                              {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-bold text-rose-600 block">
                              Due: {settings.currencySymbol}{ord.balanceDue.toFixed(2)}
                            </span>
                            <button
                              onClick={() => onViewOrderReceipt(ord)}
                              className="text-[11px] font-semibold text-orange-600 hover:underline mt-0.5 block"
                            >
                              Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
