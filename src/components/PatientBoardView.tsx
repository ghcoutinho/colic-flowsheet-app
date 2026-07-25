import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';
import { HeartPulse, Plus, Copy, Trash2, Receipt, Clock, Thermometer, Droplets, Activity, Edit3 } from 'lucide-react';
import { BillingInvoiceModal } from './BillingInvoiceModal';

interface StatusSuggestionForBoard {
  patientId: string;
  status: PatientStatus;
  reason: string;
}

const STATUS_TITLES: Record<PatientStatus, string> = {
  CRITICAL: 'Critical Care',
  STABLE: 'Stable / Med Mgt',
  MONITORING: 'ICU Monitoring',
  RECOVERING: 'Recovering / Step Down',
  DISCHARGED: 'Discharged',
};

// Survival is "higher is better"; surgical indication is "higher is worse".
const survivalTone = (pct: number) =>
  pct >= 75 ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
    : pct >= 40 ? 'bg-tertiary-container text-on-tertiary-container border-amber-100 text-amber-800'
    : 'bg-error-container text-on-error-container border-red-100 text-red-800';

const surgicalTone = (pct: number) =>
  pct >= 60 ? 'bg-error-container text-on-error-container border-red-100 text-red-800'
    : pct >= 30 ? 'bg-tertiary-container text-on-tertiary-container border-amber-100 text-amber-800'
    : 'bg-emerald-50 border-emerald-100 text-emerald-800';

interface PatientBoardViewProps {
  patients: Patient[];
  activePatientId: string;
  onSelectPatient: (p: Patient) => void;
  onOpenNewPatientModal: () => void;
  onDuplicatePatient: (id: string) => void;
  onDeletePatient: (id: string) => void;
  onEditPatient?: (patient: Patient) => void;
  statusSuggestion?: StatusSuggestionForBoard | null;
  onAcceptSuggestion?: () => void;
  onDismissSuggestion?: () => void;
}

