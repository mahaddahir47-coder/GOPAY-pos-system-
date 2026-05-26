import React from 'react';
import { LayoutGrid, ClipboardList, Utensils, TableProperties, Users, AreaChart, Tag, LogOut, ShieldCheck, Lock } from 'lucide-react';
import { TabID } from '../types';

interface SidebarProps {
  activeTab: TabID;
  onChangeTab: (id: TabID) => void;
  onLogout?: () => void;
  activeCashierPermission?: Record<string, boolean>;
  isAdminUnlocked?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onChangeTab, onLogout, activeCashierPermission, isAdminUnlocked }) => {
  // Navigation elements matching image
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ClipboardList, badge: 'Active' },
    { id: 'menu', label: 'Menu', icon: Utensils },
    { id: 'tables', label: 'Tables', icon: TableProperties },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: AreaChart },
    { id: 'discounts', label: 'Discounts', icon: Tag },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <aside className="w-20 shrink-0 bg-[#0B1220] border-r border-[#162238]/60 flex flex-col justify-between py-5 items-center select-none">
      
      {/* Prime Navigation items list */}
      <div className="flex flex-col space-y-4 w-full px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          
          // Check if restricted (admin is locked by master password, other pages might be toggled off)
          // Admin override bypasses restriction check entirely
          const isRestricted = !isAdminUnlocked && item.id !== 'admin' && activeCashierPermission && activeCashierPermission[item.id] === false;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id as TabID)}
              className={`w-full py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group cursor-pointer relative ${
                isActive
                  ? 'bg-[#1C2B46] text-[#00C2B2] shadow-md border border-[#00C2B2]/30'
                  : 'text-[#8C9AA9] hover:text-white hover:bg-[#162238]/40'
              }`}
            >
              {/* Optional tiny notification badge dot */}
              {item.badge && !isRestricted && (
                <span className="absolute top-2.5 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}

              {/* Padlock overlay indicator for locked pages */}
              {isRestricted && (
                <span className="absolute top-1.5 right-1.5 p-0.5 rounded bg-[#1f1618] border border-rose-950 text-rose-400" title="Access restricted for current cashier">
                  <Lock className="w-2 h-2" />
                </span>
              )}
              
              <Icon className={`h-[18px] w-[18px] transition-transform duration-100 group-hover:scale-105 ${isActive ? 'text-[#00C2B2]' : ''} ${isRestricted ? 'text-slate-500 line-through opacity-70' : ''}`} />
              <span className={`text-[9.5px] font-black font-sans tracking-tight ${isRestricted ? 'text-slate-500 line-through' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>


      {/* Logout option at bottom */}
      <div className="w-full px-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2 flex flex-col items-center justify-center gap-1 text-orange-400/80 hover:text-orange-400 hover:bg-orange-950/20 rounded-2xl transition-all cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span className="text-[9px] font-bold font-sans tracking-wide">Logout</span>
        </button>
      </div>

    </aside>
  );
};

