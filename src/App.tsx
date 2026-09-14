import React, { useState, useEffect } from 'react';
import { NavTab, Order, Customer, Payment, Expense, MenuItem, BusinessSettings, OrderStatus } from './types';
import { StorageService } from './services/storage';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastContainer, useToast } from './components/Toast';
import { ReceiptModal } from './components/ReceiptModal';
import { WhatsAppModal } from './components/WhatsAppModal';

// Views
import { DashboardView } from './views/DashboardView';
import { CustomersView } from './views/CustomersView';
import { OrdersView } from './views/OrdersView';
import { PaymentsView } from './views/PaymentsView';
import { CreditLedgerView } from './views/CreditLedgerView';
import { MenuView } from './views/MenuView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  // PWA Install hook
  const { isInstallable, promptInstall } = usePWAInstall();

  // Toast notifications
  const { toasts, addToast, removeToast } = useToast();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Application State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(StorageService.getSettings());

  // Modals state
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [whatsAppData, setWhatsAppData] = useState<{
    type: 'order' | 'reminder';
    order?: Order;
    customer?: Customer;
  } | null>(null);

  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [paymentPreselectedCustomer, setPaymentPreselectedCustomer] = useState<Customer | null>(null);

  // Load initial data from StorageService
  const loadAllData = () => {
    setCustomers(StorageService.getCustomers());
    setOrders(StorageService.getOrders());
    setPayments(StorageService.getPayments());
    setExpenses(StorageService.getExpenses());
    setMenuItems(StorageService.getMenuItems());
    setSettings(StorageService.getSettings());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync title and business name
  useEffect(() => {
    if (settings?.businessName) {
      document.title = `${settings.businessName} - HomeFood Manager`;
    }
  }, [settings?.businessName]);

  // Outstanding Debt Count for badge
  const outstandingDebtorsCount = customers.filter((c) => c.currentDebt > 0).length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending').length;

  // --- Handlers: Orders ---
  const handleCreateOrder = (newOrder: Order) => {
    // 1. If balanceDue > 0, update customer debt
    let updatedCustomers = [...customers];
    const customerIndex = updatedCustomers.findIndex((c) => c.id === newOrder.customerId);

    if (customerIndex >= 0) {
      if (newOrder.balanceDue > 0) {
        updatedCustomers[customerIndex] = {
          ...updatedCustomers[customerIndex],
          currentDebt: updatedCustomers[customerIndex].currentDebt + newOrder.balanceDue,
        };
      }
    } else {
      // Guest customer became registered if desired, or create new client
      const newCust: Customer = {
        id: newOrder.customerId,
        name: newOrder.customerName,
        phone: newOrder.customerPhone || '',
        address: newOrder.deliveryAddress || '',
        creditLimit: 150,
        currentDebt: newOrder.balanceDue,
        createdAt: new Date().toISOString(),
      };
      updatedCustomers = [newCust, ...updatedCustomers];
    }
    setCustomers(updatedCustomers);
    StorageService.saveCustomers(updatedCustomers);

    // 2. If upfront amount was paid, create a payment record
    let updatedPayments = [...payments];
    if (newOrder.amountPaid > 0) {
      const upfrontPayment: Payment = {
        id: `pay-${Date.now()}`,
        receiptNumber: `RCP-${500 + payments.length + 1}`,
        customerId: newOrder.customerId,
        customerName: newOrder.customerName,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        amount: newOrder.amountPaid,
        method: newOrder.paymentMethod || 'Cash',
        notes: `Initial payment for ${newOrder.orderNumber}`,
        createdAt: new Date().toISOString(),
      };
      updatedPayments = [upfrontPayment, ...updatedPayments];
      setPayments(updatedPayments);
      StorageService.savePayments(updatedPayments);
    }

    // 3. Save order
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    StorageService.saveOrders(updatedOrders);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, orderStatus: status, updatedAt: new Date().toISOString() } : o
    );
    setOrders(updated);
    StorageService.saveOrders(updated);
    addToast('Status Updated', `Order marked as ${status}`, 'info');
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    StorageService.saveOrders(updated);
    addToast('Order Removed', 'Order record deleted', 'info');
  };

  // --- Handlers: Payments ---
  const handleSavePayment = (payment: Payment) => {
    // 1. Add payment to log
    const updatedPayments = [payment, ...payments];
    setPayments(updatedPayments);
    StorageService.savePayments(updatedPayments);

    // 2. Reduce customer's debt
    const updatedCustomers = customers.map((c) => {
      if (c.id === payment.customerId) {
        return {
          ...c,
          currentDebt: Math.max(0, c.currentDebt - payment.amount),
        };
      }
      return c;
    });
    setCustomers(updatedCustomers);
    StorageService.saveCustomers(updatedCustomers);

    // 3. If linked to an order, reduce order balance
    if (payment.orderId) {
      const updatedOrders = orders.map((o) => {
        if (o.id === payment.orderId) {
          const newPaid = o.amountPaid + payment.amount;
          const newDue = Math.max(0, o.total - newPaid);
          return {
            ...o,
            amountPaid: newPaid,
            balanceDue: newDue,
            paymentStatus: newDue <= 0 ? ('paid' as const) : ('partial' as const),
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      });
      setOrders(updatedOrders);
      StorageService.saveOrders(updatedOrders);
    }
  };

  // --- Handlers: Customers ---
  const handleSaveCustomer = (customer: Customer) => {
    const exists = customers.some((c) => c.id === customer.id);
    let updated: Customer[];
    if (exists) {
      updated = customers.map((c) => (c.id === customer.id ? customer : c));
    } else {
      updated = [customer, ...customers];
    }
    setCustomers(updated);
    StorageService.saveCustomers(updated);
  };

  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    StorageService.saveCustomers(updated);
    addToast('Customer Removed', 'Client deleted from directory', 'info');
  };

  // --- Handlers: Menu ---
  const handleSaveMenuItem = (item: MenuItem) => {
    const exists = menuItems.some((m) => m.id === item.id);
    let updated: MenuItem[];
    if (exists) {
      updated = menuItems.map((m) => (m.id === item.id ? item : m));
    } else {
      updated = [item, ...menuItems];
    }
    setMenuItems(updated);
    StorageService.saveMenuItems(updated);
  };

  const handleDeleteMenuItem = (id: string) => {
    const updated = menuItems.filter((m) => m.id !== id);
    setMenuItems(updated);
    StorageService.saveMenuItems(updated);
    addToast('Dish Deleted', 'Item removed from catalog', 'info');
  };

  const handleToggleMenuAvailability = (id: string) => {
    const updated = menuItems.map((m) =>
      m.id === id ? { ...m, isAvailable: !m.isAvailable } : m
    );
    setMenuItems(updated);
    StorageService.saveMenuItems(updated);
  };

  // --- Handlers: Expenses ---
  const handleSaveExpense = (expense: Expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    StorageService.saveExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    StorageService.saveExpenses(updated);
    addToast('Expense Removed', 'Expense item deleted', 'info');
  };

  // --- Handlers: Settings & Reset ---
  const handleSaveSettings = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleResetData = () => {
    StorageService.resetToDemoData();
    loadAllData();
    addToast('Data Reset', 'Demo sample data reloaded successfully', 'success');
  };

  // Helper shortcuts
  const openRecordPaymentForCustomer = (cust: Customer) => {
    setPaymentPreselectedCustomer(cust);
    setIsRecordPaymentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a] flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Top App Navbar */}
      <Navbar
        settings={settings}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        isInstallable={isInstallable}
        onTriggerInstall={promptInstall}
        onOpenNewOrder={() => setIsCreateOrderModalOpen(true)}
      />

      {/* Main Content Area with Desktop Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-8">
        {/* Left Sidebar on Desktop */}
        <Sidebar
          settings={settings}
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onSelectTab={setActiveTab}
          outstandingDebtorsCount={outstandingDebtorsCount}
          unpaidOrdersCount={outstandingDebtorsCount}
          pendingOrdersCount={pendingOrdersCount}
        />

        {/* View Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              orders={orders}
              customers={customers}
              payments={payments}
              expenses={expenses}
              settings={settings}
              onNavigate={setActiveTab}
              onOpenNewOrder={() => setIsCreateOrderModalOpen(true)}
              onOpenRecordPayment={() => {
                setPaymentPreselectedCustomer(null);
                setIsRecordPaymentModalOpen(true);
              }}
              onViewOrderReceipt={(order) => setReceiptOrder(order)}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              orders={orders}
              payments={payments}
              settings={settings}
              onSaveCustomer={handleSaveCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onOpenRecordPaymentForCustomer={openRecordPaymentForCustomer}
              onOpenWhatsAppReminder={(cust) =>
                setWhatsAppData({ type: 'reminder', customer: cust })
              }
              onViewOrderReceipt={(order) => setReceiptOrder(order)}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              customers={customers}
              menuItems={menuItems}
              settings={settings}
              isCreateModalOpen={isCreateOrderModalOpen}
              onOpenCreateModal={() => setIsCreateOrderModalOpen(true)}
              onCloseCreateModal={() => setIsCreateOrderModalOpen(false)}
              onCreateOrder={handleCreateOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onViewReceipt={(order) => setReceiptOrder(order)}
              onOpenWhatsApp={(order) => setWhatsAppData({ type: 'order', order })}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              customers={customers}
              orders={orders}
              settings={settings}
              isRecordModalOpen={isRecordPaymentModalOpen}
              preselectedCustomer={paymentPreselectedCustomer}
              onOpenRecordModal={() => setIsRecordPaymentModalOpen(true)}
              onCloseRecordModal={() => {
                setIsRecordPaymentModalOpen(false);
                setPaymentPreselectedCustomer(null);
              }}
              onSavePayment={handleSavePayment}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'credit' && (
            <CreditLedgerView
              customers={customers}
              orders={orders}
              settings={settings}
              onOpenRecordPayment={openRecordPaymentForCustomer}
              onOpenWhatsAppReminder={(cust) =>
                setWhatsAppData({ type: 'reminder', customer: cust })
              }
              onViewOrderReceipt={(order) => setReceiptOrder(order)}
            />
          )}

          {activeTab === 'menu' && (
            <MenuView
              menuItems={menuItems}
              settings={settings}
              onSaveMenuItem={handleSaveMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onToggleAvailability={handleToggleMenuAvailability}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              settings={settings}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              orders={orders}
              expenses={expenses}
              payments={payments}
              customers={customers}
              menuItems={menuItems}
              settings={settings}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetData}
              onShowToast={addToast}
              isInstallable={isInstallable}
              onTriggerInstall={promptInstall}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onSelectTab={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        outstandingDebtorsCount={outstandingDebtorsCount}
        unpaidOrdersCount={outstandingDebtorsCount}
      />

      {/* Printable Receipt Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          settings={settings}
          onClose={() => setReceiptOrder(null)}
        />
      )}

      {/* WhatsApp Message Generator Modal */}
      {whatsAppData && (
        <WhatsAppModal
          type={whatsAppData.type}
          order={whatsAppData.order}
          customer={whatsAppData.customer}
          settings={settings}
          onClose={() => setWhatsAppData(null)}
          onShowToast={addToast}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
