export type PatientProfile = {
  id: string;
  date: string;
  weight: number | '';
  surgeon: string;
  sxDate: string;
  lesion: string;
  resection: string;
  sheetPage: string;
  demeanor: string;
  highLaminitisRisk: boolean;
};

export const defaultPatient: PatientProfile = {
  id: '',
  date: new Date().toISOString().split('T')[0],
  weight: '',
  surgeon: '',
  sxDate: '',
  lesion: '',
  resection: '',
  sheetPage: '',
  demeanor: '',
  highLaminitisRisk: true
};

export type RoundData = {
  time: string;
  hr: number | '';
  rr: number | '';
  temp: number | '';
  mm: string;
  crt: number | '';
  mentation: string;
  painScore: number | '';
  painBehavior: string;
  analgesiaGiven: string;
  gutSounds: string;
  refluxVol: number | '';
  refluxApp: string;
  ngtLeft: string;
  manurePassed: string;
  fecalChar: string;
  abDistension: number | '';
  pcv: number | '';
  tp: number | '';
  lactate: number | '';
  wbc: number | '';
  bg: number | '';
  naKcl: number | '';
  creatinine: number | '';
  ivFluidType: string;
  ivRate: string;
  volInfused: number | '';
  urinePassed: string;
  urineOut: number | '';
  pulseFront: string;
  pulseHind: string;
  hoofHeat: string;
  weightShift: string;
  obelGrade: number | '';
  cryoOn: string;
  hoofTemp: number | '';
  incision: string;
  ivCath: string;
  medications?: Record<string, string>;
};

export const defaultRound: RoundData = {
  time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
  hr: '', rr: '', temp: '', mm: '', crt: '', mentation: '', gutSounds: '',
  painScore: '', painBehavior: '', analgesiaGiven: '', refluxVol: '', refluxApp: '', ngtLeft: '', manurePassed: '', fecalChar: '', abDistension: '',
  pcv: '', tp: '', lactate: '', wbc: '', bg: '', naKcl: '', creatinine: '',
  ivFluidType: '', ivRate: '', volInfused: '', urinePassed: '', urineOut: '',
  pulseFront: '', pulseHind: '', hoofHeat: '', weightShift: '', obelGrade: '', cryoOn: '', hoofTemp: '',
  incision: '', ivCath: ''
};

export type DrugConfig = {
  name: string;
  type: 'bolus' | 'cri' | 'fluid' | 'oral';
  doseRate: number;
  unit: string;
  conc: number | '';
  concUnit: string;
  freq?: string;
  stopTime?: string;
  stopReason?: string;
  stopNote?: string;
};

