import { useState } from 'react';
import { AlertTriangle, Plus, Snowflake, Droplets, Activity } from 'lucide-react';
import { calculateIceScore, checkAlerts } from '../utils/algorithms';
import type { RoundData } from '../utils/algorithms';

export default function Flowsheet() {
  const [rounds, setRounds] = useState<RoundData[]>([{
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hr: 44,
    rr: 12,
    temp: 37.8,
    mm: 'pink',
    crt: 2,
    mentation: 'BAR',
    gutSounds: 'normal',
    painScore: 0,
    refluxVol: 0,
    pcv: 38,
    tp: 6.5,
    lactate: 1.2,
    wbc: 8.0,
    fluidsIn: 2,
    urineOut: 1,
    highLaminitisRisk: true
  }]);

  const addRound = () => {
    setRounds([...rounds, {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hr: '', rr: '', temp: '', mm: '', crt: '', mentation: '', gutSounds: '', painScore: '', refluxVol: '', pcv: '', tp: '', lactate: '', wbc: '', fluidsIn: '', urineOut: '', highLaminitisRisk: rounds[0].highLaminitisRisk
    }]);
  };

  const updateRound = (index: number, field: keyof RoundData, value: any) => {
    const newRounds = [...rounds];
    newRounds[index] = { ...newRounds[index], [field]: value };
    setRounds(newRounds);
  };

  const activeAlerts = rounds.flatMap((r) => checkAlerts(r));
  const latestRound = rounds[rounds.length - 1];
  const iceScore = calculateIceScore(latestRound);

  // Auto-totals
  const totalReflux = rounds.reduce((sum, r) => sum + (Number(r.refluxVol) || 0), 0);
  const totalFluidsIn = rounds.reduce((sum, r) => sum + (Number(r.fluidsIn) || 0), 0);
  const totalUrineOut = rounds.reduce((sum, r) => sum + (Number(r.urineOut) || 0), 0);
  const fluidBalance = totalFluidsIn - totalUrineOut - totalReflux;

  return (
    <div className="flex-col gap-4">
      {/* Dashboard Top */}
      <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 200px', marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-muted mb-2"><Snowflake size={16} style={{display:'inline', marginRight: '4px'}}/> On Ice Score</div>
          {iceScore ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: iceScore.color }}>{iceScore.score}%</div>
              <div className="badge" style={{ backgroundColor: iceScore.color, color: 'white' }}>{iceScore.label}</div>
            </div>
          ) : (
            <div className="text-muted">No data</div>
          )}
        </div>
        
        <div className="card" style={{ flex: '1 1 200px', marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-muted mb-2"><Droplets size={16} style={{display:'inline', marginRight: '4px'}}/> Fluid Balance</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: fluidBalance >= 0 ? 'var(--success)' : 'var(--warning)' }}>
            {fluidBalance > 0 ? '+' : ''}{fluidBalance} L
          </div>
          <div className="text-muted text-center mt-2" style={{ fontSize: '0.75rem' }}>
            In: {totalFluidsIn}L | Out: {totalUrineOut}L | Reflux: {totalReflux}L
          </div>
        </div>

        <div className="card" style={{ flex: '2 1 300px', marginBottom: 0 }}>
          <div className="text-danger mb-2" style={{ fontWeight: 600 }}><AlertTriangle size={16} style={{display:'inline', marginRight: '4px'}}/> Call Surgeon Triggers</div>
          {activeAlerts.length > 0 ? (
            <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
              {activeAlerts.map((a, i) => (
                <div key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem', padding: '0.25rem', backgroundColor: 'var(--danger-light)', borderLeft: '3px solid var(--danger)', borderRadius: '4px' }}>
                  <strong>{a.trigger}:</strong> {a.message}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted">No active escalation triggers.</div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="card table-container">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title" style={{ marginBottom: 0, borderBottom: 'none' }}><Activity size={18} style={{display:'inline', marginRight: '4px'}}/> Clinical Flowsheet</h2>
          <button className="btn btn-primary" onClick={addRound}><Plus size={16} /> Add Round</button>
        </div>
        <table className="table-fixed-col">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Target / Normal</th>
              {rounds.map((r, i) => (
                <th key={i} style={{ minWidth: '120px' }}>
                  <input 
                    type="time" 
                    value={r.time} 
                    onChange={e => updateRound(i, 'time', e.target.value)}
                    style={{ background: 'transparent', border: 'none', fontWeight: 600, color: 'inherit', width: '100%' }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Vitals */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem' }}>VITALS & PERFUSION</td></tr>
            <tr>
              <td>Heart Rate (bpm)</td>
              <td className="text-muted">28–44</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <input type="number" value={r.hr} onChange={e => updateRound(i, 'hr', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: typeof r.hr === 'number' && r.hr > 52 ? 'var(--danger)' : 'inherit', fontWeight: typeof r.hr === 'number' && r.hr > 52 ? 700 : 400 }} />
                </td>
              ))}
            </tr>
            <tr>
              <td>Temp (°C)</td>
              <td className="text-muted">37.2–38.5</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <input type="number" step="0.1" value={r.temp} onChange={e => updateRound(i, 'temp', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: typeof r.temp === 'number' && (r.temp < 37.0 || r.temp > 38.5) ? 'var(--danger)' : 'inherit', fontWeight: typeof r.temp === 'number' && (r.temp < 37.0 || r.temp > 38.5) ? 700 : 400 }} />
                </td>
              ))}
            </tr>
            
            {/* GI */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem' }}>GI FUNCTION</td></tr>
            <tr>
              <td>Reflux Vol (L)</td>
              <td className="text-muted">&lt; 2 L</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <input type="number" step="0.5" value={r.refluxVol} onChange={e => updateRound(i, 'refluxVol', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: typeof r.refluxVol === 'number' && r.refluxVol >= 2 ? 'var(--danger)' : 'inherit' }} />
                </td>
              ))}
            </tr>

            {/* ClinPath */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem' }}>CLINICOPATHOLOGY</td></tr>
            <tr>
              <td>Lactate (mmol/L)</td>
              <td className="text-muted">&lt; 2.06</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <input type="number" step="0.1" value={r.lactate} onChange={e => updateRound(i, 'lactate', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: typeof r.lactate === 'number' && r.lactate > 2.06 ? 'var(--danger)' : 'inherit' }} />
                </td>
              ))}
            </tr>
            <tr>
              <td>WBC (×10³/µL)</td>
              <td className="text-muted">5–12.5</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <input type="number" step="0.1" value={r.wbc} onChange={e => updateRound(i, 'wbc', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: typeof r.wbc === 'number' && (r.wbc < 5 || r.wbc > 12.5) ? 'var(--danger)' : 'inherit' }} />
                </td>
              ))}
            </tr>
            <tr>
              <td>PCV (%)</td>
              <td className="text-muted">32-45</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <input type="number" step="1" value={r.pcv} onChange={e => updateRound(i, 'pcv', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: typeof r.pcv === 'number' && r.pcv > 50 ? 'var(--danger)' : 'inherit' }} />
                </td>
              ))}
            </tr>
            
            {/* Fluids */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem' }}>FLUIDS IN / OUT (This interval)</td></tr>
            <tr>
              <td>Fluids In (L)</td>
              <td className="text-muted">-</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <input type="number" step="0.5" value={r.fluidsIn} onChange={e => updateRound(i, 'fluidsIn', e.target.value === '' ? '' : Number(e.target.value))} />
                </td>
              ))}
            </tr>
            <tr>
              <td>Urine Out (L)</td>
              <td className="text-muted">-</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <input type="number" step="0.5" value={r.urineOut} onChange={e => updateRound(i, 'urineOut', e.target.value === '' ? '' : Number(e.target.value))} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
