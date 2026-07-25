import { FlowsheetRow, Patient, PatientStatus } from '../types';

/**
 * Shared prognosis model for the whole app.
 *
 * Survival uses the Colic Assessment Score (CAS) fed into a logistic curve;
 * surgical indication uses the Reeves/Ducharme-style multivariable predictors
 * (pain, gut sounds, rectal findings, ultrasound). Every view must import from
 * here so the board, the dashboard and the engine can never disagree.
 *
 * Clinical decision support only — not a validated outcome predictor.
 */

/** Total calcium (mg/dL) assumed when none has been charted. Mid normal range
 *  for the adult horse, i.e. contributes no CAS points. */
export const ASSUMED_NORMAL_CALCIUM = 12;

export interface ClinicalInputs {
  hr: number;
  rr: number;
  lactate: number;
  calcium: number;
  pcv: number;
  painScore: number;
  /** 0 = normal, 1 = reduced/hypomotile, 2 = absent */
  gutSounds: 0 | 1 | 2;
  /** 0 = normal or simple impaction, 1 = evident structural abnormality */
  rectalAbnormal: 0 | 1;
  /** 0 = normal, 1 = free fluid / distended loops */
  usAbnormal: 0 | 1;
  refluxLiters: number;
  /** Time slot the most recent value came from, for display. */
  latestSlot: string;
  /** True when at least one real value was read from the flowsheet. */
  hasData: boolean;
}

