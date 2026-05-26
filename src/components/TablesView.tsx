import React, { useState, useEffect } from 'react';
import { Plus, TableProperties, HelpCircle, Check, Users, Shield, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { Table, TableStatus } from '../types';

interface TablesViewProps {
  tables: Table[];
  onAddSimulatedTable: (table: Table) => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus, currentBill?: number, reservedTime?: string) => void;
  onStartTableOrder?: (tableId: string) => void;
}

export const TablesView: React.FC<TablesViewProps> = ({
  tables,
  onAddSimulatedTable,
  onUpdateTableStatus,
  onStartTableOrder,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | TableStatus>('All');
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Quick states for layout timers
  const [secs, setSecs] = useState(0);

  // Form states for creating custom table
  const [newTableId, setNewTableId] = useState('T-13');
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [newTableStatus, setNewTableStatus] = useState<TableStatus>('Available');

  // Popup editors for selected table
  const [editStatus, setEditStatus] = useState<TableStatus>('Available');
  const [editBill, setEditBill] = useState('0.00');
  const [editReservedTime, setEditReservedTime] = useState('07:30 PM');

  useEffect(() => {
    const clockInt = setInterval(() => {
      setSecs(s => s + 1);
    }, 1000);
    return () => clearInterval(clockInt);
  }, []);

  const formatTimer = (tableId: string) => {
    // Return relative simulated timestamps
    const offsetMap: Record<string, number> = {
      'T-01': 2125, // 00:35:25
      'T-03': 1120, // 00:18:40
      'T-06': 3730, // 01:02:10
      'T-07': 135,  // 00:02:15
      'T-11': 910,  // 00:15:10
      'T-12': 1470, // 00:24:30
    };
    
    const baseOffset = offsetMap[tableId] || 45;
    const finalSecs = baseOffset + secs;

    const hrs = Math.floor(finalSecs / 3600);
    const mins = Math.floor((finalSecs % 3600) / 60);
    const seconds = finalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(seconds)}`;
  };

  const handleCreateCustomTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (tables.some(t => t.id === newTableId)) {
      alert("Table ID already exists! Please define another unique code.");
      return;
    }
    
    onAddSimulatedTable({
      id: newTableId,
      seats: newTableSeats,
      status: newTableStatus,
      currentBill: newTableStatus === 'Occupied' ? 45.00 : undefined,
      reservedTime: newTableStatus === 'Reserved' ? '06:00 PM' : undefined,
    });
    setIsAddingTable(false);

    // Auto-increment standard helper for next
    const numericPart = parseInt(newTableId.replace('T-', '')) || 12;
    setNewTableId(`T-${(numericPart + 1).toString().padStart(2, '0')}`);
  };

  const handleUpdateTableDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;

    const pBill = parseFloat(editBill);
    onUpdateTableStatus(
      selectedTable.id,
      editStatus,
      editStatus === 'Occupied' ? (isNaN(pBill) ? 0.00 : pBill) : undefined,
      editStatus === 'Reserved' ? editReservedTime : undefined
    );
    setSelectedTable(null);
  };

  const filteredTables = tables.filter((t) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Occupied') return t.status === 'Occupied';
    return t.status === activeFilter;
  });

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'Occupied':
        return { stroke: 'text-blue-400', bg: 'bg-blue-950/20 border-blue-900/30 text-blue-300', dot: 'bg-blue-400' };
      case 'Reserved':
        return { stroke: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-900/30 text-amber-300', dot: 'bg-amber-400' };
      case 'Cleaning':
        return { stroke: 'text-purple-400', bg: 'bg-purple-950/20 border-purple-900/30 text-purple-300', dot: 'bg-purple-400' };
      default:
        // Available
        return { stroke: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300', dot: 'bg-emerald-400' };
    }
  };

  return (
    <div className="space-y-6 text-white font-sans animate-in fade-in-50 duration-150">
      
      {/* 1. Upper actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            Tables
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Toggle table occupancy, schedule reserved spaces, and preview active bills instantly.
          </p>
        </div>

        <button
          onClick={() => setIsAddingTable(true)}
          className="bg-[#2F80ED] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Table</span>
        </button>
      </div>

      {/* Categories filters */}
      <div className="flex items-center justify-between gap-3 border-b border-blue-900/10 pb-4">
        <div className="flex bg-[#091124] p-1 rounded-xl border border-blue-900/10 text-xs font-bold">
          {(['All', 'Available', 'Occupied', 'Reserved', 'Cleaning'] as const).map(tab => {
            const count = tab === 'All' 
              ? tables.length 
              : tables.filter(t => t.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab as any)}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  (tab === 'All' && activeFilter === 'All') || (activeFilter === tab)
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Legend color guides row */}
        <div className="hidden lg:flex items-center space-x-4 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Cleaning</span>
          </div>
        </div>
      </div>

      {/* Interactive Grids List */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const detail = getStatusBadge(table.status);
          const hasActiveBill = table.status === 'Occupied' && table.currentBill !== undefined;
          
          return (
            <div
              key={table.id}
              onClick={() => {
                setSelectedTable(table);
                setEditStatus(table.status);
                setEditBill(table.currentBill?.toFixed(2) || '45.00');
                setEditReservedTime(table.reservedTime || '07:30 PM');
              }}
              className={`bg-[#091124]/90 hover:bg-[#0c1935] border rounded-2xl p-4 flex flex-col justify-between shadow-md group cursor-pointer transition-all duration-150 select-none active:scale-[0.98] ${
                table.status === 'Occupied' 
                  ? 'border-blue-900/30 hover:border-blue-500/40' 
                  : table.status === 'Reserved'
                    ? 'border-amber-900/30 hover:border-amber-500/40'
                    : 'border-blue-900/10 hover:border-[#2F80ED]/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-100">{table.id}</h3>
                  <span className="text-[10px] text-slate-400 font-bold">{table.seats} Seats</span>
                </div>
                
                {/* Visual Chair indicator */}
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-wider ${detail.bg}`}>
                  {table.status}
                </span>
              </div>

              {/* Status Specific Info */}
              <div className="my-5 flex flex-col items-center justify-center py-2 relative">
                {/* Interactive centerpiece icon matching status */}
                <div className={`p-3.5 bg-blue-950/20 rounded-2xl border border-blue-900/10 transition-transform duration-100 group-hover:scale-110 ${detail.stroke}`}>
                  <TableProperties className="h-5 w-5" />
                </div>

                {table.status === 'Occupied' && (
                  <div className="mt-3 text-center leading-none">
                    <p className="text-[10px] uppercase font-bold text-slate-400 font-mono">Dine In</p>
                    <p className="text-sm font-black text-white font-mono mt-1">${table.currentBill?.toFixed(2)}</p>
                  </div>
                )}

                {table.status === 'Reserved' && (
                  <div className="mt-3 text-center leading-none">
                    <p className="text-[10px] uppercase font-bold text-amber-400 font-mono">Reserved</p>
                    <p className="text-xs font-mono font-bold text-slate-200 mt-0.5">{table.reservedTime || '07:30 PM'}</p>
                  </div>
                )}

                {table.status === 'Available' && (
                  <p className="text-[10px] font-bold text-[#8C9AA9] uppercase mt-4">Available</p>
                )}

                {table.status === 'Cleaning' && (
                  <p className="text-[10px] font-bold text-purple-400 uppercase mt-4">Resetting...</p>
                )}
              </div>

              {/* Backside meta stats */}
              <div className="border-t border-blue-900/10 pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                {table.status === 'Occupied' ? (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Clock</span>
                    </span>
                    <span className="text-slate-100 font-bold">{formatTimer(table.id)}</span>
                  </>
                ) : (
                  <>
                    <span>Indicator</span>
                    <span className="font-sans font-bold">Tap to edit</span>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Add New Table Simulation Modal */}
      {isAddingTable && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCustomTable} className="bg-[#091124] border border-[#14223f] rounded-3xl p-5 w-full max-w-sm text-left shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Configure New Diners Table</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Table ID Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. T-13"
                  value={newTableId}
                  onChange={(e) => setNewTableId(e.target.value)}
                  className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Seats Count</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(parseInt(e.target.value) || 4)}
                  className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Initial Status</label>
                <select
                  value={newTableStatus}
                  onChange={(e) => setNewTableStatus(e.target.value as any)}
                  className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied (Dine In)</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Cleaning">Cleaning / Resetting</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingTable(false)}
                className="w-1/2 py-2 text-center text-xs text-slate-400 hover:bg-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
              >
                Deploy Table
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Editing Selected Table Details Popup */}
      {selectedTable && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateTableDetails} className="bg-[#091124] border border-[#14223f] rounded-3xl p-5 w-full max-w-sm text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-blue-900/10 pb-2">
              <h3 className="text-sm font-black text-slate-200">Manage Table {selectedTable.id}</h3>
              <span className="text-[10px] text-slate-400 font-mono">Current: {selectedTable.status}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Modify Occupancy</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied (Dine In)</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>

              {editStatus === 'Occupied' && (
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Active Billing Tab Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editBill}
                    onChange={(e) => setEditBill(e.target.value)}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                  />
                </div>
              )}

              {editStatus === 'Reserved' && (
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Reservation Time Slot</label>
                  <input
                    type="text"
                    required
                    value={editReservedTime}
                    onChange={(e) => setEditReservedTime(e.target.value)}
                    className="w-full bg-slate-950/60 border border-blue-900/25 rounded-md p-2 text-xs text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTable(null)}
                className="w-1/3 py-2 text-center text-xs text-slate-400 hover:bg-slate-900 rounded-xl"
              >
                Close
              </button>
              
              {editStatus === 'Available' && onStartTableOrder && (
                <button
                  type="button"
                  onClick={() => {
                     onStartTableOrder(selectedTable.id);
                     setSelectedTable(null);
                  }}
                  className="w-1/3 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 font-bold text-xs rounded-xl"
                >
                  Start Order
                </button>
              )}

              {editStatus === 'Occupied' && onStartTableOrder && (
                <button
                  type="button"
                  onClick={() => {
                     onStartTableOrder(selectedTable.id); // Go to menu and load cart
                     setSelectedTable(null);
                  }}
                  className="w-1/3 py-2 bg-amber-600/20 text-amber-400 hover:bg-amber-600/40 font-bold text-xs rounded-xl"
                >
                  Checkout
                </button>
              )}

              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
