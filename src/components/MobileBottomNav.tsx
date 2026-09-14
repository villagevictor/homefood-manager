import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  Users,
  MoreHorizontal,
  Soup,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab?: (tab: ActiveTab) => void;
  onNavigate?: (tab: ActiveTab) => void;
  pendingOrdersCount?: number;
  unpaidOrdersCount?: number;
  outstandingDebtorsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onNavigate,
  pendingOrdersCount = 0,
  unpaidOrdersCount = 0,
  outstandingDebtorsCount = 0,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const debtorBadgeCount = unpaidOrdersCount || outstandingDebtorsCount;

  const mainTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: LayoutDashboard },
    {
      id: 'orders' as ActiveTab,
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'credit' as ActiveTab,
      label: 'Credit',
      icon: BookOpen,
      badge: debtorBadgeCount > 0 ? debtorBadgeCount : undefined,
    },
    { id: 'customers' as ActiveTab, label: 'Clients', icon: Users },
  ];

  const moreTabs = [
    { id: 'payments' as ActiveTab, label: 'Payments History', icon: CreditCard },
    { id: 'menu' as ActiveTab, label: 'Menu Catalog', icon: Soup },
    { id: 'expenses' as ActiveTab, label: 'Expenses Logger', icon: Receipt },
    { id: 'reports' as ActiveTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Settings & Backup', icon: Settings },
  ];

  const handleSelect = (tab: ActiveTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onNavigate) onNavigate(tab);
    setShowMoreMenu(false);
  };

  const isMoreActive = moreTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* Slide-up "More" sheet on mobile */}
      {showMoreMenu && (
        <div
          id="mobile-more-backdrop"
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            id="mobile-more-sheet"
            className="absolute bottom-16 inset-x-0 bg-white rounded-t-2xl p-5 shadow-2xl border-t border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-400 tracking-wider">ALL MODULES</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelect(tab.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 font-semibold border border-orange-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-orange-600' : 'text-slate-500'}`} />
                    <span className="truncate text-xs sm:text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav
        id="mobile-bottom-bar"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900 border-t border-slate-800 flex items-center justify-around h-16 px-1 safe-area-pb"
      >
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={() => handleSelect(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full min-w-0 py-1 transition-all relative ${
                isActive ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 truncate">{tab.label}</span>
            </button>
          );
        })}

        {/* More Tab */}
        <button
          id="mobile-tab-more"
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex-1 flex flex-col items-center justify-center h-full min-w-0 py-1 transition-all ${
            isMoreActive || showMoreMenu ? 'text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[11px] mt-1 truncate">More</span>
        </button>
      </nav>
    </>
  );
};
