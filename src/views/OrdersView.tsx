import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Printer,
  MessageSquare,
  ChevronDown,
  Trash2,
  DollarSign,
  Plus,
  Minus,
  Utensils,
  AlertCircle,
  X,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, PaymentMethod, Customer, MenuItem, BusinessSettings, OrderItem } from '../types';
import { initialSettings } from '../data/sampleData';

interface OrdersViewProps {
  orders: Order[];
  customers: Customer[];
  menuItems: MenuItem[];
  settings?: BusinessSettings;
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  onOpenCreateModal: () => void;
  onCreateOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onViewReceipt: (order: Order) => void;
  onOpenWhatsApp: (order: Order) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  customers,
  menuItems,
  settings = initialSettings,
  isCreateModalOpen,
  onCloseCreateModal,
  onOpenCreateModal,
  onCreateOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onViewReceipt,
  onOpenWhatsApp,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  // New Order Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [menuId: string]: number }>({});
  const [taxRate, setTaxRate] = useState(settings?.taxRate || 0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [amountPaidNow, setAmountPaidNow] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  // Menu Search within Order Modal
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Customer selected details
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Calculate order items & totals
  const orderItemsList: OrderItem[] = Object.entries(selectedItems)
    .filter(([_, qty]) => Number(qty) > 0)
    .map(([menuId, qty]) => {
      const numQty = Number(qty);
      const item = menuItems.find((m) => m.id === menuId)!;
      return {
        menuItemId: menuId,
        name: item.name,
        price: item.price,
        quantity: numQty,
        subtotal: item.price * numQty,
      };
    });

  const subtotal = orderItemsList.reduce((sum, i) => sum + i.subtotal, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  // Dynamic balance due calculation
  const calculatedPaidAmount =
    paymentStatus === 'paid'
      ? grandTotal
      : paymentStatus === 'credit'
      ? 0
      : Math.min(grandTotal, amountPaidNow);

  const balanceDue = Math.max(0, grandTotal - calculatedPaidAmount);

  // Item quantity handlers in order modal
  const handleSetQty = (menuId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[menuId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[menuId];
        return copy;
      }
      return { ...prev, [menuId]: next };
    });
  };

