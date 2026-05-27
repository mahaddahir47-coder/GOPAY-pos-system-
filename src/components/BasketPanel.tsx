import React, { useState, useEffect, useRef } from 'react';
import { Trash2, CreditCard, ShoppingCart, Loader2, Edit2, CheckCircle2, AlertTriangle, Printer, Plus, Minus, Utensils, Clock, Truck, ChevronDown, ExternalLink, QrCode, Copy } from 'lucide-react';
import { CartItem, GoPayWallet, MerchantSettings, Product, Table, TabID, Invoice } from '../types';
import { PrinterController } from './PrinterController';
import { ThermalPrinterDevice } from '../utils/printer';
import QRCode from 'qrcode';

// Custom internal QrCanvas renderer with white background for high contrast scanning
const QrCanvas: React.FC<{ value: string; size?: number }> = ({ value, size = 150 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: { dark: '#091124', light: '#FFFFFF' },
        errorCorrectionLevel: 'H', // Use high error correction to allow center overlay safely
      });
    } catch (err) {
      console.error('QR Code Generation failure:', err);
    }
  }, [value, size]);

  return (
    <div className="bg-white p-2.5 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100/90">
      <canvas ref={canvasRef} style={{ width: `${size - 16}px`, height: `${size - 16}px` }} className="rounded-xl" />
    </div>
  );
};

interface BasketPanelProps {
  activeInvoiceId?: string;
  cart: CartItem[];
  settings: MerchantSettings;
  selectedWallet: GoPayWallet;
  onChangeWallet: (wallet: GoPayWallet) => void;
  onUpdateQuantity: (productId: string, delta: number, isCustom: boolean, customPrice?: number) => void;
  onRemoveItem: (productId: string, isCustom: boolean, customPrice?: number) => void;
  onClearCart: () => void;
  onAddProduct: (product: Product, customPrice?: number) => void;
  paymentStatus: 'unpaid' | 'paid';
  onTriggerNfcWrite: () => Promise<boolean>;
  onOpenInlineSimulator?: () => void;
  onSimulateDirectOrder?: () => void;
  onUpdateTaxRate?: (newRate: number) => void; // Allows updating tax inline!
  orderType: 'Dine In' | 'Takeaway' | 'Delivery';
  onChangeOrderType: (type: 'Dine In' | 'Takeaway' | 'Delivery') => void;
  selectedTableId: string;
  onChangeSelectedTableId: (tableId: string) => void;
  tables: Table[];
  takeawayTime: string;
  onChangeTakeawayTime: (time: string) => void;
  deliveryAddress: string;
  onChangeDeliveryAddress: (address: string) => void;
  deliveryPhone: string;
  onChangeDeliveryPhone: (phone: string) => void;
  onNavigateTab?: (tab: TabID) => void;

  // Thermal Printer integrations props
  isPrinterConnected: boolean;
  onSetPrinterConnected: (val: boolean) => void;
  autoPrintEnabled: boolean;
  onSetAutoPrintEnabled: (val: boolean) => void;
  connectedDevice: ThermalPrinterDevice | null;
  onSetConnectedDevice: (dev: ThermalPrinterDevice | null) => void;
  onTriggerPrint: () => void;
  onProceedToPayment?: () => void;
}


