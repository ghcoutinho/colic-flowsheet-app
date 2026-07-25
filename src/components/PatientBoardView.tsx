import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';
import { HeartPulse, Plus, Copy, Trash2, Receipt, Clock, Thermometer, Droplets, Activity, Edit3 } from 'lucide-react';
import { BillingInvoiceModal } from './BillingInvoiceModal';

interface PatientBoardViewProps {
  patients: Patient[];
  activePatientId: string;
  onSelectPatient: (p: Patient) => void;
  onOpenNewPatientModal: () => void;
  onDuplicatePatient: (id: string) => void;
  onDeletePatient: (id: string) => void;
  onEditPatient?: (patient: Patient) => void;
}

export const PatientBoardView: React.FC<PatientBoardViewProps> = ({
  patients,
  activePatientId,
  onSelectPatient,
  onOpenNewPatientModal,
  onDuplicatePatient,
  onDeletePatient,
  onEditPatient,
}) => {
  const [billingPatientId, setBillingPatientId] = useState<string | null>(null);

  const billingPatient = patients.find(p => p.id === billingPatientId);

  // Group patients by status
  const columns: { status: PatientStatus; title: string; color: string; bg: string; border: string }[] = [
    { status: 'CRITICAL', title: 'Critical Care', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    { status: 'STABLE', title: 'Stable / Med Mgt', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { status: 'MONITORING', title: 'ICU Monitoring', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { status: 'RECOVERING', title: 'Recovering / Step Down', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  ];

  return (
    <div className="space-y-6 h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="text-blue-600" /> Patient Management Board
          </h2>
          <p className="text-xs text-slate-500 font-medium">Kanban overview of all active ICU patients.</p>
        </div>
        <button
          onClick={onOpenNewPatientModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {columns.map(col => {
          const colPatients = patients.filter(p => p.status === col.status);
          
          return (
            <div key={col.status} className={`w-80 shrink-0 flex flex-col rounded-2xl border ${col.border} bg-slate-50/50 shadow-sm overflow-hidden`}>
              <div className={`${col.bg} ${col.border} border-b p-3 flex justify-between items-center`}>
                <h3 className={`text-xs font-black uppercase tracking-wider ${col.color}`}>{col.title}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white shadow-sm ${col.color}`}>
                  {colPatients.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {colPatients.length === 0 ? (
                  <div className="text-center p-4 text-xs font-medium text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    No patients
                  </div>
                ) : (
                  colPatients.map(p => (
                    <div 
                      key={p.id} 
                      className={`bg-white rounded-xl p-3 border-2 shadow-sm transition-all hover:shadow-md ${
                        p.id === activePatientId ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div 
                          className="cursor-pointer" 
                          onClick={() => onSelectPatient(p)}
                        >
                          <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                          <div className="text-[10px] text-slate-500">{p.patientId} • {p.weightKg} kg</div>
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
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Patient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-3" onClick={() => onSelectPatient(p)}>
                        <div className="text-[10px] font-semibold text-slate-700 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                          {p.diagnosis}
                        </div>
                        <div className="text-[10px] text-slate-600 flex justify-between">
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
                      </div>

                      <button
                        onClick={() => setBillingPatientId(p.id)}
                        className="w-full py-1.5 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
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
