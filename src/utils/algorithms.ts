export type RoundData = {
  time: string;
  hr: number | '';
  rr: number | '';
  temp: number | '';
  mm: string;
  crt: number | '';
  mentation: string;
  gutSounds: string;
  painScore: number | '';
  refluxVol: number | '';
  pcv: number | '';
  tp: number | '';
  lactate: number | '';
  wbc: number | '';
  fluidsIn: number | '';
  urineOut: number | '';
  highLaminitisRisk: boolean;
};

export function calculateIceScore(round: RoundData): { score: number, color: string, label: string } | null {
  if (!round.time) return null;

  let score = 0;
  
  if (round.highLaminitisRisk) score += 40;
  
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

  // Continuous interpolation for styling could be added, but discrete is safer for clinical badges
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