export const drugDatabase: Record<string, DrugConfig[]> = {
  "Antibiotics": [
    { name: 'Potassium Penicillin G', type: 'bolus', doseRate: 22000, unit: 'IU/kg', conc: 1000000, concUnit: 'IU/mL', freq: '6' },
    { name: 'Sodium Penicillin G', type: 'bolus', doseRate: 22000, unit: 'IU/kg', conc: 1000000, concUnit: 'IU/mL', freq: '6' },
    { name: 'Procaine Penicillin G', type: 'bolus', doseRate: 22000, unit: 'IU/kg', conc: 300000, concUnit: 'IU/mL', freq: '12' },
    { name: 'Gentamicin', type: 'bolus', doseRate: 6.6, unit: 'mg/kg', conc: 100, concUnit: 'mg/mL', freq: '24' },
    { name: 'Amikacin', type: 'bolus', doseRate: 21, unit: 'mg/kg', conc: 250, concUnit: 'mg/mL', freq: '24' },
    { name: 'Ceftiofur', type: 'bolus', doseRate: 2.2, unit: 'mg/kg', conc: 50, concUnit: 'mg/mL', freq: '12' },
    { name: 'Metronidazole', type: 'bolus', doseRate: 15, unit: 'mg/kg', conc: 5, concUnit: 'mg/mL', freq: '8' },
    { name: 'Enrofloxacin', type: 'bolus', doseRate: 5, unit: 'mg/kg', conc: 100, concUnit: 'mg/mL', freq: '24' },
    { name: 'Trimethoprim-sulfa', type: 'oral', doseRate: 30, unit: 'mg/kg', conc: 480, concUnit: 'mg/mL', freq: '12' },
    { name: 'Oxytetracycline', type: 'bolus', doseRate: 6.6, unit: 'mg/kg', conc: 100, concUnit: 'mg/mL', freq: '12' },
    { name: 'Doxycycline', type: 'oral', doseRate: 10, unit: 'mg/kg', conc: 100, concUnit: 'mg/tablet', freq: '12' },
    { name: 'Chloramphenicol', type: 'oral', doseRate: 50, unit: 'mg/kg', conc: 1000, concUnit: 'mg/tablet', freq: '6' }
  ],
  "Analgesics": [
    { name: 'Butorphanol', type: 'bolus', doseRate: 0.05, unit: 'mg/kg', conc: 10, concUnit: 'mg/mL', freq: '4' },
    { name: 'Morphine', type: 'bolus', doseRate: 0.1, unit: 'mg/kg', conc: 15, concUnit: 'mg/mL', freq: '4' },
    { name: 'Lidocaine (CRI)', type: 'cri', doseRate: 3.0, unit: 'mg/kg/h', conc: 20, concUnit: 'mg/mL', freq: 'CRI' },
    { name: 'Ketamine (CRI)', type: 'cri', doseRate: 0.6, unit: 'mg/kg/h', conc: 100, concUnit: 'mg/mL', freq: 'CRI' },
    { name: 'Detomidine', type: 'bolus', doseRate: 0.01, unit: 'mg/kg', conc: 10, concUnit: 'mg/mL', freq: '4' },
    { name: 'Xylazine', type: 'bolus', doseRate: 0.3, unit: 'mg/kg', conc: 100, concUnit: 'mg/mL', freq: '2' },
    { name: 'Buprenorphine', type: 'bolus', doseRate: 0.005, unit: 'mg/kg', conc: 0.3, concUnit: 'mg/mL', freq: '8' },
    { name: 'Methadone', type: 'bolus', doseRate: 0.1, unit: 'mg/kg', conc: 10, concUnit: 'mg/mL', freq: '4' },
    { name: 'Tramadol', type: 'oral', doseRate: 5, unit: 'mg/kg', conc: 50, concUnit: 'mg/tablet', freq: '12' },
    { name: 'Gabapentin', type: 'oral', doseRate: 10, unit: 'mg/kg', conc: 100, concUnit: 'mg/tablet', freq: '12' }
  ],
  "Anti-inflammatory": [
    { name: 'Flunixin meglumine', type: 'bolus', doseRate: 1.1, unit: 'mg/kg', conc: 50, concUnit: 'mg/mL', freq: '12' },
    { name: 'Flunixin (anti-endotoxic)', type: 'bolus', doseRate: 0.25, unit: 'mg/kg', conc: 50, concUnit: 'mg/mL', freq: '8' },
    { name: 'Firocoxib', type: 'bolus', doseRate: 0.1, unit: 'mg/kg', conc: 22.7, concUnit: 'mg/mL', freq: '24' },
    { name: 'Phenylbutazone', type: 'bolus', doseRate: 2.2, unit: 'mg/kg', conc: 200, concUnit: 'mg/mL', freq: '12' },
    { name: 'Ketoprofen', type: 'bolus', doseRate: 2.2, unit: 'mg/kg', conc: 100, concUnit: 'mg/mL', freq: '24' },
    { name: 'Meloxicam', type: 'bolus', doseRate: 0.6, unit: 'mg/kg', conc: 5, concUnit: 'mg/mL', freq: '24' },
    { name: 'Dipyrone', type: 'bolus', doseRate: 22, unit: 'mg/kg', conc: 500, concUnit: 'mg/mL', freq: '8' },
    { name: 'Dexamethasone', type: 'bolus', doseRate: 0.05, unit: 'mg/kg', conc: 2, concUnit: 'mg/mL', freq: '24' }
  ],
  "GI-Prokinetic": [
    { name: 'Lidocaine (CRI)', type: 'cri', doseRate: 3.0, unit: 'mg/kg/h', conc: 20, concUnit: 'mg/mL', freq: 'CRI' },
    { name: 'Metoclopramide', type: 'cri', doseRate: 0.04, unit: 'mg/kg/h', conc: 5, concUnit: 'mg/mL', freq: 'CRI' },
    { name: 'Erythromycin', type: 'bolus', doseRate: 1, unit: 'mg/kg', conc: 200, concUnit: 'mg/mL', freq: '6' },
    { name: 'Neostigmine', type: 'bolus', doseRate: 0.02, unit: 'mg/kg', conc: 1, concUnit: 'mg/mL', freq: '2' },
    { name: 'Bethanechol', type: 'bolus', doseRate: 0.025, unit: 'mg/kg', conc: 5, concUnit: 'mg/mL', freq: '6' },
    { name: 'Omeprazole', type: 'oral', doseRate: 4, unit: 'mg/kg', conc: 370, concUnit: 'mg/g paste', freq: '24' }
  ],
  "Fluids": [
    { name: 'LRS Maintenance', type: 'fluid', doseRate: 2.0, unit: 'mL/kg/h', conc: '', concUnit: '', freq: 'CRI' },
    { name: 'LRS Resuscitation Bolus', type: 'fluid', doseRate: 20, unit: 'mL/kg', conc: '', concUnit: '', freq: 'STAT' },
    { name: 'Plasmalyte-A', type: 'fluid', doseRate: 2.0, unit: 'mL/kg/h', conc: '', concUnit: '', freq: 'CRI' },
    { name: 'Hypertonic Saline 7.2%', type: 'fluid', doseRate: 4, unit: 'mL/kg', conc: '', concUnit: '', freq: 'STAT' },
    { name: 'Plasma', type: 'fluid', doseRate: 10, unit: 'mL/kg', conc: '', concUnit: '', freq: 'STAT' },
    { name: 'Hetastarch', type: 'fluid', doseRate: 10, unit: 'mL/kg', conc: '', concUnit: '', freq: 'STAT' }
  ]
};

