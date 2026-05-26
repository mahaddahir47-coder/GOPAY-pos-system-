import React, { useState, useEffect, useRef } from 'react';
import { Wifi, QrCode, Copy, Check, Sparkles, Printer, Tablet, RefreshCw, Smartphone, ExternalLink } from 'lucide-react';
import { Invoice } from '../types';
import QRCode from 'qrcode';

interface NFCInducerProps {
  invoice: Invoice;
  isNfcSupported: boolean;
  onTriggerNfcWrite: () => Promise<boolean>;
  paymentStatus: 'unpaid' | 'paid';
  onOpenInlineSimulator?: () => void;
}

// Reusable dynamic QR Canvas rendering component
const QrCanvas: React.FC<{ value: string; size?: number }> = ({ value, size = 140 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
        color: { dark: '#030918', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      });
    } catch (err) {
      console.error('QR Code Generation failure:', err);
    }
  }, [value, size]);

  return (
    <div className="bg-white p-2 rounded-2xl flex items-center justify-center shrink-0 border border-blue-900/20 shadow-md">
      <canvas ref={canvasRef} style={{ width: `${size - 24}px`, height: `${size - 24}px` }} className="rounded-xl" />
    </div>
  );
};

export const NFCInducer: React.FC<NFCInducerProps> = ({
  invoice,
  isNfcSupported,
  paymentStatus,
  onOpenInlineSimulator,
}) => {
  const [copyAck, setCopyAck] = useState(false);
  const [nfcActive, setNfcActive] = useState(true);

  // Compute dynamic GoPay payment checkout link matching current cashier basket
  const getPaymentLink = () => {
    const activeMerchantId = invoice.merchantId || "R-10245";
    const amount = parseFloat(invoice.total as any).toFixed(2);
    return `https://gopay01.vercel.app/?merchant=${activeMerchantId}&amount=${amount}`;
  };

  const paymentLink = getPaymentLink();

  const handleCopyClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopyAck(true);
      setTimeout(() => setCopyAck(false), 2000);
    }
  };

  const triggerPrintReceipt = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
      
      {/* 1. Left Panel: NFC Transmitter Console (Grid span 5) */}
      <div className="lg:col-span-5 bg-[#0b172d]/85 border border-[#14223f]/80 text-white rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[240px] transition-all">
        {/* Title and Switch */}
        <div className="flex items-center justify-between border-b border-blue-900/10 pb-2.5">
          <div className="flex items-center space-x-2 text-[#8C9AA9] text-xs font-bold uppercase tracking-wider">
            <span className={`w-1.5 h-1.5 rounded-full ${nfcActive && parseFloat(invoice.total as any) > 0 ? 'bg-blue-500 animate-ping' : 'bg-slate-550'}`}></span>
            <span>NFC Transmitter</span>
          </div>

          <button
            type="button"
            onClick={() => setNfcActive(!nfcActive)}
            className="flex items-center gap-2 cursor-pointer focus:outline-none bg-blue-950/20 px-2 py-1 rounded-lg border border-blue-900/25 transition-all text-xs text-slate-300 font-bold active:scale-[0.98]"
          >
            <span>{nfcActive ? 'ON' : 'OFF'}</span>
            <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ${nfcActive ? 'bg-blue-500' : 'bg-slate-800'}`}>
              <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 shadow-sm ${nfcActive ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
            </div>
          </button>
        </div>

        {/* Floating Radar Waves Area */}
        <div className="flex items-center gap-5 my-4">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            {nfcActive && parseFloat(invoice.total as any) > 0 ? (
              <>
                <div className="absolute inset-0 border-2 border-dashed border-[#2F80ED]/20 rounded-full animate-spin [animation-duration:12s]"></div>
                <div className="absolute inset-2 border border-blue-500/40 rounded-full animate-ping [animation-duration:2.5s]"></div>
                <div className="absolute inset-4 border border-blue-500/30 rounded-full"></div>
                <div className="absolute inset-5 rounded-full bg-gradient-to-tr from-blue-900/90 to-blue-950 flex flex-col items-center justify-center border border-blue-500/45 shadow-[0_0_20px_rgba(47,128,237,0.35)]">
                   <span className="font-mono text-[9px] font-black text-blue-400 tracking-widest animate-pulse flex items-center gap-0.5">
                     (((o)))
                   </span>
                   <span className="font-sans font-black text-[10px] text-white tracking-widest mt-0.5">
                     ACTIVE
                   </span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 border border-slate-800 rounded-full"></div>
                <div className="absolute inset-5 rounded-full bg-slate-900 flex flex-col items-center justify-center border border-slate-850">
                   <span className="font-sans font-black text-[10px] text-slate-500 tracking-widest">
                     MUTED
                   </span>
                </div>
              </>
            )}
          </div>

          <div className="text-left space-y-1.5 flex-1 select-text">
            <h4 className="text-[13px] font-extrabold text-white leading-tight">
              {!nfcActive
                ? 'Broadcasting Paused'
                : parseFloat(invoice.total as any) > 0 
                  ? 'Transmitting invoice signature...' 
                  : 'Awaiting items...'}
            </h4>
            <p className="text-[10px] text-slate-400 leading-snug">
              {!nfcActive 
                ? 'Turn the transmitter ON to start streaming order parameters via dev NFC adapters.'
                : parseFloat(invoice.total as any) > 0 
                  ? 'Tap static smart-receiver tag or click wallet simulator to emulate Somali payment completion.' 
                  : 'Add delicious meals to your cart to generate a corresponding NFC transaction token.'}
            </p>
          </div>
        </div>

        {/* Mini indicators footer */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-blue-900/10 text-[9px] font-mono">
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#07101f]/60 border border-blue-900/25 text-emerald-400">
            <span className={`w-1.5 h-1.5 rounded-full ${nfcActive && parseFloat(invoice.total as any) > 0 ? 'bg-emerald-500' : 'bg-slate-550'}`}></span>
            <span>{nfcActive && parseFloat(invoice.total as any) > 0 ? 'NDEF Live Broadcast' : 'NDEF Standby'}</span>
          </div>
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#07101f]/60 border border-blue-900/25 text-slate-400">
            <span>Power: USB-5V</span>
          </div>
        </div>
      </div>

      {/* 2. Right Panel: Dynamic Checkout QR (Grid span 7) */}
      <div className="lg:col-span-7 bg-[#0b172d]/85 border border-[#14223f]/80 text-white rounded-3xl p-5 flex flex-col justify-between shadow-xl min-h-[240px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/10 pb-2.5">
          <div className="flex items-center space-x-2 text-[#8C9AA9] text-xs font-bold uppercase tracking-wider">
            <QrCode className="h-3.5 w-3.5 text-blue-400" />
            <span>Interactive Checkout QR Code</span>
          </div>
          
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
            paymentStatus === 'paid' 
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/20 font-bold' 
              : 'bg-amber-950/80 text-amber-400 border-amber-500/20 font-medium'
          }`}>
            {paymentStatus === 'paid' ? 'SETTLED / CLOSED' : 'AWAITING SCAN'}
          </span>
        </div>

        {/* Content of QR Code & details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-3 items-center">
          {/* QR Box on Left */}
          <div className="col-span-1 md:col-span-12 lg:col-span-5 flex flex-col items-center justify-center bg-[#050b16]/70 p-3 rounded-2xl border border-blue-900/10 gap-2">
            <QrCanvas value={paymentLink} />
            <div className="text-center">
              <span className="font-extrabold text-[9px] text-emerald-400 tracking-wider block uppercase">
                {paymentStatus === 'paid' ? 'VALIDATED ✓' : 'SCAN TO DEPOSIT'}
              </span>
              <span className="font-mono text-[8.5px] text-blue-400/80 overflow-hidden text-ellipsis max-w-[155px] block truncate">
                {paymentLink}
              </span>
            </div>
          </div>

          {/* Core Invoice Summary info */}
          <div className="col-span-1 md:col-span-12 lg:col-span-7 space-y-2.5 text-left select-text">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Merchant Account:</span>
                <span className="font-bold text-white max-w-[140px] truncate">{invoice.merchantName} ({invoice.merchantId})</span>
              </div>
              
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Invoice ID:</span>
                <span className="font-mono text-blue-400 font-semibold text-[10px]">{invoice.id}</span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Method selected:</span>
                <span className="font-bold text-emerald-400 uppercase text-[10px]">{invoice.wallet} Mobile Payment</span>
              </div>

              <div className="flex items-center justify-between text-[11px] border-t border-blue-950/40 pt-1.5">
                <span className="text-slate-400 font-medium">Total Amount:</span>
                <span className="font-mono text-emerald-400 font-black text-sm">${parseFloat(invoice.total as any).toFixed(2)}</span>
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-1.5 w-full">
                <button
                  type="button"
                  onClick={triggerPrintReceipt}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-1.5 px-2.5 font-bold uppercase rounded-lg flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all outline-none cursor-pointer"
                >
                  <Printer className="w-3 h-3 text-white" />
                  <span>Print Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyClipboard(paymentLink)}
                  className="bg-[#183262]/50 hover:bg-[#183262] text-slate-200 p-1.5 rounded-lg border border-blue-500/10 cursor-pointer flex items-center gap-1 text-[9px] font-bold"
                  title="Copy permanent GoPay payment link with updated merchant and amount"
                >
                  {copyAck ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-blue-400" />}
                  <span>Copy QR Link</span>
                </button>

                {onOpenInlineSimulator && (
                  <button
                    type="button"
                    onClick={onOpenInlineSimulator}
                    className="bg-[#183262]/50 hover:bg-[#183262] text-slate-200 p-1.5 rounded-lg border border-[#183262]/20 cursor-pointer"
                    title="Simulate payment deposit"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin [animation-duration:15s]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer link line */}
        <div className="flex items-center justify-between text-[9px] text-[#8C9AA9] border-t border-blue-900/10 pt-2 font-semibold">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
            Mogadishu Unified Banking Portal 🇸🇴
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">GoPay Live:</span>
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2F80ED] hover:underline flex items-center gap-0.5 font-bold animate-pulse text-[9.5px]"
            >
              <span>gopay01.vercel.app</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};
