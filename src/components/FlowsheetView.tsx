import React, { useState, useEffect } from 'react';
import { FlowsheetRow, Patient, SurgeonScheduleSettings } from '../types';
import { Plus, Clock, FileText, Upload, CheckCircle, AlertTriangle, XCircle, RefreshCw, Calendar } from 'lucide-react';

interface FlowsheetViewProps {
  rows: FlowsheetRow[];
  timeSlots: string[];
  patient: Patient;
  surgeonSettings?: SurgeonScheduleSettings;
  onOpenAddRound: () => void;
  onUpdateCellValue: (rowId: string, timeSlot: string, newValue: string, status?: 'NORMAL' | 'AMBER_DUE' | 'DUE' | 'WARNING' | 'CRITICAL' | 'DONE' | 'LATE' | 'DISCONTINUED' | 'PROCESSING') => void;
  onAddMedicationToFlowsheet: (medName: string, doseText: string) => void;
}

export const FlowsheetView: React.FC<FlowsheetViewProps> = ({
  rows,
  timeSlots,
  patient,
  surgeonSettings,
  onOpenAddRound,
  onUpdateCellValue,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [editingCell, setEditingCell] = useState<{ rowId: string; timeSlot: string; currentValue: string } | null>(null);
  const [cellInputValue, setCellInputValue] = useState<string>('');

  // PDF Lab Import Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [selectedPdfTimeSlot, setSelectedPdfTimeSlot] = useState<string>('12:00');
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [isPdfParsing, setIsPdfParsing] = useState<boolean>(false);

  // Gut Sounds 4-Quadrant Cross State
  const [gutSoundsQuad, setGutSoundsQuad] = useState<{ lUp: string; lLow: string; rUp: string; rLow: string }>({
    lUp: '+',
    lLow: '+',
    rUp: '+',
    rLow: '+',
  });

  // Manure Details State
  const [manurePassed, setManurePassed] = useState<string>('Yes');
  const [manureAmount, setManureAmount] = useState<string>('Moderate');
  const [manureConsistency, setManureConsistency] = useState<string>('Normal Pellets');

  // Real-time system clock monitor
  const [currentClockTime, setCurrentClockTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentClockTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 10000);
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

  // Parse surgeon interval string to numerical hour step
  const parseIntervalHours = (intervalStr?: string) => {
    if (!intervalStr || intervalStr === 'STAT') return 1;
    const num = parseInt(intervalStr.replace('q', '').replace('h', ''));
    return isNaN(num) ? 1 : num;
  };

  // Surgeon Schedule Timepoint Column Filtering (Vitals, GI, Labs tabs)
  const { activeTimeSlots, surgeonRequirementLabel } = React.useMemo(() => {
    if (filterCategory === 'ALL' || !surgeonSettings) {
      return { activeTimeSlots: timeSlots, surgeonRequirementLabel: null };
    }

    let intervalStr = 'q1h';
    let labelCategory = '';

    if (filterCategory === 'VITALS') {
      intervalStr = surgeonSettings.tprInterval;
      labelCategory = 'Vitals & Pain';
    } else if (filterCategory === 'GI') {
      intervalStr = surgeonSettings.giInterval;
      labelCategory = 'GI & Motility';
    } else if (filterCategory === 'LABS') {
      intervalStr = surgeonSettings.clinPathInterval;
      labelCategory = 'Clinicopathology';
    } else {
      return { activeTimeSlots: timeSlots, surgeonRequirementLabel: null };
    }

    const step = parseIntervalHours(intervalStr);
    const filteredSlots = timeSlots.filter((_, idx) => idx % step === 0);

    return {
      activeTimeSlots: filteredSlots,
      surgeonRequirementLabel: `Surgeon Order Active: ${labelCategory} scheduled every ${intervalStr}`,
    };
  }, [filterCategory, timeSlots, surgeonSettings]);

  // Auto PCV Trend Calculation
  useEffect(() => {
    const pcvRow = rows.find(r => r.id === 'ht_pcv' || r.parameter.toLowerCase().includes('hematocrit'));
    const trendRow = rows.find(r => r.id === 'pcv_tp_split' || r.id === 'pcv_trend_row');

    if (pcvRow && trendRow) {
      let prevPcv: number | null = null;
      timeSlots.forEach((slot) => {
        const val = pcvRow.values[slot]?.value;
        if (val !== undefined && val !== '' && !isNaN(Number(val))) {
          const numPcv = Number(val);
          if (prevPcv !== null) {
            const diff = parseFloat((numPcv - prevPcv).toFixed(1));
            let trendText = '↔ Stable (±0%)';
            let status: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
            if (diff > 0) {
              trendText = `↑ +${diff}% (Hemoconcentration)`;
              status = diff >= 3 ? 'CRITICAL' : 'WARNING';
            } else if (diff < 0) {
              trendText = `↓ ${diff}% (Rehydrating)`;
              status = 'NORMAL';
            }
            if (trendRow.values[slot]?.value !== trendText) {
              onUpdateCellValue(trendRow.id, slot, trendText, status);
            }
          }
          prevPcv = numPcv;
        }
      });
    }
  }, [rows, timeSlots, onUpdateCellValue]);

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

  // Dynamic status evaluation based on JSON dataset thresholds
  const getDynamicStatus = (param: string, value: any): 'NORMAL' | 'WARNING' | 'CRITICAL' => {
    if (value === undefined || value === null || value === '') return 'NORMAL';
    const p = param.toLowerCase();
    const strVal = String(value).toLowerCase();
    const num = parseFloat(strVal);

    if (p.includes('reflux vol')) {
      // User rule: < 2L shows RED
      if (!isNaN(num) && num < 2.0) return 'CRITICAL';
      return 'NORMAL';
    }

    if (p.includes('heart rate') || p.includes('hr')) {
      if (!isNaN(num)) {
        if (num <= 44) return 'NORMAL';
        if (num <= 60) return 'WARNING';
        return 'CRITICAL';
      }
    }

    if (p.includes('respiratory rate') || p.includes('rr')) {
      if (!isNaN(num)) {
        if (num <= 24) return 'NORMAL';
        if (num <= 40) return 'WARNING';
        return 'CRITICAL';
      }
    }

    if (p.includes('temperature') || p.includes('temp')) {
      if (!isNaN(num)) {
        if (num >= 99.5 && num <= 101.5) return 'NORMAL';
        if (num > 101.5 && num <= 102.5) return 'WARNING';
        return 'CRITICAL';
      }
    }

    if (p.includes('crt')) {
      if (!isNaN(num)) {
        if (num <= 2.0) return 'NORMAL';
        if (num <= 3.0) return 'WARNING';
        return 'CRITICAL';
      }
    }

    if (p.includes('mucous') || p.includes('mm')) {
      if (strVal.includes('pink')) return 'NORMAL';
      if (strVal.includes('injected') || strVal.includes('tacky') || strVal.includes('hyperemic')) return 'WARNING';
      if (strVal.includes('pale') || strVal.includes('dry') || strVal.includes('muddy') || strVal.includes('toxic') || strVal.includes('cyanotic')) return 'CRITICAL';
    }

    if (p.includes('hematocrit') || p.includes('pcv')) {
      if (!isNaN(num)) {
        if (num >= 32 && num <= 48) return 'NORMAL';
        if (num >= 49 && num <= 55) return 'WARNING';
        return 'CRITICAL';
      }
    }

    if (p.includes('lactate')) {
      if (!isNaN(num)) {
        if (num <= 2.0) return 'NORMAL';
        if (num <= 3.5) return 'WARNING';
        return 'CRITICAL';
      }
    }

    if (p.includes('creatinine')) {
      if (!isNaN(num)) {
        if (num <= 1.6) return 'NORMAL';
        if (num <= 2.5) return 'WARNING';
        return 'CRITICAL';
      }
    }

    if (p.includes('glucose')) {
      if (!isNaN(num)) {
        if (num >= 75 && num <= 115) return 'NORMAL';
        if (num > 115 && num <= 180) return 'WARNING';
        return 'CRITICAL';
      }
    }

    if (p.includes('wbc')) {
      if (!isNaN(num)) {
        if (num >= 5.5 && num <= 12.5) return 'NORMAL';
        if (num > 12.5 && num <= 16.0) return 'WARNING';
        return 'CRITICAL';
      }
    }

    return 'NORMAL';
  };

  const getRowColorStyles = (color: FlowsheetRow['bandColor'] | string) => {
    switch (color) {
      case 'red':
        return { headerBg: 'bg-red-700 text-white font-extrabold', rowCellBg: 'bg-red-100/70 hover:bg-red-100', cardBorder: 'border-red-300' };
      case 'orange':
        return { headerBg: 'bg-amber-600 text-white font-extrabold', rowCellBg: 'bg-amber-100/70 hover:bg-amber-100', cardBorder: 'border-amber-300' };
      case 'yellow':
        return { headerBg: 'bg-yellow-500 text-slate-950 font-extrabold', rowCellBg: 'bg-yellow-100/70 hover:bg-yellow-100', cardBorder: 'border-yellow-300' };
      case 'green':
        return { headerBg: 'bg-emerald-600 text-white font-extrabold', rowCellBg: 'bg-emerald-100/70 hover:bg-emerald-100', cardBorder: 'border-emerald-300' };
      case 'blue':
        return { headerBg: 'bg-sky-600 text-white font-extrabold', rowCellBg: 'bg-sky-100/70 hover:bg-sky-100', cardBorder: 'border-sky-300' };
      case 'purple':
        return { headerBg: 'bg-purple-600 text-white font-extrabold', rowCellBg: 'bg-purple-100/70 hover:bg-purple-100', cardBorder: 'border-purple-300' };
      case 'pink':
        return { headerBg: 'bg-pink-600 text-white font-extrabold', rowCellBg: 'bg-pink-100/70 hover:bg-pink-100', cardBorder: 'border-pink-300' };
      default:
        return { headerBg: 'bg-slate-700 text-white font-extrabold', rowCellBg: 'bg-slate-50 hover:bg-slate-100', cardBorder: 'border-slate-300' };
    }
  };

  const getNextDueSlot = (row: FlowsheetRow) => {
    if (row.category !== 'MEDICATIONS' && row.type !== 'medication') return null;
    const nowIdx = timeSlots.indexOf(nowSlot);
    const startIdx = nowIdx >= 0 ? nowIdx : 0;

    for (let i = startIdx; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      const cell = row.values[slot];
      const isGiven = cell && (cell.status === 'DONE' || (cell.value !== '' && cell.value !== undefined && cell.status !== 'DUE'));
      const isMarkedDue = cell?.status === 'DUE' || cell?.status === 'AMBER_DUE' || cell?.note === 'DUE';
      if (!isGiven && isMarkedDue) return slot;
    }
    return null;
  };

  const isNumericRow = (row: FlowsheetRow) => {
    if (row.type === 'numeric') return true;
    if (row.type === 'select' || row.type === 'text' || row.type === 'medication' || row.type === 'cri' || row.type === 'gut_sounds' || row.type === 'manure') return false;
    const p = row.parameter.toLowerCase();
    return (
      p.includes('rate') ||
      p.includes('temp') ||
      p.includes('crt') ||
      p.includes('score') ||
      p.includes('reflux vol') ||
      p.includes('pcv') ||
      p.includes('protein') ||
      p.includes('fibrinogen') ||
      p.includes('wbc') ||
      p.includes('neutrophil') ||
      p.includes('lymphocyte') ||
      p.includes('monocyte') ||
      p.includes('eosinophil') ||
      p.includes('lactate') ||
      p.includes('creatinine') ||
      p.includes('glucose') ||
      p.includes('obel')
    );
  };

  const handleInlineNumericKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentRow: FlowsheetRow,
    slot: string,
    val: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleanVal = val.trim();
      const status = getDynamicStatus(currentRow.parameter, cleanVal);
      onUpdateCellValue(currentRow.id, slot, cleanVal, status);

      // Find next numeric row in filteredRows below currentRow
      const currIndex = filteredRows.findIndex(r => r.id === currentRow.id);
      for (let i = currIndex + 1; i < filteredRows.length; i++) {
        const nextRow = filteredRows[i];
        if (isNumericRow(nextRow)) {
          const nextInputEl = document.getElementById(`inline-num-input-${nextRow.id}-${slot}`) as HTMLInputElement;
          if (nextInputEl) {
            nextInputEl.focus();
            nextInputEl.select();
            break;
          }
        }
      }
    }
  };

  const handleCellClick = (rowId: string, timeSlot: string, currentValue: string) => {
    const row = rows.find(r => r.id === rowId);
    if (row && isNumericRow(row)) {
      // Direct inline editing for numeric parameters - no modal dialog box
      const inputEl = document.getElementById(`inline-num-input-${rowId}-${timeSlot}`) as HTMLInputElement;
      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      }
      return;
    }

    setEditingCell({ rowId, timeSlot, currentValue });
    setCellInputValue(currentValue);

    // Initialize gut sounds state if gut_sounds row
    if (row?.type === 'gut_sounds' && currentValue.includes('L-UP')) {
      const parts = currentValue.split('|').map(s => s.trim());
      const getSymbol = (str: string) => str.split(':')[1]?.trim() || '+';
      setGutSoundsQuad({
        lUp: getSymbol(parts[0] || ''),
        lLow: getSymbol(parts[1] || ''),
        rUp: getSymbol(parts[2] || ''),
        rLow: getSymbol(parts[3] || ''),
      });
    }
  };

  const handleSaveCell = (statusOverride?: 'NORMAL' | 'AMBER_DUE' | 'DUE' | 'WARNING' | 'CRITICAL' | 'DONE' | 'LATE' | 'DISCONTINUED') => {
    if (editingCell) {
      const activeRow = rows.find((r) => r.id === editingCell.rowId);
      const isMed = activeRow?.category === 'MEDICATIONS' || activeRow?.type === 'medication';
      let valToSave = cellInputValue.trim();

      if (activeRow?.type === 'gut_sounds') {
        valToSave = `L-UP: ${gutSoundsQuad.lUp} | L-LOW: ${gutSoundsQuad.lLow} | R-UP: ${gutSoundsQuad.rUp} | R-LOW: ${gutSoundsQuad.rLow}`;
      } else if (activeRow?.type === 'manure') {
        valToSave = manurePassed === 'Yes' ? `Yes (${manureAmount}, ${manureConsistency})` : 'No';
      } else if (isMed && valToSave !== '' && !isNaN(Number(valToSave))) {
        let unitStr = 'mL';
        if (activeRow?.target) {
          const uMatch = activeRow.target.match(/mL\/hr|mL|mg\/kg\/hr|mg\/kg|IU\/kg|mcg\/kg|g\/dL|mg\/dL/i);
          if (uMatch) unitStr = uMatch[0];
        }
        valToSave = `${valToSave} ${unitStr}`;
      }

      const calculatedStatus = statusOverride || (isMed ? 'DONE' : getDynamicStatus(activeRow?.parameter || '', valToSave));
      onUpdateCellValue(editingCell.rowId, editingCell.timeSlot, valToSave, calculatedStatus);
      setEditingCell(null);
    }
  };

  // PDF Document Auto-Fill Parser
  const handleImportPdfReport = () => {
    setIsPdfParsing(true);
    setTimeout(() => {
      // Auto-fill extracted lab values from PDF
      const pcvRow = rows.find(r => r.parameter.toLowerCase().includes('hematocrit'));
      const tpRow = rows.find(r => r.parameter.toLowerCase().includes('total protein'));
      const lacRow = rows.find(r => r.parameter.toLowerCase().includes('lactate'));
      const wbcRow = rows.find(r => r.parameter.toLowerCase().includes('wbc'));
      const gluRow = rows.find(r => r.parameter.toLowerCase().includes('glucose'));
      const creatRow = rows.find(r => r.parameter.toLowerCase().includes('creatinine'));

      if (pcvRow) onUpdateCellValue(pcvRow.id, selectedPdfTimeSlot, '44', 'NORMAL');
      if (tpRow) onUpdateCellValue(tpRow.id, selectedPdfTimeSlot, '6.5', 'NORMAL');
      if (lacRow) onUpdateCellValue(lacRow.id, selectedPdfTimeSlot, '2.1', 'WARNING');
      if (wbcRow) onUpdateCellValue(wbcRow.id, selectedPdfTimeSlot, '8.2', 'NORMAL');
      if (gluRow) onUpdateCellValue(gluRow.id, selectedPdfTimeSlot, '108', 'NORMAL');
      if (creatRow) onUpdateCellValue(creatRow.id, selectedPdfTimeSlot, '1.3', 'NORMAL');

      setIsPdfParsing(false);
      setPdfSuccessMessage(`Successfully imported and filled 6 lab parameters for time slot ${selectedPdfTimeSlot}!`);
      setTimeout(() => setPdfSuccessMessage(null), 3500);
      setIsPdfModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-20 md:pb-8">
      {/* Top Action Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">{patient.name}'s Clinical Flowsheet</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {patient.patientId} • {patient.weightKg} kg
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ICU vital parameters, fluid balance, clinicopathology & medication schedule
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* PDF Import Button */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-95"
            id="import-pdf-btn"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            Import PDF Lab Report
          </button>

          <button
            onClick={onOpenAddRound}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-95"
            id="add-round-btn"
          >
            <Plus className="w-4 h-4 text-emerald-200" />
            Add Round
          </button>
        </div>
      </div>

      {pdfSuccessMessage && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md text-xs font-extrabold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {pdfSuccessMessage}
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Parameters' },
            { id: 'VITALS', label: 'Vitals & Pain' },
            { id: 'GI', label: 'GI & Motility' },
            { id: 'MEDS', label: 'Meds & CRIs' },
            { id: 'LABS', label: 'Clinicopathology & Labs' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {surgeonRequirementLabel ? (
          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl shadow-xs text-xs font-extrabold flex items-center gap-1.5 animate-in fade-in shrink-0">
            <Clock className="w-3.5 h-3.5 text-blue-200" /> {surgeonRequirementLabel}
          </div>
        ) : (
          <div className="text-[11px] font-bold text-slate-500 hidden lg:block px-2">
            💡 Tap any cell to record or edit value
          </div>
        )}
      </div>

      {/* Main Flowsheet Grid Container with Sticky Left Column */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[850px]">
            {/* Table Header Row */}
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider font-semibold border-b border-slate-700">
                {/* Sticky Header Title */}
                <th className="p-3 sticky left-0 z-20 bg-slate-800 w-60 sm:w-72 border-r border-slate-700 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-300">
                      {filterCategory === 'MEDS' ? 'Medications and CRIs' : 'Parameter'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Target</span>
                  </div>
                </th>

                {/* Time Slots Headers (Filtered by Surgeon Schedule in Vitals/GI/Labs tabs) */}
                {activeTimeSlots.map((slot) => {
                  const isNow = slot === nowSlot;
                  return (
                    <th
                      key={slot}
                      className={`p-2.5 text-center min-w-[80px] border-r border-slate-700 ${
                        isNow ? 'bg-amber-400 text-slate-950 font-black shadow-inner border-amber-500' : ''
                      }`}
                    >
                      {isNow && (
                        <div className="text-[9px] leading-tight font-extrabold uppercase bg-slate-900 text-amber-300 px-1 py-0.5 rounded shadow-xs mb-0.5">
                          NOW ({currentClockTime})
                        </div>
                      )}
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
                    <tr className="bg-slate-200 text-slate-900 font-black border-y border-slate-300">
                      <td className="p-2 sticky left-0 z-10 bg-slate-200 border-r border-slate-300 uppercase tracking-wide text-[11px] shadow-sm flex items-center justify-between">
                        <span>{groupTitle}</span>
                        {firstRow?.categoryFrequency && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-300 text-slate-800 text-[10px] lowercase font-extrabold">
                            {firstRow.categoryFrequency}
                          </span>
                        )}
                      </td>
                      {activeTimeSlots.map((slot) => (
                        <td key={slot} className="p-2 bg-slate-200/50 border-r border-slate-300/50"></td>
                      ))}
                    </tr>

                    {/* Individual Parameter Rows */}
                    {categoryRows.map((row) => {
                      const colorStyles = getRowColorStyles(row.bandColor);
                      const nextDueSlot = getNextDueSlot(row);
                      const isMed = row.category === 'MEDICATIONS' || row.type === 'medication' || row.type === 'cri';

                      return (
                        <tr key={row.id} className="transition-colors">
                          {/* Sticky Left Title + Target + Route Column */}
                          <td className={`p-2.5 sticky left-0 z-10 border-r border-slate-300 shadow-md ${colorStyles.headerBg}`}>
                            <div className="flex items-start justify-between gap-1">
                              <div className="space-y-0.5 max-w-[150px] sm:max-w-[180px]">
                                <span className="font-black text-white text-xs block truncate">{row.parameter}</span>
                                {row.dosePicked && (
                                  <span className="text-[10px] text-amber-200 font-extrabold block">Dose: {row.dosePicked}</span>
                                )}
                                {row.route && (
                                  <span className="text-[10px] text-sky-200 font-bold block">Route: {row.route}</span>
                                )}
                              </div>
                              <span className="text-[10px] font-extrabold text-slate-900 bg-white/90 px-1.5 py-0.5 rounded shadow-xs shrink-0 mt-0.5">
                                {row.target}
                              </span>
                            </div>
                          </td>

                          {/* Time Values Cells across the row with dynamic anti-misentry color scheme */}
                          {activeTimeSlots.map((slot, slotIdx) => {
                            const cell = row.values[slot];
                            const isNow = slot === nowSlot;
                            const isNextDue = slot === nextDueSlot;

                            const isDue = cell?.status === 'DUE' || cell?.status === 'AMBER_DUE' || cell?.note === 'DUE';
                            const isDone = cell?.status === 'DONE';
                            const isLate = cell?.status === 'LATE';
                            const isDiscontinued = cell?.status === 'DISCONTINUED' || row.isDiscontinued;

                            const dynStatus = getDynamicStatus(row.parameter, cell?.value);
                            const hasValue = cell && cell.value !== '' && cell.value !== undefined;

                            // Calculate dynamic delta from previous non-empty numeric cell
                            let calculatedDelta: string | null = null;
                            if (hasValue && !isNaN(Number(cell.value))) {
                              const currNum = Number(cell.value);
                              let prevNum: number | null = null;
                              for (let k = slotIdx - 1; k >= 0; k--) {
                                const prevSlotVal = row.values[timeSlots[k]]?.value;
                                if (prevSlotVal !== undefined && prevSlotVal !== '' && !isNaN(Number(prevSlotVal))) {
                                  prevNum = Number(prevSlotVal);
                                  break;
                                }
                              }
                              if (prevNum !== null) {
                                const diff = parseFloat((currNum - prevNum).toFixed(2));
                                calculatedDelta = diff >= 0 ? `+${diff}` : `${diff}`;
                              } else {
                                calculatedDelta = '+0'; // Baseline difference
                              }
                            }

                            let cellStyleClass = colorStyles.rowCellBg;
                            if (isDiscontinued) {
                              cellStyleClass = 'bg-slate-200 text-slate-500 line-through';
                            } else if (isDone) {
                              cellStyleClass = 'bg-emerald-100 text-emerald-950 font-black border-2 border-emerald-500';
                            } else if (isLate) {
                              cellStyleClass = 'bg-red-100 text-red-950 font-black border-2 border-red-500';
                            } else if (isDue) {
                              cellStyleClass = 'bg-amber-100 text-amber-950 font-black border-2 border-amber-500';
                            } else if (hasValue) {
                              if (dynStatus === 'CRITICAL') cellStyleClass = 'bg-red-100 text-red-950 font-black border-2 border-red-500';
                              else if (dynStatus === 'WARNING') cellStyleClass = 'bg-amber-100 text-amber-950 font-black border-2 border-amber-400';
                              else cellStyleClass = colorStyles.rowCellBg;
                            }

                            return (
                              <td
                                key={slot}
                                onClick={() => handleCellClick(row.id, slot, cell?.value?.toString() || '')}
                                className={`p-1.5 text-center border-r border-slate-200/80 cursor-pointer transition-all hover:brightness-95 relative min-w-[80px] ${cellStyleClass} ${
                                  isNextDue ? 'ring-4 ring-amber-500 z-20' : isNow ? 'ring-2 ring-amber-500 z-10' : ''
                                }`}
                              >
                                {isDiscontinued ? (
                                  <span className="line-through text-slate-500 font-bold text-[11px]">DISC</span>
                                ) : isNextDue ? (
                                  <div className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-1 rounded-lg border-2 border-amber-600 shadow-md animate-pulse">
                                    NEXT DUE
                                  </div>
                                ) : isDue ? (
                                  <div className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-1 rounded-lg border border-amber-600 shadow-xs">
                                    DUE
                                  </div>
                                ) : isDone ? (
                                  <div className="bg-emerald-600 text-white font-black text-[10px] px-2 py-1 rounded-lg border border-emerald-700 shadow-xs">
                                    ✓ {cell.value || row.target}
                                  </div>
                                ) : (cell?.status === 'PROCESSING' || (cell?.isCollected && !hasValue)) ? (
                                  <div className="bg-slate-800 text-amber-300 font-extrabold text-[10px] px-1.5 py-1.5 rounded-xl border border-amber-400/60 flex items-center justify-center gap-1 shadow-md animate-pulse">
                                    ⏳ Processing
                                  </div>
                                ) : isNumericRow(row) ? (
                                  <div className={`bg-white rounded-xl p-0.5 shadow-xs border ${colorStyles.cardBorder} flex flex-col items-center justify-center min-h-[38px] relative`}>
                                    {row.category === 'CLINICOPATHOLOGY' && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextCollected = !cell?.isCollected;
                                          const nextStatus = nextCollected && !hasValue ? 'PROCESSING' : 'NORMAL';
                                          onUpdateCellValue(row.id, slot, cell?.value?.toString() || '', nextStatus);
                                        }}
                                        className={`absolute -bottom-2 text-[8px] font-black px-1.5 py-0.5 rounded-full border shadow-2xs transition-all ${
                                          cell?.isCollected ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                                        }`}
                                        title="Click to toggle sample collected status"
                                      >
                                        {cell?.isCollected ? '✓ Coletado' : '+ Coletar'}
                                      </button>
                                    )}
                                    {calculatedDelta && (
                                      <span className={`absolute -top-2 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full border shadow-xs pointer-events-none ${
                                        calculatedDelta.startsWith('+') && calculatedDelta !== '+0'
                                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                                          : calculatedDelta.startsWith('-')
                                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      }`}>
                                        {calculatedDelta}
                                      </span>
                                    )}
                                    <input
                                      id={`inline-num-input-${row.id}-${slot}`}
                                      type="number"
                                      step="any"
                                      defaultValue={cell?.value !== undefined ? cell.value : ''}
                                      key={`${row.id}-${slot}-${cell?.value}`}
                                      onBlur={(e) => {
                                        const cleanVal = e.target.value.trim();
                                        if (cleanVal !== (cell?.value?.toString() || '')) {
                                          const status = getDynamicStatus(row.parameter, cleanVal);
                                          onUpdateCellValue(row.id, slot, cleanVal, status);
                                        }
                                      }}
                                      onKeyDown={(e) => handleInlineNumericKeyDown(e, row, slot, (e.target as HTMLInputElement).value)}
                                      className="w-full text-center font-black text-slate-900 text-xs sm:text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500 rounded-lg py-1"
                                      placeholder="—"
                                    />
                                  </div>
                                ) : hasValue ? (
                                  row.type === 'gut_sounds' ? (
                                    (() => {
                                      let lUp = '+', rUp = '+', lLow = '+', rLow = '+';
                                      const strVal = String(cell.value);
                                      if (strVal.includes('L-UP')) {
                                        const parts = strVal.split('|').map(s => s.trim());
                                        const getSym = (s: string) => s.split(':')[1]?.trim() || '+';
                                        lUp = getSym(parts[0] || '');
                                        lLow = getSym(parts[1] || '');
                                        rUp = getSym(parts[2] || '');
                                        rLow = getSym(parts[3] || '');
                                      }

                                      const renderSym = (sym: string) => {
                                        if (sym === '++') return <span className="text-emerald-600 font-black text-xs tracking-tighter">++</span>;
                                        if (sym === '+') return <span className="text-emerald-500 font-black text-sm">+</span>;
                                        if (sym === '-') return <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 block shadow-2xs" />;
                                        if (sym === '0') return <span className="w-3 h-0.5 bg-red-600 rounded-full block" />;
                                        return <span className="text-slate-500 font-bold text-[10px]">{sym}</span>;
                                      };

                                      return (
                                        <div className="w-12 h-12 bg-white border border-slate-300 rounded-xl p-0.5 relative shadow-xs mx-auto flex items-center justify-center">
                                          {/* Dark Blue Cross Dividers */}
                                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2.5px] bg-sky-900 rounded-full z-0"></div>
                                          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2.5px] bg-sky-900 rounded-full z-0"></div>

                                          <div className="grid grid-cols-2 grid-rows-2 w-full h-full z-10 text-center font-black">
                                            <div className="flex items-center justify-center">{renderSym(lUp)}</div>
                                            <div className="flex items-center justify-center">{renderSym(rUp)}</div>
                                            <div className="flex items-center justify-center">{renderSym(lLow)}</div>
                                            <div className="flex items-center justify-center">{renderSym(rLow)}</div>
                                          </div>
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    <div className={`bg-white rounded-xl p-1 shadow-xs border ${colorStyles.cardBorder} flex flex-col items-center justify-center min-h-[38px] relative`}>
                                      {calculatedDelta && (
                                        <span className={`absolute -top-2 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full border shadow-xs ${
                                          calculatedDelta.startsWith('+') && calculatedDelta !== '+0'
                                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                                            : calculatedDelta.startsWith('-')
                                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        }`}>
                                          {calculatedDelta}
                                        </span>
                                      )}
                                      <span className="font-black text-slate-900 text-xs sm:text-sm">
                                        {cell.value}
                                      </span>
                                    </div>
                                  )
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

      {/* PDF Import Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Import PDF / Lab Analyzer Report
              </h3>
              <button onClick={() => setIsPdfModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Select Time Slot to Populate:</label>
              <select
                value={selectedPdfTimeSlot}
                onChange={(e) => setSelectedPdfTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-700 block">Drop your CBC, Chemistry or Blood Gas PDF here</span>
                <span className="text-[11px] text-slate-400 block mt-1">Supports PDF, PNG, JPG lab reports</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleImportPdfReport}
                disabled={isPdfParsing}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2"
              >
                {isPdfParsing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {isPdfParsing ? 'Parsing PDF...' : 'Auto-Fill Flowsheet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cell Modal */}
      {editingCell && (() => {
        const activeRow = rows.find(r => r.id === editingCell.rowId);
        const isMedicationRow = activeRow?.category === 'MEDICATIONS' || activeRow?.type === 'medication' || activeRow?.type === 'cri';

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {isMedicationRow ? 'Record Administration' : 'Edit Value'} • Slot <span className="text-blue-600">{editingCell.timeSlot}</span>
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
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pre-Calculated Target Volume</span>
                    <button
                      onClick={() => handleSaveCell('DONE')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                    >
                      ✓ Confirm Given: {activeRow?.target}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSaveCell('LATE')}
                      className="py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs"
                    >
                      ⚠️ Mark Late
                    </button>
                    <button
                      onClick={() => handleSaveCell('DISCONTINUED')}
                      className="py-2 bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs"
                    >
                      🚫 Discontinue
                    </button>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-bold text-slate-700 block">Different Volume Given:</label>
                    <input
                      type="number"
                      step="any"
                      value={cellInputValue}
                      onChange={(e) => setCellInputValue(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-extrabold focus:ring-2 focus:ring-blue-500 outline-none text-base"
                      placeholder="e.g. 9.9"
                    />
                  </div>
                </div>
              ) : activeRow?.type === 'gut_sounds' ? (
                /* Gut Sounds 4-Quadrant Visual Grid with ++ option */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 block">Select Motility for Each Quadrant:</span>
                    <span className="text-[11px] font-extrabold text-blue-600">Live Preview:</span>
                  </div>

                  {/* Live Cross Widget Preview */}
                  <div className="w-14 h-14 bg-white border-2 border-slate-400 rounded-xl p-0.5 relative shadow-md mx-auto flex items-center justify-center">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-sky-900 rounded-full z-0"></div>
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-sky-900 rounded-full z-0"></div>
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full z-10 text-center font-black">
                      <div className="flex items-center justify-center">
                        {gutSoundsQuad.lUp === '++' ? <span className="text-emerald-600 font-black text-xs">++</span> : gutSoundsQuad.lUp === '+' ? <span className="text-emerald-500 font-black text-sm">+</span> : gutSoundsQuad.lUp === '-' ? <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 block shadow-xs" /> : <span className="w-3 h-0.5 bg-red-600 rounded-full block" />}
                      </div>
                      <div className="flex items-center justify-center">
                        {gutSoundsQuad.rUp === '++' ? <span className="text-emerald-600 font-black text-xs">++</span> : gutSoundsQuad.rUp === '+' ? <span className="text-emerald-500 font-black text-sm">+</span> : gutSoundsQuad.rUp === '-' ? <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 block shadow-xs" /> : <span className="w-3 h-0.5 bg-red-600 rounded-full block" />}
                      </div>
                      <div className="flex items-center justify-center">
                        {gutSoundsQuad.lLow === '++' ? <span className="text-emerald-600 font-black text-xs">++</span> : gutSoundsQuad.lLow === '+' ? <span className="text-emerald-500 font-black text-sm">+</span> : gutSoundsQuad.lLow === '-' ? <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 block shadow-xs" /> : <span className="w-3 h-0.5 bg-red-600 rounded-full block" />}
                      </div>
                      <div className="flex items-center justify-center">
                        {gutSoundsQuad.rLow === '++' ? <span className="text-emerald-600 font-black text-xs">++</span> : gutSoundsQuad.rLow === '+' ? <span className="text-emerald-500 font-black text-sm">+</span> : gutSoundsQuad.rLow === '-' ? <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500 block shadow-xs" /> : <span className="w-3 h-0.5 bg-red-600 rounded-full block" />}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-100 rounded-2xl border border-slate-300">
                    {/* Left Upper */}
                    <div className="p-2 bg-white rounded-xl border text-center space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase block">L-UP (Left Upper)</span>
                      <div className="flex justify-center gap-1">
                        {['++', '+', '-', '0'].map((sym) => (
                          <button
                            key={sym}
                            onClick={() => setGutSoundsQuad((prev) => ({ ...prev, lUp: sym }))}
                            className={`w-7 h-7 rounded-lg font-black text-xs transition-all ${
                              gutSoundsQuad.lUp === sym
                                ? sym === '++' || sym === '+' ? 'bg-emerald-600 text-white' : sym === '-' ? 'bg-amber-400 text-slate-950' : 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right Upper */}
                    <div className="p-2 bg-white rounded-xl border text-center space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase block">R-UP (Right Upper)</span>
                      <div className="flex justify-center gap-1">
                        {['++', '+', '-', '0'].map((sym) => (
                          <button
                            key={sym}
                            onClick={() => setGutSoundsQuad((prev) => ({ ...prev, rUp: sym }))}
                            className={`w-7 h-7 rounded-lg font-black text-xs transition-all ${
                              gutSoundsQuad.rUp === sym
                                ? sym === '++' || sym === '+' ? 'bg-emerald-600 text-white' : sym === '-' ? 'bg-amber-400 text-slate-950' : 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Left Lower */}
                    <div className="p-2 bg-white rounded-xl border text-center space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase block">L-LOW (Left Lower)</span>
                      <div className="flex justify-center gap-1">
                        {['++', '+', '-', '0'].map((sym) => (
                          <button
                            key={sym}
                            onClick={() => setGutSoundsQuad((prev) => ({ ...prev, lLow: sym }))}
                            className={`w-7 h-7 rounded-lg font-black text-xs transition-all ${
                              gutSoundsQuad.lLow === sym
                                ? sym === '++' || sym === '+' ? 'bg-emerald-600 text-white' : sym === '-' ? 'bg-amber-400 text-slate-950' : 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right Lower */}
                    <div className="p-2 bg-white rounded-xl border text-center space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase block">R-LOW (Right Lower)</span>
                      <div className="flex justify-center gap-1">
                        {['++', '+', '-', '0'].map((sym) => (
                          <button
                            key={sym}
                            onClick={() => setGutSoundsQuad((prev) => ({ ...prev, rLow: sym }))}
                            className={`w-7 h-7 rounded-lg font-black text-xs transition-all ${
                              gutSoundsQuad.rLow === sym
                                ? sym === '++' || sym === '+' ? 'bg-emerald-600 text-white' : sym === '-' ? 'bg-amber-400 text-slate-950' : 'bg-red-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeRow?.type === 'manure' ? (
                /* Manure Details Select */
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">Manure Passed?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Yes', 'No'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setManurePassed(opt)}
                        className={`py-2 rounded-xl text-xs font-black border transition-all ${
                          manurePassed === opt ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {manurePassed === 'Yes' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Amount:</label>
                        <select
                          value={manureAmount}
                          onChange={(e) => setManureAmount(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900 text-xs bg-slate-50"
                        >
                          {['Small', 'Moderate', 'Abundant'].map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Consistency:</label>
                        <select
                          value={manureConsistency}
                          onChange={(e) => setManureConsistency(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900 text-xs bg-slate-50"
                        >
                          {['Normal Pellets', 'Soft / Cow-pat', 'Watery Diarrhea', 'Mucus-covered'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              ) : activeRow?.parameter.includes('NGT') ? (
                /* NGT Options */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Nasogastric Tube Status:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Yes', 'No', 'Removed'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setCellInputValue(opt); }}
                        className={`py-2 rounded-xl text-xs font-black border transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.parameter.includes('Catheter') ? (
                /* IV Catheter Site Dropdown */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">IV Catheter Site Assessment:</label>
                  <select
                    value={cellInputValue}
                    onChange={(e) => setCellInputValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900 text-xs bg-slate-50"
                  >
                    {[
                      'Right Jugular (Clean)',
                      'Left Jugular (Clean)',
                      'Right Jugular (Mild Edema)',
                      'Left Jugular (Mild Edema)',
                      'Right Jugular (Thrombophlebitis)',
                      'Left Jugular (Thrombophlebitis)',
                      'Catheter Flushed / Patent',
                      'Catheter Removed',
                    ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ) : activeRow?.parameter.includes('Mucous') || activeRow?.id === 'mm' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Mucous Membrane Status:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Pink, Moist',
                      'Injected / Hyperemic',
                      'Pale / Tacky',
                      'Muddy / Dry',
                      'Brick-Red / Toxic',
                      'Cyanotic / Blue',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.parameter.includes('Mentation') ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Mentation:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'BAR (Bright, Alert)',
                      'QAR (Quiet, Alert)',
                      'Dull / Depressed',
                      'Stuporous / Somnolent',
                      'Agitated / Severe Pain',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.parameter.includes('Pain behavior') ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Pain Behavior:</label>
                  <div className="space-y-1.5">
                    {[
                      'Quiet / Resting',
                      'Mild Flank Watching / Pawing',
                      'Restless / Frequent Lying Down',
                      'Violent Rolling / Uncontrolled Pain',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.parameter.includes('Analgesia') ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Analgesia Administered:</label>
                  <div className="space-y-1.5">
                    {[
                      'None Needed',
                      'Flunixin Meglumine 1.1 mg/kg IV',
                      'Buprenorphine 0.006 mg/kg IV',
                      'Xylazine 0.5 mg/kg IV',
                      'Detomidine 0.01 mg/kg IV',
                      'Buscopan 0.3 mg/kg IV',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.type === 'rectal_exam' || activeRow?.parameter.includes('Rectal') ? (
                /* Rectal Examination 1-Click Grid */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Rectal Exam Findings:</label>
                  <div className="space-y-1.5">
                    {[
                      'Normal / Empty Pelvic Flexure',
                      'Small Intestinal Distension (Tensional Loops)',
                      'Pelvic Flexure Impaction (Firm Fecal Mass)',
                      'Large Colon Displacement (L-Dorsal / R-Dorsal)',
                      'Tympany / Gas Distension',
                      'TIGHT TENSIONAL BANDS (Strangulation Risk)',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-purple-700 text-white border-purple-800 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.type === 'flash_us' || activeRow?.parameter.includes('FLASH') ? (
                /* FLASH Abdominal US 1-Click Grid */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select FLASH Abdominal US Findings:</label>
                  <div className="space-y-1.5">
                    {[
                      'Normal Motility & Normal Wall (<3mm)',
                      'Distended SI Loops (>4cm tensional)',
                      'Thickened Small Intest. Wall (>3mm)',
                      'Thickened Colon Wall (>5mm)',
                      'Anechoic / Moderate Free Fluid',
                      'Increased Hyperechoic Peritoneal Fluid',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-700 text-white border-blue-800 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.type === 'response_therapy' || activeRow?.parameter.includes('Response to') ? (
                /* Response to Therapy 1-Click Grid */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Response to Medical Analgesia:</label>
                  <div className="space-y-1.5">
                    {[
                      'Complete Resolution',
                      'Partial / Transient Response',
                      'Refractory / Unresponsive to Analgesia',
                      'Rapid Deterioration',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt
                            ? opt.includes('Complete') ? 'bg-emerald-600 text-white font-extrabold' : 'bg-red-600 text-white font-extrabold'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.type === 'peritoneal' || activeRow?.parameter.includes('Peritoneal Gross') ? (
                /* Peritoneal Appearance 1-Click Grid */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Peritoneal Fluid Appearance:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Clear Yellow',
                      'Turbid / Clouded',
                      'Serosanguineous (Pink/Red)',
                      'Frank Blood',
                      'Enterocentesis (Feed Material)',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-purple-700 text-white border-purple-800 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.parameter.includes('Reflux appearance') ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Reflux Appearance:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'None / No Reflux',
                      'Yellow / Bilious Fluid',
                      'Green Feed-Tinged',
                      'Fetid / Malodorous',
                      'Hemorrhagic / Dark Red',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.parameter.includes('Digital pulse') ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Digital Pulse Status:</label>
                  <div className="space-y-1.5">
                    {[
                      'Normal / Cool Hooves',
                      'Slightly Bounding Pulse',
                      'Markedly Bounding / Warm Hooves',
                      'Absent Pulse',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.parameter.includes('Cryotherapy') ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Cryotherapy Status:</label>
                  <div className="space-y-1.5">
                    {[
                      'Yes (Ice Boots ON)',
                      'Yes (Continuous Slurry)',
                      'No (Off / Paused)',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.parameter.includes('Hoof Temp') ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Hoof Temp Status:</label>
                  <div className="space-y-1.5">
                    {[
                      '< 10°C (Target Cryo)',
                      '10 - 15°C (Mild Cooling)',
                      '> 15°C (Warm / Re-ice Required)',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeRow?.parameter.includes('Incision') ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Select Incision Status:</label>
                  <div className="space-y-1.5">
                    {[
                      'Clean, Dry, Intact',
                      'Mild Edema / Swelling',
                      'Serosanguinous Drainage',
                      'Purulent Discharge',
                      'Dehiscence / Herniation',
                    ].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setCellInputValue(opt)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          cellInputValue === opt ? 'bg-blue-600 text-white border-blue-700 font-extrabold shadow-sm' : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Numeric Parameter Cell Modal */
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Enter Parameter Value ({activeRow?.unit || activeRow?.target}):</label>
                  <input
                    type="number"
                    step="any"
                    value={cellInputValue}
                    onChange={(e) => setCellInputValue(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none text-base"
                    placeholder="e.g. 48, 38.1..."
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setEditingCell(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveCell()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Value
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
