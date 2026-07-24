import React, { useState } from 'react';
import { DrugFormularyItem, Patient } from '../types';
import { Search, Calculator, Check, Plus, RefreshCw, Sliders, ShieldCheck, Sparkles } from 'lucide-react';

interface DoseCalculatorProps {
  patient: Patient;
  formulary: DrugFormularyItem[];
  onSyncToFlowsheet: (drugName: string, calculatedDoseText: string) => void;
  onUpdatePatientWeight: (newWeightKg: number) => void;
}

export const DoseCalculator: React.FC<DoseCalculatorProps> = ({
  patient,
  formulary,
  onSyncToFlowsheet,
  onUpdatePatientWeight,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [syncedDrugId, setSyncedDrugId] = useState<string | null>(null);

  // Local state for interactive dose modifications per drug
  const [drugStates, setDrugStates] = useState<{
    [id: string]: { doseRate: number; concentration: number };
  }>(() => {
    const initial: { [id: string]: { doseRate: number; concentration: number } } = {};
    formulary.forEach((item) => {
      initial[item.id] = {
        doseRate: item.defaultDoseRate,
        concentration: item.defaultConcentration,
      };
    });
    return initial;
  });

  const categories = ['ALL', 'Antibiotics', 'Analgesics', 'Sedatives', 'CRIs', 'Prokinetics'];

  const filteredFormulary = formulary.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDoseRateChange = (drugId: string, delta: number) => {
    setDrugStates((prev) => {
      const current = prev[drugId] || { doseRate: 1, concentration: 1 };
      const nextRate = Math.max(0.001, parseFloat((current.doseRate + delta).toFixed(3)));
      return { ...prev, [drugId]: { ...current, doseRate: nextRate } };
    });
  };

  const handleConcentrationChange = (drugId: string, val: number) => {
    setDrugStates((prev) => {
      const current = prev[drugId] || { doseRate: 1, concentration: 1 };
      return { ...prev, [drugId]: { ...current, concentration: Math.max(0.001, val) } };
    });
  };

  const calculateVolume = (weightKg: number, doseRate: number, concentration: number) => {
    if (!concentration || concentration <= 0) return 0;
    const totalDose = weightKg * doseRate;
    const volume = totalDose / concentration;
    return parseFloat(volume.toFixed(2));
  };

  const handleSync = (item: DrugFormularyItem) => {
    const state = drugStates[item.id] || { doseRate: item.defaultDoseRate, concentration: item.defaultConcentration };
    const volume = calculateVolume(patient.weightKg, state.doseRate, state.concentration);
    const isCRI = item.category === 'CRIs' || item.defaultFrequency === 'CRI' || item.doseUnit.includes('/hr');
    const unitLabel = isCRI ? 'mL/hr' : 'mL';
    const doseText = `${volume} ${unitLabel} (${state.doseRate} ${item.doseUnit})`;

    onSyncToFlowsheet(item.name, doseText);
    setSyncedDrugId(item.id);
    setTimeout(() => setSyncedDrugId(null), 2500);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-20 md:pb-8">
      {/* Top Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Interactive Dose Calculator</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Weight-synced clinical math for equine antibiotics, analgesics, and CRIs
            </p>
          </div>

          {/* Patient Weight Sync Pill */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Weight</div>
              <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>Patient: {patient.name}</span>
                <span className="text-blue-400 font-black">{patient.weightKg} kg</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-500/30">Synced</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdatePatientWeight(Math.max(50, patient.weightKg - 10))}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm"
                title="Decrease Weight"
              >
                -
              </button>
              <button
                onClick={() => onUpdatePatientWeight(patient.weightKg + 10)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm"
                title="Increase Weight"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Search & Category Filters */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Formulary (Antibiotics, Analgesics, Sedatives, CRIs)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drug Formulary Calculator Cards */}
      <div className="space-y-4">
        {filteredFormulary.map((item) => {
          const state = drugStates[item.id] || {
            doseRate: item.defaultDoseRate,
            concentration: item.defaultConcentration,
          };
          const calcVol = calculateVolume(patient.weightKg, state.doseRate, state.concentration);
          const isSynced = syncedDrugId === item.id;

          return (
            <div
              key={item.id}
              className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md p-5 space-y-4 transition-all hover:border-slate-700"
            >
              {/* Drug Title Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{item.category}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-400 font-medium">{item.route}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">{item.name}</h3>
                </div>
                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700">
                  {item.defaultFrequency}
                </span>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dose Rate Slider / Stepper */}
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Dose Rate</span>
                    <span className="text-blue-400 font-extrabold text-sm">
                      {state.doseRate} {item.doseUnit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDoseRateChange(item.id, -0.1)}
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-white flex items-center justify-center text-sm"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={item.maxDoseRate !== undefined ? item.maxDoseRate : item.defaultDoseRate}
                      step={item.defaultDoseRate < 0.1 ? 0.001 : (item.defaultDoseRate <= 2 ? 0.1 : 1)}
                      value={state.doseRate}
                      onChange={(e) =>
                        setDrugStates((prev) => ({
                          ...prev,
                          [item.id]: { ...state, doseRate: parseFloat(e.target.value) },
                        }))
                      }
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <button
                      onClick={() => handleDoseRateChange(item.id, +0.1)}
                      className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 font-bold text-white flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Concentration Input */}
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Concentration</span>
                    <span className="text-slate-400 text-[11px]">{item.concentrationUnit}</span>
                  </div>
                  <input
                    type="number"
                    value={state.concentration}
                    onChange={(e) => handleConcentrationChange(item.id, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Prominent Calculated Output Box (Matches Screenshot) */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-center border border-blue-400/40 shadow-inner">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-100">Calculated Volume</div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {calcVol} {(item.category === 'CRIs' || item.defaultFrequency === 'CRI' || item.doseUnit.includes('/hr')) ? 'mL/hr' : 'mL'}
                </div>
                <div className="text-[11px] text-blue-200 mt-0.5">
                  ({patient.weightKg} kg × {state.doseRate} {item.doseUnit} ÷ {state.concentration} {item.concentrationUnit})
                </div>
              </div>

              {/* Sync to Flowsheet Button */}
              <button
                onClick={() => handleSync(item)}
                className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                  isSynced
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                id={`sync-btn-${item.id}`}
              >
                {isSynced ? (
                  <>
                    <Check className="w-5 h-5" /> Synced to Flowsheet!
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" /> Sync to Flowsheet
                  </>
                )}
              </button>

              {item.notes && (
                <div className="text-[11px] text-slate-400 italic bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                  💡 Clinical Note: {item.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
