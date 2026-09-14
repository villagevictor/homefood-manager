import React from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  BookOpen,
  Soup,
  Receipt,
  BarChart3,
  Settings,
  UtensilsCrossed,
} from 'lucide-react';
import { ActiveTab, BusinessSettings } from '../types';
import { initialSettings } from '../data/sampleData';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  onNavigate?: (tab: ActiveTab) => void;
  settings?: BusinessSettings;
  pendingOrdersCount?: number;
  unpaidOrdersCount?: number;
  outstandingDebtorsCount?: number;
}

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onNavigate,
  settings = initialSettings,
  pendingOrdersCount = 0,
  unpaidOrdersCount = 0,
  outstandingDebtorsCount = 0,
}) => {
  const handleSelectTab = (tab: ActiveTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onNavigate) onNavigate(tab);
  };

  const debtorBadgeCount = unpaidOrdersCount || outstandingDebtorsCount;

  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Home Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-orange-500 text-white',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
    },
    {
      id: 'credit',
      label: 'Credit Ledger',
      icon: BookOpen,
      badge: debtorBadgeCount > 0 ? debtorBadgeCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'menu',
      label: 'Menu Catalog',
      icon: Soup,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: Receipt,
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none h-screen sticky top-0 overflow-y-auto"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-600 text-white shadow-md shadow-orange-950/40">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-white tracking-tight truncate leading-tight">
            HomeFood
          </h2>
          <p className="text-xs text-slate-400 font-medium truncate">
            {settings?.businessName || 'HomeFood Kitchen'}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 tracking-wider">
          MAIN MENU
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-orange-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                    isActive ? 'bg-white text-orange-700' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Business Mini Summary Footer */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Currency</span>
          <span className="font-semibold text-slate-200">
            {settings.currencyCode} ({settings.currencySymbol})
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span>Tax Rate</span>
          <span className="font-semibold text-slate-200">{settings.taxRate}%</span>
        </div>
        <div className="mt-3 pt-2.5 border-t border-slate-700/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>PWA Offline Ready</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        </div>
      </div>
    </aside>
  );
};
