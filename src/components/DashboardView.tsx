import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, ShoppingCart, DollarSign, Activity, FileText, Clock } from 'lucide-react';
import { Order, ShiftLog } from '../types';

interface DashboardViewProps {
  orders: Order[];
  onRefresh?: () => void;
  onNavigateTab: (tabId: 'dashboard' | 'orders' | 'menu' | 'tables' | 'customers' | 'reports' | 'discounts') => void;
  
  // Shift state and functions for cashier workflow
  shiftLogs: ShiftLog[];
  activeCashierId: string;
  activeCashierName: string;
  onClockIn: (cashierId: string, shiftCode: string) => void;
  onClockOut: (cashierId: string, durationStr: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  orders, 
  onRefresh, 
  onNavigateTab,
  shiftLogs,
  activeCashierId,
  activeCashierName,
  onClockIn,
  onClockOut
}) => {
  const [trendTab, setTrendTab] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('hourly');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; val: string } | null>(null);

  // Active cashier live shift ticking logic
  const activeShift = shiftLogs.find(log => log.cashierId === activeCashierId && !log.clockOutTime);
  const [elapsed, setElapsed] = useState<string>('00h 00m 00s');

  useEffect(() => {
    if (!activeShift) {
      setElapsed('00h 00m 00s');
      return;
    }

    const updateTimer = () => {
      const start = new Date(activeShift.clockInTime).getTime();
      const diff = Date.now() - start;
      if (diff < 0) {
        setElapsed('00h 00m 00s');
        return;
      }
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setElapsed(`${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`);
    };

    updateTimer(); // instant draw
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeShift]);

  // Derive status from live orders + seed stable metrics
  const totalLiveSales = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const totalLiveOrdersCount = orders.length;

  // Static basis plus live increments for beautiful dynamic dashboards
  const baseSales = 2453.50;
  const currentSales = baseSales + totalLiveSales;
  const currentOrders = 86 + totalLiveOrdersCount;
  const currentAvgOrder = currentOrders > 0 ? (currentSales / currentOrders) : 0;
  const currentTransactions = 92 + orders.filter(o => o.status === 'Completed').length;

  // Trend data points based on selection
  const trendData: Record<'hourly' | 'daily' | 'weekly' | 'monthly', { label: string; value: number }[]> = {
    hourly: [
      { label: '12 AM', value: 180 },
      { label: '2 AM', value: 120 },
      { label: '4 AM', value: 90 },
      { label: '6 AM', value: 150 },
      { label: '8 AM', value: 240 },
      { label: '10 AM', value: 380 },
      { label: '12 PM', value: 520 },
      { label: '2 PM', value: 680.50 },
      { label: '4 PM', value: 540 },
      { label: '6 PM', value: 590 },
      { label: '8 PM', value: 480 },
      { label: '10 PM', value: 560 },
      { label: '12 AM', value: 580 },
    ],
    daily: [
      { label: 'Mon', value: 1800 },
      { label: 'Tue', value: 2100 },
      { label: 'Wed', value: 1950 },
      { label: 'Thu', value: 2400 },
      { label: 'Fri', value: 3100 },
      { label: 'Sat', value: 4200 },
      { label: 'Sun', value: 3850 },
    ],
    weekly: [
      { label: 'Week 1', value: 12500 },
      { label: 'Week 2', value: 14800 },
      { label: 'Week 3', value: 13900 },
      { label: 'Week 4', value: 16200 },
    ],
    monthly: [
      { label: 'Jan', value: 45000 },
      { label: 'Feb', value: 48000 },
      { label: 'Mar', value: 52000 },
      { label: 'Apr', value: 58000 },
      { label: 'May', value: currentSales * 20 }, // scale to reflect sales
    ]
  };

  const activeTrend = trendData[trendTab];

  // SVG dimensions for trend chart
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 20;

  const minVal = 0;
  const maxVal = Math.max(...activeTrend.map(d => d.value)) * 1.15;

  const points = activeTrend.map((d, idx) => {
    const x = paddingX + (idx / (activeTrend.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.value - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
    return { x, y, label: d.label, val: `$${d.value.toFixed(2)}` };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Grid lines
  const gridLinesY = [0.25, 0.5, 0.75].map(ratio => {
    const y = paddingY + ratio * (height - 2 * paddingY);
    const val = maxVal - ratio * (maxVal - minVal);
    return { y, val: val.toFixed(0) };
  });

  const topSellingItems = [
    { name: 'Margherita Pizza', qty: 32 + orders.filter(o => o.target === 'T-07' && o.type === 'Dine In').length * 2, sales: 1775.00 },
    { name: 'Grilled Chicken', qty: 27 + orders.filter(o => o.target === 'T-03').length, sales: 1583.00 },
    { name: 'Cheeseburger', qty: 24, sales: 1122.00 },
    { name: 'Pasta Alfredo', qty: 21, sales: 956.80 },
    { name: 'Lemonade', qty: 18, sales: 342.00 }
  ];

  const paymentBreakdown = [
    { name: 'evc (GoPay)', ratio: 68, amount: currentSales * 0.68, color: 'bg-blue-500', fill: '#3b82f6' },
    { name: 'Cash', ratio: 20, amount: currentSales * 0.20, color: 'bg-emerald-500', fill: '#10b981' },
    { name: 'Card', ratio: 10, amount: currentSales * 0.10, color: 'bg-amber-500', fill: '#f59e0b' },
    { name: 'Other', ratio: 2, amount: currentSales * 0.02, color: 'bg-slate-500', fill: '#64748b' }
  ];

  const orderStatuses = [
    { name: 'Completed', count: Math.ceil(currentOrders * 0.65), ratio: 65, color: 'bg-blue-500' },
    { name: 'Preparing', count: Math.ceil(currentOrders * 0.21), ratio: 21, color: 'bg-amber-500' },
    { name: 'Served', count: Math.ceil(currentOrders * 0.09), ratio: 9, color: 'bg-emerald-500' },
    { name: 'Cancelled', count: Math.ceil(currentOrders * 0.05), ratio: 5, color: 'bg-rose-500' }
  ];

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in-50 duration-150">
      
      {/* 1. Header with dynamic refresh indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics and live payment broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Calendar Picker style dropdown */}
          <div className="px-4 py-2 bg-[#091124] border border-[#14223f] rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F80ED] animate-pulse"></span>
            <span>Today, {new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <button
            onClick={onRefresh}
            className="p-2.5 bg-[#091124] hover:bg-slate-900 border border-[#14223f] rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh statistics stats"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 1.5 Cashier Clock-In / Clock-Out Shift Controller */}
      <div className="bg-gradient-to-r from-[#0a152d]/90 via-[#091124] to-[#040a15]/95 border border-blue-900/15 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden text-left animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-center shrink-0 ${
            activeShift 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-950/15 border-rose-900/30 text-rose-450'
          }`}>
            <Clock className={`w-6 h-6 ${activeShift ? 'animate-pulse' : ''}`} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-slate-100">
                {activeCashierName}’s Duty Shift Control
              </span>
              <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${
                activeShift 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-950/20 text-rose-450 border-rose-950/25'
              }`}>
                {activeShift ? 'Active Duty' : 'Off-Duty'}
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-xl">
              {activeShift 
                ? `You began your active working shift at ${new Date(activeShift.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} with code "${activeShift.shiftCode}". Your total duration is logged to the admin registry upon clocking out.` 
                : 'Your working hours are currently untracked. Toggle block below to clock-in, launch a new shift code, and automatically log total duration.'
              }
            </p>

            {/* If has past logs, show helpful hint */}
            {shiftLogs.filter(log => log.cashierId === activeCashierId && log.clockOutTime).length > 0 && !activeShift && (
              <p className="text-[10px] text-slate-500 font-mono mt-1 border-t border-slate-900 pt-1.5 inline-block">
                Last shift log: <strong className="text-slate-400">{shiftLogs.filter(log => log.cashierId === activeCashierId && log.clockOutTime).slice(-1)[0]?.duration}</strong> on {new Date(shiftLogs.filter(log => log.cashierId === activeCashierId && log.clockOutTime).slice(-1)[0]?.clockInTime).toLocaleDateString()} with code <strong className="text-[#2F80ED]">{shiftLogs.filter(log => log.cashierId === activeCashierId && log.clockOutTime).slice(-1)[0]?.shiftCode}</strong>.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
          {/* Active continuous timer digits */}
          {activeShift && (
            <div className="text-center sm:text-right w-full sm:w-auto mr-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Shift Timer</span>
              <span className="text-lg font-black font-mono text-emerald-400 tracking-tight">{elapsed}</span>
            </div>
          )}

          {activeShift ? (
            <button
              onClick={() => onClockOut(activeCashierId, elapsed)}
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#250d12]/70 hover:bg-rose-600 border border-rose-950 hover:border-rose-500 text-rose-400 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <span>Clock Out</span>
            </button>
          ) : (
            <button
              onClick={() => {
                // Generate a randomized nice code to represent the shift
                const generatedCode = `Shift #S${Math.floor(100 + Math.random() * 900)}`;
                onClockIn(activeCashierId, generatedCode);
              }}
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0b2413] hover:bg-emerald-600 border border-emerald-950 hover:border-emerald-500 text-emerald-450 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <span>Clock In Now</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top grid stats (Matching style of image first row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="bg-[#091124]/90 border border-blue-900/10 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Sales</span>
            <div className="p-2 bg-blue-950/40 rounded-xl border border-blue-900/15">
              <DollarSign className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white font-mono">${currentSales.toLocaleString([], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-400 font-mono">
              <TrendingUp className="h-3 w-3" />
              <span>+12.5%</span>
              <span className="text-slate-500 font-normal ml-0.5">vs Yesterday</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
        </div>

        {/* Orders Card */}
        <div className="bg-[#091124]/90 border border-blue-900/10 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Orders</span>
            <div className="p-2 bg-blue-950/40 rounded-xl border border-blue-900/15">
              <ShoppingCart className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white font-mono">{currentOrders}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-400 font-mono">
              <TrendingUp className="h-3 w-3" />
              <span>+8.3%</span>
              <span className="text-slate-500 font-normal ml-0.5">vs Yesterday</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-[#2F80ED]/10 transition-colors pointer-events-none"></div>
        </div>

        {/* Average Order Card */}
        <div className="bg-[#091124]/90 border border-blue-900/10 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Average Order</span>
            <div className="p-2 bg-blue-950/40 rounded-xl border border-blue-900/15">
              <Activity className="h-4 w-4 text-[#2F80ED]" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white font-mono">${currentAvgOrder.toFixed(2)}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-400 font-mono">
              <TrendingUp className="h-3 w-3" />
              <span>+5.2%</span>
              <span className="text-slate-500 font-normal ml-0.5">vs Yesterday</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>
        </div>

        {/* Transactions Card */}
        <div className="bg-[#091124]/90 border border-blue-900/10 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Transactions</span>
            <div className="p-2 bg-blue-950/40 rounded-xl border border-blue-900/15">
              <FileText className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-white font-mono">{currentTransactions}</h3>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-400 font-mono">
              <TrendingUp className="h-3 w-3" />
              <span>+9.1%</span>
              <span className="text-slate-500 font-normal ml-0.5">vs Yesterday</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
        </div>
      </div>

      {/* 3. Middle Section: Sales Overview graph vs Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Sales Overview Line Chart panel */}
        <div className="lg:col-span-8 bg-[#091124]/90 border border-blue-900/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between border-b border-blue-900/10 pb-3 mb-4">
            <h2 className="text-sm font-bold tracking-tight uppercase text-slate-200">
              Sales Overview
            </h2>
            <div className="flex items-center bg-blue-950/50 p-1 rounded-xl border border-blue-900/20 text-[10px] font-bold uppercase">
              {(['hourly', 'daily', 'weekly', 'monthly'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setTrendTab(tab);
                    setHoveredPoint(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    trendTab === tab
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Core Interactive SVG Rendering (replaces heavy charting library) */}
          <div className="flex-1 min-h-[200px] flex items-center justify-center relative select-none">
            
            {/* Tooltip Hover Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-10 px-2.5 py-1.5 bg-[#030918] border border-blue-500 rounded-lg text-[10px] font-mono pointer-events-none shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${(hoveredPoint.y / height) * 100 - 25}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <p className="text-slate-400 font-bold uppercase text-[9px]">{hoveredPoint.label}</p>
                <p className="text-[#2F80ED] font-black text-xs mt-0.5">{hoveredPoint.val}</p>
              </div>
            )}

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                {/* Glow & Fill Gradients */}
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F80ED" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#2F80ED" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Y Values */}
              {gridLinesY.map((l, idx) => (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={l.y}
                    x2={width - paddingX}
                    y2={l.y}
                    stroke="#14223f"
                    strokeWidth="0.75"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 6}
                    y={l.y + 3}
                    fill="#475569"
                    fontSize="8.5"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    ${l.val}
                  </text>
                </g>
              ))}

              {/* Chart Shaded Fill Area */}
              {points.length > 0 && (
                <path
                  d={`${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
                  fill="url(#chartGradient)"
                />
              )}

              {/* Chart Line Path */}
              {points.length > 0 && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#2F80ED"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Interactive Nodes */}
              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint?.label === p.label ? "6" : "3.5"}
                  fill={hoveredPoint?.label === p.label ? "#FFFFFF" : "#2F80ED"}
                  stroke="#091124"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-100"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Labels Row */}
              {points.map((p, idx) => {
                // Show alternate label on hourly to be clean
                if (trendTab === 'hourly' && idx % 2 !== 0) return null;
                return (
                  <text
                    key={idx}
                    x={p.x}
                    y={height - 4}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Top Selling Items (Matches layout of screenshot dashboard far-right middle block) */}
        <div className="lg:col-span-4 bg-[#091124]/90 border border-blue-900/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between border-b border-blue-900/10 pb-3 mb-4 shrink-0">
            <h2 className="text-sm font-bold tracking-tight uppercase text-slate-200">
              Top Selling Items
            </h2>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-[#2F80ED] hover:underline text-[10px] font-extrabold uppercase bg-blue-950/20 hover:bg-blue-950/40 px-2 py-1 rounded"
            >
              View Full Report
            </button>
          </div>

          <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[160px] scrollbar-thin">
            {topSellingItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-blue-950 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-white truncate font-bold max-w-[130px]" title={item.name}>{item.name}</span>
                </div>
                
                <div className="flex items-center gap-4 text-right font-mono">
                  <span className="text-slate-400 font-bold">{item.qty} Sold</span>
                  <span className="text-white font-extrabold">${item.sales.toLocaleString([], { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Bottom Row: Payment Breakdown & Orders Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Payment Breakdown Card representing the layout on dashboard bottom left */}
        <div className="bg-[#091124]/90 border border-blue-900/10 rounded-2xl p-5 shadow-xl">
          <div className="border-b border-blue-900/10 pb-3 mb-4">
            <h2 className="text-sm font-bold tracking-tight uppercase text-slate-200">
              Payment Breakdown
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Visual Pie/Donut Chart */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#132448" strokeWidth="12" />
                
                {/* Live values */}
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray={`${2.512 * 68} ${251.2}`}
                  strokeDashoffset={0}
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${2.512 * 20} ${251.2}`}
                  strokeDashoffset={-2.512 * 68}
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={`${2.512 * 10} ${251.2}`}
                  strokeDashoffset={-2.512 * 88}
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#64748b"
                  strokeWidth="12"
                  strokeDasharray={`${2.512 * 2} ${251.2}`}
                  strokeDashoffset={-2.512 * 98}
                />
              </svg>
              <div className="absolute inset-4 rounded-full bg-[#091124] flex flex-col items-center justify-center mt-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-[12px] font-black text-white font-mono mt-0.5">${currentSales.toFixed(0)}</span>
              </div>
            </div>

            {/* Explanations rows list matching screenshot */}
            <div className="flex-1 w-full space-y-2 text-[11px] font-semibold">
              {paymentBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`}></span>
                    <span className="text-slate-300 font-bold">{item.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5 text-right font-mono text-[10.5px]">
                    <span className="text-slate-400 font-bold">{item.ratio}%</span>
                    <span className="text-white font-extrabold w-16">${item.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Status Card representing the layout on dashboard bottom right */}
        <div className="bg-[#091124]/90 border border-blue-900/10 rounded-2xl p-5 shadow-xl">
          <div className="border-b border-blue-900/10 pb-3 mb-4">
            <h2 className="text-sm font-bold tracking-tight uppercase text-slate-200">
              Orders Status
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Visual Pie/Donut Chart */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#132448" strokeWidth="12" />
                
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray={`${2.512 * 65} ${251.2}`}
                  strokeDashoffset={0}
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={`${2.512 * 21} ${251.2}`}
                  strokeDashoffset={-2.512 * 65}
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${2.512 * 9} ${251.2}`}
                  strokeDashoffset={-2.512 * 86}
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray={`${2.512 * 5} ${251.2}`}
                  strokeDashoffset={-2.512 * 95}
                />
              </svg>
              <div className="absolute inset-4 rounded-full bg-[#091124] flex flex-col items-center justify-center mt-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Orders</span>
                <span className="text-[13px] font-black text-white font-mono mt-0.5">{currentOrders}</span>
              </div>
            </div>

            {/* Explanation status rows */}
            <div className="flex-1 w-full space-y-2 text-[11px] font-semibold">
              {orderStatuses.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`}></span>
                    <span className="text-slate-300 font-bold">{item.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5 text-right font-mono text-[10.5px]">
                    <span className="text-white font-extrabold">{item.count}</span>
                    <span className="text-slate-400 font-bold w-8">({item.ratio}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