export const PatientBoardView: React.FC<PatientBoardViewProps> = ({
  patients,
  activePatientId,
  onSelectPatient,
  onOpenNewPatientModal,
  onDuplicatePatient,
  onDeletePatient,
  onEditPatient,
  statusSuggestion,
  onAcceptSuggestion,
  onDismissSuggestion,
}) => {
  const [billingPatientId, setBillingPatientId] = useState<string | null>(null);

  const billingPatient = patients.find(p => p.id === billingPatientId);

  // Group patients by status
  const columns: { status: PatientStatus; title: string; color: string; bg: string; border: string }[] = [
    { status: 'CRITICAL', title: 'Critical Care', color: 'text-red-700', bg: 'bg-error-container text-on-error-container', border: 'border-red-200' },
    { status: 'STABLE', title: 'Stable / Med Mgt', color: 'text-blue-700', bg: 'bg-primary-container text-on-primary-container', border: 'border-blue-200' },
    { status: 'MONITORING', title: 'ICU Monitoring', color: 'text-amber-700', bg: 'bg-tertiary-container text-on-tertiary-container', border: 'border-amber-200' },
    { status: 'RECOVERING', title: 'Recovering / Step Down', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ];

  return (
    <div className="space-y-6 h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-surface-container border border-surface-container-high p-4 rounded-2xl border border-surface-container-highest border border-surface-container-high shrink-0">
        <div>
          <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
            <Activity className="text-primary" /> Patient Management Board
          </h2>
          <p className="text-xs text-outline-variant font-medium">Kanban overview of all active ICU patients.</p>
        </div>
        <button
          onClick={onOpenNewPatientModal}
          className="px-4 py-2 bg-primary text-on-primary hover:opacity-90 text-on-surface rounded-xl text-xs font-black border border-surface-container-highest flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map(col => {
          const colPatients = patients.filter(p => p.status === col.status);
          
          return (
            <div key={col.status} className={`w-80 shrink-0 flex flex-col rounded-2xl border ${col.border} bg-surface-container-low/50 border border-surface-container-high overflow-hidden`}>
              <div className={`${col.bg} ${col.border} border-b p-3 flex justify-between items-center`}>
                <h3 className={`text-xs font-black uppercase tracking-wider ${col.color}`}>{col.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container border border-surface-container-high border border-surface-container-high ${col.color}`}>
                  {colPatients.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {colPatients.length === 0 ? (
                  <div className="text-center p-4 text-xs font-medium text-slate-400 border-2 border-dashed border-surface-container-highest rounded-xl">
                    No patients
                  </div>
                ) : (
                  colPatients.map(p => (
                    <div 
                      key={p.id} 
                      className={`bg-surface-container border border-surface-container-high rounded-xl p-3 border-2 border border-surface-container-high transition-all hover:border border-surface-container-highest ${
                        p.id === activePatientId ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-surface-container-highest hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div 
                          className="cursor-pointer" 
                          onClick={() => onSelectPatient(p)}
                        >
                          <h4 className="font-bold text-sm text-on-surface">{p.name}</h4>
                          <div className="text-[10px] text-outline-variant">{p.patientId} • {p.weightKg} kg</div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => onEditPatient?.(p)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Patient"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDuplicatePatient(p.id)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary-container text-on-primary-container rounded-lg transition-colors"
                            title="Duplicate Patient"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if(window.confirm(`Delete patient ${p.name}? This cannot be undone.`)) {
                                onDeletePatient(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-error hover:bg-error-container text-on-error-container rounded-lg transition-colors"
                            title="Delete Patient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-3" onClick={() => onSelectPatient(p)}>
                        <div className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-lowest p-1.5 rounded-lg border border-surface-container-highest">
                          {p.diagnosis}
                        </div>
                        <div className="text-[10px] text-outline flex justify-between">
                          <span>Surg: {p.assignedSurgeon}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-sky-50 rounded-lg p-1.5 flex items-center gap-1.5 border border-sky-100">
                          <Thermometer className="w-3 h-3 text-sky-600" />
                          <span className="text-[9px] font-bold text-sky-800 truncate">{p.onIceScore}</span>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-1.5 flex items-center gap-1.5 border border-purple-100">
                          <Clock className="w-3 h-3 text-purple-600" />
                          <span className="text-[9px] font-bold text-purple-800">Due: {p.nextDueRoundTime}</span>
                        </div>
                        <div className={`rounded-lg p-1.5 flex items-center gap-1.5 border ${survivalTone(p.survivalPrognosisPercent)}`}>
                          <HeartPulse className="w-3 h-3" />
                          <span className="text-[9px] font-bold">Surv {p.survivalPrognosisPercent}%</span>
                        </div>
                        <div className={`rounded-lg p-1.5 flex items-center gap-1.5 border ${surgicalTone(p.surgicalIndicationPercent)}`}>
                          <Activity className="w-3 h-3" />
                          <span className="text-[9px] font-bold">Surg {p.surgicalIndicationPercent}%</span>
                        </div>
                      </div>

                      {statusSuggestion?.patientId === p.id && (
                        <div className="mb-3 rounded-lg border border-amber-300 bg-tertiary-container text-on-tertiary-container p-2">
                          <div className="text-[10px] font-bold text-amber-900 leading-snug">
                            Suggested: {STATUS_TITLES[statusSuggestion.status]}
                          </div>
                          <div className="text-[9px] text-amber-800 mb-1.5">{statusSuggestion.reason}</div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onAcceptSuggestion?.()}
                              className="flex-1 text-[10px] font-bold text-on-surface bg-amber-600 hover:bg-amber-700 rounded-md py-1 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => onDismissSuggestion?.()}
                              className="flex-1 text-[10px] font-bold text-amber-800 bg-surface-container border border-surface-container-high border border-amber-300 hover:bg-amber-100 rounded-md py-1 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setBillingPatientId(p.id)}
                        className="w-full py-1.5 flex items-center justify-center gap-1.5 text-[10px] font-bold text-on-surface-variant bg-surface-container-lowest hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Receipt className="w-3 h-3" /> Issue Bill / Invoice
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Billing Modal */}
      {billingPatientId && billingPatient && (
        <BillingInvoiceModal
          patient={billingPatient}
          onClose={() => setBillingPatientId(null)}
        />
      )}
    </div>
  );
};