  const handleSelectCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    if (custId) {
      const cust = customers.find((c) => c.id === custId);
      if (cust) {
        setDeliveryAddress(cust.address);
      }
    }
  };

  const handleResetForm = () => {
    setSelectedCustomerId('');
    setGuestName('');
    setGuestPhone('');
    setDeliveryAddress('');
    setOrderNotes('');
    setSelectedItems({});
    setTaxRate(settings?.taxRate || 0);
    setDiscountAmount(0);
    setPaymentStatus('paid');
    setAmountPaidNow(0);
    setPaymentMethod('Cash');
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItemsList.length === 0) {
      onShowToast('No Items Selected', 'Please select at least one dish from the menu', 'error');
      return;
    }

    let custName = guestName.trim();
    let custPhone = guestPhone.trim();
    let custId = selectedCustomerId;

    if (selectedCustomer) {
      custName = selectedCustomer.name;
      custPhone = selectedCustomer.phone;
    } else if (!custName) {
      onShowToast('Customer Required', 'Select an existing customer or enter a name', 'error');
      return;
    }

    const orderNum = `HF-${1000 + orders.length + 1}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerId: custId || `guest-${Date.now()}`,
      customerName: custName,
      customerPhone: custPhone,
      deliveryAddress: deliveryAddress.trim(),
      items: orderItemsList,
      subtotal,
      taxRate,
      taxAmount,
      discount: discountAmount,
      total: grandTotal,
      amountPaid: calculatedPaidAmount,
      balanceDue,
      paymentStatus,
      paymentMethod: calculatedPaidAmount > 0 ? paymentMethod : undefined,
      orderStatus: 'pending',
      notes: orderNotes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateOrder(newOrder);
    onCloseCreateModal();
    handleResetForm();
    onShowToast('Order Created', `Order ${orderNum} added to kitchen queue!`, 'success');
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all') return order.orderStatus === statusFilter;
    return true;
  });

  return (
    <div id="orders-view" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time kitchen status, delivery progress, and customer receipts
          </p>
        </div>

        <button
          id="btn-create-order-view"
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-xs transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Search & Status Filter Tabs */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, client name, food item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          {(['all', 'pending', 'preparing', 'delivered', 'cancelled'] as const).map((st) => {
            const count =
              st === 'all'
                ? orders.length
                : orders.filter((o) => o.orderStatus === st).length;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No orders found</p>
            <p className="text-xs text-slate-400 mt-1">
              There are no orders matching your selected filters.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isPending = order.orderStatus === 'pending';
            const isPreparing = order.orderStatus === 'preparing';
            const isDelivered = order.orderStatus === 'delivered';
            const isCancelled = order.orderStatus === 'cancelled';

            return (
              <div
                key={order.id}
                id={`order-row-${order.id}`}
                className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-slate-300 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{order.orderNumber}</span>
                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isPending
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : isPreparing
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : isDelivered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {order.orderStatus}
                    </span>

                    {/* Payment badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        order.balanceDue <= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                      }`}
                    >
                      {order.balanceDue <= 0
                        ? 'Paid Full'
                        : `Owes: ${settings.currencySymbol}${order.balanceDue.toFixed(2)}`}
                    </span>

                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-slate-800">
                    <span className="font-semibold text-slate-900">{order.customerName}</span>
                    {order.customerPhone && (
                      <span className="text-slate-500 text-xs ml-2">({order.customerPhone})</span>
                    )}
                  </div>

                  {/* Items list */}
                  <p className="text-xs text-slate-600 mt-1">
                    {order.items.map((item) => `${item.quantity}x ${item.name}`).join(' • ')}
                  </p>

                  {order.deliveryAddress && (
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      📍 {order.deliveryAddress}
                    </p>
                  )}
                </div>

                {/* Right totals & action buttons */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Total price block */}
                  <div className="text-left lg:text-right pr-2">
                    <p className="text-lg font-bold text-slate-900">
                      {settings.currencySymbol}
                      {order.total.toFixed(2)}
                    </p>
                    {order.amountPaid > 0 && order.balanceDue > 0 && (
                      <p className="text-[11px] text-slate-500">
                        Paid: {settings.currencySymbol}
                        {order.amountPaid.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Status update buttons */}
                  <div className="flex items-center gap-1.5">
                    {isPending && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition"
                      >
                        Start Prep
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                      >
                        Delivered
                      </button>
                    )}

                    {!isDelivered && !isCancelled && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancel order ${order.orderNumber}?`)) {
                            onUpdateOrderStatus(order.id, 'cancelled');
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Cancel Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    {/* Receipt Action */}
                    <button
                      onClick={() => onViewReceipt(order)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                      title="Print or view receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Receipt</span>
                    </button>

                    {/* WhatsApp Action */}
                    <button
                      onClick={() => onOpenWhatsApp(order)}
                      className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                      title="Send WhatsApp Order Summary"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete order ${order.orderNumber} permanently?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Order Record"
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

      {/* CREATE ORDER MODAL */}
      {isCreateModalOpen && (
        <div
          id="create-order-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
          onClick={onCloseCreateModal}
        >
          <div
            id="create-order-modal"
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold">New Food Order</h3>
                <p className="text-xs text-slate-400">Select customer, menu dishes, and payment terms</p>
              </div>
              <button
                onClick={onCloseCreateModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateOrderSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* 1. Customer Selection */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  1. Customer Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Choose Registered Client
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleSelectCustomerChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">-- Guest / Walk-in / New Customer --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.currentDebt > 0 ? `(Debt: ${settings.currencySymbol}${c.currentDebt.toFixed(2)})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!selectedCustomerId ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Client Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-center">
                      <p>
                        <strong>Phone:</strong> {selectedCustomer?.phone || 'None'}
                      </p>
                      <p>
                        <strong>Credit Limit:</strong> {settings.currencySymbol}{selectedCustomer?.creditLimit.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {!selectedCustomerId && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +1 555 123 4567"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}
                  <div className={selectedCustomerId ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Delivery Address / Notes
                    </label>
                    <input
                      type="text"
                      placeholder="Street address, apartment, or pickup counter..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Menu Item Selection */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2. Select Food Items ({orderItemsList.reduce((sum, i) => sum + i.quantity, 0)} selected)
                  </span>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search menu..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                  {menuItems
                    .filter((m) => m.isAvailable)
                    .filter((m) => m.name.toLowerCase().includes(menuSearch.toLowerCase()))
                    .map((item) => {
                      const qty = selectedItems[item.id] || 0;

                      return (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                            qty > 0
                              ? 'bg-orange-50 border-orange-300 shadow-xs'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {item.imageEmoji} {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {settings.currencySymbol}{item.price.toFixed(2)} • {item.category}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {qty > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetQty(item.id, -1)}
                                className="w-6 h-6 rounded-md bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {qty > 0 && (
                              <span className="w-6 text-center text-xs font-bold text-slate-900">
                                {qty}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSetQty(item.id, 1)}
                              className="w-6 h-6 rounded-md bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 3. Pricing & Discounts */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  3. Pricing & Calculations
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subtotal
                    </label>
                    <div className="px-3 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl text-slate-800">
                      {settings.currencySymbol}{subtotal.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.5"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Discount ({settings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Grand Total
                    </label>
                    <div className="px-3 py-2 text-base font-bold bg-orange-100 border border-orange-200 rounded-xl text-orange-800">
                      {settings.currencySymbol}{grandTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Payment Terms */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  4. Payment Terms & Method
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="paid">Paid in Full</option>
                      <option value="partial">Partial Payment</option>
                      <option value="credit">On Credit (Unpaid)</option>
                    </select>
                  </div>

                  {paymentStatus === 'partial' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Amount Paid Now ({settings.currencySymbol})
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={grandTotal}
                        step="any"
                        value={amountPaidNow}
                        onChange={(e) => setAmountPaidNow(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}

                  {paymentStatus !== 'credit' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Mobile Money / Transfer">Mobile Money / Transfer</option>
                        <option value="POS / Card">POS / Card</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Balance Due (Credit Debt)
                    </label>
                    <div
                      className={`px-3 py-2 text-sm font-bold rounded-xl border ${
                        balanceDue > 0
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}
                    >
                      {settings.currencySymbol}{balanceDue.toFixed(2)}
                    </div>
                  </div>
                </div>

                {balanceDue > 0 && (
                  <p className="text-xs text-rose-600 font-medium">
                    ⚠️ {settings.currencySymbol}{balanceDue.toFixed(2)} will be added to{' '}
                    {selectedCustomer?.name || 'this customer'}'s debt balance on the Credit Ledger.
                  </p>
                )}
              </div>

              {/* Kitchen / Chef Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kitchen / Special Preparation Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra pepper sauce, allergy warnings, deliver by 1:30 PM..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onCloseCreateModal}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-xs transition transform active:scale-95"
                >
                  Submit Order ({settings.currencySymbol}{grandTotal.toFixed(2)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
