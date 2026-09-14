import React, { useState } from 'react';
import { Send, Copy, Check, X, MessageSquare } from 'lucide-react';
import { BusinessSettings, Customer, Order } from '../types';
import { initialSettings } from '../data/sampleData';

interface WhatsAppModalProps {
  type: 'order' | 'reminder';
  order?: Order | null;
  customer?: Customer | null;
  settings?: BusinessSettings;
  onClose: () => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  type,
  order,
  customer,
  settings = initialSettings,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  // Build target phone number (strip spaces/dashes)
  const rawPhone = order?.customerPhone || customer?.phone || '';
  const sanitizedPhone = rawPhone.replace(/[^\d+]/g, '').replace('+', '');

  // Build default message
  const getDefaultMessage = (): string => {
    if (type === 'order' && order) {
      const itemsList = order.items
        .map((i) => `• ${i.quantity}x ${i.name} (${settings.currencySymbol}${i.subtotal.toFixed(2)})`)
        .join('\n');

      const paymentInfo =
        order.balanceDue <= 0
          ? `✅ *Status: Paid in Full* (${order.paymentMethod || 'Confirmed'})`
          : `⚠️ *Amount Paid:* ${settings.currencySymbol}${order.amountPaid.toFixed(2)}\n❗ *Balance Due:* ${settings.currencySymbol}${order.balanceDue.toFixed(2)}`;

      return `🍲 *${settings.businessName} - ORDER SUMMARY*\n\n` +
        `Hello ${order.customerName}! Here is the confirmation for your food order *${order.orderNumber}*:\n\n` +
        `*Items Ordered:*\n${itemsList}\n\n` +
        `*Subtotal:* ${settings.currencySymbol}${order.subtotal.toFixed(2)}\n` +
        (order.discount > 0 ? `*Discount:* -${settings.currencySymbol}${order.discount.toFixed(2)}\n` : '') +
        (order.taxAmount > 0 ? `*Tax (${order.taxRate}%):* +${settings.currencySymbol}${order.taxAmount.toFixed(2)}\n` : '') +
        `*Total Amount:* ${settings.currencySymbol}${order.total.toFixed(2)}\n` +
        `${paymentInfo}\n\n` +
        `📍 *Delivery Address:* ${order.deliveryAddress || 'Pickup at counter'}\n\n` +
        `${settings.receiptFooterMessage}\n\n` +
        `📞 For inquiries: ${settings.phone}`;
    }

    if (type === 'reminder' && customer) {
      return `👋 *Hello ${customer.name},*\n\n` +
        `Warm greetings from *${settings.businessName}*! 🍲\n\n` +
        `This is a gentle reminder regarding your outstanding food order balance of *${settings.currencySymbol}${customer.currentDebt.toFixed(2)}* on your account.\n\n` +
        `Kindly settle this balance at your earliest convenience via Mobile Money / Bank Transfer or Cash upon your next delivery.\n\n` +
        `Thank you so much for your continued patronage and support! 🙏\n\n` +
        `📞 Contact us: ${settings.phone} | ${settings.whatsapp}`;
    }

    return '';
  };

  const [message, setMessage] = useState(getDefaultMessage());

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      onShowToast('Copied to Clipboard', 'Message copied to your clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Copy Failed', 'Please select and copy manually', 'error');
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const url = sanitizedPhone
      ? `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      id="whatsapp-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        id="whatsapp-modal-content"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-200" />
            <span className="font-bold text-sm">
              {type === 'order' ? 'Send WhatsApp Order Receipt' : 'Send WhatsApp Payment Reminder'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Recipient
            </label>
            <div className="text-sm font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {order?.customerName || customer?.name} ({rawPhone || 'No phone provided'})
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Message Preview & Edit
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={9}
              className="w-full p-3 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Open in WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