/* ------------------------------------------------------------------ *
 * Medication scheduling helpers
 * ------------------------------------------------------------------ *
 * Rounds are stored with an 'HH:MM' clock time only (no date). This is
 * intentional for a shift-based flowsheet. Overnight ordering (e.g. a
 * 23:00 round followed by a 01:00 round) is a known limitation of the
 * clock-only model and is out of scope for this pass.
 * ------------------------------------------------------------------ */

/** Parse a frequency string ('q6h', 'q12-24h', 'STAT', 'CRI') into interval hours.
 *  Ranges take the FIRST (shortest / most conservative) value.
 *  Returns null for CRI, STAT, or anything without a number (handled specially). */
export function parseFreqHours(freq?: string): number | null {
  if (!freq) return null;
  const f = freq.trim().toUpperCase();
  if (f === 'CRI' || f === 'STAT') return null;
  const match = freq.match(/\d+/); // first number: 'q12-24h' -> 12
  if (!match) return null;
  const h = parseInt(match[0], 10);
  return h > 0 ? h : null;
}

/** Minutes since midnight for an 'HH:MM' string (used for sorting). */
export function minutesOfDay(time: string): number {
  const [h, m] = (time || '').split(':').map(Number);
  if (isNaN(h)) return -1;
  return h * 60 + (isNaN(m) ? 0 : m);
}

/** Sort rounds chronologically by clock time (replaces the old no-op sort). */
export function sortRoundsByTime(rounds: RoundData[]): RoundData[] {
  return [...rounds].sort((a, b) => minutesOfDay(a.time) - minutesOfDay(b.time));
}

/** Round an 'HH:MM' string up to the next full hour if it has minutes. */
export function ceilToHour(time: string): string {
  let [h, m] = (time || '00:00').split(':').map(Number);
  if (isNaN(h)) h = 0;
  if (!isNaN(m) && m > 0) h = (h + 1) % 24;
  return `${String(h % 24).padStart(2, '0')}:00`;
}

/** Generate the list of 'HH:MM' dose times at a fixed interval, starting from
 *  `startTime` (inclusive), across a horizon in hours. Wraps past midnight. */
