import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, ArrowLeft, QrCode, Smartphone, Info, ShieldAlert, Sparkles, Check, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { CartItem, GoPayWallet, MerchantSettings } from '../types';
import QRCode from 'qrcode';

interface CheckoutStageProps {
  cart: CartItem[];
  settings: MerchantSettings;
  orderType: 'Dine In' | 'Takeaway' | 'Delivery';
  selectedTableId: string;
  takeawayTime: string;
  deliveryAddress: string;
  deliveryPhone: string;
  paymentStatus: 'unpaid' | 'paid';
  onClearCart: () => void;
  onCancelPayment: () => void;
  onBackToCatalog: () => void;
  onTriggerNfcWrite: () => Promise<boolean>;
  isNfcSupported: boolean;
  selectedWallet: GoPayWallet;
  onChangeWallet: (wallet: GoPayWallet) => void;
  onSimulateDirectOrder: () => void;
  onOpenInlineSimulator?: () => void;
}

// Custom internal QrCanvas renderer with white background for high contrast scanning
const QrCanvas: React.FC<{ value: string; size?: number }> = ({ value, size = 180 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: { dark: '#0B1220', light: '#FFFFFF' },
        errorCorrectionLevel: 'H', // Use high error correction to allow center overlay safely
      });
    } catch (err) {
      console.error('QR Code Generation failure:', err);
    }
  }, [value, size]);

  return (
    <div className="bg-white p-2.5 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
      <canvas ref={canvasRef} style={{ width: `${size - 16}px`, height: `${size - 16}px` }} className="rounded-xl" />
    </div>
  );
};

