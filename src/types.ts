export type OrderStatus = 'pending' | 'preparing' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'credit';
export type PaymentMethod = 'Cash' | 'Mobile Money / Transfer' | 'POS / Card' | 'Other';
export type MenuCategory = 'Main Dishes' | 'Soups & Stews' | 'Sides & Extras' | 'Drinks & Beverages' | 'Combos & Catering';
export type ExpenseCategory = 'Ingredients & Groceries' | 'Packaging' | 'Gas & Utilities' | 'Rent & Facilities' | 'Transport & Logistics' | 'Staff & Wages' | 'Miscellaneous';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  cost: number;
  description: string;
  isAvailable: boolean;
  imageEmoji?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  currentDebt: number;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  currencySymbol: string;
  currencyCode: string;
  taxRate: number;
  receiptFooterMessage: string;
  receiptFooterNote?: string;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'payment' | 'expense' | 'customer';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  statusBadge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
}

export type ActiveTab = 
  | 'dashboard'
  | 'customers'
  | 'orders'
  | 'payments'
  | 'credit'
  | 'menu'
  | 'expenses'
  | 'reports'
  | 'settings';

export type NavTab = ActiveTab;
