import React from 'react';
import { Patient } from '../types';
import { exportPatientDataToExcel, SHAREPOINT_BACKUP_URL } from '../utils/excelExporter';
import { Heart, Activity, AlertTriangle, Clock, Droplets, Thermometer, ShieldAlert, UserCheck, ChevronRight, Scale, Calendar, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface PatientDashboardProps {
  patient: Patient;
  patients: Patient[];
  onSelectPatient: (p: Patient) => void;
  onOpenNewPatientModal: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  patients,
  onSelectPatient,
  onOpenNewPatientModal,
}) => {
  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-20 md:pb-8">
      {/* Top Patient Management & Backup Header Bar */}
      <div className="flex items-center justify-between gap-3 bg-surface-container border border-surface-container-high p-4 rounded-2xl border border-surface-container-highest border border-surface-container-high">
        <div>
          <h2 className="text-base font-extrabold text-on-surface">ICU Patient Management</h2>
          <p className="text-xs text-outline-variant font-medium">Register equine patients, view clinical signalment & auto-sync backups</p>
        </div>

        <button
          onClick={onOpenNewPatientModal}
          className="px-4 py-2.5 bg-primary text-on-primary hover:opacity-90 text-on-surface text-xs font-black rounded-xl border border-surface-container-highest flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
        >
          <span>🐴 + Register New Patient</span>
        </button>
      </div>

      {/* Backup & Data Protection Banner */}
      <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-4 border border-surface-container-highest border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-on-surface flex items-center gap-2">
              SharePoint Backup & Auto-Sync (Every 6h)
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Auto 6h Active</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Full patient & flowsheet data is auto-backed up every 6 hours and stored in browser memory across reloads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportPatientDataToExcel(patient, patients, [], [])}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-on-surface text-xs font-extrabold rounded-xl border border-surface-container-highest flex items-center justify-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Generate Backup</span>
          </button>
          <a
            href={SHAREPOINT_BACKUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none px-3 py-2 bg-primary text-on-primary hover:bg-blue-500 text-on-surface text-xs font-extrabold rounded-xl border border-surface-container-highest flex items-center justify-center gap-1 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open SharePoint</span>
          </a>
        </div>
      </div>
      {/* Patient Header */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐴</span>
            <h1 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">
              Patient ID: {patient.patientId}
            </h1>
            <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
              patient.status === 'CRITICAL' ? 'bg-red-500 text-on-surface animate-pulse' : 'bg-emerald-500 text-on-surface'
            }`}>
              {patient.status}
            </span>
          </div>
          <p className="text-xs text-outline-variant mt-1 font-medium">
            {patient.name} • {patient.weightKg} kg • {patient.breed} ({patient.ageYears} yrs) • {patient.sex || 'Unknown sex'}
          </p>
          <div className="text-xs text-on-surface-variant mt-2 font-bold bg-surface-container-low p-2.5 rounded-xl border border-surface-container-highest">
            Diagnosis: <span className="text-blue-700">{patient.diagnosis}</span>
            {patient.surgicalProcedure && (
              <div className="text-[11px] text-outline-variant font-normal mt-0.5">
                Procedure: {patient.surgicalProcedure}
              </div>
            )}
            {patient.surgeryTime && (
              <div className="text-[11px] text-outline-variant font-normal mt-0.5">
                Surgery: {new Date(patient.surgeryTime).toLocaleString()}
              </div>
            )}
            {(patient.facility || patient.intern) && (
              <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                {patient.facility && <span>🏥 {patient.facility}</span>}
                {patient.intern && <span className="ml-2">👨‍⚕️ Intern: {patient.intern}</span>}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onOpenNewPatientModal}
          className="px-4 py-2 bg-surface-container-lowest hover:bg-slate-800 text-on-surface rounded-xl text-xs font-bold border border-surface-container-highest transition-all self-start sm:self-auto"
        >
          + Add New Patient
        </button>
      </div>

      {/* 4 Summary Cards Grid (Matches Screenshot 4/7 Exactly) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: On Ice Score (Blue) */}
        <div className="bg-sky-400 text-on-surface rounded-2xl p-4 sm:p-5 border border-surface-container-high space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-100">
            <Thermometer className="w-4 h-4" /> On Ice Score
          </div>
          <div className="text-xl sm:text-2xl font-black">{patient.onIceScore}</div>
        </div>

        {/* Card 2: Survival Prognosis (Green) */}
        <div className="bg-emerald-400 text-on-surface rounded-2xl p-4 sm:p-5 border border-surface-container-high space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-100">
            <Heart className="w-4 h-4" /> Survival Prognosis %
          </div>
          <div className="text-xl sm:text-2xl font-black">{patient.survivalPrognosisPercent}%</div>
        </div>

        {/* Card 3: Net Fluid Balance (Yellow) */}
        <div className="bg-amber-300 text-amber-950 rounded-2xl p-4 sm:p-5 border border-surface-container-high space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <Droplets className="w-4 h-4" /> Net Fluid Balance
          </div>
          <div className="text-xl sm:text-2xl font-black">
            {patient.netFluidBalanceLiters > 0 ? `+${patient.netFluidBalanceLiters}` : patient.netFluidBalanceLiters} Liters
          </div>
        </div>

        {/* Card 4: Next Due Round (Purple) */}
        <div className="bg-purple-300 text-purple-950 rounded-2xl p-4 sm:p-5 border border-surface-container-high space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-800">
            <Clock className="w-4 h-4" /> Next Due Round
          </div>
          <div className="text-xl sm:text-2xl font-black">{patient.nextDueRoundTime}</div>
        </div>
      </div>

      {/* Call Surgeon Triggers Section (Matches Screenshot 4/7) */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high space-y-3">
        <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
          🚩 Call Surgeon Triggers 🚩
        </h3>

        <div className="space-y-2 text-xs font-bold text-on-surface">
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center gap-3">
            <span className="text-base">🚩</span>
            <span>Heart Rate &gt; {patient.callSurgeonTriggers.heartRateBpm} bpm</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center gap-3">
            <span className="text-base">🚩</span>
            <span>Pain Score &gt; {patient.callSurgeonTriggers.painScore}</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center gap-3">
            <span className="text-base">🚩</span>
            <span>Reflux &gt; {patient.callSurgeonTriggers.refluxLiters}L</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center gap-3">
            <span className="text-base">🚩</span>
            <span>Respiratory Rate &gt; {patient.callSurgeonTriggers.respRateBpmin}/min</span>
          </div>
        </div>
      </div>

      {/* Current Surgeon Schedule */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high space-y-2">
        <h3 className="text-sm font-extrabold text-on-surface">Current Surgeon Monitoring Schedule</h3>
        <p className="text-xs font-bold text-on-surface">
          {patient.assignedSurgeon}, {patient.nextShiftSurgeon}
        </p>
      </div>

      {/* All ICU Patients Switcher Card */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high space-y-3">
        <h3 className="text-sm font-extrabold text-on-surface">Switch Patient</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPatient(p)}
              className={`p-3 rounded-xl border text-left transition-all ${
                p.id === patient.id
                  ? 'bg-primary-container text-on-primary-container border-blue-500 font-bold shadow-xs'
                  : 'bg-surface-container-low border-surface-container-highest hover:bg-surface-container-lowest'
              }`}
            >
              <div className="font-extrabold text-on-surface text-xs">{p.name}</div>
              <div className="text-[11px] text-outline-variant">{p.weightKg} kg • {p.status}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