export const CheckoutStage: React.FC<CheckoutStageProps> = ({
  cart,
  settings,
  orderType,
  selectedTableId,
  takeawayTime,
  deliveryAddress,
  deliveryPhone,
  paymentStatus,
  onClearCart,
  onCancelPayment,
  onBackToCatalog,
  onTriggerNfcWrite,
  isNfcSupported,
  selectedWallet,
  onChangeWallet,
  onSimulateDirectOrder,
  onOpenInlineSimulator,
}) => {
  const [activePaymentTab, setActivePaymentTab] = useState<'qr' | 'nfc'>('qr');
  const [nfcWriteStatus, setNfcWriteStatus] = useState<'idle' | 'writing' | 'success' | 'failed'>('idle');

  // Math totals
  const subtotal = cart.reduce((acc, item) => {
    const pr = item.customPrice !== undefined ? item.customPrice : item.product.price;
    return acc + pr * item.quantity;
  }, 0);
  const tax = subtotal * (settings.taxRate / 100);
  const total = subtotal + tax;

  // Compute dynamic GoPay payment link with updated merchant and amount matching current basket
  const getPaymentLink = () => {
    const activeMerchantId = settings.merchantId || "R-10245";
    const amount = total.toFixed(2);
    return `https://gopay01.vercel.app/?merchant=${activeMerchantId}&amount=${amount}`;
  };

  const paymentLink = getPaymentLink();

  const handleWriteNfc = async () => {
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

  // Human-readable Target display
  let orderTarget = 'Walk-in Customer';
  if (orderType === 'Dine In') {
    orderTarget = selectedTableId;
  } else if (orderType === 'Takeaway') {
    orderTarget = `Takeaway (${takeawayTime})`;
  } else if (orderType === 'Delivery') {
    orderTarget = `${deliveryAddress || 'Address'} (${deliveryPhone || 'Phone'})`;
  }

  // Define payment options
  const wallets = [
    { key: 'evc' as GoPayWallet, label: 'EVC Plus', img: 'https://i.postimg.cc/wT0gFtgz/EVCPlus.png' },
    { key: 'edahab' as GoPayWallet, label: 'eDahab', img: 'https://i.postimg.cc/L6N2vqRx/Edahab.png' },
    { key: 'jeeb' as GoPayWallet, label: 'Jeeb', img: 'https://i.postimg.cc/4NXvffNj/Jeeb.png' },
    { key: 'premier' as GoPayWallet, label: 'Premier', img: 'https://i.postimg.cc/dVmz7t8s/Premier-bank.png' },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* Dynamic 2-column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= LEFT COLUMN: Current Order ================= */}
        <div className="xl:col-span-4 bg-[#0B1220] border border-blue-900/15 rounded-3xl p-6 flex flex-col justify-between shadow-2xl min-h-[500px]">
          
          <div className="space-y-5">
            {/* Header: Title and Status Pill */}
            <div className="flex items-center justify-between border-b border-blue-900/10 pb-3">
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-[#6B7280] uppercase tracking-widest">Current Order</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold">INV-{Date.now().toString().slice(-6)}</p>
              </div>
              
              {/* Dine In Pill / Badge */}
              <div className="flex items-center gap-1.5 bg-[#162238] border border-blue-900/25 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C2B2] animate-pulse"></span>
                <span>{orderType} - {orderType === 'Dine In' ? selectedTableId : 'Cashier'}</span>
                <span className="text-slate-500 font-normal ml-0.5">⋮</span>
              </div>
            </div>

            {/* Scrollable list of cart items */}
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
              {cart.map((item, idx) => {
                const itemPrice = item.customPrice !== undefined ? item.customPrice : item.product.price;
                return (
                  <div key={`${item.product.id}-${idx}`} className="flex items-center justify-between py-1 border-b border-blue-900/10">
                    <div className="flex items-center gap-3">
                      {/* Round badge indicator with fine teal border */}
                      <div className="w-6 h-6 rounded-full border border-[#00C2B2]/40 bg-[#0B1220] flex items-center justify-center text-[#00C2B2] font-black text-xs shrink-0 shadow-sm">
                        {item.quantity}
                      </div>
                      <span className="text-sm text-ellipsis font-semibold text-white truncate max-w-[140px]" title={item.product.name}>
                        {item.product.name}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-300">
                      ${(itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Summary matching image exactly */}
          <div className="border-t border-blue-900/10 pt-4 space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6B7280] font-semibold">Subtotal</span>
              <span className="font-mono font-bold text-slate-200">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#6B7280] font-semibold">Tax (8.5%)</span>
              <span className="font-mono font-bold text-slate-200">${tax.toFixed(2)}</span>
            </div>

            <div className="border-t border-dashed border-blue-900/20 pt-3 flex justify-between items-center">
              <span className="text-sm font-extrabold text-[#6B7280] uppercase tracking-wider">Total</span>
              <span className="text-3xl font-black text-[#00C2B2] font-mono leading-none tracking-tight">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Bottom buttons inside this Left panel */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={onClearCart}
                className="py-2.5 px-3 rounded-xl border border-blue-900/40 hover:bg-rose-950/20 hover:border-rose-500/20 text-[#6B7280] hover:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Order</span>
              </button>

              <button
                type="button"
                onClick={onBackToCatalog}
                className="py-2.5 px-3 rounded-xl bg-transparent border border-[#00C2B2]/30 hover:border-[#00C2B2] text-[#00C2B2] hover:bg-[#00C2B2]/5 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: Select Payment Method ================= */}
        <div className="xl:col-span-8 bg-[#0B1220] border border-blue-900/15 rounded-3xl p-6 flex flex-col justify-between shadow-2xl min-h-[500px]">
          
          {/* Header row with Title and Selector Tabs on the Right */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-blue-900/10 pb-4 gap-3">
            <h3 className="text-base font-extrabold text-white tracking-tight text-left">
              Select Payment Method
            </h3>

            {/* QR Code and NFC Selector Tabs */}
            <div className="flex bg-[#0F1829] p-1 rounded-xl border border-blue-900/10 self-start md:self-auto shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => setActivePaymentTab('qr')}
                className={`py-2 px-4 rounded-lg text-xs font-extrabold tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                  activePaymentTab === 'qr'
                    ? 'bg-[#00C2B2] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePaymentTab('nfc')}
                className={`py-2 px-4 rounded-lg text-xs font-extrabold tracking-wide flex items-center gap-2 transition-all cursor-pointer ${
                  activePaymentTab === 'nfc'
                    ? 'bg-[#00C2B2] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>NFC</span>
              </button>
            </div>
          </div>

          {/* Core Body Container based on selected tab */}
          <div className="my-auto py-6 flex flex-col items-center justify-center">
            {activePaymentTab === 'qr' ? (
              <div className="flex flex-col items-center justify-center space-y-5 w-full">
                
                {/* White design QR card */}
                <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-200">
                  
                  {/* Photo dynamic align corner brackets in Teal */}
                  <div className="absolute top-5 left-5 w-5 h-5 border-t-2 border-l-2 border-[#00C2B2] rounded-tl-md"></div>
                  <div className="absolute top-5 right-5 w-5 h-5 border-t-2 border-r-2 border-[#00C2B2] rounded-tr-md"></div>
                  <div className="absolute bottom-5 left-5 w-5 h-5 border-b-2 border-l-2 border-[#00C2B2] rounded-bl-md"></div>
                  <div className="absolute bottom-5 right-5 w-5 h-5 border-b-2 border-r-2 border-[#00C2B2] rounded-br-md"></div>

                  {/* Scan to Pay Labeling */}
                  <div className="text-center pt-2">
                    <h4 className="text-slate-900 font-extrabold text-base tracking-tight">Scan to Pay</h4>
                    <p className="text-[#6B7280] text-[10.5px] mt-0.5 max-w-[210px] leading-normal mx-auto font-medium">
                      Open any mobile banking app or GoPay app to scan
                    </p>
                  </div>

                  {/* QR Canvas Box with Center-Overlay Logo */}
                  <div className="relative flex items-center justify-center p-1 bg-white rounded-2xl">
                    <QrCanvas value={paymentLink} size={170} />
                    
                    {/* Centered overlay icon representing premium GoPay */}
                    <div className="absolute w-9 h-9 bg-[#00C2B2] rounded-xl flex items-center justify-center border-2 border-white shadow-md">
                      <div className="text-white font-black text-[13px] leading-none tracking-tighter cursor-default">GP</div>
                    </div>
                  </div>

                  {/* GoPay styled logomark underneath QR */}
                  <div className="flex flex-col items-center justify-center pb-2 select-none">
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-black text-[#00C2B2] tracking-tight">GoPay</span>
                      <span className="text-[#00C2B2] text-xs font-bold font-mono animate-pulse">)))</span>
                    </div>
                  </div>

                </div>

                {/* Centered Tip underneath white checkout card */}
                <div className="flex items-center gap-2 bg-[#00C2B2]/5 border border-[#00C2B2]/20 px-4 py-2 rounded-xl text-center max-w-md shadow-sm">
                  <Info className="w-4 h-4 text-[#00C2B2] shrink-0 animate-bounce" />
                  <span className="text-[10px] text-[#00C2B2] font-bold text-left leading-snug">
                    Make sure the QR code is clearly visible on the customer's phone or secondary device.
                  </span>
                </div>

              </div>
            ) : (
              // ================= NFC TAB BODY =================
              <div className="flex flex-col items-center justify-center space-y-6 max-w-md text-center py-4 animate-in zoom-in-95 duration-200">
                
                {/* Visual Radar Waves */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-dashed border-[#00C2B2]/20 rounded-full animate-spin [animation-duration:15s]"></div>
                  <div className="absolute inset-3 border border-[#00C2B2]/40 rounded-full animate-ping [animation-duration:2s]"></div>
                  <div className="absolute inset-6 border border-[#00C2B2]/30 rounded-full"></div>
                  <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-[#0F1829] to-[#1C2B46] flex flex-col items-center justify-center border border-[#00C2B2]/40 shadow-[0_0_20px_rgba(0,194,178,0.25)]">
                     <span className="font-mono text-[9px] font-black text-[#00C2B2] tracking-widest animate-pulse">
                       (((o)))
                     </span>
                     <span className="font-sans font-black text-[9px] text-white tracking-widest mt-0.5">
                       NFC
                     </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-extrabold text-white">Transmitting Invoice NDEF Signature...</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Place customer smart NFC card or phone tag close to the local transmitter ring to write invoice payload.
                  </p>
                </div>

                {/* Quick Interactive Simulated / Physical NFC Writer */}
                <button
                  type="button"
                  onClick={handleWriteNfc}
                  disabled={nfcWriteStatus === 'writing'}
                  className={`py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 border transition-all active:scale-[0.98] cursor-pointer inline-flex ${
                    nfcWriteStatus === 'success'
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/10'
                      : nfcWriteStatus === 'failed'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-rose-500/10'
                        : 'bg-[#1C2B46] hover:bg-teal-600 border-[#00C2B2]/20 hover:border-[#00C2B2] text-teal-400 hover:text-white shadow-[#00C2B2]/5'
                  }`}
                >
                  {nfcWriteStatus === 'writing' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {nfcWriteStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  {nfcWriteStatus === 'failed' && <AlertTriangle className="w-4 h-4 text-white" />}
                  {nfcWriteStatus === 'idle' && <span className="text-[#00C2B2] font-mono">(((o)))</span>}
                  
                  <span>
                    {nfcWriteStatus === 'idle' && 'WRITE TO NFC TAG'}
                    {nfcWriteStatus === 'writing' && 'BROADCASTING NDEF...'}
                    {nfcWriteStatus === 'success' && 'NFC TAG WRITE OK!'}
                    {nfcWriteStatus === 'failed' && 'WRITE ERROR / BLOCKED'}
                  </span>
                </button>

                <p className="text-[10px] text-slate-500 font-mono">
                  Payload content: {paymentLink.slice(0, 32)}...
                </p>

              </div>
            )}
          </div>

          {/* Wallet Brand Horizontal Logos in Bottom Area */}
          <div className="border-t border-blue-900/10 pt-4 flex flex-col space-y-2">
            <span className="text-[9px] font-bold text-[#6B7280] tracking-wider text-left uppercase">
              Target Carrier Gateway
            </span>
            <div className="grid grid-cols-4 gap-2">
              {wallets.map((w) => {
                const isActive = selectedWallet === w.key;
                return (
                  <button
                    key={w.key}
                    type="button"
                    onClick={() => onChangeWallet(w.key)}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1C2B46] border-[#00C2B2]/80 shadow-md scale-[1.01]'
                        : 'bg-[#0F1829]/60 border-blue-900/15 opacity-60 hover:opacity-100 hover:bg-[#0F1829]'
                    }`}
                    title={`Select ${w.label} receiver gateway`}
                  >
                    <img src={w.img} alt={w.label} className="h-5 object-contain" referrerPolicy="no-referrer" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* ================= BOTTOM METRICS PANEL: Actions row ================= */}
      <div className="bg-[#0B1220] border border-blue-900/15 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl select-none">
        
        {/* Left Back Arrow component */}
        <button
          type="button"
          onClick={onBackToCatalog}
          className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-[#0F1829] border border-blue-900/15 hover:border-blue-700/50 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back</span>
        </button>

        {/* Middle grand balance amount display */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="leading-none text-left">
            <p className="text-[9px] font-black uppercase text-[#6B7280] tracking-widest uppercase">Amount Due</p>
            <p className="text-3xl font-black text-[#00C2B2] font-mono mt-1 leading-none">
              ${total.toFixed(2)}
            </p>
          </div>
          {onOpenInlineSimulator && (
            <button
              onClick={onOpenInlineSimulator}
              className="px-3 py-1.5 rounded-xl bg-[#162238] hover:bg-[#203253] border border-blue-900/20 hover:border-blue-500/30 text-[#00C2B2] text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Launch virtual customer payment simulator"
            >
              <span>Simulate Scan</span>
              <Sparkles className="w-3 h-3 text-[#00C2B2]" />
            </button>
          )}
        </div>

        {/* Right operation buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          
          <button
            type="button"
            onClick={onSimulateDirectOrder}
            className="flex-1 sm:flex-initial py-3.5 px-6 rounded-2xl bg-[#1C2B46] hover:bg-[#25395A] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer border border-[#00C2B2]/20"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
            <span>Other Payment</span>
          </button>

          {/* Action "Cancel Payment" button in a solid teal background with center close 'X' symbol */}
          <button
            type="button"
            onClick={onCancelPayment}
            className="flex-1 sm:flex-initial py-3.5 px-6 rounded-2xl bg-[#00C2B2] hover:bg-[#008E82] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-[#00C2B2]/10"
          >
            <span>Cancel Payment</span>
            <span className="font-extrabold font-mono text-sm leading-none ml-1">✕</span>
          </button>

        </div>

      </div>

    </div>
  );
};
