import React, { useState } from 'react';
import { Patient, FlowsheetRow, DrugFormularyItem, SurgeonScheduleSettings } from './types';
import {
  INITIAL_PATIENTS,
  INITIAL_TIME_SLOTS,
  INITIAL_FLOWSHEET_ROWS,
  INITIAL_FORMULARY,
  DEFAULT_SURGEON_SETTINGS,
  STANDING_ORDERS,
  REFERENCE_RANGES,
} from './data/mockData';

import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { FlowsheetView } from './components/FlowsheetView';
import { PatientDashboard } from './components/PatientDashboard';
import { DoseCalculator } from './components/DoseCalculator';
import { PrognosisEngine } from './components/PrognosisEngine';
import { SurgeonSettingsView } from './components/SurgeonSettingsView';
import { StandingOrdersView } from './components/StandingOrdersView';
import { ReferenceRangesView } from './components/ReferenceRangesView';
import { ASOMetadataView } from './components/ASOMetadataView';
import { AddRoundModal } from './components/AddRoundModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('flowsheet');
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>('p1');
  const [timeSlots, setTimeSlots] = useState<string[]>(INITIAL_TIME_SLOTS);
  const [flowsheetRows, setFlowsheetRows] = useState<FlowsheetRow[]>(INITIAL_FLOWSHEET_ROWS);
  const [formulary, setFormulary] = useState<DrugFormularyItem[]>(INITIAL_FORMULARY);
  const [surgeonSettings, setSurgeonSettings] = useState<SurgeonScheduleSettings>(DEFAULT_SURGEON_SETTINGS);

  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Update cell value directly in flowsheet
  const handleUpdateCellValue = (rowId: string, timeSlot: string, newValue: string) => {
    setFlowsheetRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            values: {
              ...row.values,
              [timeSlot]: {
                value: newValue,
                status: 'NORMAL',
              },
            },
          };
        }
        return row;
      })
    );
    showToast(`Updated ${rowId} for time ${timeSlot}`);
  };

  // Add round values from modal
  const handleAddRoundValues = (timeSlot: string, roundData: { [rowId: string]: string }) => {
    setFlowsheetRows((prev) =>
      prev.map((row) => {
        if (roundData[row.id] !== undefined) {
          return {
            ...row,
            values: {
              ...row.values,
              [timeSlot]: {
                value: roundData[row.id],
                status: 'NORMAL',
              },
            },
          };
        }
        return row;
      })
    );
    showToast(`Added Vitals Round for ${timeSlot}`);
  };

  // Sync drug order directly from Dose Calculator to Flowsheet
  const handleSyncToFlowsheet = (drugName: string, doseText: string) => {
    const existingIndex = flowsheetRows.findIndex(
      (r) => r.parameter.toLowerCase().includes(drugName.toLowerCase())
    );

    if (existingIndex >= 0) {
      setFlowsheetRows((prev) =>
        prev.map((row, idx) => {
          if (idx === existingIndex) {
            return {
              ...row,
              values: {
                ...row.values,
                '14:00': { value: doseText, status: 'NORMAL' },
              },
            };
          }
          return row;
        })
      );
    } else {
      // Create new medication row
      const newRow: FlowsheetRow = {
        id: `med_${Date.now()}`,
        category: 'MEDICATIONS',
        categoryLabel: 'MEDICATIONS & CRIs',
        parameter: `${drugName}`,
        target: doseText,
        bandColor: 'pink',
        type: 'medication',
        values: {
          '14:00': { value: doseText, status: 'NORMAL' },
        },
      };
      setFlowsheetRows((prev) => [...prev, newRow]);
    }

    showToast(`Synced ${drugName} order to ${activePatient.name}'s Flowsheet!`);
  };

  // Update patient weight
  const handleUpdatePatientWeight = (newWeightKg: number) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, weightKg: newWeightKg } : p))
    );
    showToast(`Updated ${activePatient.name}'s weight to ${newWeightKg} kg`);
  };

  // Add new patient handler
  const handleOpenNewPatientModal = () => {
    const newName = prompt('Enter New ICU Horse Name:', 'Shadow');
    if (!newName) return;
    const newWeight = parseInt(prompt('Enter Weight in kg:', '500') || '500');

    const newP: Patient = {
      id: `p_${Date.now()}`,
      name: newName,
      patientId: `#Horse_${Math.floor(100 + Math.random() * 900)}`,
      weightKg: newWeight,
      ageYears: 7,
      breed: 'Warmblood Cross',
      diagnosis: 'Acute Colic / Monitoring',
      status: 'MONITORING',
      onIceScore: '1/5 (Low Risk)',
      survivalPrognosisPercent: 88,
      surgicalIndicationPercent: 20,
      netFluidBalanceLiters: 0.0,
      nextDueRoundTime: '15:00 PM',
      assignedSurgeon: 'Dr. A. Smith',
      nextShiftSurgeon: 'Dr. B. Jones',
      callSurgeonTriggers: {
        heartRateBpm: 80,
        painScore: 7,
        refluxLiters: 2.0,
        respRateBpmin: 30,
      },
    };

    setPatients((prev) => [...prev, newP]);
    setActivePatientId(newP.id);
    showToast(`Added New ICU Patient: ${newName}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePatient={activePatient}
        patients={patients}
        onSelectPatient={(p) => setActivePatientId(p.id)}
        onOpenNewPatientModal={handleOpenNewPatientModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {activeTab === 'flowsheet' && (
          <FlowsheetView
            rows={flowsheetRows}
            timeSlots={timeSlots}
            patient={activePatient}
            onOpenAddRound={() => setIsAddRoundOpen(true)}
            onUpdateCellValue={handleUpdateCellValue}
            onAddMedicationToFlowsheet={handleSyncToFlowsheet}
          />
        )}

        {activeTab === 'patients' && (
          <PatientDashboard
            patient={activePatient}
            patients={patients}
            onSelectPatient={(p) => setActivePatientId(p.id)}
            onOpenNewPatientModal={handleOpenNewPatientModal}
          />
        )}

        {activeTab === 'calculator' && (
          <DoseCalculator
            patient={activePatient}
            formulary={formulary}
            onSyncToFlowsheet={handleSyncToFlowsheet}
            onUpdatePatientWeight={handleUpdatePatientWeight}
          />
        )}

        {activeTab === 'prognosis' && <PrognosisEngine patient={activePatient} />}

        {activeTab === 'schedule' && (
          <SurgeonSettingsView
            patient={activePatient}
            settings={surgeonSettings}
            onSaveSettings={(s) => {
              setSurgeonSettings(s);
              showToast('Surgeon Monitoring Settings Saved!');
            }}
          />
        )}

        {activeTab === 'orders' && <StandingOrdersView orders={STANDING_ORDERS} />}

        {activeTab === 'references' && <ReferenceRangesView categories={REFERENCE_RANGES} />}

        {activeTab === 'aso' && <ASOMetadataView />}
      </main>

      {/* Mobile Navigation Bar */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Add Round Modal */}
      {isAddRoundOpen && (
        <AddRoundModal
          patient={activePatient}
          timeSlots={timeSlots}
          onClose={() => setIsAddRoundOpen(false)}
          onAddRoundValues={handleAddRoundValues}
        />
      )}
    </div>
  );
}