export interface PrognosisResult {
  casScore: number;
  survivalPercent: number;
  surgScore: number;
  surgicalPercent: number;
  /** Human-readable drivers, used for the board's suggestion reason. */
  factors: string[];
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const logistic = (z: number) => 100 / (1 + Math.exp(-z));

// ---------------------------------------------------------------- extraction

type Cell = { value: string | number; status?: string } | undefined;

/** Most recent non-empty cell for a row, scanning time slots newest first. */
function latestCell(rows: FlowsheetRow[], ids: string[], timeSlots: string[]): { cell: Cell; slot: string } | null {
  const row = rows.find(r => ids.includes(r.id))
    || rows.find(r => ids.some(id => r.parameter?.toLowerCase().includes(id.toLowerCase())));
  if (!row) return null;
  for (let i = timeSlots.length - 1; i >= 0; i--) {
    const cell = row.values[timeSlots[i]];
    if (cell && cell.value !== undefined && cell.value !== null && cell.value !== '') {
      return { cell, slot: timeSlots[i] };
    }
  }
  return null;
}

function num(rows: FlowsheetRow[], ids: string[], timeSlots: string[], fallback: number): { v: number; slot: string | null } {
  const hit = latestCell(rows, ids, timeSlots);
  if (!hit) return { v: fallback, slot: null };
  const parsed = parseFloat(String(hit.cell!.value));
  return Number.isFinite(parsed) ? { v: parsed, slot: hit.slot } : { v: fallback, slot: hit.slot };
}

/** Classify a qualitative cell. The charted `status` is authoritative; text is
 *  only consulted when a cell carries no status. */
function severity(cell: Cell): 0 | 1 | 2 {
  if (!cell) return 0;
  const s = (cell.status || '').toUpperCase();
  if (s === 'CRITICAL') return 2;
  if (s === 'WARNING') return 1;
  if (s === 'NORMAL') return 0;
  const t = String(cell.value).toLowerCase();
  if (!t || t.includes('normal') || t.includes('none')) return 0;
  return 1;
}

export function extractClinicalInputs(rows: FlowsheetRow[] = [], timeSlots: string[] = []): ClinicalInputs {
  const hr = num(rows, ['hr', 'heart rate'], timeSlots, 44);
  const rr = num(rows, ['rr', 'resp rate'], timeSlots, 16);
  const lactate = num(rows, ['lactate', 'plasma lactate'], timeSlots, 1.2);
  const calcium = num(rows, ['calcium', 'total calcium'], timeSlots, ASSUMED_NORMAL_CALCIUM);
  const pcv = num(rows, ['ht_pcv', 'pcv_vital', 'hematocrit'], timeSlots, 38);
  const pain = num(rows, ['pain_score', 'pain score'], timeSlots, 0);
  const reflux = num(rows, ['reflux_vol', 'reflux vol'], timeSlots, 0);

  const rectal = latestCell(rows, ['rectal_exam', 'rectal examination'], timeSlots);
  const us = latestCell(rows, ['flash_us', 'flash abdominal us'], timeSlots);
  const gut = latestCell(rows, ['gut_sounds', 'gut sounds'], timeSlots);

  const slots = [hr.slot, lactate.slot, rectal?.slot, us?.slot].filter(Boolean) as string[];

  return {
    hr: hr.v,
    rr: rr.v,
    lactate: lactate.v,
    calcium: calcium.v,
    pcv: pcv.v,
    painScore: pain.v,
    gutSounds: severity(gut?.cell),
    rectalAbnormal: severity(rectal?.cell) > 0 ? 1 : 0,
    usAbnormal: severity(us?.cell) > 0 ? 1 : 0,
    refluxLiters: reflux.v,
    latestSlot: slots[slots.length - 1] || timeSlots[timeSlots.length - 1] || '',
    hasData: slots.length > 0 || hr.slot !== null,
  };
}

// ------------------------------------------------------------------- scoring

/** Colic Assessment Score — higher is worse. */
export function calculateCasScore(i: ClinicalInputs): number {
  let cas = 0;
  if (i.hr >= 61) cas += 2; else if (i.hr >= 46) cas += 1;
  if (i.rr >= 29) cas += 2; else if (i.rr >= 17) cas += 1;
  if (i.calcium > 0 && i.calcium <= 10.5) cas += 2; else if (i.calcium > 10.5 && i.calcium <= 11.8) cas += 1;
  if (i.lactate > 2.0) cas += 2;
  if (i.usAbnormal === 1) cas += 2;
  if (i.rectalAbnormal === 1) cas += 2;
  return cas;
}

/** Surgical-indication score — pain, motility, rectal and ultrasound findings. */
export function calculateSurgScore(i: ClinicalInputs): number {
  let s = 0;
  if (i.rectalAbnormal === 1) s += 3;
  if (i.painScore >= 2) s += 3; else if (i.painScore >= 1) s += 1;
  if (i.gutSounds === 2) s += 2; else if (i.gutSounds === 1) s += 1;
  if (i.usAbnormal === 1) s += 2;
  return s;
}

export function calculatePrognosis(i: ClinicalInputs): PrognosisResult {
  const casScore = calculateCasScore(i);
  const surgScore = calculateSurgScore(i);

  const survivalPercent = clamp(logistic(2.1 - 0.32 * casScore), 1.2, 99.1);
  const surgicalPercent = clamp(logistic(-2.5 + 0.65 * surgScore), 2.4, 98.7);

  const factors: string[] = [];
  if (i.hr >= 61) factors.push(`HR ${i.hr} bpm`);
  else if (i.hr >= 46) factors.push(`HR ${i.hr} bpm (mild)`);
  if (i.rr >= 29) factors.push(`RR ${i.rr}/min`);
  if (i.lactate > 2.0) factors.push(`lactate ${i.lactate} mmol/L`);
  if (i.calcium > 0 && i.calcium <= 11.8) factors.push(`calcium ${i.calcium} mg/dL`);
  if (i.rectalAbnormal) factors.push('abnormal rectal exam');
  if (i.usAbnormal) factors.push('abnormal FLASH ultrasound');
  if (i.painScore >= 2) factors.push(`pain ${i.painScore}/3`);
  if (i.gutSounds === 2) factors.push('absent gut sounds');
  else if (i.gutSounds === 1) factors.push('reduced gut sounds');
  if (i.refluxLiters >= 2) factors.push(`reflux ${i.refluxLiters} L`);

  return { casScore, survivalPercent, surgScore, surgicalPercent, factors };
}

// ------------------------------------------------------------------- triage

export interface StatusSuggestion {
  status: PatientStatus;
  reason: string;
}

/** Ward-facing names for each status, matching the patient board columns. */
export const STATUS_LABELS: Record<PatientStatus, string> = {
  CRITICAL: 'Critical Care',
  STABLE: 'Stable / Med Mgt',
  MONITORING: 'ICU Monitoring',
  RECOVERING: 'Recovering / Step Down',
  DISCHARGED: 'Discharged',
};

/**
 * Map survival probability onto the ward's four working categories.
 * Hard clinical triggers escalate to CRITICAL regardless of the percentage, so
 * a deteriorating horse is never held back by a lagging score.
 */
export function deriveSuggestedStatus(
  survivalPercent: number,
  i: ClinicalInputs,
  triggers?: Patient['callSurgeonTriggers'],
): StatusSuggestion {
  const hardTriggers: string[] = [];
  if (i.hr > (triggers?.heartRateBpm ?? 60)) hardTriggers.push(`HR ${i.hr}`);
  if (i.painScore >= (triggers?.painScore ?? 2)) hardTriggers.push(`pain ${i.painScore}/3`);
  if (i.refluxLiters >= (triggers?.refluxLiters ?? 2)) hardTriggers.push(`reflux ${i.refluxLiters} L`);
  if (i.rr > (triggers?.respRateBpmin ?? 30)) hardTriggers.push(`RR ${i.rr}`);

  if (hardTriggers.length > 0) {
    return { status: 'CRITICAL', reason: `Call-surgeon trigger: ${hardTriggers.join(', ')}` };
  }

  const pct = `survival ${survivalPercent.toFixed(0)}%`;
  if (survivalPercent < 40) return { status: 'CRITICAL', reason: pct };
  if (survivalPercent < 75) return { status: 'MONITORING', reason: pct };
  if (survivalPercent < 90) return { status: 'STABLE', reason: pct };
  return { status: 'RECOVERING', reason: pct };
}

/** Convenience: flowsheet rows straight to a scored result plus suggestion. */
export function evaluatePatient(
  rows: FlowsheetRow[],
  timeSlots: string[],
  triggers?: Patient['callSurgeonTriggers'],
) {
  const inputs = extractClinicalInputs(rows, timeSlots);
  const prognosis = calculatePrognosis(inputs);
  const suggestion = deriveSuggestedStatus(prognosis.survivalPercent, inputs, triggers);
  return { inputs, prognosis, suggestion };
}