export const BasketPanel: React.FC<BasketPanelProps> = ({
  activeInvoiceId,
  cart,
  settings,
  selectedWallet,
  onChangeWallet,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddProduct,
  paymentStatus,
  onTriggerNfcWrite,
  onOpenInlineSimulator,
  onSimulateDirectOrder,
  onUpdateTaxRate,
  orderType,
  onChangeOrderType,
  selectedTableId,
  onChangeSelectedTableId,
  tables,
  takeawayTime,
  onChangeTakeawayTime,
  deliveryAddress,
  onChangeDeliveryAddress,
  deliveryPhone,
  onChangeDeliveryPhone,
  onNavigateTab,
  isPrinterConnected,
  onSetPrinterConnected,
  autoPrintEnabled,
  onSetAutoPrintEnabled,
  connectedDevice,
  onSetConnectedDevice,
  onTriggerPrint,
  onProceedToPayment,
}) => {
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [taxInputVal, setTaxInputVal] = useState(settings.taxRate.toString());
  const [nfcWriteStatus, setNfcWriteStatus] = useState<'idle' | 'writing' | 'success' | 'failed'>('idle');
  const [isCopied, setIsCopied] = useState(false);

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => {
    const price = item.customPrice !== undefined ? item.customPrice : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const tax = subtotal * (settings.taxRate / 100);
  const total = subtotal + tax;

  const currentInvoice: Invoice = {
    id: activeInvoiceId || 'R-10245',
    items: cart,
    subtotal: subtotal,
    tax: tax,
    total: total.toFixed(2) as any,
    merchantName: settings.merchantName,
    merchantId: settings.merchantId,
    wallet: selectedWallet,
    timestamp: new Date().toISOString(),
    nfcPayload: JSON.stringify({
      merchant: settings.merchantName,
      id: settings.merchantId,
      amount: total.toFixed(2),
      wallet: selectedWallet,
    }),
  };

  const invoice = currentInvoice;

  const getPaymentLink = () => {
    const activeMerchantId = invoice.merchantId || "R-10245";
    return `https://gopay01.vercel.app/?merchant=${activeMerchantId}&amount=`;
  };

  const paymentLink = getPaymentLink();

  const handleUpdateTax = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(taxInputVal);
    if (!isNaN(parsed) && parsed >= 0) {
      if (onUpdateTaxRate) {
        onUpdateTaxRate(parsed);
      }
      setIsEditingTax(false);
    }
  };

  const handleWriteNfc = async () => {
    if (cart.length === 0) return;
    setNfcWriteStatus('writing');
    try {
      const success = await onTriggerNfcWrite();
      if (success) {
        setNfcWriteStatus('success');
        setTimeout(() => setNfcWriteStatus('idle'), 3000);
      } else {
        setNfcWriteStatus('failed');
        setTimeout(() => setNfcWriteStatus('idle'), 4000);
      }
    } catch (err) {
      setNfcWriteStatus('failed');
      setTimeout(() => setNfcWriteStatus('idle'), 4000);
    }
  };

  // Maps the wallets to their specific icons in the reference image
  const walletConfig: { key: GoPayWallet; label: string; icon: string }[] = [
    { key: 'evc', label: 'evc', icon: 'MessageSquare' },
    { key: 'edahab', label: 'edahab', icon: 'Globe' },
    { key: 'jeeb', label: 'jeeb', icon: 'PiggyBank' },
    { key: 'premier', label: 'premier', icon: 'Shield' },
  ];

  return (
    <div className="bg-[#091124] text-white rounded-3xl p-6 flex flex-col space-y-5 border border-blue-900/15 shadow-xl h-full font-sans">
      
      {/* Upper Title Section / Table Selector Block - Matching current order mockup */}
      <div className="flex flex-col space-y-3 border-b border-blue-900/20 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold tracking-tight uppercase text-slate-100">
              Current Order
            </h2>
          </div>
          
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-400 hover:bg-slate-800/20 px-2 py-1 rounded-md transition-all duration-150 flex items-center gap-1 cursor-pointer"
              title="Clear all order list slots"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* 3-tab segment for Dine-In, Takeaway, Delivery */}
        <div className="grid grid-cols-3 gap-1 bg-[#050b16] p-1 rounded-xl border border-blue-900/10">
          <button
            type="button"
            onClick={() => onChangeOrderType('Dine In')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-black tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer ${
              orderType === 'Dine In'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3 h-3" />
            <span>Dine-In</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeOrderType('Takeaway')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-black tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer ${
              orderType === 'Takeaway'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Takeaway</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeOrderType('Delivery')}
            className={`py-1.5 px-1 rounded-lg text-[10px] font-black tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer ${
              orderType === 'Delivery'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Dynamic Contextual Inputs */}
        <div className="bg-[#050b16]/40 border border-blue-900/10 rounded-xl p-2.5 space-y-2 text-left animate-in duration-200">
          {orderType === 'Dine In' && (
            <div className="flex items-center justify-between gap-1">
              <div className="flex-1 flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-450 shrink-0">Table:</span>
                <div className="relative flex-1">
                  <select
                    value={selectedTableId}
                    onChange={(e) => onChangeSelectedTableId(e.target.value)}
                    className="w-full bg-[#050b16] border border-blue-900/30 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-blue-400 appearance-none focus:outline-none focus:border-blue-550 focus:ring-1 focus:ring-blue-500 cursor-pointer pr-6"
                  >
                    {tables.map(table => (
                      <option key={table.id} value={table.id} className="bg-[#091124] text-slate-200">
                        {table.id} ({table.seats} seats - {table.status})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('tables')}
                  className="px-2 py-1 bg-blue-950/40 hover:bg-blue-900/30 border border-blue-900/20 hover:border-blue-500/30 text-[9px] text-[#2F80ED] font-black rounded-lg transition-all flex items-center gap-0.5"
                  title="Choose from tables layout map screen"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  <span>Map</span>
                </button>
              )}
            </div>
          )}

          {orderType === 'Takeaway' && (
            <div className="flex flex-col space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400">Preparation / Ready Time:</span>
              <div className="grid grid-cols-4 gap-1">
                {['Immediate', '10 Min', '20 Min', '30 Min'].map((timeOption) => {
                  const isSel = takeawayTime === timeOption;
                  return (
                    <button
                      key={timeOption}
                      type="button"
                      onClick={() => onChangeTakeawayTime(timeOption)}
                      className={`py-1 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                        isSel 
                          ? 'bg-[#183262] border border-blue-500 text-white' 
                          : 'bg-[#050b16] border border-blue-900/20 text-slate-450 hover:text-white'
                      }`}
                    >
                      {timeOption}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                placeholder="Or custom time (e.g., in 15 mins)..."
                value={takeawayTime}
                onChange={(e) => onChangeTakeawayTime(e.target.value)}
                className="w-full bg-[#050b16] border border-blue-900/30 rounded-lg px-2.5 py-1 text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {orderType === 'Delivery' && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Address</span>
                <input
                  type="text"
                  placeholder="Street / Apt..."
                  value={deliveryAddress}
                  onChange={(e) => onChangeDeliveryAddress(e.target.value)}
                  className="w-full bg-[#050b16] border border-blue-900/30 rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Phone</span>
                <input
                  type="text"
                  placeholder="+252..."
                  value={deliveryPhone}
                  onChange={(e) => onChangeDeliveryPhone(e.target.value)}
                  className="w-full bg-[#050b16] border border-blue-900/30 rounded-lg px-2 py-1.5 text-[10px] text-white placeholder-slate-650 focus:outline-none focus:border-blue-550 font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart Predefined Order Table Columns & Rows */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-[220px] max-h-[300px] scrollbar-thin">
        {cart.length === 0 ? (
          <div className="my-auto py-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-blue-950/40 text-blue-400/80 rounded-2xl flex items-center justify-center border border-blue-900/15">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-300">Register empty</p>
              <p className="text-[10px] text-slate-400 max-w-[210px] mx-auto mt-0.5 leading-relaxed">
                Click menu dishes to start building the live billing broadcast.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Columns Header Layout matching image exactly */}
            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-blue-900/10">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {/* List Row items */}
            <div className="space-y-3">
              {cart.map((item) => {
                const isCustom = item.product.category === 'custom';
                const itemPrice = item.customPrice !== undefined ? item.customPrice : item.product.price;
                return (
                  <div key={`${item.product.id}-${itemPrice}`} className="grid grid-cols-12 gap-1 text-xs items-center group">
                    {/* Item label */}
                    <div className="col-span-6 pr-2">
                      <span className="text-white font-bold block truncate" title={item.product.name}>
                        {item.product.name}
                      </span>
                    </div>

                    {/* Quantity Selector with interactive inline buttons */}
                    <div className="col-span-2 flex items-center justify-center space-x-1.5 bg-blue-950/40 py-1.5 px-2 rounded-lg border border-blue-950/40">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, -1, isCustom, itemPrice)}
                        className="text-slate-400 hover:text-rose-400 pr-0.5"
                      >
                        -
                      </button>
                      <span className="text-[10px] font-mono font-bold text-slate-205">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, 1, isCustom, itemPrice)}
                        className="text-slate-400 hover:text-blue-400 pl-0.5"
                      >
                        +
                      </button>
                    </div>

                    {/* Price each */}
                    <span className="col-span-2 text-right font-mono text-slate-400">
                      ${itemPrice.toFixed(2)}
                    </span>

                    {/* Total Slot and Hover Trash can icon */}
                    <div className="col-span-2 text-right flex items-center justify-end space-x-1 font-mono">
                      <span className="text-white font-bold">
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id, isCustom, itemPrice)}
                        className="text-slate-500 hover:text-red-400 p-0.5 rounded cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pricing / Invoice Summary Footer Block matching image perfectly */}
      <div className="border-t border-blue-900/15 pt-3 space-y-2 text-xs">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-slate-400">
          <span>Subtotal</span>
          <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
        </div>

        {/* Editable Tax Row */}
        <div className="flex justify-between items-center text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Tax ({settings.taxRate.toFixed(1)}%)</span>
            {!isEditingTax ? (
              <button
                type="button"
                onClick={() => {
                  setTaxInputVal(settings.taxRate.toString());
                  setIsEditingTax(true);
                }}
                className="text-blue-400 hover:text-white flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
              >
                Edit
              </button>
            ) : (
              <form onSubmit={handleUpdateTax} className="inline-flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  className="w-12 bg-slate-900 border border-blue-900/40 rounded px-1.5 py-0.5 text-[10px] text-white"
                  value={taxInputVal}
                  onChange={(e) => setTaxInputVal(e.target.value)}
                />
                <button type="submit" className="text-emerald-400 text-[9px] font-bold uppercase">Save</button>
              </form>
            )}
          </div>
          <span className="font-mono text-white">${tax.toFixed(2)}</span>
        </div>

        {/* Total Display in Massive Blue Font as requested */}
        <div className="flex justify-between items-center border-t border-dashed border-blue-900/20 pt-2.5">
          <span className="text-sm font-bold text-white uppercase">Total</span>
          <span className="text-2xl font-black text-[#2F80ED] font-mono leading-none">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Horizontal Target Wallet selectors row styled EXACTLY like screenshot */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium text-[#8C9AA9] block tracking-wide text-left uppercase">
          PAYMENT METHOD
        </label>
        
        <div className="grid grid-cols-4 gap-1.5">
          {walletConfig.map((wallet) => {
            const isActive = selectedWallet === wallet.key;
            return (
              <button
                key={wallet.key}
                type="button"
                onClick={() => onChangeWallet(wallet.key)}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                  isActive
                    ? 'bg-[#183262] border-blue-500 shadow-md'
                    : 'bg-[#0b172d]/90 border-blue-900/15 hover:bg-slate-900'
                }`}
              >
                <div className={`w-10 h-6 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-60 saturate-50'}`}>
                  {wallet.key === 'evc' && (
                    <img src="https://i.postimg.cc/wT0gFtgz/EVCPlus.png" alt="EVC Plus" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  )}
                  {wallet.key === 'edahab' && (
                    <img src="https://i.postimg.cc/L6N2vqRx/Edahab.png" alt="eDahab" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  )}
                  {wallet.key === 'jeeb' && (
                    <img src="https://i.postimg.cc/4NXvffNj/Jeeb.png" alt="Jeeb" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  )}
                  {wallet.key === 'premier' && (
                    <img src="https://i.postimg.cc/dVmz7t8s/Premier-bank.png" alt="Premier Bank" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Automated, Dynamic QR Code Container */}
      {settings.merchantId && (
        cart.length > 0 ? (
          <div className="relative bg-white w-full rounded-2xl p-4 shadow-lg border border-slate-100 flex flex-col items-center justify-center space-y-3 animate-in fade-in-50 duration-250">
            
            {/* Subtle corner brackets in Teal */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#00C2B2] rounded-tl-sm"></div>
            <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#00C2B2] rounded-tr-sm"></div>
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#00C2B2] rounded-bl-sm"></div>
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#00C2B2] rounded-br-sm"></div>

            {/* Heading */}
            <div className="text-center select-none">
              <h4 className="text-slate-900 font-extrabold text-[12px] tracking-tight">Active Payment QR</h4>
              <p className="text-[#6B7280] text-[9px] scale-[0.95] leading-none mt-0.5">
                Live automated checkout link
              </p>
            </div>

            {/* Dynamic QrCanvas */}
            <div className="relative flex items-center justify-center p-0.5 bg-white rounded-xl">
              <QrCanvas value={paymentLink} size={110} />
              <div className="absolute w-6 h-6 bg-[#00C2B2] rounded-md flex items-center justify-center border border-white shadow-sm">
                <span className="text-white font-black text-[8px] leading-none">GP</span>
              </div>
            </div>

            {/* GoPay styled logomark underneath QR */}
            <div className="flex flex-col items-center justify-center select-none leading-none">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-[#00C2B2] tracking-tight">GoPay Broadcast</span>
                <span className="text-[#00C2B2] text-[8px] font-bold font-mono animate-pulse">)))</span>
              </div>
            </div>

            {/* HIGH-CONTRAST DYNAMIC DATA METRICS */}
            <div className="w-full bg-slate-50 border border-slate-100/80 rounded-xl p-2.5 space-y-1.5 text-left text-[10px] text-slate-700 font-semibold leading-normal">
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-1">
                <span className="text-[8px] text-slate-400 font-bold uppercase">Merchant ID</span>
                <span className="font-mono text-slate-900 font-bold">{settings.merchantId || "R-10245"}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200/50 pb-1">
                <span className="text-[8px] text-slate-400 font-bold uppercase">Carrier Target</span>
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    {selectedWallet === 'evc' && <img src="https://i.postimg.cc/wT0gFtgz/EVCPlus.png" className="w-full h-full object-contain" referrerPolicy="no-referrer" />}
                    {selectedWallet === 'edahab' && <img src="https://i.postimg.cc/L6N2vqRx/Edahab.png" className="w-full h-full object-contain" referrerPolicy="no-referrer" />}
                    {selectedWallet === 'jeeb' && <img src="https://i.postimg.cc/4NXvffNj/Jeeb.png" className="w-full h-full object-contain" referrerPolicy="no-referrer" />}
                    {selectedWallet === 'premier' && <img src="https://i.postimg.cc/dVmz7t8s/Premier-bank.png" className="w-full h-full object-contain" referrerPolicy="no-referrer" />}
                  </div>
                  <span className="font-bold text-slate-900 capitalize">{selectedWallet}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[8px] text-slate-400 font-bold uppercase">Amount Due</span>
                <span className="font-mono text-[#00C2B2] font-extrabold">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Copy Link Container directly integrated inside the single white card */}
            <div className="w-full flex items-center justify-between gap-1 bg-slate-100/60 border border-slate-200/30 px-2.5 py-1 rounded-md text-left leading-none">
              <span className="text-[8px] font-mono text-slate-400 truncate max-w-[130px]" title={paymentLink}>
                {paymentLink}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(paymentLink);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }
                }}
                className="text-[8px] text-[#00C2B2] hover:text-[#00ebd7] font-extrabold shrink-0 flex items-center gap-0.5 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 font-bold" />
                    <span className="text-emerald-500 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5 text-slate-400 font-bold" />
                    <span className="text-slate-500 font-bold">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative bg-white w-full rounded-2xl p-4 shadow-lg border border-slate-100 flex flex-col items-center justify-center space-y-3 animate-in fade-in-50 duration-250">
            
            {/* Subtle corner brackets in Teal */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#00C2B2] rounded-tl-sm"></div>
            <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#00C2B2] rounded-tr-sm"></div>
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#00C2B2] rounded-bl-sm"></div>
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#00C2B2] rounded-br-sm"></div>

            {/* Heading */}
            <div className="text-center select-none">
              <h4 className="text-slate-900 font-extrabold text-[12px] tracking-tight">Permanent Counter QR</h4>
              <p className="text-[#6B7280] text-[9px] scale-[0.95] leading-none mt-0.5">
                Scan to initiate checkout at this terminal
              </p>
            </div>

            {/* Dynamic QrCanvas with permanent merchant link */}
            <div className="relative flex items-center justify-center p-0.5 bg-white rounded-xl">
              <QrCanvas value={paymentLink} size={110} />
              <div className="absolute w-6 h-6 bg-[#00C2B2] rounded-md flex items-center justify-center border border-white shadow-sm">
                <span className="text-white font-black text-[8px] leading-none">GP</span>
              </div>
            </div>

            {/* GoPay styled logomark underneath QR */}
            <div className="flex flex-col items-center justify-center select-none leading-none">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-[#00C2B2] tracking-tight">GoPay Counter ID</span>
              </div>
            </div>

            {/* Merchant ID Display */}
            <div className="w-full bg-slate-50 border border-slate-100/80 rounded-xl p-2.5 flex items-center justify-between text-[10px] text-slate-700 font-semibold leading-normal">
                <span className="text-[8px] text-slate-400 font-bold uppercase">Terminal ID</span>
                <span className="font-mono text-slate-900 font-bold">{settings.merchantId}</span>
            </div>
          </div>
        )
      )}

      {/* New Proceed To Payment Button based on reference images */}
      {onProceedToPayment && cart.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onProceedToPayment}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#00C2B2] hover:bg-[#008E82] text-white text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-white" />
            <span>Proceed to Payment</span>
          </button>
        </div>
      )}

    </div>
  );
};
