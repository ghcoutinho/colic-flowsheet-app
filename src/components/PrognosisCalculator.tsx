import { useState, useEffect } from 'react';
import type { RoundData } from '../utils/algorithms';

export default function PrognosisCalculator() {
  const [inputs, setInputs] = useState({
    hr: '',
    rr: '',
    pcv: '',
    lactate: '',
    ca: '12.0',
    pain: '0',
    gutSounds: '0',
    rectal: '0',
    us: '0'
  });

  const [results, setResults] = useState<{
    survProb: number;
    survColor: string;
    survLabel: string;
    surgProb: number;
    surgColor: string;
    surgLabel: string;
  } | null>(null);

  useEffect(() => {
    // Auto-fetch from latest round
    const saved = localStorage.getItem('cmt_rounds');
    if (saved) {
      try {
        const rounds = JSON.parse(saved) as RoundData[];
        if (rounds.length > 0) {
          const r = rounds[rounds.length - 1];
          setInputs(prev => ({
            ...prev,
            hr: String(r.hr || ''),
            rr: String(r.rr || ''),
            pcv: String(r.pcv || ''),
            lactate: String(r.lactate || ''),
            pain: mapPain(r.painScore, r.painBehavior),
            gutSounds: mapGutSounds(r.gutSounds)
          }));
        }
      } catch (e) {}
    }
  }, []);

  const mapPain = (score: any, behavior: any) => {
    const s = Number(score) || 0;
    if (s >= 2 || behavior === 'rolling' || behavior === 'kicking abdomen') return '2';
    if (s === 1 || behavior === 'pawing' || behavior === 'flank watching') return '1';
    return '0';
  };

  const mapGutSounds = (sounds: any) => {
    if (sounds === 'absent') return '2';
    if (sounds === 'reduced') return '1';
    return '0';
  };

  const calculateProbabilities = () => {
    const hr = Number(inputs.hr) || 0;
    const pcv = Number(inputs.pcv) || 0;
    const lac = Number(inputs.lactate) || 0;
    const dor = Number(inputs.pain);
    const sons = Number(inputs.gutSounds);
    const retal = Number(inputs.rectal);
    const us = Number(inputs.us);

    // 1. SURVIVAL PROBABILITY (Logistic Regression)
    // Z = 4.5 - (0.03 * HR) - (0.04 * PCV) - (0.25 * Lactate)
    const logitSurv = 4.5 - (0.03 * hr) - (0.04 * pcv) - (0.25 * lac);
    let survProb = (1 / (1 + Math.exp(-logitSurv))) * 100;
    
    if (survProb > 99) survProb = 99.1;
    if (survProb < 1) survProb = 1.2;

    let survColor = 'var(--danger)';
    let survLabel = 'Critical Risk of Death (Shock/Ischemia)';
    if (survProb > 75) {
      survColor = 'var(--success)';
      survLabel = 'Favorable / Stable Prognosis';
    } else if (survProb >= 40) {
      survColor = 'var(--warning)';
      survLabel = 'Guarded Prognosis (Caution)';
    }

    // 2. SURGERY INDICATION (Clinical Score)
    let surgScore = 0;
    if (retal === 1) surgScore += 3;
    if (dor === 1) surgScore += 1; else if (dor === 2) surgScore += 3;
    if (sons === 1) surgScore += 1; else if (sons === 2) surgScore += 2;
    if (us === 1) surgScore += 2;

    const logitSurg = -2.5 + (0.65 * surgScore);
    let surgProb = (100 / (1 + Math.exp(-logitSurg)));

    if (surgProb > 99) surgProb = 98.7;
    if (surgProb < 2) surgProb = 2.4;

    let surgColor = 'var(--danger)';
    let surgLabel = 'Highly Indicative of Laparotomy';
    if (surgProb < 30) {
      surgColor = 'var(--success)';
      surgLabel = 'Conservative Medical Treatment Recommended';
    } else if (surgProb < 60) {
      surgColor = 'var(--warning)';
      surgLabel = 'Surgical Possibility - Evaluate Evolution';
    }

    setResults({ survProb, survColor, survLabel, surgProb, surgColor, surgLabel });
  };

  return (
    <div className="flex-col gap-4 max-w-4xl mx-auto">
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)', textAlign: 'center', marginBottom: '0.5rem' }}>
          Equine Prognosis Calculator
        </h2>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Logistic Survival Analysis and Surgical Risk (%)
        </p>

        {/* Systemic Parameters */}
        <h3 style={{ fontSize: '1.1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
          Systemic Parameters & Vital Signs
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="input-group">
            <label className="input-label">Heart Rate (bpm)</label>
            <input className="input-field" type="number" value={inputs.hr} onChange={e => setInputs({...inputs, hr: e.target.value})} placeholder="Ex: 44" />
          </div>
          <div className="input-group">
            <label className="input-label">Respiratory Rate (brpm)</label>
            <input className="input-field" type="number" value={inputs.rr} onChange={e => setInputs({...inputs, rr: e.target.value})} placeholder="Ex: 16" />
          </div>
          <div className="input-group">
            <label className="input-label">Abdominal Pain Intensity</label>
            <select className="input-field" value={inputs.pain} onChange={e => setInputs({...inputs, pain: e.target.value})}>
              <option value="0">Absent or Mild (Responsive)</option>
              <option value="1">Moderate / Intermittent</option>
              <option value="2">Severe / Continuous (Refractory)</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Intestinal Motility (Gut Sounds)</label>
            <select className="input-field" value={inputs.gutSounds} onChange={e => setInputs({...inputs, gutSounds: e.target.value})}>
              <option value="0">Normal</option>
              <option value="1">Reduced / Hypomotile</option>
              <option value="2">Totally Absent</option>
            </select>
          </div>
        </div>

        {/* Labs & Imaging */}
        <h3 style={{ fontSize: '1.1rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
          Laboratory Exams & Imaging
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="input-group">
            <label className="input-label">Hematocrit (PCV %)</label>
            <input className="input-field" type="number" value={inputs.pcv} onChange={e => setInputs({...inputs, pcv: e.target.value})} placeholder="Ex: 38" />
          </div>
          <div className="input-group">
            <label className="input-label">Blood Lactate (mmol/L)</label>
            <input className="input-field" type="number" step="0.1" value={inputs.lactate} onChange={e => setInputs({...inputs, lactate: e.target.value})} placeholder="Ex: 1.2" />
          </div>
          <div className="input-group">
            <label className="input-label">Transrectal Exam</label>
            <select className="input-field" value={inputs.rectal} onChange={e => setInputs({...inputs, rectal: e.target.value})}>
              <option value="0">Normal or Simple Impaction</option>
              <option value="1">Evident Structural Abnormalities</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Ultrasonography (FLASH)</label>
            <select className="input-field" value={inputs.us} onChange={e => setInputs({...inputs, us: e.target.value})}>
              <option value="0">Normal</option>
              <option value="1">Abnormal (Free fluid, distended loops)</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700 }} onClick={calculateProbabilities}>
          Process Probabilities
        </button>

        {results && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px', padding: '2rem', borderRadius: '8px', border: `2px solid ${results.survColor}`, backgroundColor: `${results.survColor}10`, textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--text-main)' }}>Survival Chances</h4>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: results.survColor, lineHeight: 1, marginBottom: '0.5rem' }}>{results.survProb.toFixed(1)}%</div>
              <p style={{ margin: 0, fontWeight: 600, color: results.survColor }}>{results.survLabel}</p>
            </div>
            
            <div style={{ flex: 1, minWidth: '250px', padding: '2rem', borderRadius: '8px', border: `2px solid ${results.surgColor}`, backgroundColor: `${results.surgColor}10`, textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--text-main)' }}>Surgery Indication</h4>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: results.surgColor, lineHeight: 1, marginBottom: '0.5rem' }}>{results.surgProb.toFixed(1)}%</div>
              <p style={{ margin: 0, fontWeight: 600, color: results.surgColor }}>{results.surgLabel}</p>
            </div>
          </div>
        )}

      </div>
      
      <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <strong>Disclaimer:</strong> This probability is an estimate based on a multivariable logistic regression model. It should be used as clinical support and does not replace professional veterinary judgment.
      </div>
    </div>
  );
}
