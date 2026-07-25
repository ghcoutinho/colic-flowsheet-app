import React, { useState } from 'react';
import { Patient } from '../types';
import { UserPlus, X, ShieldAlert, Heart, Activity, FileText, Scale, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { ComboboxWithAdd } from './ComboboxWithAdd';

interface NewPatientModalProps {
  onClose: () => void;
  onSavePatient: (patient: Patient) => void;
  initialPatient?: Patient | null;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ onClose, onSavePatient, initialPatient }) => {
  const [formData, setFormData] = useState<Partial<Patient>>(initialPatient || {
    name: '',
    patientId: `#EQU-${Math.floor(1000 + Math.random() * 9000)}`,
    weightKg: 500,
    ageYears: 8,
    breed: 'Thoroughbred',
    sex: 'Gelding',
    cribBiter: false,
    lastFoalingDate: '',
    previousAbdominalSurgery: 'No',
    recurrentColicHistory: 'No',
    tetanusVaccinationDate: 'Up to Date',
    bodyConditionScore: 5,
    preAdmissionAnalgesia: 'None',
    recentDeworming: 'Up to Date',
    rectalExamBaseline: 'Normal / Empty Pelvic Flexure',
    ownerEmergencyContact: '',
    referringVetContact: '',
    surgeryConsentStatus: 'Full Surgical Intervention Agreed',
    diagnosis: 'Acute Abdominal Pain (Colic)',
    surgicalProcedure: 'Pre-op / Medical Evaluation',
    status: 'CRITICAL',
    surgeryTime: '',
    assignedSurgeon: 'Dr. Gustavo Coutinho',
    nextShiftSurgeon: 'Dr. On Call',
    intern: '',
    facility: 'UFMG Veterinary Hospital',
    callSurgeonTriggers: {
      heartRateBpm: 60,
      painScore: 2,
      refluxLiters: 2.0,
      respRateBpmin: 24,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.weightKg) {
      alert('Please fill out the horse name and body weight!');
      return;
    }

    const newPatient: Patient = {
      ...initialPatient,
      id: initialPatient ? initialPatient.id : `p_${Date.now()}`,
      name: formData.name || 'Unnamed Horse',
      patientId: formData.patientId || `#EQU-${Date.now()}`,
      weightKg: Number(formData.weightKg) || 500,
      ageYears: Number(formData.ageYears) || 8,
      breed: formData.breed || 'Thoroughbred',
      sex: formData.sex || 'Gelding',
      cribBiter: formData.cribBiter || false,
      lastFoalingDate: formData.lastFoalingDate,
      previousAbdominalSurgery: formData.previousAbdominalSurgery,
      recurrentColicHistory: formData.recurrentColicHistory,
      tetanusVaccinationDate: formData.tetanusVaccinationDate,
      bodyConditionScore: Number(formData.bodyConditionScore) || 5,
      preAdmissionAnalgesia: formData.preAdmissionAnalgesia,
      recentDeworming: formData.recentDeworming,
      rectalExamBaseline: formData.rectalExamBaseline,
      ownerEmergencyContact: formData.ownerEmergencyContact,
      referringVetContact: formData.referringVetContact,
      surgeryConsentStatus: formData.surgeryConsentStatus,
      diagnosis: formData.diagnosis || 'Colic',
      surgicalProcedure: formData.surgicalProcedure,
      status: formData.status || 'CRITICAL',
      onIceScore: '1/5 (Low Risk)',
      survivalPrognosisPercent: 88,
      surgicalIndicationPercent: 20,
      netFluidBalanceLiters: 0,
      nextDueRoundTime: 'NOW',
      surgeryTime: formData.surgeryTime,
      assignedSurgeon: formData.assignedSurgeon || 'Dr. Attending',
      nextShiftSurgeon: formData.nextShiftSurgeon || 'Dr. On-Call',
      intern: formData.intern,
      facility: formData.facility || 'UFMG Veterinary Hospital',
      callSurgeonTriggers: formData.callSurgeonTriggers || {
        heartRateBpm: 60,
        painScore: 2,
        refluxLiters: 2.0,
        respRateBpmin: 24,
      },
    };

    onSavePatient(newPatient);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" /> {initialPatient ? 'Edit Patient' : 'New Patient Registration & Admission'}
            </h2>
            <p className="text-xs text-slate-500">Comprehensive clinical signalment, baseline vitals & consent parameters</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Basic Signalment */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-blue-700 uppercase tracking-wider bg-blue-50 p-2 rounded-lg flex items-center gap-1.5">
              🐴 1. Equine Signalment & Identification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1">Horse Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  placeholder="e.g. Thunder Star"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Patient ID / Medical Record #</label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Body Weight (kg) *</label>
                <input
                  type="number"
                  required
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  placeholder="480"
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Sex / Reproductive Status"
                  value={formData.sex || ''}
                  onChange={(val) => setFormData({ ...formData, sex: val as any })}
                  options={[
                    'Gelding',
                    'Stallion',
                    'Mare',
                  ]}
                  placeholder="Select sex..."
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={formData.ageYears}
                  onChange={(e) => setFormData({ ...formData, ageYears: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Breed"
                  value={formData.breed || ''}
                  onChange={(val) => setFormData({ ...formData, breed: val })}
                  options={[
                    'Thoroughbred', 'Quarter Horse', 'Arabian', 'Standardbred', 'Appaloosa', 'Paint Horse', 'Pinto',
                    'Warmblood', 'Hanoverian', 'KWPN (Dutch Warmblood)', 'Oldenburg', 'Trakehner', 'Holsteiner', 'Westphalian', 'Selle Français', 'Lusitano', 'PRE (Pura Raza Española)',
                    'Belgian Draft', 'Clydesdale', 'Shire', 'Percheron',
                    'Tennessee Walking Horse', 'Missouri Fox Trotter', 'Paso Fino', 'Mangalarga Marchador', 'Campolina', 'Crioulo', 'Pantaneiro', 'Quarto de Milha (BRA)',
                    'Welsh Pony', 'Shetland Pony', 'Connemara Pony', 'Haflinger',
                    'Crossbred / Mixed', 'Grade Horse'
                  ]}
                  placeholder="Select or type breed..."
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Body Condition Score (BCS 1-9)</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={formData.bodyConditionScore}
                  onChange={(e) => setFormData({ ...formData, bodyConditionScore: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                />
              </div>

              {formData.sex === 'Mare' && (
                <div>
                  <label className="text-slate-700 block mb-1">Last Foaling Date (LCV Window)</label>
                  <input
                    type="date"
                    value={formData.lastFoalingDate}
                    onChange={(e) => setFormData({ ...formData, lastFoalingDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Clinical Risk Factors & History */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider bg-amber-50 p-2 rounded-lg flex items-center gap-1.5">
              ⚠️ 2. Risk Factors & History (EPI / Adhesions / EGUS)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
              <div>
                <ComboboxWithAdd
                  label="Crib-Biter / Aerophagia? (EFE Risk)"
                  value={formData.cribBiter ? 'Yes' : 'No'}
                  onChange={(val) => setFormData({ ...formData, cribBiter: val === 'Yes' })}
                  options={['No', 'Yes']}
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Previous Abdominal Surgery?"
                  value={formData.previousAbdominalSurgery || ''}
                  onChange={(val) => setFormData({ ...formData, previousAbdominalSurgery: val })}
                  options={['No', 'Yes', 'Unknown']}
                  placeholder="e.g. No, or '2024 Celiotomy'"
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Recurrent Colic History?"
                  value={formData.recurrentColicHistory || ''}
                  onChange={(val) => setFormData({ ...formData, recurrentColicHistory: val })}
                  options={['No', 'Yes (Mild)', 'Yes (Severe)', 'Unknown']}
                  placeholder="e.g. No, or 3 episodes in 6 mo"
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Tetanus Vaccination Status"
                  value={formData.tetanusVaccinationDate || ''}
                  onChange={(val) => setFormData({ ...formData, tetanusVaccinationDate: val })}
                  options={['Up to Date', 'Unknown', 'Overdue', 'Unvaccinated']}
                  placeholder="e.g. Up to date (< 6 mo)"
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Pre-Admission Analgesia Given"
                  value={formData.preAdmissionAnalgesia || ''}
                  onChange={(val) => setFormData({ ...formData, preAdmissionAnalgesia: val })}
                  options={['None', 'Flunixin meglumine', 'Xylazine', 'Detomidine', 'Dipyrone', 'Buscopan']}
                  placeholder="e.g. Flunixin 1.1 mg/kg 2h ago"
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Recent Deworming History"
                  value={formData.recentDeworming || ''}
                  onChange={(val) => setFormData({ ...formData, recentDeworming: val })}
                  options={['Up to Date', 'Unknown', 'Overdue', 'Ivermectin', 'Moxidectin']}
                  placeholder="e.g. Ivermectin 30 days ago"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Rectal Exam & Diagnosis */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-emerald-50 p-2 rounded-lg flex items-center gap-1.5">
              🩺 3. Baseline Diagnostics & Presenting Condition
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              <div>
                <ComboboxWithAdd
                  label="Admission Rectal Exam Findings"
                  value={formData.rectalExamBaseline || ''}
                  onChange={(val) => setFormData({ ...formData, rectalExamBaseline: val })}
                  options={['Normal / Empty Pelvic Flexure', 'Pelvic flexure impaction', 'SI distension', 'Large colon gas distension', 'Right dorsal displacement', 'Nephrosplenic entrapment']}
                  placeholder="e.g. Pelvic flexure impaction / SI distension"
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Primary Diagnosis / Complaint"
                  value={formData.diagnosis || ''}
                  onChange={(val) => setFormData({ ...formData, diagnosis: val })}
                  options={[
                    'Large Colon Volvulus',
                    'Large Colon Impaction',
                    'Small Intestine Strangulation',
                    'Epiploic Foramen Entrapment',
                    'Nephrosplenic Entrapment',
                    'Right Dorsal Displacement',
                    'Ileal Impaction',
                    'Spasmodic Colic',
                    'Gastric Ulcers (EGUS)',
                    'Enteritis',
                    'Colitis',
                    'Peritonitis'
                  ]}
                  placeholder="e.g. Large Colon Volvulus"
                  required
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Surgical Procedure / Plan"
                  value={formData.surgicalProcedure || ''}
                  onChange={(val) => setFormData({ ...formData, surgicalProcedure: val })}
                  options={[
                    'Exploratory Celiotomy',
                    'Large Colon Resection',
                    'Small Intestine Resection & Anastomosis',
                    'Pelvic Flexure Enterotomy',
                    'Medical Management (No Surgery)'
                  ]}
                  placeholder="e.g. Exploratory Celiotomy"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Surgery Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={formData.surgeryTime}
                  onChange={(e) => setFormData({ ...formData, surgeryTime: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Initial ICU Acuity Status"
                  value={formData.status || ''}
                  onChange={(val) => setFormData({ ...formData, status: val as any })}
                  options={[
                    'CRITICAL',
                    'STABLE',
                    'MONITORING',
                    'RECOVERING'
                  ]}
                  placeholder="Select status..."
                />
              </div>
            </div>
          </div>

          {/* Section 4: Administrative, Surgeon & Consent */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-purple-800 uppercase tracking-wider bg-purple-50 p-2 rounded-lg flex items-center gap-1.5">
              📜 4. Consent, Costs & Surgeon Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              <div>
                <ComboboxWithAdd
                  label="Surgery & Financial Consent Status"
                  value={formData.surgeryConsentStatus || ''}
                  onChange={(val) => setFormData({ ...formData, surgeryConsentStatus: val as any })}
                  options={[
                    'Full Surgical Intervention Agreed',
                    'Medical Management Only (No Surgery)',
                    'Financial Ceiling Reached',
                    'DNR / Euthanasia Authorized if Unfavorable'
                  ]}
                  placeholder="Select consent status..."
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Facility / Hospital"
                  value={formData.facility || ''}
                  onChange={(val) => setFormData({ ...formData, facility: val })}
                  options={[
                    'UFMG Veterinary Hospital',
                    'Private Equine Clinic',
                    'Other'
                  ]}
                  placeholder="e.g. UFMG Veterinary Hospital"
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Attending Surgeon"
                  value={formData.assignedSurgeon || ''}
                  onChange={(val) => setFormData({ ...formData, assignedSurgeon: val })}
                  options={[
                    'Dr. Gustavo Coutinho',
                    'Dr. On Call',
                    'Dr. Attending'
                  ]}
                  placeholder="Select or enter surgeon..."
                />
              </div>

              <div>
                <ComboboxWithAdd
                  label="Intern / Resident"
                  value={formData.intern || ''}
                  onChange={(val) => setFormData({ ...formData, intern: val })}
                  options={[
                    'Resident A',
                    'Intern B'
                  ]}
                  placeholder="Select or enter intern..."
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Owner / Emergency Contact</label>
                <input
                  type="text"
                  value={formData.ownerEmergencyContact}
                  onChange={(e) => setFormData({ ...formData, ownerEmergencyContact: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  placeholder="e.g. John Doe (555-0199)"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1">Referring Veterinarian</label>
                <input
                  type="text"
                  value={formData.referringVetContact}
                  onChange={(e) => setFormData({ ...formData, referringVetContact: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  placeholder="e.g. Dr. Smith (Equine Clinic)"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs shadow-md transition-all active:scale-95"
            >
              Save Patient & Reset Flowsheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
