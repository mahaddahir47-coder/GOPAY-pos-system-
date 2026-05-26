import React, { useState, useEffect } from 'react';
import { ShieldCheck, Wifi, Signal, Battery, ArrowRight, Lock, CheckCircle2, ShoppingBag, Receipt, ArrowLeft, Printer } from 'lucide-react';
import { GoPayWallet } from '../types';

interface SimpleItem {
  name: string;
  qty: number;
  price: number;
}

interface CustomerWalletSimulatorProps {
  invoiceId: string;
  merchantName: string;
  merchantId: string;
  amount: string;
  wallet: GoPayWallet;
  itemsJSON?: string;
  onConfirmPayment: () => void;
  onClose?: () => void;
  inlineMode?: boolean;
}

export const CustomerWalletSimulator: React.FC<CustomerWalletSimulatorProps> = ({
  invoiceId,
  merchantName,
  merchantId,
  amount,
  wallet,
  itemsJSON,
  onConfirmPayment,
  onClose,
  inlineMode = false,
}) => {
  const [pin, setPin] = useState<string>('');
  const [step, setStep] = useState<'welcome' | 'pin' | 'processing' | 'success'>('welcome');
  const [txId, setTxId] = useState<string>('');

  // Parse item references for receipt preview
  const parsedItems: SimpleItem[] = React.useMemo(() => {
    if (!itemsJSON) return [];
    try {
      return JSON.parse(itemsJSON);
    } catch {
      return [];
    }
  }, [itemsJSON]);

  useEffect(() => {
    // Generate static checkout reference ID
    const rndLong = Math.floor(100000 + Math.random() * 900000);
    setTxId(`GP-TX-${rndLong}`);
  }, [invoiceId]);

  // Audio synthesize trigger for successful Somalia mobile banking beep
  const triggerSuccessBeep = () => {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 1320; // Somali high confirmation tone
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.log('AudioContext could not launch on static user event context: ', e);
    }
  };

  const handleKeyPress = (num: string) => {
    if (num === 'C') {
      setPin('');
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + num);
      }
    }
  };

  const verifyPinAndPay = () => {
    if (pin.length < 4) return;
    setStep('processing');
    
    // Process delay simulator
    setTimeout(async () => {
      triggerSuccessBeep();
      setStep('success');
      localStorage.setItem(`gopay_payment_status_${invoiceId}`, 'paid');
      
      // Real-time broadcast notification across devices using ntfy pub/sub framework
      try {
        await fetch(`https://ntfy.sh/gopay_payment_${invoiceId}`, {
          method: 'POST',
          body: 'paid',
        });
      } catch (err) {
        console.warn('Real-time pub/sub transfer broadcast skipped or blocked: ', err);
      }

      // Also notify the local Express GoPay backend server
      if (merchantId) {
        try {
          await fetch('/api/pay-terminal-price', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ merchantId }),
          });
        } catch (err) {
          console.warn('Express backend status pay notify failed: ', err);
        }
      }
      
      onConfirmPayment();
    }, 1500);
  };

  // Styled brand color sheets corresponding to targeted Somali system operators
  const getBrandDetails = () => {
    switch (wallet) {
      case 'evc':
        return {
          name: 'Hormuud EVC Plus',
          primaryBg: 'bg-[#00828A]', // Dark Teal
          accentBg: 'bg-[#FFD400]', // Hormuud Yellow
          textColor: 'text-white',
          borderBorder: 'border-[#00828A]/30',
          logoText: 'EVC Plus',
          tagline: 'Somalia\'s Safest Mobile Wallet Payment Gateway',
        };
      case 'edahab':
        return {
          name: 'eDahab (Somtel)',
          primaryBg: 'bg-[#1E3A8A]', // Somtel Navy Blue
          accentBg: 'bg-[#FF8A00]', // Somtel Bright Orange
          textColor: 'text-white',
          borderBorder: 'border-blue-900/30',
          logoText: 'eDahab',
          tagline: 'Somtel Consolidated Cash Flow Security',
        };
      case 'jeeb':
        return {
          name: 'JEEB Mobile Wallet',
          primaryBg: 'bg-[#0E2F56]', // Dark Navy
          accentBg: 'bg-[#00E5FF]', // Cyber Cyan
          textColor: 'text-white',
          borderBorder: 'border-cyan-500/30',
          logoText: 'JEEB',
          tagline: 'Next-Gen Tap-to-Transmit Fintech Solution',
        };
      case 'premier':
        return {
          name: 'Premier Wallet',
          primaryBg: 'bg-[#6B1D2F]', // Royal Maroon
          accentBg: 'bg-[#D4AF37]', // Rich Gold
          textColor: 'text-white',
          borderBorder: 'border-amber-500/30',
          logoText: 'Premier Bank',
          tagline: 'Islamic Banking & Fast Mobile Pay System',
        };
    }
  };

  const brand = getBrandDetails();

  return (
    <div className={`font-mono text-slate-800 ${inlineMode ? 'w-full max-w-[420px] mx-auto rounded-3xl overflow-hidden border border-slate-200 shadow-2xl relative' : 'fixed inset-0 bg-slate-900 bg-opacity-95 z-55 flex items-center justify-center p-4 overflow-y-auto'}`}>
      
      {/* Outer iOS Mock Mobile Hardware Wrapping Grid */}
      <div className={`w-full max-w-[390px] mx-auto bg-slate-950 text-white rounded-[40px] border-[10px] border-slate-800 flex flex-col min-h-[640px] shadow-2xl ${inlineMode ? 'h-[640px]' : ''}`}>
        
        {/* iOS Top Status Bar Indicator Info */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold text-gray-400 font-sans tracking-tight bg-slate-900">
          <span>{new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="w-14 h-4 bg-black rounded-full mx-auto hidden sm:block"></div> {/* iPhone notch spacer */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <Signal className="h-3 w-3" />
            <span className="text-[9px]">5G</span>
            <Battery className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* Dynamic Branded Screen Canvas banner header */}
        <div className={`${brand.primaryBg} ${brand.textColor} p-4 text-center relative border-b border-white/10 shrink-0`}>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute left-3 top-4 text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer"
              title="Return to Pos"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />
            <h1 className="text-xs font-black uppercase tracking-widest">{brand.logoText} Secure Payment Link</h1>
          </div>
          <p className="text-[9px] text-white/70 mt-0.5 tracking-tight font-sans italic">{brand.tagline}</p>
        </div>

        {/* Immersive Scrollable Body Container Area */}
        <div className="flex-1 bg-[#F4F6F9] text-slate-800 p-5 flex flex-col justify-between overflow-y-auto font-sans">
          
          {step === 'welcome' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Secure verification details block of payee */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-md text-center space-y-1">
                  <span className="text-[9px] font-black text-[#2F80ED] uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                    PENDING INCOMING REQUEST
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Invoice Ref: {invoiceId}</p>
                  
                  <div className="py-2.5">
                    <p className="text-xs text-slate-500 font-medium">Deliver Checkout Amount to:</p>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{merchantName}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Merchant MID: {merchantId}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Billing Total</p>
                    <p className="text-2xl font-black text-slate-900 font-mono">${parseFloat(amount).toFixed(2)}</p>
                  </div>
                </div>

                {/* Serialized list items of invoice */}
                {parsedItems.length > 0 && (
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/50 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 border-b border-slate-100 pb-1.5">
                      <ShoppingBag className="h-3.5 w-3.5 text-[#2F80ED]" />
                      <span>Order Items Breakdown</span>
                    </div>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto font-mono text-xs text-slate-700 pr-1">
                      {parsedItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="truncate max-w-[150px] font-medium text-slate-900">{item.name}</span>
                          <span className="text-slate-400 text-[10px]">x{item.qty}</span>
                          <span className="font-bold text-slate-900">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Slide action trigger to next checkout page */}
              <button
                onClick={() => setStep('pin')}
                className={`w-full py-3.5 rounded-2xl ${brand.accentBg} text-slate-900 hover:opacity-90 font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg active:scale-98 transition-all duration-150 cursor-pointer border border-yellow-400`}
              >
                <span>PROCEED TO COMPANION PIN INGRESS</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 'pin' && (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="text-center space-y-2">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Secure Transaction Pin Entry</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Please provide your {brand.name} Wallet authentication pin.</p>
                </div>

                {/* Interactive input dot blocks simulating standard mobile bank interfaces */}
                <div className="flex justify-center space-x-4 py-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border border-slate-350 transition-all duration-100 ${
                        pin.length > idx ? 'bg-slate-800 scale-110 shadow-sm shadow-slate-800/30' : 'bg-white'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Pin Ingress Numeric Pad */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-200/50 p-2 rounded-2xl border border-slate-300/40">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeyPress(num)}
                    className={`py-2 text-center text-[#022047] font-bold text-sm bg-white hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200 font-mono transition-colors cursor-pointer ${
                      num === 'C' ? 'text-rose-500 bg-rose-50 hover:bg-rose-100 border-rose-150' : ''
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Verify checkout action banner */}
              <button
                type="button"
                onClick={verifyPinAndPay}
                disabled={pin.length < 4}
                className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider border shadow-md transition-all duration-150 ${
                  pin.length === 4
                    ? `${brand.accentBg} text-slate-900 border-yellow-400 hover:opacity-95 active:scale-[0.98] cursor-pointer`
                    : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                }`}
              >
                Sign & Confirm Transfer
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              {/* Core spinner loader ring */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#2F80ED] rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#022047]">Processing Checkout Transaction...</p>
                <p className="text-[10px] text-slate-400 font-mono">Transmitting secure tokens to terminal router</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                
                {/* Check sign circle widget */}
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-md">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Payment Successful</h3>
                  <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 rounded-full px-3 py-0.5 inline-block">
                    ✓ Transact Authenticated & Confirmed
                  </p>
                </div>

                {/* Multi-Device success Receipt sheet layout */}
                <div className="bg-white p-4 rounded-2xl border border-slate-250/90 shadow-sm relative overflow-hidden text-slate-800 space-y-3 font-mono text-[10px]">
                  {/* Decorative stamp clip side indicator */}
                  <div className="absolute top-0 right-0 bg-[#00828A] text-white font-sans text-[7px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                    GoPay Certified
                  </div>
                  
                  <div className="text-center border-b border-dashed border-slate-300 pb-2.5 space-y-1">
                    <h4 className="text-xs font-black uppercase text-slate-900">{merchantName}</h4>
                    <p className="text-[8px] text-slate-400">Merchant Reference: {merchantId}</p>
                    <p className="text-[8px] text-slate-400">Session Date: {new Date().toLocaleString()}</p>
                    <p className="text-[8px] text-slate-400 font-bold text-[#2F80ED]">TX REFERID: {txId}</p>
                  </div>

                  <div className="border-b border-dashed border-slate-300 pb-2.5 space-y-1.5">
                    <div className="grid grid-cols-12 gap-1 font-bold text-slate-500 uppercase pb-1 border-b border-slate-100 mb-1">
                      <span className="col-span-6">Food Dish Item</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-4 text-right">Price</span>
                    </div>
                    {parsedItems.map((item, id) => (
                      <div key={id} className="grid grid-cols-12 gap-1 text-[10px]">
                        <span className="col-span-6 truncate text-slate-700 font-semibold">{item.name}</span>
                        <span className="col-span-2 text-center text-slate-400">{item.qty}</span>
                        <span className="col-span-4 text-right font-bold text-slate-800">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    {parsedItems.length === 0 && (
                      <div className="flex justify-between text-slate-700">
                        <span className="font-semibold">{merchantName} Custom Sale</span>
                        <span>1</span>
                        <span>${parseFloat(amount).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-900">
                      <span>Grand Total Remitted:</span>
                      <span className="text-[#2F80ED] text-sm">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-center bg-[#F4F6F9] rounded-xl p-2 border border-slate-150 space-y-0.5 mt-1.5">
                    <span className="text-[8px] font-black uppercase text-slate-400 block tracking-widest">TRANSMITTER LINK COMPLETE</span>
                    <p className="text-[8.5px] font-sans font-bold text-slate-700">Receipt and Payment successfully saved in Customer Wall Wallet.</p>
                  </div>
                </div>

              </div>

              {/* Close simulated banking screen */}
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                }}
                className="w-full py-3 bg-[#011631] text-white hover:bg-slate-900 border border-slate-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <span>Disconnect Checkout Client</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

        </div>

        {/* Mock Hardware Home Bar representation at the bottom container */}
        <div className="pb-3 pt-1.5 bg-slate-950 flex items-center justify-center shrink-0">
          <div className="w-28 h-1 bg-white/40 rounded-full"></div>
        </div>

      </div>

    </div>
  );
};
