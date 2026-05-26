import React, { useState } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight, CheckCircle, Clock, Check, X, ShieldAlert } from 'lucide-react';
import { Order, OrderType, OrderStatus } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onAddSimulatedOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onAddSimulatedOrder,
  onUpdateOrderStatus,
}) => {
  const [filterType, setFilterType] = useState<'All' | OrderType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingOrder, setIsAddingOrder] = useState(false);

  // Form for "+ New Order" Simulation
  const [newOrderType, setNewOrderType] = useState<OrderType>('Dine In');
  const [newOrderTarget, setNewOrderTarget] = useState('T-03');
  const [newOrderItemsCount, setNewOrderItemsCount] = useState(3);
  const [newOrderTotal, setNewOrderTotal] = useState('31.20');

  const filteredOrders = orders.filter((o) => {
    // 1. Tab Type Filter
    if (filterType !== 'All' && o.type !== filterType) return false;
    
    // 2. Status Select Dropdown Filter
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;

    // 3. Search query
    const matchSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.status.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSearch;
  });

  // Simple Pagination config (8 items per page)
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handleCreateDummyOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const valTotal = parseFloat(newOrderTotal);
    const newId = (orders.length > 0 ? Math.max(...orders.map(o => parseInt(o.id) || 1000)) + 1 : 1046).toString();
    
    if (!isNaN(valTotal) && newOrderTarget.trim() !== '') {
      onAddSimulatedOrder({
        id: newId,
        type: newOrderType,
        target: newOrderTarget,
        itemsCount: newOrderItemsCount,
        total: valTotal,
        status: 'Preparing',
        timestamp: new Date().toISOString(),
      });
      setIsAddingOrder(false);
    }
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Serving':
        return 'bg-emerald-950/75 text-emerald-400 border border-emerald-500/25';
      case 'Ready':
        return 'bg-blue-950/75 text-[#2F80ED] border border-blue-500/25';
      case 'Preparing':
        return 'bg-amber-950/75 text-amber-500 border border-amber-500/25';
      case 'Completed':
        return 'bg-slate-900 text-slate-400 border border-slate-800';
      case 'Cancelled':
        return 'bg-red-950/75 text-red-400 border border-red-500/25';
      default:
        return 'bg-slate-900 text-slate-400';
    }
  };

  // Human-readable relative time representation
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      
      if (diffMin < 1) return 'Just now';
      if (diffMin === 1) return '1 min ago';
      if (diffMin < 60) return `${diffMin} min ago`;
      
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr === 1) return '1 hr ago';
      if (diffHr < 24) return `${diffHr} hrs ago`;
      
      return '1 day ago';
    } catch {
      return '8 min ago';
    }
  };

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in-50 duration-150">
      
      {/* Upper Actions Headers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse live invoice drafts, incoming meal tickets, and update active tables.
          </p>
        </div>

        <button
          onClick={() => setIsAddingOrder(true)}
          className="bg-[#2F80ED] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Simulate Incoming Order</span>
        </button>
      </div>

      {/* Grid Tabs Panel matching image */}
      <div className="flex flex-col gap-4">
        
        {/* Navigation Tabs Bar Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-[#091124] p-1 rounded-xl border border-blue-900/10 text-xs font-bold">
            {(['All', 'Dine In', 'Takeaway', 'Delivery'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFilterType(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  (tab === 'All' && filterType === 'All') || (filterType === tab)
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'All' ? 'All Orders' : tab}
              </button>
            ))}
          </div>

          {/* Quick status dropdown filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase font-sans">Status Filter</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-[#091124] border border-blue-900/20 text-slate-300 text-xs rounded-xl p-2 pr-8 font-semibold outline-none focus:border-blue-500"
            >
              <option value="All">All statuses</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Serving">Serving</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Search and Filters Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          <div className="md:col-span-12 relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search orders by identifier, Table#, Customer name..."
              className="w-full bg-[#050b16]/70 border border-blue-900/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-[#2F80ED] transition-colors"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

        </div>

        {/* Main interactive directory table */}
        <div className="bg-[#091124]/90 border border-blue-900/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-blue-900/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-blue-950/20">
                  <th className="py-3 px-5">Order #</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Table / Customer</th>
                  <th className="py-3 px-5 text-center">Items</th>
                  <th className="py-3 px-5 text-right">Total</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Time</th>
                  <th className="py-3 px-5 text-center">Transition Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/5 text-xs">
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      No matching transaction orders located.
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-950/10 group transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-300">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="text-white hover:underline cursor-pointer">{order.type}</span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-200 font-bold">
                        {order.target}
                      </td>
                      <td className="py-3.5 px-5 text-center font-mono text-slate-400 font-bold">
                        {order.itemsCount}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-white">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-block text-[10px] font-bold tracking-wider px-3 py-1 rounded-full text-center ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-slate-400">
                        {getRelativeTime(order.timestamp)}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {/* Interactive state actions */}
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                          {order.status === 'Preparing' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'Ready')}
                              className="px-2 py-1 rounded bg-blue-950 text-blue-400 text-[9px] uppercase font-bold hover:bg-blue-900/50"
                              title="Mark as ready to serve"
                            >
                              Ready
                            </button>
                          )}
                          {order.status === 'Ready' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'Serving')}
                              className="px-2 py-1 rounded bg-emerald-950 text-emerald-400 text-[9px] uppercase font-bold hover:bg-emerald-900/50"
                              title="Begin serving table"
                            >
                              Serve
                            </button>
                          )}
                          {order.status === 'Serving' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-200 text-[9px] uppercase font-bold hover:bg-slate-700"
                              title="Checkout complete"
                            >
                              Complete
                            </button>
                          )}
                          {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'Cancelled')}
                              className="px-1.5 py-1 text-rose-500 hover:bg-rose-950/20 rounded"
                              title="Cancel entry order"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          {order.status === 'Completed' && (
                            <span className="text-[10px] text-slate-600">Archived ✓</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Table Pagination Selector matching image */}
          <div className="p-4 border-t border-blue-900/10 flex items-center justify-between text-xs select-none">
            <span className="font-bold text-slate-400 font-sans">
              Showing <span className="text-white">{indexOfFirstItem + 1}</span> to <span className="text-white">{Math.min(indexOfLastItem, filteredOrders.length)}</span> of <span className="text-white">{filteredOrders.length}</span> orders
            </span>
            
            <div className="flex items-center gap-1 font-mono">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1 px-2.5 bg-blue-950/15 border border-blue-900/10 rounded hover:bg-slate-900 text-slate-450 disabled:opacity-30 disabled:hover:bg-transparent"
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
                className="p-1 px-2.5 bg-blue-950/15 border border-blue-900/10 rounded hover:bg-slate-900 text-slate-450 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Simulated Order creation popover modal */}
      {isAddingOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateDummyOrder} className="bg-[#091124] border border-[#14223f] rounded-3xl p-5 w-full max-w-sm text-left shadow-2xl relative space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Simulate New Incoming Order</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Service Type</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Dine In', 'Takeaway', 'Delivery'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewOrderType(type)}
                      className={`text-[10px] py-1.5 rounded-lg border font-bold transition-all ${
                        newOrderType === type 
                          ? 'border-blue-500 bg-blue-900/30 text-white' 
                          : 'border-blue-900/25 bg-slate-950/40 text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Table/Customer Target</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. T-03 or Walk-in Customer"
                  value={newOrderTarget}
                  onChange={(e) => setNewOrderTarget(e.target.value)}
                  className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Dishes Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOrderItemsCount}
                    onChange={(e) => setNewOrderItemsCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Total ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newOrderTotal}
                    onChange={(e) => setNewOrderTotal(e.target.value)}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingOrder(false)}
                className="w-1/2 py-2 text-center text-xs text-slate-400 hover:bg-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
              >
                Create Simulated
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
