import React, { useState } from 'react';
import { AreaChart, ChevronRight, Download, Eye, DollarSign, BarChart2, PieChart, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { Order } from '../types';

interface ReportsViewProps {
  orders: Order[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders }) => {
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'items' | 'categories' | 'payments' | 'staff' | 'tax'>('sales');
  const [isExporting, setIsExporting] = useState(false);

  const calculateSales = () => {
    return orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  };

  const currentTotalSales = 14785.60 + calculateSales();
  const currentTotalOrders = 512 + orders.length;
  const currentAverageOrder = currentTotalSales / currentTotalOrders;
  const currentTotalCustomers = 398 + Math.floor(orders.length * 0.4);

  // SVG Chart data
  const chartPoints = [
    { label: 'May 14', value: 1600 },
    { label: 'May 15', value: 2400 },
    { label: 'May 16', value: 1900 },
    { label: 'May 17', value: 2800 },
    { label: 'May 18', value: 3600 },
    { label: 'May 19', value: 2950 },
    { label: 'May 20', value: 4100 },
    { label: 'May 21', value: 4500 }
  ];

  const width = 600;
  const height = 150;
  const padX = 40;
  const padY = 20;

  const maxVal = Math.max(...chartPoints.map(p => p.value)) * 1.1;
  const minVal = 0;

  const points = chartPoints.map((d, idx) => {
    const x = padX + (idx / (chartPoints.length - 1)) * (width - 2 * padX);
    const y = height - padY - ((d.value - minVal) / (maxVal - minVal)) * (height - 2 * padY);
    return { x, y, label: d.label, val: `$${d.value}` };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const handleSimulateExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Successfully converted local billing ledger into an encrypted XLS sheet. Dispatched to merchant mailbox!");
    }, 1500);
  };

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in-50 duration-150">
      
      {/* 1. Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile ledger accounts, filter tax summaries, and export daily sales audits.
          </p>
        </div>

        <button
          onClick={handleSimulateExport}
          disabled={isExporting}
          className="bg-[#2F80ED] hover:bg-blue-600 disabled:bg-blue-900/40 text-white px-4 py-2.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <Download className="h-4 w-4 animate-bounce" />
          <span>{isExporting ? "Reconciling..." : "Export Financial PDF"}</span>
        </button>
      </div>

      {/* 2. Subtabs Row */}
      <div className="flex bg-[#091124] p-1 rounded-xl border border-blue-900/10 text-xs font-bold overflow-x-auto select-none scrollbar-none">
        {(['sales', 'items', 'categories', 'payments', 'staff', 'tax'] as const).map(tab => {
          const mapNames: Record<string, string> = {
            sales: 'Sales Overview',
            items: 'Items Analytics',
            categories: 'Categories',
            payments: 'Payments Flow',
            staff: 'Staff Shift Performance',
            tax: 'Tax Summary'
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer capitalize ${
                activeSubTab === tab
                  ? 'bg-[#183262] text-white shadow'
                  : 'text-slate-450 hover:text-white'
              }`}
            >
              {mapNames[tab]}
            </button>
          );
        })}
      </div>

      {/* 3. Grid Statistics Box (screenshot structure row 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="bg-[#091124]/90 border border-blue-950/20 p-5 rounded-2xl flex flex-col justify-between shadow">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Sales Ledger</span>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white font-mono">${currentTotalSales.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">▲ 15.3% vs Last 7 Days</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#091124]/90 border border-blue-950/20 p-5 rounded-2xl flex flex-col justify-between shadow">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Completed Orders</span>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white font-mono">{currentTotalOrders}</h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">▲ 11.8% vs Last 7 Days</span>
          </div>
        </div>

        {/* Average Order ticket amount */}
        <div className="bg-[#091124]/90 border border-blue-950/20 p-5 rounded-2xl flex flex-col justify-between shadow">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Average Ticket Amount</span>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white font-mono">${currentAverageOrder.toFixed(2)}</h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">▲ 3.6% vs Last 7 Days</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-[#091124]/90 border border-blue-950/20 p-5 rounded-2xl flex flex-col justify-between shadow">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Active Patrons VIP</span>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white font-mono">{currentTotalCustomers}</h3>
            <span className="text-[10px] text-[#2F80ED] font-mono font-bold">▲ 9.2% vs Last 7 Days</span>
          </div>
        </div>

      </div>

      {/* 4. Trend Line Chart VS Category Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Trend line visual line graph */}
        <div className="lg:col-span-8 bg-[#091124]/90 border border-blue-900/15 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between border-b border-blue-900/10 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase text-slate-350 tracking-wider">Weekly Sales Trendline</h3>
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>May 14 - May 21, 2024</span>
            </span>
          </div>

          <div className="flex-1 min-h-[160px] flex items-center justify-center relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              {/* Plot gradient area */}
              {points.length > 0 && (
                <path
                  d={`${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`}
                  fill="url(#chartGradient)"
                  className="opacity-25"
                />
              )}

              {/* Connecting line */}
              <path
                d={pathD}
                fill="none"
                stroke="#2F80ED"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Nodes */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#2F80ED"
                    strokeWidth="2"
                  />
                  <text
                    x={p.x}
                    y={height - 2}
                    fill="#64748b"
                    fontSize="8.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                  <text
                    x={p.x}
                    y={p.y - 8}
                    fill="#cbd5e1"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.val}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Distribution category pie chart */}
        <div className="lg:col-span-4 bg-[#091124]/90 border border-blue-900/15 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="border-b border-blue-900/10 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase text-slate-350 tracking-wider">Sales by Category</h3>
          </div>

          <div className="flex flex-col items-center gap-4 py-2">
            
            {/* Simple Category pie chart markup */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-95deg]">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="170.8 251.2" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="55.2 251.2" strokeDashoffset="-170.8" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="17.5 251.2" strokeDashoffset="-226" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#64748b" strokeWidth="12" strokeDasharray="5 251.2" strokeDashoffset="-243.5" />
              </svg>
              <div className="absolute inset-4 rounded-full bg-[#091124] flex flex-col items-center justify-center">
                <span className="text-[12px] font-black text-white font-mono">$14,785</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-[10px] font-semibold text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500"></span>Food (68%)</span>
                <span className="font-mono text-white">$10,047.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-blue-500"></span>Drinks (22%)</span>
                <span className="font-mono text-white">$3,252.40</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500"></span>Desserts (7%)</span>
                <span className="font-mono text-white">$1,035.20</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-slate-500"></span>Others (3%)</span>
                <span className="font-mono text-white">$451.00</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 5. Bottom Rows: Top-Selling dishes items VS Payment methods ledger summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Top items table */}
        <div className="bg-[#091124]/90 border border-blue-900/15 rounded-2xl p-5 shadow-xl">
          <div className="border-b border-blue-900/10 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase text-slate-350 tracking-wider">Top Selling Food Items</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-12 border-b border-blue-900/5 pb-2 text-[10px] font-bold text-slate-400 uppercase">
              <span className="col-span-8">Product Name</span>
              <span className="col-span-2 text-center">Unit Sold</span>
              <span className="col-span-2 text-right">Value</span>
            </div>

            <div className="grid grid-cols-12 font-semibold">
              <span className="col-span-8 text-white">Margherita Wood-fired Pizza</span>
              <span className="col-span-2 text-center font-mono">142</span>
              <span className="col-span-2 text-right font-mono text-white">$1,775.00</span>
            </div>
            <div className="grid grid-cols-12 font-semibold">
              <span className="col-span-8 text-white">Grilled Lemon Chicken Breast</span>
              <span className="col-span-2 text-center font-mono">118</span>
              <span className="col-span-2 text-right font-mono text-white">$1,583.00</span>
            </div>
            <div className="grid grid-cols-12 font-semibold">
              <span className="col-span-8 text-white">Angus Cheddar Cheeseburger</span>
              <span className="col-span-2 text-center font-mono">102</span>
              <span className="col-span-2 text-right font-mono text-white">$1,122.00</span>
            </div>
            <div className="grid grid-cols-12 font-semibold">
              <span className="col-span-8 text-white">Fettuccine Alfredo Pasta</span>
              <span className="col-span-2 text-center font-mono">89</span>
              <span className="col-span-2 text-right font-mono text-white">$956.80</span>
            </div>
          </div>
        </div>

        {/* Payment methods list with active blue indicator fill rows */}
        <div className="bg-[#091124]/90 border border-blue-900/15 rounded-2xl p-5 shadow-xl">
          <div className="border-b border-blue-900/10 pb-3 mb-4">
            <h3 className="text-xs font-bold uppercase text-slate-350 tracking-wider">Settled Payment Methods</h3>
          </div>

          <div className="space-y-3">
            {[
              { id: 'evc', label: 'EVC Plus (GoPay)', val: 9856.20, ratio: 66.7, bg: 'bg-blue-500' },
              { id: 'cash', label: 'Cash Drawer Ledger', val: 3123.40, ratio: 21.1, bg: 'bg-emerald-500' },
              { id: 'card', label: 'Credit/Debit POS Terminal', val: 1455.60, ratio: 9.8, bg: 'bg-amber-500' },
              { id: 'other', label: 'Other Wallets / Vouchers', val: 350.40, ratio: 2.4, bg: 'bg-slate-500' }
            ].map((p, idx) => (
              <div key={idx} className="space-y-1.5 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{p.label}</span>
                  <span className="font-mono text-white font-bold">${p.val.toFixed(2)} <span className="text-slate-500 text-[10px]">({p.ratio}%)</span></span>
                </div>
                {/* Simulated bar progress indicator flow */}
                <div className="w-full h-2 rounded bg-blue-950/40 relative overflow-hidden">
                  <div
                    className={`h-full rounded ${p.bg}`}
                    style={{ width: `${p.ratio}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
