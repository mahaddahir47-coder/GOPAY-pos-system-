import React, { useState } from 'react';
import { 
  Landmark, ShieldCheck, CreditCard, User, Clock, Save, 
  Sparkles, RefreshCw, Lock, Unlock, Key, Plus, Trash2, 
  Edit2, Check, ShieldAlert, Eye, EyeOff
} from 'lucide-react';
import { MerchantSettings, GoPayWallet, Cashier, TabID, ShiftLog } from '../types';

interface AdminViewProps {
  settings: MerchantSettings;
  onSaveSettings: (settings: MerchantSettings) => void;
  
  // Cashiers state from parent
  cashiers: Cashier[];
  onUpdateCashiers: (newCashiers: Cashier[]) => void;
  activeCashierId: string;
  onChangeActiveCashierId: (id: string) => void;
  
  // Admin credentials state from parent
  adminUser: string;
  onChangeAdminUser: (val: string) => void;
  adminPass: string;
  onChangeAdminPass: (val: string) => void;
  
  // Unlocked session state
  isAdminUnlocked: boolean;
  onSetAdminUnlocked: (val: boolean) => void;

  // Shift logs states
  shiftLogs: ShiftLog[];
  onClearShiftLogs: () => void;
  onDeleteShiftLog?: (id: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  settings,
  onSaveSettings,
  cashiers,
  onUpdateCashiers,
  activeCashierId,
  onChangeActiveCashierId,
  adminUser,
  onChangeAdminUser,
  adminPass,
  onChangeAdminPass,
  isAdminUnlocked,
  onSetAdminUnlocked,
  shiftLogs,
  onClearShiftLogs,
  onDeleteShiftLog,
}) => {
  // Gate check states
  const [gateUser, setGateUser] = useState('');
  const [gatePass, setGatePass] = useState('');
  const [gateError, setGateError] = useState('');

  // Terminal Settings states
  const [merchantName, setMerchantName] = useState(settings.merchantName);
  const [merchantId, setMerchantId] = useState(settings.merchantId);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [defaultWallet, setDefaultWallet] = useState<GoPayWallet>(settings.defaultWallet);

  // Admin credentials states
  const [localAdminUser, setLocalAdminUser] = useState(adminUser);
  const [localAdminPass, setLocalAdminPass] = useState(adminPass);
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Cashier Edit states
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [isAddingCashier, setIsAddingCashier] = useState(false);
  
  // Cashier form states
  const [cashierUser, setCashierUser] = useState('');
  const [cashierPass, setCashierPass] = useState('');
  const [cashierShift, setCashierShift] = useState('');
  const [cashierPermissions, setCashierPermissions] = useState<Record<TabID, boolean>>({
    dashboard: true,
    orders: true,
    menu: true,
    tables: true,
    customers: true,
    reports: true,
    discounts: true,
    admin: true,
  });

  const [notification, setNotification] = useState<string>('');

  // Custom dialog/confirmation states to prevent browser iframe permission blocks
  const [cashierToDelete, setCashierToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [customAlert, setCustomAlert] = useState<string | null>(null);

  // Auto notification timer helper
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  // Secure admin code login
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (gateUser.trim() === adminUser && gatePass === adminPass) {
      onSetAdminUnlocked(true);
      setGateError('');
      setGateUser('');
      setGatePass('');
    } else {
      setGateError('Incorrect administrator username or security password. Let’s try again.');
    }
  };

  // Handle master saving of systems configs
  const handleSaveSystems = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      merchantName: merchantName.trim() || 'GoPay Restaurant',
      merchantId: merchantId.trim() || 'R-10245',
      taxRate: Math.max(0, parseFloat(taxRate.toString()) || 0),
      defaultWallet,
    });
    
    onChangeAdminUser(localAdminUser.trim() || 'admin');
    onChangeAdminPass(localAdminPass.trim() || 'admin');
    
    triggerNotification('Global POS terminal and gate codes updated!');
  };

  // Switch to editing an existing cashier
  const handleStartEditCashier = (c: Cashier) => {
    setSelectedCashier(c);
    setIsAddingCashier(false);
    setCashierUser(c.username);
    setCashierPass(c.password || '');
    setCashierShift(c.shiftCode);
    setCashierPermissions({ ...c.permissions });
  };

  // Start adding a new cashier
  const handleStartAddCashier = () => {
    setSelectedCashier(null);
    setIsAddingCashier(true);
    setCashierUser('');
    setCashierPass('');
    setCashierShift(`Shift #A${Math.floor(100 + Math.random() * 900)}`);
    setCashierPermissions({
      dashboard: true,
      orders: true,
      menu: true,
      tables: true,
      customers: true,
      reports: false,
      discounts: false,
      admin: false,
    });
  };

  // Save/Add cashier
  const handleCommitCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashierUser.trim()) return;

    if (isAddingCashier) {
      // Create new
      const newCashier: Cashier = {
        id: `c-${Date.now()}`,
        username: cashierUser.trim(),
        password: cashierPass.trim() || '1234',
        shiftCode: cashierShift.trim() || 'Shift #A500',
        permissions: cashierPermissions,
      };
      onUpdateCashiers([...cashiers, newCashier]);
      triggerNotification(`New cashier "${newCashier.username}" registered!`);
      setIsAddingCashier(false);
    } else if (selectedCashier) {
      // Update existing
      const updatedList = cashiers.map(c => {
        if (c.id === selectedCashier.id) {
          return {
            ...c,
            username: cashierUser.trim(),
            password: cashierPass.trim(),
            shiftCode: cashierShift.trim(),
            permissions: cashierPermissions,
          };
        }
        return c;
      });
      onUpdateCashiers(updatedList);
      triggerNotification(`Cashier "${cashierUser}" credentials updated!`);
      setSelectedCashier(null);
    }
  };

  // Remove checkout cashier operator with guardrails
  const handleRemoveCashier = (id: string, name: string) => {
    if (!isAdminUnlocked && id === activeCashierId) {
      setCustomAlert('Security Active: Selected operator is currently flagged as "Active Operator". Assign another cashier active before deleting.');
      return;
    }
    setCashierToDelete({ id, name });
  };

  const handleConfirmSingleDelete = () => {
    if (!cashierToDelete) return;
    const { id, name } = cashierToDelete;
    const remaining = cashiers.filter(c => c.id !== id);
    onUpdateCashiers(remaining);
    if (id === activeCashierId && remaining.length > 0) {
      onChangeActiveCashierId(remaining[0].id);
    } else if (remaining.length === 0) {
      onChangeActiveCashierId('');
    }
    triggerNotification(`Cashier "${name}" removed from payroll registry.`);
    if (selectedCashier?.id === id) {
      setSelectedCashier(null);
    }
    setCashierToDelete(null);
  };

  const handleDeleteAllCashiers = () => {
    setShowConfirmDeleteAll(true);
  };

  const handleConfirmDeleteAll = () => {
    onUpdateCashiers([]);
    onChangeActiveCashierId('');
    triggerNotification('All cashier operators removed from the system registry.');
    setShowConfirmDeleteAll(false);
  };

  // Toggling permissions
  const handleTogglePermission = (tab: TabID) => {
    setCashierPermissions(prev => ({
      ...prev,
      [tab]: !prev[tab]
    }));
  };

  const handleGenerateShift = () => {
    setCashierShift(`Shift #A${Math.floor(100 + Math.random() * 900)}`);
  };

  // Lock Admin view immediately
  const handleLockAdmin = () => {
    onSetAdminUnlocked(false);
    triggerNotification('Admin terminal locked out.');
  };

  // Standard tab display human labels
  const tabLabels: Record<TabID, string> = {
    dashboard: 'Dashboard',
    orders: 'Orders Queue',
    menu: 'POS Cashier Register',
    tables: 'Tables Layout Map',
    customers: 'Customer Directory',
    reports: 'Reports & Analytics',
    discounts: 'Discounts Ledger',
    admin: 'Admin Settings Panel'
  };

  // Gate check (unlocked view or gate locked view)
  if (!isAdminUnlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#030918]/25 min-h-[70vh] animate-in fade-in duration-300">
        
        <div className="w-full max-w-md bg-[#091124] border border-blue-900/30 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 bg-blue-950/80 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black tracking-tight text-white">Unlock Admin Security Gate</h2>
              <p className="text-xs text-slate-400 px-3">
                Restricted access. Please input your master administrator username and credential key to continue.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Admin Username</label>
              <input
                type="text"
                placeholder="Secure Username"
                value={gateUser}
                onChange={(e) => setGateUser(e.target.value)}
                className="w-full bg-[#050b16] border border-blue-900/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-650 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Security Password</label>
              <input
                type="password"
                placeholder="Access Keycode"
                value={gatePass}
                onChange={(e) => setGatePass(e.target.value)}
                className="w-full bg-[#050b16] border border-blue-900/40 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-650 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {gateError && (
              <div className="text-xs bg-rose-955/20 text-rose-450 border border-rose-900/20 p-3 rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-medium">{gateError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-black text-white rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>ACCESS ADMIN MODULE</span>
            </button>
          </form>

          {/* Secure helper key info for developers in sandbox/compile environments */}
          <div className="text-[10px] text-slate-500 text-center font-mono pt-3 border-t border-blue-900/10">
            Demo Hint: username <span className="text-blue-400 font-bold">admin</span> / password <span className="text-blue-400 font-bold">admin</span>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="w-full text-white space-y-6 animate-in fade-in duration-300">
      
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-blue-900/15 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span>Admin</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full font-mono">
              SESSION UNLOCKED
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {notification && (
            <div className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 text-xs px-4 py-2 rounded-xl flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">{notification}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLockAdmin}
            className="bg-rose-955/20 hover:bg-rose-900/30 border border-rose-900/40 hover:border-rose-550 text-xs font-bold text-rose-400 hover:text-white px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all duration-150 cursor-pointer"
            title="Lock out admin section immediately"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Out Panel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: POS Properties & Security Settings (Span 6) */}
        <div className="lg:col-span-5 space-y-6">
          
          <form onSubmit={handleSaveSystems} className="bg-[#0b172d]/85 border border-[#14223f] rounded-3xl p-6 space-y-6 shadow-xl text-left">
            
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-widest pb-3 border-b border-blue-900/15">
              <Landmark className="h-4 w-4" />
              <span>POS Terminal Identity</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Merchant Banner Title</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  maxLength={40}
                  className="w-full bg-[#050b16] border border-blue-900/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Merchant Register Code</label>
                <input
                  type="text"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  maxLength={20}
                  className="w-full bg-[#050b16] border border-blue-900/30 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-widest pt-2 pb-3 border-b border-blue-900/15">
              <CreditCard className="h-4 w-4" />
              <span>Taxes & Default Channels</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Tax VAT (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#050b16] border border-blue-900/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none pr-8 font-mono"
                    required
                  />
                  <span className="absolute right-3.5 top-3 text-slate-500 font-bold text-xs">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Broadcast Wallet</label>
                <select
                  value={defaultWallet}
                  onChange={(e) => setDefaultWallet(e.target.value as GoPayWallet)}
                  className="w-full bg-[#050b16] border border-blue-900/30 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="evc">EVC Plus</option>
                  <option value="edahab">eDahab</option>
                  <option value="jeeb">Jeeb Digital</option>
                  <option value="premier">Premier Bank</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-widest pt-2 pb-3 border-b border-blue-900/15">
              <Key className="h-4 w-4" />
              <span>Modify Admin Security Key</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Admin Username</label>
                <input
                  type="text"
                  value={localAdminUser}
                  onChange={(e) => setLocalAdminUser(e.target.value)}
                  className="w-full bg-[#050b16] border border-blue-900/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Admin Password</label>
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={localAdminPass}
                    onChange={(e) => setLocalAdminPass(e.target.value)}
                    className="w-full bg-[#050b16] border border-blue-900/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none pr-9 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-500 hover:text-slate-300"
                  >
                    {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#183262] hover:bg-blue-600 border border-blue-900/40 hover:border-blue-500 text-xs font-black rounded-2xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Systems & Gate Settings</span>
              </button>
            </div>

          </form>

          {/* Active Operator info card */}
          {isAdminUnlocked ? (
            <div className="bg-gradient-to-r from-amber-950/20 to-[#0b172d]/80 border border-amber-500/25 rounded-3xl p-5 text-left space-y-3.5">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Systems operator logs feed</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-955/20 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-500/70 block font-mono uppercase tracking-wide font-bold">Admin Privileges Active</span>
                  <span className="text-sm font-black text-white">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0b172d]/85 border border-[#14223f] rounded-3xl p-5 text-left space-y-3.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Systems operator logs feed</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-900/40 flex items-center justify-center text-blue-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Current ACTIVE Cashier</span>
                  <span className="text-sm font-black text-white">
                    {cashiers.find(c => c.id === activeCashierId)?.username || 'No operator loaded'}
                  </span>
                  <span className="text-xs block text-slate-500 font-mono mt-0.5">
                    Shift: {cashiers.find(c => c.id === activeCashierId)?.shiftCode || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Cashier Operator List on High Panel (Span 7) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          <div className="bg-[#0b172d]/85 border border-[#14223f] rounded-3xl p-6 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/15">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                <User className="h-4 w-4" />
                <span>Cashier Registry Ledger</span>
              </div>
              <div className="flex gap-2">
                {cashiers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteAllCashiers}
                    className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-600 border border-rose-900/40 hover:border-rose-500 text-[10px] text-rose-450 hover:text-white font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All Cashiers</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleStartAddCashier}
                  className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-600 border border-blue-900/30 hover:border-blue-500 text-[10px] text-blue-400 hover:text-white font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Cashier</span>
                </button>
              </div>
            </div>

            {/* List Table of existing Cashiers */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-blue-900/10 text-slate-500 uppercase text-[10px] tracking-wide">
                    <th className="py-2.5 font-bold">Cashier Username</th>
                    <th className="py-2.5 font-bold">Shift ID</th>
                    <th className="py-2.5 font-bold">Allowed Pages (Toggled)</th>
                    <th className="py-2.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/5">
                  {cashiers.map((c) => {
                    const isActive = !isAdminUnlocked && c.id === activeCashierId;
                    const permCount = Object.values(c.permissions).filter(Boolean).length;
                    
                    return (
                      <tr 
                        key={c.id} 
                        className={`transition-colors group ${
                          isActive ? 'bg-[#183262]/25' : 'hover:bg-blue-950/20'
                        }`}
                      >
                        <td className="py-3 font-semibold text-slate-200">
                          <div className="flex items-center gap-2">
                            <span>{c.username}</span>
                            {isActive && (
                              <span className="bg-blue-950 text-blue-400 border border-[#2F80ED]/30 text-[8px] font-mono uppercase px-1.5 py-0.5 rounded font-bold shrink-0">
                                Active Oper.
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-mono text-slate-400 text-[11px]">
                          {c.shiftCode}
                        </td>
                        <td className="py-3">
                          <span className="text-[10px] font-bold text-[#2f80ed] bg-[#14223f] px-2 py-1 rounded-md" title="Pages with granted permissions">
                            {permCount} / 8 permitted
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditCashier(c)}
                              className="p-1 px-2.5 bg-[#0b172d] hover:bg-blue-600/30 text-[10px] text-blue-400 hover:text-white border border-blue-900/30 rounded-lg transition-colors cursor-pointer flex items-center gap-0.5"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveCashier(c.id, c.username)}
                              className="p-1 bg-[#250d12] hover:bg-rose-500 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Delete cashier profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Form for Creating / Editing Cashier */}
            {(isAddingCashier || selectedCashier) && (
              <form onSubmit={handleCommitCashier} className="bg-[#050b16] border border-blue-900/35 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between pb-2 border-b border-blue-900/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2F80ED]">
                    {isAddingCashier ? 'Register New Operational Operator' : `Editing profile for "${cashierUser}"`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCashier(false);
                      setSelectedCashier(null);
                    }}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 block">Username</span>
                    <input
                      type="text"
                      placeholder="Username for login"
                      value={cashierUser}
                      onChange={(e) => setCashierUser(e.target.value)}
                      className="w-full bg-[#0b172d] border border-blue-900/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 block">Operator PIN / Password</span>
                    <input
                      type="text"
                      placeholder="Employee Password (e.g. 1234)"
                      value={cashierPass}
                      onChange={(e) => setCashierPass(e.target.value)}
                      className="w-full bg-[#0b172d] border border-blue-900/40 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 block">Shift Code identifier</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Shift #A201"
                        value={cashierShift}
                        onChange={(e) => setCashierShift(e.target.value)}
                        className="w-full bg-[#0b172d] border border-blue-900/40 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGenerateShift}
                        className="px-2 py-1 bg-[#0b172d] border border-blue-900/20 rounded-lg text-blue-400 hover:text-white"
                        title="Generate shift identifier"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permissions Toggles (On/Off buttons) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                    Page Access Authorizations (Allowed Pages)
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(cashierPermissions) as TabID[]).map((tabKey) => {
                      const isAllowed = cashierPermissions[tabKey];
                      return (
                        <div 
                          key={tabKey} 
                          className="flex items-center justify-between p-2 rounded-xl bg-[#0b172d] border border-blue-900/10"
                        >
                          <span className="text-[10px] font-bold text-slate-300">
                            {tabLabels[tabKey] || tabKey}
                          </span>

                          {/* Beautiful On/Off switch style button */}
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(tabKey)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isAllowed ? 'bg-blue-600' : 'bg-slate-850'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isAllowed ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-xs text-white font-black rounded-xl hover:bg-blue-500 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Operator Profile</span>
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>

      {/* Master Shift Activity Logs */}
      <div className="bg-[#0b172d]/85 border border-[#14223f] rounded-3xl p-6 shadow-xl space-y-5 text-left animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-blue-900/15">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Master Cashier Shift Activity Logs</span>
          </div>
          {shiftLogs.length > 0 && (
            <button
              type="button"
              onClick={onClearShiftLogs}
              className="px-2.5 py-1.5 bg-[#250d12]/60 hover:bg-rose-650 border border-rose-950/20 text-rose-450 hover:text-white text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer"
            >
              Clear Storage Logs
            </button>
          )}
        </div>

        {shiftLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-medium">
            No shift logs found in terminal memory database. Clock in on the Dashboard to record active shifts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-blue-900/10 text-slate-500 uppercase text-[9px] tracking-wider font-extrabold pb-2">
                  <th className="py-2">Operator Name</th>
                  <th className="py-2">Shift Code</th>
                  <th className="py-1">Clock In Timestamp</th>
                  <th className="py-1">Clock Out Timestamp</th>
                  <th className="py-2">Elapsed Duration</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/5">
                {[...shiftLogs].reverse().map((log) => {
                  const clockInDate = new Date(log.clockInTime);
                  const clockOutDate = log.clockOutTime ? new Date(log.clockOutTime) : null;
                  const isActive = !log.clockOutTime;

                  return (
                    <tr 
                      key={log.id} 
                      className={`transition-colors duration-150 ${
                        isActive ? 'bg-[#183262]/10 hover:bg-[#183262]/20' : 'hover:bg-blue-950/25'
                      }`}
                    >
                      <td className="py-3 font-extrabold text-slate-200">
                        {log.cashierName}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#2F80ED] font-bold">
                        {log.shiftCode}
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {clockInDate.toLocaleString()}
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {clockOutDate ? (
                          clockOutDate.toLocaleString()
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold font-sans bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span>Active Shift</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-mono font-black text-slate-200">
                        {log.duration || 'Running...'}
                      </td>
                      <td className="py-3 text-right">
                        {onDeleteShiftLog ? (
                          <button
                            type="button"
                            onClick={() => onDeleteShiftLog(log.id)}
                            className="p-1 px-2.5 bg-[#250d12] hover:bg-rose-500 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer text-[10px] font-bold"
                            title="Delete specific shift log"
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            <span>Delete</span>
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Custom Alert Dialog */}
      {customAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b172d] border border-blue-900/40 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-500">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h4 className="text-sm font-black uppercase tracking-wider text-white">Security Restriction</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{customAlert}</p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setCustomAlert(null)}
                className="px-4 py-2 bg-[#14223f] hover:bg-blue-600 hover:text-white text-blue-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Understood, Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Single Delete Modal */}
      {cashierToDelete && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#091124] border border-rose-500/20 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h4 className="text-sm font-black uppercase tracking-wider text-white">Deregister Cashier?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to completely deregister and wipe the cashier profile for <span className="text-rose-400 font-bold font-mono">"{cashierToDelete.name}"</span>? This action is irreversible.
            </p>
            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCashierToDelete(null)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold rounded-xl transition-all cursor-pointer border border-[#14223f]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl transition-all cursor-pointer"
              >
                Yes, Deregister Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Delete All Modal */}
      {showConfirmDeleteAll && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#091124] border border-rose-500/40 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500 animate-pulse">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h4 className="text-sm font-black uppercase tracking-wider text-white">WIPING LEDGER REGISTRY</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              WARNING: You are about to completely delete <span className="font-bold text-rose-400 text-xs">ALL</span> registered cashier operators on this terminal. The local payroll list will be completely wiped!
            </p>
            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteAll(false)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold rounded-xl transition-all cursor-pointer border border-[#14223f]"
              >
                Back to settings
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl transition-all cursor-pointer"
              >
                YES, WIPE ALL RECORDS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
