import React, { useState } from 'react';
import { Plus, Tag, ToggleLeft, ToggleRight, X, Trash2, HelpCircle, Check, Percent, Award } from 'lucide-react';
import { Discount, DiscountType, DiscountStatus } from '../types';

interface DiscountsViewProps {
  discounts: Discount[];
  onAddSimulatedDiscount: (discount: Discount) => void;
  onDeleteDiscount: (id: string) => void;
  onToggleDiscountStatus: (id: string) => void;
}

export const DiscountsView: React.FC<DiscountsViewProps> = ({
  discounts,
  onAddSimulatedDiscount,
  onDeleteDiscount,
  onToggleDiscountStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | DiscountStatus>('All');
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);

  // Form states for creating custom discount rule banner
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<DiscountType>('Percentage');
  const [newValue, setNewValue] = useState('10%');
  const [newLimit, setNewLimit] = useState('∞');
  const [newStatus, setNewStatus] = useState<DiscountStatus>('Active');

  const filteredDiscounts = discounts.filter(d => {
    if (activeTab === 'All') return true;
    return d.status === activeTab;
  });

  const handleAddDiscountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() === '') return;

    onAddSimulatedDiscount({
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      name: newName,
      type: newType,
      value: newValue,
      usageCount: 0,
      limit: newLimit,
      status: newStatus,
      startDate: newStatus === 'Scheduled' ? 'May 28, 2024' : undefined,
    });

    setNewName('');
    setNewValue('10%');
    setNewLimit('∞');
    setIsAddingDiscount(false);
  };

  const getStatusBadge = (status: DiscountStatus, date?: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-block text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/25 text-emerald-400">
            Active
          </span>
        );
      case 'Scheduled':
        return (
          <div className="flex flex-col text-left">
            <span className="inline-block text-[10px] w-fit font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950/70 border border-blue-500/25 text-[#2F80ED]">
              Scheduled
            </span>
            {date && <span className="text-[9px] text-slate-500 font-mono mt-0.5">Starts {date}</span>}
          </div>
        );
      case 'Expired':
        return (
          <span className="inline-block text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-850 text-slate-500">
            Expired
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in-50 duration-150">
      
      {/* 1. Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            Discounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build promotional rules, monitor code utilization limits, and schedule marketing campaigns.
          </p>
        </div>

        <button
          onClick={() => setIsAddingDiscount(true)}
          className="bg-[#2F80ED] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Discount</span>
        </button>
      </div>

      {/* 2. Top Navigation categories filter */}
      <div className="flex bg-[#091124] p-1 rounded-xl border border-blue-900/10 text-xs font-bold w-fit">
        {(['All', 'Active', 'Scheduled', 'Expired'] as const).map(tab => {
          const count = tab === 'All' 
            ? discounts.length 
            : discounts.filter(d => d.status === tab).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#183262] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* 3. Catalog Directory list table */}
      <div className="bg-[#091124]/90 border border-blue-900/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-900/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-blue-950/20">
                <th className="py-3 px-6">Discount Campaign Rule</th>
                <th className="py-3 px-6">Reduction Type</th>
                <th className="py-3 px-6 text-center">Value</th>
                <th className="py-3 px-6 text-center">Redeemed Usage</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/5 text-xs font-semibold">
              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    No active discount rules created under this filter.
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((disco) => (
                  <tr key={disco.id} className="hover:bg-blue-950/10 transition-colors group">
                    
                    {/* Name Campaign info */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-900/15 flex items-center justify-center shrink-0">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-white font-extrabold group-hover:text-blue-450 truncate max-w-[170px]">{disco.name}</p>
                          <span className="text-[9px] text-slate-500 font-mono">CODE: {disco.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Reduction Type */}
                    <td className="py-3.5 px-6 text-slate-350">
                      {disco.type}
                    </td>

                    {/* Value */}
                    <td className="py-3.5 px-6 text-center font-mono text-white font-extrabold text-sm">
                      {disco.value}
                    </td>

                    {/* Usage Progress redeem ratio */}
                    <td className="py-3.5 px-6 text-center font-mono">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span className="text-slate-200 font-bold">{disco.usageCount} <span className="text-slate-500 font-normal">/ {disco.limit}</span></span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center">
                        {getStatusBadge(disco.status, disco.startDate)}
                      </div>
                    </td>

                    {/* Controls togglers */}
                    <td className="py-3.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {disco.status !== 'Expired' ? (
                          <button
                            onClick={() => onToggleDiscountStatus(disco.id)}
                            className="text-slate-400 hover:text-white"
                            title="Toggle activation state rule"
                          >
                            {disco.status === 'Active' ? (
                              <ToggleRight className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-slate-500" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-650 font-sans font-medium">Inactive</span>
                        )}

                        <button
                          onClick={() => onDeleteDiscount(disco.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/10 cursor-pointer"
                          title="Erase discount rule promotion"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popover Form to Submit customized discounts rules */}
      {isAddingDiscount && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddDiscountSubmit} className="bg-[#091124] border border-[#14223f] rounded-3xl p-5 w-full max-w-sm text-left shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Configure Discount Rule</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Discount Campaign Label</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Student 10% Off"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Reduction Category</label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      const val = e.target.value as DiscountType;
                      setNewType(val);
                      setNewValue(val === 'Percentage' ? '15%' : val === 'Amount' ? '$5.00' : 'BOGO');
                    }}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white outline-none"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Amount">Fixed Amount</option>
                    <option value="BOGO">BOGO (Buy 1 Get 1)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Reduction Value</label>
                  <input
                    type="text"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">In-Check Limit Count</label>
                  <input
                    type="text"
                    required
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Transition Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white font-sans outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingDiscount(false)}
                className="w-1/2 py-2 text-center text-xs text-slate-400 hover:bg-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
              >
                Deploy Rule
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
