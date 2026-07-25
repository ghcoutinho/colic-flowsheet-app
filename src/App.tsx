import React, { useState, useEffect } from 'react';
import { Patient, PatientStatus, FlowsheetRow, FlowsheetValue, DrugFormularyItem, SurgeonScheduleSettings } from './types';
import { evaluatePatient, STATUS_LABELS } from './utils/prognosis';
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
import { PatientBoardView } from './components/PatientBoardView';
import { DoseCalculator } from './components/DoseCalculator';
import { PrognosisEngine } from './components/PrognosisEngine';
import { SurgeonSettingsView } from './components/SurgeonSettingsView';
import { StandingOrdersView } from './components/StandingOrdersView';
import { ReferenceRangesView } from './components/ReferenceRangesView';
import { ASOMetadataView } from './components/ASOMetadataView';
import { AddRoundModal } from './components/AddRoundModal';
import { NewPatientModal } from './components/NewPatientModal';
import { exportPatientDataToExcel, SHAREPOINT_BACKUP_URL } from './utils/excelExporter';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('flowsheet');

  // Persistent localStorage state - no data lost on reload
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem('equine_colic_patients');
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [activePatientId, setActivePatientId] = useState<string>(() => {
    try {
      return localStorage.getItem('equine_colic_active_patient_id') || INITIAL_PATIENTS[0].id;
    } catch {
      return INITIAL_PATIENTS[0].id;
    }
  });

  const [timeSlots, setTimeSlots] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('equine_colic_time_slots');
      return saved ? JSON.parse(saved) : INITIAL_TIME_SLOTS;
    } catch {
      return INITIAL_TIME_SLOTS;
    }
  });

  const [flowsheetRows, setFlowsheetRows] = useState<FlowsheetRow[]>(() => {
    try {
      const saved = localStorage.getItem('equine_colic_flowsheet_rows');
      return saved ? JSON.parse(saved) : INITIAL_FLOWSHEET_ROWS;
    } catch {
      return INITIAL_FLOWSHEET_ROWS;
    }
  });

  const [formulary, setFormulary] = useState<DrugFormularyItem[]>(INITIAL_FORMULARY);

  const [surgeonSettings, setSurgeonSettings] = useState<SurgeonScheduleSettings>(() => {
    try {
      const saved = localStorage.getItem('equine_colic_surgeon_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SURGEON_SETTINGS;
    } catch {
      return DEFAULT_SURGEON_SETTINGS;
    }
  });

  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage on every state mutation
  useEffect(() => {
    localStorage.setItem('equine_colic_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('equine_colic_active_patient_id', activePatientId);
  }, [activePatientId]);

  useEffect(() => {
    localStorage.setItem('equine_colic_time_slots', JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
    localStorage.setItem('equine_colic_flowsheet_rows', JSON.stringify(flowsheetRows));
  }, [flowsheetRows]);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---- Live prognosis + triage suggestion -------------------------------
  // Statuses the clinician has explicitly dismissed, so we stop re-proposing
  // the same move on every keystroke. Keyed by patient id.
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Record<string, PatientStatus>>({});

  const { prognosis: livePrognosis, suggestion: liveSuggestion } = evaluatePatient(
    flowsheetRows,
    timeSlots,
    activePatient?.callSurgeonTriggers,
  );

  // Keep the stored percentages in step with what has been charted, so the
  // board card, the dashboard and the prognosis screen all agree.
  useEffect(() => {
    if (!activePatient) return;
    const survival = Math.round(livePrognosis.survivalPercent);
    const surgical = Math.round(livePrognosis.surgicalPercent);
    if (
      activePatient.survivalPrognosisPercent === survival &&
      activePatient.surgicalIndicationPercent === surgical
    ) return;
    setPatients(prev => prev.map(p =>
      p.id === activePatient.id
        ? { ...p, survivalPrognosisPercent: survival, surgicalIndicationPercent: surgical }
        : p,
    ));
  }, [activePatient?.id, livePrognosis.survivalPercent, livePrognosis.surgicalPercent]);

  // Only surface a move when it differs from the current column and has not
  // already been waved off. The clinician decides; nothing moves on its own.
  const statusSuggestion =
    activePatient &&
    liveSuggestion.status !== activePatient.status &&
    dismissedSuggestions[activePatient.id] !== liveSuggestion.status
      ? { patientId: activePatient.id, ...liveSuggestion }
      : null;

  const handleAcceptSuggestion = () => {
    if (!statusSuggestion) return;
    setPatients(prev => prev.map(p =>
      p.id === statusSuggestion.patientId ? { ...p, status: statusSuggestion.status } : p,
    ));
    showToast(`Moved to ${STATUS_LABELS[statusSuggestion.status]}`);
  };

  const handleDismissSuggestion = () => {
    if (!statusSuggestion) return;
    setDismissedSuggestions(prev => ({ ...prev, [statusSuggestion.patientId]: statusSuggestion.status }));
  };

  // Automatic 6-hour scheduled backup timer
  useEffect(() => {
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    const backupTimer = setInterval(() => {
      exportPatientDataToExcel(activePatient, patients, flowsheetRows, timeSlots);
      showToast('⏰ Scheduled 6-Hour Auto-Backup Generated! Click top banner to upload to SharePoint.');
    }, SIX_HOURS_MS);

    return () => clearInterval(backupTimer);
  }, [activePatient, patients, flowsheetRows, timeSlots]);

  const handleExportExcelBackup = () => {
    exportPatientDataToExcel(activePatient, patients, flowsheetRows, timeSlots);
    showToast(`Excel backup downloaded! Click top banner to upload to SharePoint.`);
  };

  // Behavioral Rule 1: Auto-reset flowsheet & next full hour column alignment on new patient save
  const handleSavePatient = (newP: Patient) => {
    if (editingPatient) {
      setPatients(prev => prev.map(pt => pt.id === newP.id ? newP : pt));
      setEditingPatient(null);
      setIsNewPatientModalOpen(false);
      showToast(`Updated ${newP.name}!`);
      return;
    }

    const now = new Date();
    let nextFullHour = now.getHours() + (now.getMinutes() > 0 ? 1 : 0);
    if (nextFullHour >= 24) nextFullHour = 0;

    // Generate 10 consecutive hourly time slots starting at next full hour
    const newSlots: string[] = [];
    for (let i = 0; i < 10; i++) {
      const h = (nextFullHour + i) % 24;
      newSlots.push(`${String(h).padStart(2, '0')}:00`);
    }

    // Reset flowsheet rows completely for the new patient
    const resetRows: FlowsheetRow[] = INITIAL_FLOWSHEET_ROWS.map((r) => ({
      ...r,
      values: {}, // Completely fresh empty values grid
    }));

    // If initial baseline rectal exam was recorded, populate first slot
    if (newP.rectalExamBaseline) {
      const rectalRow = resetRows.find((r) => r.id === 'rectal_exam');
      if (rectalRow) {
        rectalRow.values[newSlots[0]] = {
          value: newP.rectalExamBaseline,
          status: 'NORMAL',
        };
      }
    }

    setPatients((prev) => [newP, ...prev]);
    setActivePatientId(newP.id);
    setTimeSlots(newSlots);
    setFlowsheetRows(resetRows);
    setIsNewPatientModalOpen(false);
    setEditingPatient(null);

    showToast(`Registered ${newP.name}! Flowsheet reset starting at ${newSlots[0]}`);
  };

  const handleDeletePatient = (id: string) => {
    if (patients.length <= 1) {
      showToast("Cannot delete the last patient.");
      return;
    }
    const updated = patients.filter(p => p.id !== id);
    setPatients(updated);
    if (activePatientId === id) {
      setActivePatientId(updated[0].id);
    }
    showToast("Patient deleted successfully.");
  };

  const handleDuplicatePatient = (id: string) => {
    const patientToCopy = patients.find(p => p.id === id);
    if (!patientToCopy) return;

    const newId = `p_${Date.now()}`;
    const duplicate: Patient = {
      ...patientToCopy,
      id: newId,
      name: `${patientToCopy.name} (Copy)`,
      patientId: `${patientToCopy.patientId}-C`,
    };
    
    setPatients(prev => [duplicate, ...prev]);
    showToast(`Patient duplicated: ${duplicate.name}`);
  };

  // Update cell value directly in flowsheet
  const handleUpdateCellValue = (
    rowId: string,
    timeSlot: string,
    newValue: string,
    status?: FlowsheetValue['status']
  ) => {
    setFlowsheetRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const currentCell = row.values[timeSlot];
          return {
            ...row,
            values: {
              ...row.values,
              [timeSlot]: {
                ...currentCell,
                value: newValue,
                status: status || currentCell?.status || 'NORMAL',
              },
            },
          };
        }
        return row;
      })
    );
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

  // Helper to project scheduled timepoints for a drug starting from current hour
  const getScheduledDrugValues = (doseText: string, frequencyStr: string, slots: string[]) => {
    const d = new Date();
    const currentHour = d.getHours();
    
    // Parse frequency hours
    let freqHours = 24;
    const match = (frequencyStr || '').match(/\d+/);
    if (match) {
      freqHours = parseInt(match[0], 10);
    } else if (frequencyStr === 'CRI') {
      freqHours = 1; // CRI is continuous across all slots
    }

    // Generate scheduled clock hours across 48h horizon
    const scheduledHours: number[] = [];
    for (let h = currentHour; h < currentHour + 48; h += freqHours) {
      scheduledHours.push(h % 24);
    }

    const values: Record<string, any> = {};
    slots.forEach((slot) => {
      const slotHour = parseInt((slot || '').split(':')[0], 10);
      if (!isNaN(slotHour) && scheduledHours.includes(slotHour)) {
        values[slot] = {
          value: '',
          status: 'DUE',
          note: 'DUE',
        };
      }
    });
    return values;
  };

  // Sync drug order directly from Dose Calculator to Flowsheet
  const handleSyncToFlowsheet = (drugName: string, doseText: string) => {
    const existingIndex = flowsheetRows.findIndex(
      (r) => r.parameter.toLowerCase().includes(drugName.toLowerCase())
    );

    // Extract frequency from formulary or default to q6h
    const formularyItem = formulary.find(f => f.name.toLowerCase().includes(drugName.toLowerCase()));
    const freq = formularyItem?.defaultFrequency || 'q6h';
    const scheduledValues = getScheduledDrugValues(doseText, freq, timeSlots);

    if (existingIndex >= 0) {
      setFlowsheetRows((prev) =>
        prev.map((row, idx) => {
          if (idx === existingIndex) {
            return {
              ...row,
              target: doseText,
              drugCategory: formularyItem?.category,
              values: {
                ...row.values,
                ...scheduledValues,
              },
            };
          }
          return row;
        })
      );
    } else {
      // Create new medication row with scheduled due timepoints
      const newRow: FlowsheetRow = {
        id: `med_${Date.now()}`,
        category: 'MEDICATIONS',
        categoryLabel: 'MEDICATIONS & CRIs',
        parameter: `${drugName}`,
        target: doseText,
        drugCategory: formularyItem?.category,
        bandColor: 'pink',
        type: 'medication',
        values: scheduledValues,
      };
      setFlowsheetRows((prev) => [...prev, newRow]);
    }

    showToast(`Scheduled ${drugName} (${freq}) to ${activePatient.name}'s Flowsheet!`);
  };

  // Update patient weight
  const handleUpdatePatientWeight = (newWeightKg: number) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === activePatient.id ? { ...p, weightKg: newWeightKg } : p))
    );
    showToast(`Updated ${activePatient.name}'s weight to ${newWeightKg} kg`);
  };

  // Open the full New Patient Registration Modal
  const handleOpenNewPatientModal = () => {
    setEditingPatient(null);
    setIsNewPatientModalOpen(true);
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
        onExportExcelBackup={handleExportExcelBackup}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {activeTab === 'flowsheet' && (
          <FlowsheetView
            rows={flowsheetRows}
            timeSlots={timeSlots}
            patient={activePatient}
            surgeonSettings={surgeonSettings}
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

        {activeTab === 'board' && (
          <PatientBoardView
            patients={patients}
            activePatientId={activePatientId}
            onSelectPatient={(p) => {
              setActivePatientId(p.id);
              setActiveTab('flowsheet');
            }}
            onDeletePatient={handleDeletePatient}
            onDuplicatePatient={handleDuplicatePatient}
            onOpenNewPatientModal={handleOpenNewPatientModal}
            onEditPatient={(p) => {
              setEditingPatient(p);
              setIsNewPatientModalOpen(true);
            }}
            statusSuggestion={statusSuggestion}
            onAcceptSuggestion={handleAcceptSuggestion}
            onDismissSuggestion={handleDismissSuggestion}
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

        {activeTab === 'prognosis' && (
          <PrognosisEngine
            patient={activePatient}
            rows={flowsheetRows}
            timeSlots={timeSlots}
          />
        )}

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

      {/* New Patient Registration Modal */}
      {isNewPatientModalOpen && (
        <NewPatientModal 
          onClose={() => {
            setIsNewPatientModalOpen(false);
            setEditingPatient(null);
          }}
          onSavePatient={handleSavePatient}
          initialPatient={editingPatient}
        />
      )}
    </div>
  );
}
