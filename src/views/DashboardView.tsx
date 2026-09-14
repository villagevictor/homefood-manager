import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  CreditCard,
  Receipt,
  TrendingUp,
  PlusCircle,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Order, Customer, Payment, Expense, BusinessSettings, ActivityItem, ActiveTab } from '../types';
import { initialSettings } from '../data/sampleData';

interface DashboardViewProps {
  orders: Order[];
  customers: Customer[];
  payments: Payment[];
  expenses: Expense[];
  settings?: BusinessSettings;
  activities?: ActivityItem[];
  onNavigateTab?: (tab: ActiveTab) => void;
  onNavigate?: (tab: ActiveTab) => void;
  onOpenNewOrder: () => void;
  onOpenAddCustomer?: () => void;
  onOpenRecordPayment: () => void;
  onOpenAddExpense?: () => void;
  onViewOrderReceipt: (order: Order) => void;
  onUpdateOrderStatus?: (orderId: string, status: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  customers,
  expenses,
  settings = initialSettings,
  activities,
  onNavigateTab,
  onOpenNewOrder,
  onOpenAddCustomer,
  onOpenRecordPayment,
  onOpenAddExpense,
  onViewOrderReceipt,
}) => {
  // Calculations
  const nonCancelledOrders = orders.filter((o) => o.orderStatus !== 'cancelled');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending');
  const preparingOrders = orders.filter((o) => o.orderStatus === 'preparing');
  const totalOutstandingCredit = customers.reduce((sum, c) => sum + Math.max(0, c.currentDebt), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const isProfitPositive = netProfit >= 0;

  // Debtors count
  const debtorsCount = customers.filter((c) => c.currentDebt > 0).length;

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Welcome, {settings?.ownerName || 'Chef'} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Here is your daily financial and order overview for{' '}
            <span className="font-semibold text-slate-800">{settings?.businessName || 'HomeFood Kitchen'}</span>.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-btn-new-order"
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Order</span>
          </button>
          <button
            id="dash-btn-add-customer"
            onClick={onOpenAddCustomer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition"
          >
            <UserPlus className="w-4 h-4 text-slate-600" />
            <span>Add Client</span>
          </button>
          <button
            id="dash-btn-record-payment"
            onClick={onOpenRecordPayment}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold transition"
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Collect Pay</span>
          </button>
          <button
            id="dash-btn-add-expense"
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs sm:text-sm font-semibold transition"
          >
            <Receipt className="w-4 h-4 text-rose-600" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Operational Alerts banner if pending orders or high debt */}
      {(pendingOrders.length > 0 || totalOutstandingCredit > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingOrders.length > 0 && (
            <div
              onClick={() => onNavigateTab('orders')}
              className="cursor-pointer flex items-center justify-between p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 hover:bg-orange-100/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                  {pendingOrders.length}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Action Needed</p>
                  <p className="text-sm font-semibold text-orange-900">
                    {pendingOrders.length} pending order{pendingOrders.length > 1 ? 's' : ''} waiting to prep
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-orange-600" />
            </div>
          )}

          {totalOutstandingCredit > 0 && (
            <div
              onClick={() => onNavigateTab('credit')}
              className="cursor-pointer flex items-center justify-between p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 hover:bg-rose-100/80 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Credit Ledger</p>
                  <p className="text-sm font-semibold text-rose-900">
                    {settings.currencySymbol}
                    {totalOutstandingCredit.toFixed(2)} owed across {debtorsCount} customer{debtorsCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-600" />
            </div>
          )}
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Revenue */}
        <div className="col-span-1 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {settings.currencySymbol}
              {totalRevenue.toFixed(2)}
            </p>
            <p className="text-[11px] text-emerald-600 flex items-center gap-0.5 mt-0.5 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              <span>{nonCancelledOrders.length} orders total</span>
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="col-span-1 bg-white p-4 rounded-2xl shadow-xs border border-slate-200 cursor-pointer hover:border-orange-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Orders</span>
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-bold text-orange-600">
              {pendingOrders.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              +{preparingOrders.length} in kitchen prep
            </p>
          </div>
        </div>

        {/* Outstanding Credit */}
        <div
          onClick={() => onNavigateTab('credit')}
          className="col-span-1 bg-white p-4 rounded-2xl shadow-xs border border-slate-200 cursor-pointer hover:border-rose-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Credit Owed</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-bold text-rose-600">
              {settings.currencySymbol}
              {totalOutstandingCredit.toFixed(2)}
            </p>
            <p className="text-[11px] text-rose-600 mt-0.5 font-medium">
              {debtorsCount} clients with debt
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div
          onClick={() => onNavigateTab('expenses')}
          className="col-span-1 bg-white p-4 rounded-2xl shadow-xs border border-slate-200 cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {settings.currencySymbol}
              {totalExpenses.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {expenses.length} expense entries
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Profit</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isProfitPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p
              className={`text-xl sm:text-2xl font-bold ${
                isProfitPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {settings.currencySymbol}
              {netProfit.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totalRevenue > 0
                ? `${((netProfit / totalRevenue) * 100).toFixed(1)}% net margin`
                : 'No revenue yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Split: Live Order Queue & Recent Chronological Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Orders Queue */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Kitchen Orders</h3>
              <p className="text-xs text-slate-500">Pending and currently cooking meals</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'preparing').length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-sm font-medium text-slate-700">Kitchen is all clear!</p>
                <p className="text-xs text-slate-400 mt-0.5">No active pending or preparing orders.</p>
              </div>
            ) : (
              orders
                .filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'preparing')
                .map((order) => (
                  <div
                    key={order.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 -mx-2 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.orderStatus === 'pending'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                        <span className="text-xs text-slate-500 truncate hidden sm:inline">
                          • {order.customerName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate mt-0.5">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-900">
                          {settings.currencySymbol}
                          {order.total.toFixed(2)}
                        </span>
                        {order.balanceDue > 0 && (
                          <span className="text-rose-600 font-medium">
                            (Due: {settings.currencySymbol}{order.balanceDue.toFixed(2)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onViewOrderReceipt(order)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Right: Chronological Activity Feed */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500">Real-time log of business operations</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recorded activity yet.</p>
            ) : (
              activities.slice(0, 7).map((act) => (
                <div key={act.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 leading-snug">{act.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.description}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {act.amount !== undefined && (
                    <span
                      className={`text-xs font-bold shrink-0 ${
                        act.type === 'expense'
                          ? 'text-rose-600'
                          : act.type === 'payment'
                          ? 'text-emerald-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {act.type === 'expense' ? '-' : '+'}
                      {settings.currencySymbol}
                      {act.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
