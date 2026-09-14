import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  Award,
  Users,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Order, Expense, Payment, Customer, MenuItem, BusinessSettings } from '../types';
import { initialSettings } from '../data/sampleData';

interface ReportsViewProps {
  orders: Order[];
  expenses: Expense[];
  payments: Payment[];
  customers: Customer[];
  menuItems: MenuItem[];
  settings?: BusinessSettings;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  expenses,
  payments,
  customers,
  menuItems,
  settings = initialSettings,
  onShowToast,
}) => {
  const [timeRange, setTimeRange] = useState<'all' | '7days' | '30days'>('30days');

  // Filter by time range
  const now = new Date();
  const filterDate = (dateStr: string) => {
    if (timeRange === 'all') return true;
    const itemDate = new Date(dateStr);
    const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
    if (timeRange === '7days') return diffDays <= 7;
    if (timeRange === '30days') return diffDays <= 30;
    return true;
  };

  const filteredOrders = orders.filter((o) => filterDate(o.createdAt));
  const filteredExpenses = expenses.filter((e) => filterDate(e.date));
  const filteredPayments = payments.filter((p) => filterDate(p.createdAt));

  // Financial Calculations
  const grossSales = filteredOrders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const cashCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossSales - totalExpenses;
  const profitMarginPercent = grossSales > 0 ? ((netProfit / grossSales) * 100).toFixed(1) : '0';

  // Outstanding Receivables in this period
  const receivablesInPeriod = filteredOrders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + o.balanceDue, 0);

  // Top Selling Dishes
  const itemCounts: { [name: string]: { qty: number; revenue: number } } = {};
  filteredOrders
    .filter((o) => o.orderStatus !== 'cancelled')
    .forEach((ord) => {
      ord.items.forEach((item) => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { qty: 0, revenue: 0 };
        }
        itemCounts[item.name].qty += item.quantity;
        itemCounts[item.name].revenue += item.subtotal;
      });
    });

  const topSellingItems = Object.entries(itemCounts)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  // Top Spender Clients
  const customerSpending: { [name: string]: number } = {};
  filteredOrders
    .filter((o) => o.orderStatus !== 'cancelled')
    .forEach((ord) => {
      customerSpending[ord.customerName] =
        (customerSpending[ord.customerName] || 0) + ord.total;
    });

  const topCustomers = Object.entries(customerSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Export CSV Helper
  const downloadCSV = (filename: string, rows: string[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Export Complete', `Downloaded ${filename}`, 'success');
  };

  const exportOrdersCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Items', 'Total', 'Paid', 'Balance Due', 'Status'];
    const rows = [
      headers,
      ...orders.map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleString(),
        o.customerName,
        o.items.map((i) => `${i.quantity}x ${i.name}`).join('; '),
        o.total.toFixed(2),
        o.amountPaid.toFixed(2),
        o.balanceDue.toFixed(2),
        o.orderStatus,
      ]),
    ];
    downloadCSV(`homefood_orders_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const exportExpensesCSV = () => {
    const headers = ['Title', 'Category', 'Date', 'Payment Method', 'Amount', 'Notes'];
    const rows = [
      headers,
      ...expenses.map((e) => [
        e.title,
        e.category,
        e.date,
        e.paymentMethod,
        e.amount.toFixed(2),
        e.notes || '',
      ]),
    ];
    downloadCSV(`homefood_expenses_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div id="reports-view" className="space-y-6">
      {/* Top Header & Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Reports & Insights</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track business performance, profit margins, and export bookkeeping CSVs
          </p>
        </div>

        {/* Time Filter & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === '7days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === '30days' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Past 30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* P&L Overview Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gross Sales</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {settings.currencySymbol}{grossSales.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{filteredOrders.length} completed orders</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {settings.currencySymbol}{totalExpenses.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-xs text-rose-600 mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{filteredExpenses.length} expense items</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Profit</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {settings.currencySymbol}{netProfit.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Margin: <strong className="text-slate-800">{profitMarginPercent}%</strong>
          </p>
        </div>

        {/* Cash Collected vs Receivables */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Cash Realized</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {settings.currencySymbol}{cashCollected.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Pending: <strong className="text-rose-600">{settings.currencySymbol}{receivablesInPeriod.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {/* Two Column Breakdown: Top Dishes & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Dishes */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              <h3 className="text-base font-bold text-slate-900">Best-Selling Menu Items</h3>
            </div>
            <span className="text-xs text-slate-400">By units sold</span>
          </div>

          <div className="space-y-3">
            {topSellingItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No sales recorded in this timeframe.</p>
            ) : (
              topSellingItems.map(([name, data], idx) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">{data.qty} orders</span>
                    <span className="text-xs text-slate-500 block">
                      {settings.currencySymbol}{data.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Spender Customers */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Highest-Value Clients</h3>
            </div>
            <span className="text-xs text-slate-400">By total purchases</span>
          </div>

          <div className="space-y-3">
            {topCustomers.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No customer orders recorded yet.</p>
            ) : (
              topCustomers.map(([name, totalSpent], idx) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{name}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700">
                    {settings.currencySymbol}{totalSpent.toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CSV Export & Data Backups */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Bookkeeping & Data Export</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Download your business ledger records directly into Excel / CSV format for accountant or tax filing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Orders & Invoices Log</p>
              <p className="text-xs text-slate-500 mt-0.5">{orders.length} total orders recorded</p>
            </div>
            <button
              onClick={exportOrdersCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">Operating Expenses</p>
              <p className="text-xs text-slate-500 mt-0.5">{expenses.length} expense items recorded</p>
            </div>
            <button
              onClick={exportExpensesCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs transition"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
