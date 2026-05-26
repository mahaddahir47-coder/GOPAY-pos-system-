import React, { useState } from 'react';
import { Search, Plus, Eye, MessageSquare, ChevronLeft, ChevronRight, UserCheck, MoreHorizontal, Check, Edit2, Trash2 } from 'lucide-react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  onAddSimulatedCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onStartCustomerOrder?: (customerId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onAddSimulatedCustomer,
  onDeleteCustomer,
  onStartCustomerOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);

  // Form states for "+ Add Customer" modal
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCount, setNewCount] = useState(1);
  const [newSpent, setNewSpent] = useState('25.00');

  // Filter customers as typed
  const filteredCustomers = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
    );
  });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() === '' || newPhone.trim() === '') return;

    onAddSimulatedCustomer({
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      name: newName,
      phone: newPhone,
      ordersCount: newCount,
      totalSpent: parseFloat(newSpent) || 0,
      lastVisit: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    });

    setNewName('');
    setNewPhone('');
    setNewCount(1);
    setNewSpent('25.00');
    setIsAddingCustomer(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase() || 'C';
  };

  // Get fixed color seed based on name to keep avatar backgrounds stable and appealing
  const getAvatarBg = (name: string) => {
    const colours = [
      'bg-blue-600/25 text-blue-400 border border-blue-500/25',
      'bg-emerald-600/25 text-emerald-400 border border-emerald-500/25',
      'bg-indigo-600/25 text-indigo-400 border border-indigo-500/25',
      'bg-purple-600/25 text-purple-400 border border-purple-500/25',
      'bg-amber-600/25 text-amber-400 border border-amber-500/25',
      'bg-rose-600/25 text-rose-400 border border-rose-500/25',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colours[sum % colours.length];
  };

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in-50 duration-150">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            Customers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access client indexes, total purchases spent, and loyalty rankings.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCustomer(true)}
          className="bg-[#2F80ED] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Directory Layout List Cards */}
      <div className="space-y-4">
        
        {/* Search Input Bar layout matching Customers view mockup */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search customers by name, phone numbers..."
            className="w-full bg-[#050b16]/70 border border-blue-900/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#2F80ED] transition-colors"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Directory Listings Table Wrapper */}
        <div className="bg-[#091124]/90 border border-blue-900/10 rounded-2xl shadow-xl overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-blue-900/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-blue-950/20">
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Phone</th>
                  <th className="py-3 px-6 text-center">Orders</th>
                  <th className="py-3 px-6 text-right">Total Spent</th>
                  <th className="py-3 px-6 text-right">Last Visit</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/5 text-xs font-semibold">
                {currentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                      No matching registered patrons found matching filters.
                    </td>
                  </tr>
                ) : (
                  currentCustomers.map((patron) => (
                    <tr key={patron.id} className="hover:bg-blue-950/10 transition-colors group">
                      
                      {/* Name with initials circle */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${getAvatarBg(patron.name)}`}>
                            {getInitials(patron.name)}
                          </div>
                          <div>
                            <p className="text-white font-bold group-hover:text-blue-400 transition-colors truncate max-w-[150px]">
                              {patron.name}
                            </p>
                            <span className="text-[9px] text-[#2F80ED] font-mono leading-none">VIP #{patron.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-6 font-mono text-slate-300">
                        {patron.phone}
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-6 text-center font-mono text-slate-400 font-bold">
                        {patron.ordersCount}
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-6 text-right font-mono font-black text-white">
                        ${patron.totalSpent.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Last Visit */}
                      <td className="py-3.5 px-6 text-right text-slate-300">
                        {patron.lastVisit}
                      </td>

                      {/* Action ellipsis */}
                      <td className="py-3.5 px-6 text-center relative">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => setActiveRowMenu(activeRowMenu === patron.id ? null : patron.id)}
                            className="p-1 px-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-950/40 cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Quick popover row dropdown action menu */}
                          {activeRowMenu === patron.id && (
                            <div className="absolute right-6 top-10 bg-[#060e1f] border border-blue-900/35 rounded-xl py-1 w-32 text-left shadow-2xl z-20">
                              {onStartCustomerOrder && (
                                <button
                                  onClick={() => {
                                    onStartCustomerOrder(patron.id);
                                    setActiveRowMenu(null);
                                  }}
                                  type="button"
                                  className="w-full text-left px-3 py-1.5 hover:bg-emerald-950/40 text-[10.5px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Start Order</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  alert(`Customer Loyalty VIP Info:\nName: ${patron.name}\nOrders: ${patron.ordersCount}\nTotal Spent: $${patron.totalSpent.toFixed(2)}`);
                                  setActiveRowMenu(null);
                                }}
                                type="button"
                                className="w-full text-left px-3 py-1.5 hover:bg-blue-950 text-[10.5px] text-slate-300 hover:text-white flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span>Overview</span>
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteCustomer(patron.id);
                                  setActiveRowMenu(null);
                                }}
                                type="button"
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-950 text-[10.5px] text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination panel layout */}
          <div className="p-4 border-t border-blue-900/10 flex items-center justify-between text-xs select-none">
            <span className="font-bold text-slate-400 font-sans">
              Showing <span className="text-white">{indexOfFirstItem + 1}</span> to <span className="text-white">{Math.min(indexOfLastItem, filteredCustomers.length)}</span> of <span className="text-white">{filteredCustomers.length}</span> customers
            </span>
            
            <div className="flex items-center gap-1 font-mono">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1 px-2.5 bg-blue-950/15 border border-blue-900/10 rounded hover:bg-slate-900 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold font-sans text-[11px] ${
                    currentPage === idx + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1 px-2.5 bg-blue-950/15 border border-blue-900/10 rounded hover:bg-slate-900 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Popover Modal to submit custom customer data entry */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddCustomerSubmit} className="bg-[#091124] border border-[#14223f] rounded-3xl p-5 w-full max-w-sm text-left shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Register Patron Loyalty Account</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Richard Hendricks"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. +1 555 102 3004"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Initial Orders</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCount}
                    onChange={(e) => setNewCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Total Spent ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newSpent}
                    onChange={(e) => setNewSpent(e.target.value)}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingCustomer(false)}
                className="w-1/2 py-2 text-center text-xs text-slate-400 hover:bg-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
              >
                Create Loyalty Tab
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
