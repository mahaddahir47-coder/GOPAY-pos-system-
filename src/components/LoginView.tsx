import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, User, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Cashier } from '../types';

interface LoginViewProps {
  cashiers: Cashier[];
  activeCashierId: string;
  onSetActiveCashierId: (id: string) => void;
  adminUser: string;
  adminPass: string;
  onSetAdminUnlocked: (val: boolean) => void;
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  cashiers,
  activeCashierId,
  onSetActiveCashierId,
  adminUser,
  adminPass,
  onSetAdminUnlocked,
  onLoginSuccess,
}) => {
  const [loginMode, setLoginMode] = useState<'cashier' | 'admin'>('cashier');
  
  // Cashier mode state
  const [selectedCashierId, setSelectedCashierId] = useState<string>(activeCashierId || (cashiers[0]?.id || ''));
  const [pin, setPin] = useState('');
  const [cashierError, setCashierError] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // Admin mode state
  const [inputAdminUser, setInputAdminUser] = useState('');
  const [inputAdminPass, setInputAdminPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Synchronize initial selection
  useEffect(() => {
    if (activeCashierId && cashiers.some(c => c.id === activeCashierId)) {
      setSelectedCashierId(activeCashierId);
    } else if (cashiers.length > 0) {
      setSelectedCashierId(cashiers[0].id);
    }
  }, [activeCashierId, cashiers]);

  const handleKeyPress = (num: string) => {
    setCashierError(false);
    // Accommodate dynamic cashier pin/pass lengths
    if (pin.length < 8) {
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setCashierError(false);
    setPin(prev => prev.slice(0, -1));
  };

  const handleCashierLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const currentSelected = cashiers.find(c => c.id === selectedCashierId);
    if (!currentSelected) {
      setCashierError(true);
      return;
    }

    const correctPassword = currentSelected.password || '1234';
    
    setIsAuthLoading(true);
    setTimeout(() => {
      if (pin === correctPassword) {
        // Successful lock check
        onSetActiveCashierId(selectedCashierId);
        onSetAdminUnlocked(false); // keep admin features securely locked by default for cashiers
        setCashierError(false);
        onLoginSuccess();
      } else {
        setCashierError(true);
        setPin('');
      }
      setIsAuthLoading(false);
    }, 450);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAdminUser.trim() || !inputAdminPass) return;

    setIsAuthLoading(true);
    setTimeout(() => {
      if (inputAdminUser.trim() === adminUser && inputAdminPass === adminPass) {
        // Authenticate admin override session as well
        onSetAdminUnlocked(true);
        setAdminError('');
        onLoginSuccess();
      } else {
        setAdminError('Invalid admin credentials. Please check identity tokens.');
        setInputAdminPass('');
      }
      setIsAuthLoading(false);
    }, 500);
  };

  // Find selected cashier shift info for beautiful preview tip details
  const currentCashier = cashiers.find(c => c.id === selectedCashierId) || cashiers[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen relative p-6 animate-in fade-in zoom-in-95 duration-300">
      
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Terminal Header Icon Box */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center mb-5 shadow-xl shadow-blue-900/30">
          <CreditCard className="w-8 h-8 text-white animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-black text-white tracking-tight text-center">GoPay Terminal Portal</h1>
        <p className="text-xs text-slate-400 mt-1 mb-6 text-center">
          Secure offline NFC payment & menu broadcast management registry.
        </p>

        {/* Beautiful Segmented Tab Controller */}
        <div className="grid grid-cols-2 bg-[#091124] border border-blue-900/20 p-1 rounded-2xl w-full max-w-[320px] mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginMode('cashier');
              setCashierError(false);
              setPin('');
            }}
            className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              loginMode === 'cashier'
                ? 'bg-[#183262] text-white border-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Cashier Access</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('admin');
              setAdminError('');
              setInputAdminPass('');
            }}
            className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              loginMode === 'admin'
                ? 'bg-[#183262] text-white border-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Gateway</span>
          </button>
        </div>

        {/* CASHIER SPECIFIC SIGN-IN SECTION */}
        {loginMode === 'cashier' && (
          <div className="w-full max-w-[280px] flex flex-col items-center animate-in fade-in duration-200">
            
            {/* Cashier selection select tool */}
            <div className="space-y-1.5 text-left w-full mb-5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block text-center">Select your Cashier Profile</label>
              <select
                value={selectedCashierId}
                onChange={(e) => {
                  setSelectedCashierId(e.target.value);
                  setPin('');
                  setCashierError(false);
                }}
                className="w-full bg-[#091124] border border-blue-900/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer text-center"
              >
                {cashiers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.username} ({c.shiftCode})
                  </option>
                ))}
              </select>
            </div>

            {/* PIN Dots indicators */}
            <div className="flex justify-center gap-3.5 mb-7 w-full">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pin.length > index;
                return (
                  <div 
                    key={index}
                    className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                      isFilled 
                        ? 'bg-blue-500 border-blue-400 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.6)]' 
                        : cashierError
                          ? 'bg-rose-900/40 border-rose-500'
                          : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                );
              })}
            </div>

            {cashierError && (
              <div className="text-rose-450 bg-rose-955/20 border border-rose-900/30 text-[10px] font-bold py-1.5 px-3 rounded-lg mb-4 text-center animate-bounce">
                Incorrect cashier access PIN
              </div>
            )}

            {/* Keypad selector grid */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num.toString())}
                  className="h-14 rounded-2xl bg-[#091124]/70 hover:bg-[#183262] border border-blue-900/15 hover:border-blue-500/40 text-xl font-mono text-white transition-all active:scale-[0.96] cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleDelete}
                className="h-14 rounded-2xl bg-[#1d070b]/60 hover:bg-[#341117] border border-rose-950/20 hover:border-rose-800/20 text-[10px] font-black tracking-wider text-rose-400 hover:text-white transition-colors active:scale-[0.96] cursor-pointer"
              >
                DEL
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-14 rounded-2xl bg-[#091124]/70 hover:bg-[#183262] border border-blue-900/15 hover:border-blue-500/40 text-xl font-mono text-white transition-all active:scale-[0.96] cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleCashierLogin()}
                className="h-14 rounded-2xl bg-[#0b2413] hover:bg-emerald-900 border border-emerald-950 hover:border-emerald-500/35 text-[10px] font-black tracking-wider text-emerald-400 hover:text-white transition-colors active:scale-[0.96] cursor-pointer"
              >
                OK
              </button>
            </div>

            {/* Premium sandbox/helper tip inside the login interface to guarantee no lockouts */}
            <div className="text-[10px] text-slate-500 text-center font-mono mt-5 w-full bg-blue-955/5 p-2.5 rounded-xl border border-blue-900/10">
              <span className="text-slate-400 font-bold block mb-0.5">💡 Demo Security Keys:</span>
              <span>
                {currentCashier ? (
                  <>Enter PIN <strong className="text-blue-400 font-bold font-mono">"{currentCashier.password || '1234'}"</strong> to unlock as {currentCashier.username}.</>
                ) : (
                  <>Check your defined cashier codes inside Admin panel.</>
                )}
              </span>
            </div>

          </div>
        )}

        {/* ADMINISTRATOR MASTER SIGN-IN SECTION */}
        {loginMode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="w-full max-w-[310px] space-y-4 animate-in fade-in duration-200 text-left">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Admin Username</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Master Admin Username"
                  value={inputAdminUser}
                  onChange={(e) => setInputAdminUser(e.target.value)}
                  className="w-full bg-[#050b16] border border-blue-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Gate Passcode</label>
              <div className="relative">
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  placeholder="Enter secret word"
                  value={inputAdminPass}
                  onChange={(e) => setInputAdminPass(e.target.value)}
                  className="w-full bg-[#050b16] border border-blue-900/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-650 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-3 top-2.5 p-1 text-slate-500 hover:text-slate-300"
                >
                  {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {adminError && (
              <div className="text-[10px] font-bold text-rose-450 bg-rose-955/20 border border-rose-900/20 p-3 rounded-xl flex items-start gap-1.5 leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{adminError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-600 text-xs font-black uppercase tracking-wider text-white rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Unlock Admin Terminal</span>
            </button>

            {/* Verification credential tip matching the Rest of Admin panels */}
            <div className="text-[10px] text-slate-500 text-center font-mono pt-4 border-t border-blue-900/10">
              Demo credentials: <span className="text-slate-400 font-bold font-mono">{adminUser}</span> / <span className="text-slate-400 font-bold font-mono">{adminPass}</span>
            </div>

          </form>
        )}

      </div>

      {/* Loading Block Screen */}
      {isAuthLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#010915]/85 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] text-blue-400 font-black tracking-widest uppercase">Initializing Secure Operator Session...</p>
          </div>
        </div>
      )}

    </div>
  );
};
