import React, { useState } from 'react';
import {
  Store,
  DollarSign,
  Receipt,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Save,
} from 'lucide-react';
import { BusinessSettings } from '../types';
import { initialSettings } from '../data/sampleData';
import { StorageService } from '../services/storage';

interface SettingsViewProps {
  settings?: BusinessSettings;
  onSaveSettings: (newSettings: BusinessSettings) => void;
  onResetData: () => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  isInstallable: boolean;
  onTriggerInstall: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings = initialSettings,
  onSaveSettings,
  onResetData,
  onShowToast,
  isInstallable,
  onTriggerInstall,
}) => {
  const [formData, setFormData] = useState<BusinessSettings>({
    ...initialSettings,
    ...(settings || {}),
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        ...initialSettings,
        ...settings,
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onShowToast('Settings Saved', 'Business profile updated across all invoices and views', 'success');
  };

  const handleExportBackupJSON = () => {
    const backupData = StorageService.exportAllData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(backupData);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `homefood_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Backup Created', 'Full database snapshot downloaded as JSON', 'success');
  };

  const handleImportBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        const content = event.target?.result as string;
        const success = StorageService.importData(content);
        if (success) {
          onShowToast('Data Restored', 'Database successfully restored from backup! Refreshing...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          onShowToast('Restore Failed', 'Invalid JSON backup file structure', 'error');
        }
      };
    }
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Business Profile & Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure branding, tax policies, invoice footers, and local data persistence
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Store className="w-5 h-5 text-orange-600" />
          <h3 className="text-base font-bold text-slate-900">Kitchen & Contact Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Food Business / Brand Name *
            </label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Phone Number (For Orders & WhatsApp)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Physical Kitchen Address / Location
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
          />
        </div>

        {/* Currency & Tax */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Currency Symbol / Prefix
            </label>
            <input
              type="text"
              maxLength={4}
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Examples: $, £, €, ₦, GHS, KSh, ₹, R
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Default Sales Tax Rate (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Receipt Footer Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Receipt Footer Note / Greeting
          </label>
          <input
            type="text"
            value={formData.receiptFooterNote}
            onChange={(e) => setFormData({ ...formData, receiptFooterNote: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>

      {/* PWA & Mobile App Section */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">Progressive Web App (PWA) Status</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Offline Ready & Service Worker Active</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              All data is cached locally on your device. You can manage orders and record payments without internet connectivity.
            </p>
          </div>

          {isInstallable && (
            <button
              onClick={onTriggerInstall}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0"
            >
              Install App on Device
            </button>
          )}
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Receipt className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">Data Management & Local Backups</h3>
        </div>

        <p className="text-xs text-slate-500">
          All your customers, orders, menu items, expenses, and credit ledgers are kept private in your browser's local storage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            onClick={handleExportBackupJSON}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-center gap-2"
          >
            <Download className="w-5 h-5 text-slate-700" />
            <div>
              <p className="text-xs font-bold text-slate-900">Download Backup</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Export full JSON snapshot</p>
            </div>
          </button>

          {/* Import JSON */}
          <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5 text-slate-700" />
            <div>
              <p className="text-xs font-bold text-slate-900">Restore Backup</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Upload JSON database file</p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackupJSON}
              className="hidden"
            />
          </label>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to reload the demo data? Any unsaved modifications will be replaced with clean sample data.'
                )
              ) {
                onResetData();
              }
            }}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 transition text-center gap-2"
          >
            <RotateCcw className="w-5 h-5 text-rose-600" />
            <div>
              <p className="text-xs font-bold text-rose-800">Reset Demo Data</p>
              <p className="text-[11px] text-rose-500 mt-0.5">Restore initial sample catalog</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
