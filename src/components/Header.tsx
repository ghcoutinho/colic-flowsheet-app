import React, { useState } from 'react';
import { Patient } from '../types';
import { SHAREPOINT_BACKUP_URL } from '../utils/excelExporter';
import { Activity, ShieldAlert, ChevronDown, Plus, Sparkles, BookOpen, Calculator, FileText, Settings, HeartPulse, PieChart, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activePatient: Patient;
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
  onExportExcelBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activePatient,
  patients,
  onSelectPatient,
  onOpenNewPatientModal,
  onExportExcelBackup,
}) => {
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = React.useState(false);

  const tabs = [
    { id: 'flowsheet', label: 'Flowsheet', icon: Activity },
    { id: 'patients', label: 'Patient Info', icon: HeartPulse },
    { id: 'calculator', label: 'Dose Calculator', icon: Calculator },
    { id: 'prognosis', label: 'Prognosis', icon: PieChart },
    { id: 'schedule', label: 'Surgeon Settings', icon: Settings },
    { id: 'orders', label: 'Standing Orders', icon: FileText },
    { id: 'references', label: 'Reference Ranges', icon: BookOpen },
    { id: 'aso', label: 'ASO / Media Kit', icon: Sparkles },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('flowsheet')}>
          <img src="icon.png" alt="CMT Cover Logo" className="w-10 h-10 rounded-xl object-cover border border-blue-400/40 shadow-sm hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-lg text-white">CMT</span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                ICU Flowsheet v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Colic Monitoring Tool • Post-Op Acute Abdomen</p>
          </div>
        </div>

        {/* Backup & Patient Actions */}
        <div className="flex items-center gap-2">
          {/* Excel Export Button */}
          <button
            onClick={onExportExcelBackup}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black shadow-md transition-all active:scale-95"
            title="Download Excel (.xlsx) backup file"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel Backup</span>
          </button>

          {/* SharePoint Backup Folder Direct Link */}
          <a
            href={SHAREPOINT_BACKUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-bold transition-all"
            title="Open UFMG SharePoint Backup Folder"
          >
            <ExternalLink className="w-3 h-3 text-blue-400" />
            <span>SharePoint</span>
          </a>

          {/* Patient Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors"
              id="patient-selector-btn"
            >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <div className="text-left">
              <span className="font-bold text-white block sm:inline">{activePatient.name}</span>
              <span className="text-slate-400 text-[11px] ml-1 hidden sm:inline">({activePatient.patientId})</span>
            </div>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
              activePatient.status === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {activePatient.status}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isPatientDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 divide-y divide-slate-700">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active ICU Patients
              </div>
              <div className="max-h-56 overflow-y-auto py-1">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPatient(p);
                      setIsPatientDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700/60 transition-colors ${
                      p.id === activePatient.id ? 'bg-slate-700/40 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{p.name} <span className="text-xs text-slate-400">({p.weightKg} kg)</span></div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{p.diagnosis}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.status === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setIsPatientDropdownOpen(false);
                  onOpenNewPatientModal();
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-blue-400 hover:bg-slate-700/60 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add New ICU Patient
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Primary Desktop Navigation Bar */}
      <nav className="hidden md:flex max-w-7xl mx-auto px-4 overflow-x-auto border-t border-slate-800/80 no-scrollbar">
        <div className="flex gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                id={`nav-tab-${tab.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
