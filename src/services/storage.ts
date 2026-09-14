import {
  Customer,
  MenuItem,
  Order,
  Payment,
  Expense,
  BusinessSettings,
  ActivityItem,
} from '../types';
import {
  initialSettings,
  initialMenuItems,
  initialCustomers,
  initialOrders,
  initialPayments,
  initialExpenses,
} from '../data/sampleData';

const KEYS = {
  SETTINGS: 'homefood_settings_v1',
  MENU: 'homefood_menu_v1',
  CUSTOMERS: 'homefood_customers_v1',
  ORDERS: 'homefood_orders_v1',
  PAYMENTS: 'homefood_payments_v1',
  EXPENSES: 'homefood_expenses_v1',
};

export class StorageService {
  static getSettings(): BusinessSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (!data) return initialSettings;
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object') return initialSettings;
      return { ...initialSettings, ...parsed };
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
      return initialSettings;
    }
  }

  static saveSettings(settings: BusinessSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getMenuItems(): MenuItem[] {
    try {
      const data = localStorage.getItem(KEYS.MENU);
      if (!data) return initialMenuItems;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : initialMenuItems;
    } catch (e) {
      console.error('Error loading menu from localStorage', e);
      return initialMenuItems;
    }
  }

  static saveMenuItems(items: MenuItem[]): void {
    localStorage.setItem(KEYS.MENU, JSON.stringify(items));
  }

  static getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(KEYS.CUSTOMERS);
      if (!data) return initialCustomers;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : initialCustomers;
    } catch (e) {
      console.error('Error loading customers from localStorage', e);
      return initialCustomers;
    }
  }

  static saveCustomers(customers: Customer[]): void {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  static getOrders(): Order[] {
    try {
      const data = localStorage.getItem(KEYS.ORDERS);
      if (!data) return initialOrders;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : initialOrders;
    } catch (e) {
      console.error('Error loading orders from localStorage', e);
      return initialOrders;
    }
  }

  static saveOrders(orders: Order[]): void {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  }

  static getPayments(): Payment[] {
    try {
      const data = localStorage.getItem(KEYS.PAYMENTS);
      if (!data) return initialPayments;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : initialPayments;
    } catch (e) {
      console.error('Error loading payments from localStorage', e);
      return initialPayments;
    }
  }

  static savePayments(payments: Payment[]): void {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(payments));
  }

  static getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(KEYS.EXPENSES);
      if (!data) return initialExpenses;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : initialExpenses;
    } catch (e) {
      console.error('Error loading expenses from localStorage', e);
      return initialExpenses;
    }
  }

  static saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  }

  static resetToDemoData(): {
    settings: BusinessSettings;
    menu: MenuItem[];
    customers: Customer[];
    orders: Order[];
    payments: Payment[];
    expenses: Expense[];
  } {
    this.saveSettings(initialSettings);
    this.saveMenuItems(initialMenuItems);
    this.saveCustomers(initialCustomers);
    this.saveOrders(initialOrders);
    this.savePayments(initialPayments);
    this.saveExpenses(initialExpenses);
    return {
      settings: initialSettings,
      menu: initialMenuItems,
      customers: initialCustomers,
      orders: initialOrders,
      payments: initialPayments,
      expenses: initialExpenses,
    };
  }

  static clearAllData(): void {
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.MENU);
    localStorage.removeItem(KEYS.CUSTOMERS);
    localStorage.removeItem(KEYS.ORDERS);
    localStorage.removeItem(KEYS.PAYMENTS);
    localStorage.removeItem(KEYS.EXPENSES);
  }

  static exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      menu: this.getMenuItems(),
      customers: this.getCustomers(),
      orders: this.getOrders(),
      payments: this.getPayments(),
      expenses: this.getExpenses(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static exportAllData(): string {
    return this.exportBackup();
  }

  static importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return false;

      if (parsed.settings) this.saveSettings(parsed.settings);
      if (Array.isArray(parsed.menu)) this.saveMenuItems(parsed.menu);
      if (Array.isArray(parsed.customers)) this.saveCustomers(parsed.customers);
      if (Array.isArray(parsed.orders)) this.saveOrders(parsed.orders);
      if (Array.isArray(parsed.payments)) this.savePayments(parsed.payments);
      if (Array.isArray(parsed.expenses)) this.saveExpenses(parsed.expenses);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  static importData(jsonString: string): boolean {
    return this.importBackup(jsonString);
  }

  static generateActivities(
    orders: Order[],
    payments: Payment[],
    expenses: Expense[]
  ): ActivityItem[] {
    const activities: ActivityItem[] = [];

    orders.slice(0, 8).forEach((order) => {
      activities.push({
        id: `act-ord-${order.id}`,
        type: 'order',
        title: `Order ${order.orderNumber} - ${order.customerName}`,
        description: `${order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`,
        amount: order.total,
        timestamp: order.createdAt,
        statusBadge: {
          text: order.orderStatus.toUpperCase(),
          variant:
            order.orderStatus === 'delivered'
              ? 'success'
              : order.orderStatus === 'preparing'
              ? 'info'
              : order.orderStatus === 'cancelled'
              ? 'danger'
              : 'warning',
        },
      });
    });

    payments.slice(0, 6).forEach((pay) => {
      activities.push({
        id: `act-pay-${pay.id}`,
        type: 'payment',
        title: `Payment Received - ${pay.customerName}`,
        description: `Paid via ${pay.method} ${pay.orderNumber ? `for ${pay.orderNumber}` : ''}`,
        amount: pay.amount,
        timestamp: pay.createdAt,
        statusBadge: {
          text: 'PAID',
          variant: 'success',
        },
      });
    });

    expenses.slice(0, 6).forEach((exp) => {
      activities.push({
        id: `act-exp-${exp.id}`,
        type: 'expense',
        title: `Expense: ${exp.title}`,
        description: `${exp.category} (${exp.paymentMethod})`,
        amount: exp.amount,
        timestamp: exp.createdAt || `${exp.date}T12:00:00Z`,
        statusBadge: {
          text: 'EXPENSE',
          variant: 'danger',
        },
      });
    });

    return activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
