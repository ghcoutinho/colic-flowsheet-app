export type PatientStatus = 'CRITICAL' | 'STABLE' | 'MONITORING' | 'RECOVERING' | 'DISCHARGED';

export interface Patient {
  id: string;
  name: string;
  patientId: string;
  weightKg: number;
  ageYears: number;
  breed: string;
  diagnosis: string;
  surgicalProcedure?: string;
  surgeryTime?: string;
  status: PatientStatus;
  onIceScore: string; // e.g., "3/5 (High Risk)"
  survivalPrognosisPercent: number;
  surgicalIndicationPercent: number;
  netFluidBalanceLiters: number;
  nextDueRoundTime: string;
  assignedSurgeon: string;
  nextShiftSurgeon: string;
  callSurgeonTriggers: {
    heartRateBpm: number;
    painScore: number;
    refluxLiters: number;
    respRateBpmin: number;
  };
}

export interface FlowsheetValue {
  value: string | number;
  delta?: number | string; // e.g. +2, -0.5
  status?: 'NORMAL' | 'AMBER_DUE' | 'DUE' | 'WARNING' | 'CRITICAL';
  note?: string;
}

export interface FlowsheetRow {
  id: string;
  category: 'VITALS' | 'PAIN' | 'GI' | 'CLINICOPATHOLOGY' | 'FLUIDS' | 'LAMINITIS' | 'INCISION' | 'MEDICATIONS';
  categoryLabel?: string;
  categoryFrequency?: string; // e.g., "q4h", "q12h"
  parameter: string;
  unit?: string;
  target: string;
  bandColor: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'slate';
  type?: 'numeric' | 'select' | 'text' | 'medication' | 'cri';
  // Mapping of time slot (e.g. "10:00", "11:00", "12:00", "13:00", "14:00", "15:00") to FlowsheetValue
  values: Record<string, FlowsheetValue>;
}

export interface DrugFormularyItem {
  id: string;
  name: string;
  category: 'Antibiotics' | 'Analgesics' | 'Sedatives' | 'CRIs' | 'Prokinetics' | 'NSAIDs' | 'Fluids';
  defaultDoseRate: number; // e.g., 6.6
  doseUnit: 'mg/kg' | 'mcg/kg' | 'IU/kg' | 'mg/kg/hr' | 'mL/kg';
  defaultConcentration: number; // e.g., 100
  concentrationUnit: 'mg/mL' | 'IU/mL' | 'mcg/mL' | '%';
  route: string;
  defaultFrequency: string; // e.g. "q24h", "q6h", "CRI"
  notes?: string;
}

export interface SurgeonScheduleSettings {
  tprInterval: 'q1h' | 'q2h' | 'q4h' | 'q6h' | 'q12h';
  giInterval: 'q2h' | 'q4h' | 'q6h' | 'q12h' | 'q24h';
  clinPathInterval: 'q4h' | 'q6h' | 'q12h' | 'q24h' | 'STAT';
}

export interface StandingOrder {
  id: string;
  category: string;
  title: string;
  description: string;
  protocolDetails: string[];
  type: 'hospital' | 'surgeon';
}

export interface ReferenceRangeCategory {
  category: string;
  items: {
    parameter: string;
    range: string;
    unit?: string;
    note?: string;
  }[];
}

export interface ASOMetadataReport {
  appName: string;
  subtitle: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  keywords: string;
  whatsNew: string;
  deliverables: string[];
  designRationale: string[];
}
