import React, { useState, useEffect } from 'react';
import { ChevronDown, User, ShieldCheck } from 'lucide-react';
import { MerchantSettings } from '../types';

interface HeaderProps {
  settings: MerchantSettings;
  isNfcSupported: boolean;
  cashierName: string;
  shiftCode: string;
  isAdminUnlocked?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ settings, isNfcSupported, cashierName, shiftCode, isAdminUnlocked }) => {
  const [timeState, setTimeState] = useState<string>('');


  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeState(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#030918]/60 backdrop-blur-md text-white border-b border-[#14223f] flex items-center justify-between px-6 shrink-0 z-30">
      
      {/* GoPay Brand Logo & Description Pills on Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Stylized high contrast circular icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent font-sans tracking-tight">
            GoPay
          </span>
        </div>
        
        {/* Separator and Terminal Label */}
        <div className="h-5 w-px bg-slate-800"></div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            Restaurant POS
          </span>
          <span className="bg-[#183262]/50 text-blue-400 border border-[#2F80ED]/20 text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full font-mono">
            Broadcast Transmitter
          </span>
        </div>
      </div>

      {/* Settings, Status, Dashboard Cashier on Right */}
      <div className="flex items-center space-x-3.5">
        
        {/* Interactive Online Button */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0a1428] border border-blue-900/30 rounded-xl text-[10px] font-bold font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Online</span>
          <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
        </div>

        {/* Dynamic Clock Info */}
        <div className="hidden md:block text-slate-450 text-xs font-mono">
          {timeState}
        </div>

        {/* Compact Cashier/Admin Profile Widget */}
        {isAdminUnlocked ? (
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-950/20 to-blue-950/30 p-1.5 px-3 rounded-xl border border-amber-500/30">
            <div className="w-7 h-7 rounded-full bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-left leading-none">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider whitespace-nowrap">Admin</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[#0b172d]/40 p-1.5 px-3 rounded-xl border border-blue-900/20">
            <div className="w-7 h-7 rounded-full bg-blue-950 border border-[#2F80ED]/30 flex items-center justify-center text-blue-400">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="text-left leading-none">
              <p className="text-[10px] font-bold text-white whitespace-nowrap">{cashierName}</p>
              <p className="text-[8px] font-mono text-slate-400 mt-0.5 whitespace-nowrap">{shiftCode}</p>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
