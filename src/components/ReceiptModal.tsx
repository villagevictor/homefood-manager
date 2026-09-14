import React from 'react';
import { Printer, X, CheckCircle, Clock } from 'lucide-react';
import { Order, BusinessSettings } from '../types';
import { initialSettings } from '../data/sampleData';

interface ReceiptModalProps {
  order: Order | null;
  settings?: BusinessSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  settings = initialSettings,
  onClose,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isFullyPaid = order.paymentStatus === 'paid' || order.balanceDue <= 0;

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="receipt-modal-content"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Action Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-bold">Printable Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Receipt (Formatted for thermal 80mm or standard print) */}
        <div id="printable-receipt" className="p-6 text-slate-800 bg-white font-mono text-sm">
          {/* Business Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
              {settings.businessName}
            </h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">{settings.tagline}</p>
            <p className="text-xs text-slate-600 mt-1">{settings.address}</p>
            <p className="text-xs text-slate-600">Tel: {settings.phone}</p>
          </div>

          {/* Receipt Meta */}
          <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-bold text-slate-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span>{order.customerPhone}</span>
            </div>
            {order.deliveryAddress && (
              <div className="text-slate-500 pt-1">
                <span>Address: </span>
                <span className="text-slate-800">{order.deliveryAddress}</span>
              </div>
            )}
          </div>

          {/* Itemized Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="grid grid-cols-12 text-xs font-bold text-slate-500 pb-2 border-b border-slate-200">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-2 text-center">QTY</span>
              <span className="col-span-4 text-right">TOTAL</span>
            </div>

            <div className="divide-y divide-slate-100 py-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-xs py-1.5 items-center">
                  <div className="col-span-6 pr-1">
                    <p className="font-semibold text-slate-900 truncate font-sans">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {settings.currencySymbol}
                      {item.price.toFixed(2)} each
                    </p>
                  </div>
                  <span className="col-span-2 text-center font-bold text-slate-700">
                    {item.quantity}
                  </span>
                  <span className="col-span-4 text-right font-bold text-slate-900">
                    {settings.currencySymbol}
                    {item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>
                {settings.currencySymbol}
                {order.subtotal.toFixed(2)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount:</span>
                <span>
                  -{settings.currencySymbol}
                  {order.discount.toFixed(2)}
                </span>
              </div>
            )}
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax ({order.taxRate}%):</span>
                <span>
                  +{settings.currencySymbol}
                  {order.taxAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>GRAND TOTAL:</span>
              <span className="text-base text-orange-600">
                {settings.currencySymbol}
                {order.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Amount Paid:</span>
              <span className="font-semibold text-emerald-700">
                {settings.currencySymbol}
                {order.amountPaid.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold">
              <span>Balance Due:</span>
              <span className={order.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {settings.currencySymbol}
                {order.balanceDue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Status Stamp */}
          <div className="py-3 text-center border-b border-dashed border-slate-300">
            {isFullyPaid ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                PAID IN FULL ({order.paymentMethod || 'Settled'})
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                UNPAID / BALANCE DUE ({settings.currencySymbol}
                {order.balanceDue.toFixed(2)})
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="pt-4 text-center text-xs text-slate-500 font-sans leading-relaxed">
            <p>{settings.receiptFooterMessage}</p>
            <p className="mt-2 text-[10px] text-slate-400">Printed with HomeFood Manager PWA</p>
          </div>
        </div>

        {/* Print styling helper */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              #printable-receipt, #printable-receipt * { visibility: visible; }
              #printable-receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 15px;
              }
            }
          `
        }} />
      </div>
    </div>
  );
};
