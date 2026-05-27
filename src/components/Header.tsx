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
    <header className="h-16 bg-[#0B1220] text-white border-b border-[#162238]/60 flex items-center justify-between px-6 shrink-0 z-30 select-none">
      
      {/* GoPay Brand Logo & Description Pills on Left */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Stylized high contrast circular icon in Teal brand color */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00C2B2] to-[#008E82] flex items-center justify-center shadow-lg shadow-teal-500/10">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
          <span className="text-xs font-bold text-slate-400">
            Restaurant POS
          </span>
          <span className="bg-[#00C2B2]/10 text-[#00C2B2] border border-[#00C2B2]/25 text-[9px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full font-mono">
            Broadcast Transmitter
          </span>
        </div>
      </div>

      {/* Settings, Status, Dashboard Cashier on Right */}
      <div className="flex items-center space-x-3.5">
        
        {/* Interactive Online Button */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0F1829] border border-[#162238]/60 rounded-xl text-[10px] font-bold font-mono text-[#00C2B2]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C2B2] animate-pulse"></span>
          <span>Online</span>
          <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
        </div>

        {/* Dynamic Clock Info */}
        <div className="hidden md:block text-[#6B7280] text-xs font-mono font-bold">
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
          <div className="flex items-center gap-2 bg-[#0F1829] p-1.5 px-3 rounded-xl border border-[#162238]/60">
            <div className="w-7 h-7 rounded-sm bg-[#162238] border border-[#00C2B2]/25 flex items-center justify-center text-[#00C2B2]">
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
