import React, { useState } from 'react';
import { FlowsheetRow, Patient } from '../types';
import { Plus, Clock } from 'lucide-react';

interface FlowsheetViewProps {
  rows: FlowsheetRow[];
  timeSlots: string[];
  patient: Patient;
  onOpenAddRound: () => void;
  onUpdateCellValue: (rowId: string, timeSlot: string, newValue: string) => void;
  onAddMedicationToFlowsheet: (medName: string, doseText: string) => void;
}

export const FlowsheetView: React.FC<FlowsheetViewProps> = ({
  rows,
  timeSlots,
  patient,
  onOpenAddRound,
  onUpdateCellValue,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [editingCell, setEditingCell] = useState<{ rowId: string; timeSlot: string; currentValue: string } | null>(null);
  const [cellInputValue, setCellInputValue] = useState<string>('');

  // Real-time system clock monitor
  const [currentClockTime, setCurrentClockTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentClockTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 10000); // update every 10s
    return () => clearInterval(timer);
  }, []);

  // Determine the time slot closest to the current system clock
  const getNowSlot = (slots: string[], clockStr: string) => {
    if (!slots || slots.length === 0) return '';
    const [ch, cm] = clockStr.split(':').map(Number);
    const clockMins = (ch || 0) * 60 + (cm || 0);

    let closestSlot = slots[0];
    let minDiff = Infinity;

    slots.forEach((slot) => {
      const [sh, sm] = slot.split(':').map(Number);
      if (isNaN(sh)) return;
      const slotMins = sh * 60 + (sm || 0);
      const diff = Math.abs(clockMins - slotMins);
      if (diff < minDiff) {
        minDiff = diff;
        closestSlot = slot;
      }
    });

    return closestSlot;
  };

  const nowSlot = getNowSlot(timeSlots, currentClockTime);

  const filteredRows = rows.filter((row) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'VITALS') return row.category === 'VITALS' || row.category === 'PAIN';
    if (filterCategory === 'MEDS') return row.category === 'MEDICATIONS';
    if (filterCategory === 'GI') return row.category === 'GI';
    if (filterCategory === 'LABS') return row.category === 'CLINICOPATHOLOGY';
    return true;
  });

  // Group rows by categoryLabel for structured color banding
  const groupedRows: { [key: string]: FlowsheetRow[] } = {};
  filteredRows.forEach((row) => {
    const groupKey = row.categoryLabel || row.category;
    if (!groupedRows[groupKey]) {
      groupedRows[groupKey] = [];
    }
    groupedRows[groupKey].push(row);
  });

  // Dedicated row color banding across entire row to prevent misentry
  const getRowColorStyles = (color: FlowsheetRow['bandColor'] | string) => {
    switch (color) {
      case 'red':
        return {
          headerBg: 'bg-red-700 text-white font-extrabold',
          rowCellBg: 'bg-red-100/70 hover:bg-red-100',
          cardBorder: 'border-red-300',
        };
      case 'orange':
        return {
          headerBg: 'bg-amber-600 text-white font-extrabold',
          rowCellBg: 'bg-amber-100/70 hover:bg-amber-100',
          cardBorder: 'border-amber-300',
        };
      case 'yellow':
        return {
          headerBg: 'bg-yellow-500 text-slate-950 font-extrabold',
          rowCellBg: 'bg-yellow-100/70 hover:bg-yellow-100',
          cardBorder: 'border-yellow-300',
        };
      case 'green':
        return {
          headerBg: 'bg-emerald-600 text-white font-extrabold',
          rowCellBg: 'bg-emerald-100/70 hover:bg-emerald-100',
          cardBorder: 'border-emerald-300',
        };
      case 'blue':
        return {
          headerBg: 'bg-sky-600 text-white font-extrabold',
          rowCellBg: 'bg-sky-100/70 hover:bg-sky-100',
          cardBorder: 'border-sky-300',
        };
      case 'purple':
        return {
          headerBg: 'bg-purple-600 text-white font-extrabold',
          rowCellBg: 'bg-purple-100/70 hover:bg-purple-100',
          cardBorder: 'border-purple-300',
        };
      case 'pink':
        return {
          headerBg: 'bg-pink-600 text-white font-extrabold',
          rowCellBg: 'bg-pink-100/70 hover:bg-pink-100',
          cardBorder: 'border-pink-300',
        };
      case 'cyan':
        return {
          headerBg: 'bg-cyan-600 text-white font-extrabold',
          rowCellBg: 'bg-cyan-100/70 hover:bg-cyan-100',
          cardBorder: 'border-cyan-300',
        };
      case 'lime':
        return {
          headerBg: 'bg-lime-600 text-white font-extrabold',
          rowCellBg: 'bg-lime-100/70 hover:bg-lime-100',
          cardBorder: 'border-lime-300',
        };
      case 'slate':
      default:
        return {
          headerBg: 'bg-slate-700 text-white font-extrabold',
          rowCellBg: 'bg-slate-100/70 hover:bg-slate-100',
          cardBorder: 'border-slate-300',
        };
    }
  };

  const handleCellClick = (rowId: string, timeSlot: string, currentValue: string) => {
    setEditingCell({ rowId, timeSlot, currentValue });
    setCellInputValue(currentValue);
  };

  const handleSaveCell = () => {
    if (editingCell) {
      onUpdateCellValue(editingCell.rowId, editingCell.timeSlot, cellInputValue);
      setEditingCell(null);
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Top Flowsheet Action & Summary Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Clinical Flowsheet
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
              {patient.name} ({patient.patientId})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Row-banded ICU grid • Anti-misentry color schemes • Real-time DUE highlights
          </p>
        </div>

        {/* Quick Stats & Add Round Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 block text-[10px] font-medium uppercase">Net Fluid Balance</span>
            <span className={`font-bold ${patient.netFluidBalanceLiters < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {patient.netFluidBalanceLiters > 0 ? `+${patient.netFluidBalanceLiters}` : patient.netFluidBalanceLiters} Liters
            </span>
          </div>

          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 block text-[10px] font-medium uppercase">Next Due Round</span>
            <span className="font-bold text-blue-600 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {patient.nextDueRoundTime}
            </span>
          </div>

          <button
            onClick={onOpenAddRound}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
            id="add-round-btn"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            Add Round
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          {[
            { id: 'ALL', label: 'All Parameters' },
            { id: 'VITALS', label: 'Vitals & Pain' },
            { id: 'GI', label: 'GI & Reflux' },
            { id: 'MEDS', label: 'Meds & CRIs' },
            { id: 'LABS', label: 'Clinicopathology' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="text-[11px] font-medium text-slate-500 hidden lg:block px-2">
          💡 Tap any cell to record or edit value
        </div>
      </div>

      {/* Main Flowsheet Grid Container with Sticky Left Column */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[850px]">
            {/* Table Header Row */}
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider font-semibold border-b border-slate-700">
                {/* Sticky Parameter Header */}
                <th className="p-3 sticky left-0 z-20 bg-slate-800 w-56 sm:w-64 border-r border-slate-700 shadow-md">
                  <div className="flex items-center justify-between">
                    <span>Parameter</span>
                    <span className="text-[10px] text-slate-400 font-normal">Target</span>
                  </div>
                </th>

                {/* Time Slots Headers */}
                {timeSlots.map((slot) => {
                  const isNow = slot === nowSlot;
                  return (
                    <th
                      key={slot}
                      className={`p-2.5 text-center min-w-[75px] border-r border-slate-700 ${
                        isNow ? 'bg-amber-400 text-slate-950 font-black shadow-inner border-amber-500' : ''
                      }`}
                    >
                      {isNow && <div className="text-[9px] leading-tight font-extrabold uppercase bg-slate-900 text-amber-300 px-1 py-0.5 rounded shadow-xs mb-0.5">NOW ({currentClockTime})</div>}
                      <div>{slot}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body grouped by Category Header Bands */}
            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {Object.entries(groupedRows).map(([groupTitle, categoryRows]) => {
                const firstRow = categoryRows[0];
                return (
                  <React.Fragment key={groupTitle}>
                    {/* Category Header Row Band */}
                    <tr className="bg-slate-200 text-slate-800 font-extrabold border-y border-slate-300">
                      <td className="p-2 sticky left-0 z-10 bg-slate-200 border-r border-slate-300 uppercase tracking-wide text-[11px] shadow-sm flex items-center justify-between">
                        <span>{groupTitle}</span>
                        {firstRow?.categoryFrequency && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-300 text-slate-700 text-[10px] lowercase font-bold">
                            {firstRow.categoryFrequency}
                          </span>
                        )}
                      </td>
                      {timeSlots.map((slot) => (
                        <td key={slot} className="p-2 bg-slate-200/50 border-r border-slate-300/50"></td>
                      ))}
                    </tr>

                    {/* Individual Parameter Rows */}
                    {categoryRows.map((row) => {
                      const colorStyles = getRowColorStyles(row.bandColor);
                      return (
                        <tr key={row.id} className="transition-colors">
                          {/* Sticky Left Title + Target Column */}
                          <td className={`p-2.5 sticky left-0 z-10 border-r border-slate-300 shadow-md ${colorStyles.headerBg}`}>
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate max-w-[140px] sm:max-w-[160px] text-white font-extrabold">{row.parameter}</span>
                              <span className="text-[10px] font-extrabold text-slate-900 bg-white/90 px-1.5 py-0.5 rounded shadow-xs">
                                {row.target}
                              </span>
                            </div>
                          </td>

                          {/* Time Values Cells across the row with anti-misentry color scheme */}
                          {timeSlots.map((slot) => {
                            const cell = row.values[slot];
                            const isNow = slot === nowSlot;
                            const isDue = cell?.status === 'AMBER_DUE' || cell?.status === 'DUE' || cell?.note === 'AMBER DUE' || cell?.note === 'DUE';
                            const hasValue = cell && cell.value !== '' && cell.value !== undefined;

                            return (
                              <td
                                key={slot}
                                onClick={() => handleCellClick(row.id, slot, cell?.value?.toString() || '')}
                                className={`p-1.5 text-center border-r border-slate-200/80 cursor-pointer transition-all hover:brightness-95 relative min-w-[75px] ${colorStyles.rowCellBg} ${
                                  isNow ? 'ring-2 ring-amber-500 z-10' : ''
                                }`}
                              >
                                {isDue ? (
                                  <div className="bg-amber-500 text-white font-black text-[10px] px-2.5 py-1 rounded-lg border border-amber-600 shadow-sm animate-pulse tracking-wider">
                                    DUE
                                  </div>
                                ) : hasValue ? (
                                  <div className={`bg-white rounded-xl p-1 shadow-xs border ${colorStyles.cardBorder} flex flex-col items-center justify-center min-h-[38px] relative`}>
                                    {cell.delta && (
                                      <span className="absolute -top-1.5 -right-1 text-[8px] font-black text-emerald-700 bg-emerald-100 px-1 rounded-full border border-emerald-300">
                                        {cell.delta}
                                      </span>
                                    )}
                                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                                      {cell.value}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 text-xs font-bold">
                                    +
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Cell Modal */}
      {editingCell && (() => {
        const activeRow = rows.find(r => r.id === editingCell.rowId);
        const isMedicationRow = activeRow?.category === 'MEDICATIONS' || activeRow?.type === 'medication';

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {isMedicationRow ? 'Record Administration' : 'Edit Value'} • Time Slot <span className="text-blue-600">{editingCell.timeSlot}</span>
                  </h3>
                  {activeRow && (
                    <p className="text-xs text-slate-500 font-bold mt-0.5">{activeRow.parameter}</p>
                  )}
                </div>
                <button onClick={() => setEditingCell(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                  ✕
                </button>
              </div>

              {isMedicationRow ? (
                /* Specialized Medication Cell Modal */
                <div className="space-y-4">
                  {/* Option 1: Quick Confirm Pre-Calculated Dose */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pre-Calculated Target Dose</span>
                    <button
                      onClick={() => {
                        onUpdateCellValue(editingCell.rowId, editingCell.timeSlot, activeRow?.target || 'Given');
                        setEditingCell(null);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                    >
                      ✓ Confirm Calculated Dose: {activeRow?.target}
                    </button>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-2 text-[10px] font-extrabold text-slate-400 uppercase">OR CUSTOM NUMERIC DOSE</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Option 2: Numeric Only Dose Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Enter Different Numeric Volume:
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={cellInputValue}
                      onChange={(e) => setCellInputValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-extrabold focus:ring-2 focus:ring-blue-500 outline-none text-base"
                      placeholder="e.g. 6.6 or 15"
                    />
                  </div>
                </div>
              ) : (
                /* Standard Parameter Cell Modal */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Enter Parameter Value:
                  </label>
                  <input
                    type="text"
                    value={cellInputValue}
                    onChange={(e) => setCellInputValue(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none text-base"
                    placeholder="e.g. 48, BAR, 38.1..."
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingCell(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCell}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Cell
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
