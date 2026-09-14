import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Wifi,
  WifiOff,
  Download,
  Smartphone,
  Check,
} from 'lucide-react';
import { ActiveTab, BusinessSettings } from '../types';
import { initialSettings } from '../data/sampleData';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  activeTab: ActiveTab;
  settings?: BusinessSettings;
  isOnline?: boolean;
  onOpenNewOrder: () => void;
  onOpenMobileMenu?: () => void;
  onNavigate?: (tab: ActiveTab) => void;
  isInstallable?: boolean;
  onTriggerInstall?: () => void;
}

const TAB_TITLES: Record<ActiveTab, string> = {
  dashboard: 'Business Dashboard',
  customers: 'Customer Directory',
  orders: 'Order Management',
  payments: 'Payment History & Collection',
  credit: 'Credit & Debt Ledger',
  menu: 'Menu Catalog',
  expenses: 'Operating Expenses',
  reports: 'Reports & Financial Analytics',
  settings: 'Business Settings & Data',
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  settings = initialSettings,
  isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true,
  onOpenNewOrder,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  return (
    <>
      <header
        id="top-navbar"
        className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs"
      >
        {/* Left: App Title and Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-orange-500 shadow-sm md:hidden">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {TAB_TITLES[activeTab]}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {settings?.businessName || 'HomeFood Kitchen'} • {settings?.currencyCode || 'USD'} ({settings?.currencySymbol || '$'})
            </p>
          </div>
        </div>

        {/* Right: Actions and Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online / Offline badge */}
          <div
            id="network-status-indicator"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}
            title={isOnline ? 'Online — Realtime Storage' : 'Offline — Operating from Local Storage'}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <Wifi className="w-3.5 h-3.5 hidden sm:inline" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              id="btn-install-pwa"
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              id="btn-ios-install"
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to Home</span>
            </button>
          )}

          {isInstalled && (
            <span className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Check className="w-3 h-3" /> PWA Installed
            </span>
          )}

          {/* Quick Action Button: New Order */}
          <button
            id="btn-nav-new-order"
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Order</span>
          </button>
        </div>
      </header>

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div
          id="ios-install-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Install HomeFood on iPhone / iPad</h3>
            <div className="mt-3 text-sm text-slate-600 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p>Tap the <strong>Share</strong> button at the bottom of your Safari browser.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p>Scroll down the actions list and tap <strong>Add to Home Screen</strong>.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p>Tap <strong>Add</strong> in the top-right corner to access offline anytime!</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