export function projectDueTimes(startTime: string, intervalHours: number, horizonHours = 24): string[] {
  const times: string[] = [];
  if (intervalHours <= 0) return times;
  let [h, m] = (startTime || '00:00').split(':').map(Number);
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;
  let elapsed = 0;
  while (elapsed <= horizonHours) {
    times.push(`${String(h % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    h += intervalHours;
    elapsed += intervalHours;
  }
  return times;
}

export function calculateIceScore(round: RoundData, patient: PatientProfile): { score: number, color: string, label: string } | null {
  if (!round.time) return null;

  let score = 0;
  
  if (patient.highLaminitisRisk) score += 40;
  
  if (typeof round.hr === 'number' && round.hr > 52) score += 15;
  if (typeof round.temp === 'number' && (round.temp > 38.5 || round.temp < 37.0)) score += 15;
  if (typeof round.lactate === 'number' && round.lactate > 2.06) score += 15;
  if (typeof round.wbc === 'number' && (round.wbc > 12.5 || round.wbc < 5.0)) score += 15;

  let color = '#10b981'; // Green
  let label = 'Low Priority';

  if (score >= 70) {
    color = '#ef4444'; // Red
    label = 'Strong Indication - Start Ice';
  } else if (score >= 40) {
    color = '#f59e0b'; // Yellow
    label = 'Borderline - Consider Ice';
  }

  return { score, color, label };
}

export type Alert = {
  id: string;
  trigger: string;
  message: string;
};

export function checkAlerts(round: RoundData): Alert[] {
  const alerts: Alert[] = [];

  if (typeof round.hr === 'number' && round.hr > 60) {
    alerts.push({ id: '1', trigger: 'Heart Rate > 60', message: 'Reassess pain & perfusion; check PCV/lactate; notify surgeon' });
  }
  
  if (typeof round.refluxVol === 'number' && round.refluxVol >= 2) {
    alerts.push({ id: '2', trigger: 'Reflux ≥ 2L', message: 'Leave NGT & decompress; withhold enteral intake; notify surgeon' });
  }
  
  if (typeof round.temp === 'number' && round.temp > 38.9) {
    alerts.push({ id: '3', trigger: 'Fever > 38.9°C', message: 'Full exam; consider ultrasound; notify surgeon urgently' });
  }
  
  if (typeof round.lactate === 'number' && round.lactate > 4) {
    alerts.push({ id: '4', trigger: 'Lactate > 4 mmol/L', message: 'Crystalloid bolus per orders; reassess CV; notify surgeon' });
  }
  
  if (typeof round.pcv === 'number' && round.pcv > 50) {
    alerts.push({ id: '5', trigger: 'PCV > 50%', message: 'Increase fluids; consider colloids/plasma; notify surgeon' });
  }
  
  if (typeof round.painScore === 'number' && round.painScore >= 2) {
    alerts.push({ id: '8', trigger: 'Pain Score ≥ 2', message: 'Reassess; analgesia per orders; if unresponsive, notify surgeon' });
  }

  return alerts;
}

export function evaluateParameterColor(param: keyof RoundData, value: any): string {
  if (value === '' || value === null || value === undefined) return 'inherit';
  const num = Number(value);
  if (isNaN(num)) return 'inherit';

  switch (param) {
    case 'hr':
      if (num >= 28 && num <= 44) return 'var(--success)';
      if (num > 44 && num <= 60) return 'var(--warning)';
      if (num > 60) return 'var(--danger)';
      return 'inherit';
    case 'rr':
      if (num >= 8 && num <= 16) return 'var(--success)';
      if (num > 16 && num <= 20) return 'var(--warning)';
      if (num > 20) return 'var(--danger)';
      return 'inherit';
    case 'temp':
      if (num >= 37.2 && num <= 38.5) return 'var(--success)';
      if ((num >= 37.0 && num < 37.2) || (num > 38.5 && num <= 38.9)) return 'var(--warning)';
      if (num < 37.0 || num > 38.9) return 'var(--danger)';
      return 'inherit';
    case 'lactate':
      if (num <= 2) return 'var(--success)';
      if (num > 2 && num <= 4) return 'var(--warning)';
      if (num > 4) return 'var(--danger)';
      return 'inherit';
    case 'pcv':
      if (num >= 32 && num <= 45) return 'var(--success)';
      if (num > 45 && num <= 50) return 'var(--warning)';
      if (num > 50) return 'var(--danger)';
      return 'inherit';
    case 'crt':
      if (num <= 2) return 'var(--success)';
      if (num > 2) return 'var(--danger)';
      return 'inherit';
    case 'tp':
      if (num >= 6.0 && num <= 8.0) return 'var(--success)';
      if (num >= 4.5 && num < 6.0) return 'var(--warning)';
      if (num < 4.5) return 'var(--danger)';
      return 'inherit';
    default:
      return 'inherit';
  }
}

export function calculatePrognosis(round: RoundData) {
  const hr = Number(round.hr) || 0;
  const pcv = Number(round.pcv) || 0;
  const lac = Number(round.lactate) || 0;

  // Logistic Regression for Survival
  // Z = 4.5 - (0.03 * HR) - (0.04 * PCV) - (0.25 * Lactate)
  const logitSurv = 4.5 - (0.03 * hr) - (0.04 * pcv) - (0.25 * lac);
  let survProb = (1 / (1 + Math.exp(-logitSurv))) * 100;
  
  if (survProb > 99) survProb = 99.1;
  if (survProb < 1) survProb = 1.2;

  let survColor = 'var(--danger)';
  let survLabel = 'Critical Risk of Death';
  if (survProb > 75) {
    survColor = 'var(--success)';
    survLabel = 'Favorable / Stable';
  } else if (survProb >= 40) {
    survColor = 'var(--warning)';
    survLabel = 'Guarded Prognosis';
  }

  return { survProb, survColor, survLabel };
}
