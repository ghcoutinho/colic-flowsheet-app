import { useState, useEffect } from 'react';
import type { PatientProfile, RoundData } from '../utils/algorithms';
import { calculateIceScore, checkAlerts, calculatePrognosis } from '../utils/algorithms';
import { User, Snowflake, Activity, Droplets, AlertTriangle, Settings } from 'lucide-react';

type Props = {
  patient: PatientProfile;
  setPatient: (p: PatientProfile) => void;
};

export default function Identification({ patient, setPatient }: Props) {
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [schedule, setSchedule] = useState({
    tpr: 'q2h',
    gi: 'q4h',
    clinpath: 'q12h',
    laminitis: 'q6h',
    incision: 'q12h'
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cmt_rounds');
    if (saved) {
      try { setRounds(JSON.parse(saved)); } catch (e) {}
    }
    const savedSch = localStorage.getItem('cmt_schedule');
    if (savedSch) {
      try { setSchedule(JSON.parse(savedSch)); } catch (e) {}
    }
  }, []);

  const handleScheduleChange = (newSch: typeof schedule) => {
    setSchedule(newSch);
    localStorage.setItem('cmt_schedule', JSON.stringify(newSch));
  };

  const activeAlerts = rounds.flatMap((r) => checkAlerts(r));
  const latestRound = rounds.length > 0 ? rounds[rounds.length - 1] : undefined;
  const iceScore = latestRound ? calculateIceScore(latestRound, patient) : null;
  const prognosis = latestRound ? calculatePrognosis(latestRound) : null;

  const totalReflux = rounds.reduce((sum, r) => sum + (Number(r.refluxVol) || 0), 0);
  const totalFluidsIn = rounds.reduce((sum, r) => sum + (Number(r.volInfused) || 0), 0);
  const totalUrineOut = rounds.reduce((sum, r) => sum + (Number(r.urineOut) || 0), 0);
  const fluidBalance = totalFluidsIn - totalUrineOut - totalReflux;

  return (
    <div className="flex-col gap-4">
      {/* Patient Identification Card */}
      <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary-color)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--primary-color)' }}>
            <User size={24} /> Patient Identification
          </h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Patient / ID</label>
            <input 
              type="text" 
              value={patient.id} 
              onChange={e => setPatient({...patient, id: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
              placeholder="Name/ID..." 
            />
          </div>
          
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date</label>
            <input 
              type="date" 
              value={patient.date} 
              onChange={e => setPatient({...patient, date: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
            />
          </div>
          
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Body weight (kg)</label>
            <input 
              type="number" 
              value={patient.weight} 
              onChange={e => setPatient({...patient, weight: e.target.value === '' ? '' : Number(e.target.value)})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600, color: 'var(--primary-color)' }} 
              placeholder="e.g. 500" 
            />
          </div>
          
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Surgeon</label>
            <input 
              type="text" 
              value={patient.surgeon} 
              onChange={e => setPatient({...patient, surgeon: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
              placeholder="Surgeon name..." 
            />
          </div>
          
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Sx date/time</label>
            <input 
              type="date" 
              value={patient.sxDate} 
              onChange={e => setPatient({...patient, sxDate: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
            />
          </div>
          
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Lesion / procedure</label>
            <input 
              type="text" 
              value={patient.lesion} 
              onChange={e => setPatient({...patient, lesion: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
              placeholder="e.g. LCV" 
            />
          </div>
          
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Resection? (Y/N/%)</label>
            <input 
              type="text" 
              value={patient.resection} 
              onChange={e => setPatient({...patient, resection: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
              placeholder="Y/N/Type..." 
            />
          </div>
          
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Demeanor / BCS</label>
            <input 
              type="text" 
              value={patient.demeanor} 
              onChange={e => setPatient({...patient, demeanor: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
              placeholder="e.g. BAR, 3/5" 
            />
          </div>
          
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Sheet page __ of __</label>
            <input 
              type="text" 
              value={patient.sheetPage} 
              onChange={e => setPatient({...patient, sheetPage: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
              placeholder="e.g. 1 of 2" 
            />
          </div>
          
          <div style={{ gridColumn: '1 / -1', padding: '1rem', background: 'var(--danger-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="checkbox" 
              checked={patient.highLaminitisRisk} 
              onChange={e => setPatient({...patient, highLaminitisRisk: e.target.checked})} 
              id="laminitisRisk" 
              style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', accentColor: 'var(--danger)' }}
            />
            <div>
              <label htmlFor="laminitisRisk" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)', cursor: 'pointer' }}>
                High laminitis risk? (LCV/colitis/sepsis)
              </label>
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Drives the auto 'on ice?' recommendation below. Set Y/N.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Top Summary Cards */}
      <div className="flex gap-4 mb-2" style={{ flexWrap: 'wrap' }}>
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
          <div className="text-muted mb-2"><Activity size={16} style={{display:'inline', marginRight: '4px'}}/> Prognosis</div>
          {prognosis ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: prognosis.survColor }}>{prognosis.survProb.toFixed(1)}%</div>
              <div className="badge" style={{ backgroundColor: prognosis.survColor, color: 'white' }}>{prognosis.survLabel}</div>
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

      {/* Surgeon Settings (Schedule) */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowSettings(!showSettings)}>
          <div style={{ fontWeight: 600, color: 'var(--primary-color)' }}><Settings size={16} style={{display:'inline', marginRight:'4px'}}/> Surgeon Settings (Monitoring Schedule)</div>
          <div className="text-muted">{showSettings ? '▲ Hide' : '▼ Show'}</div>
        </div>
        {showSettings && (
          <div className="mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">TPR (Vitals)</label>
              <select className="input-field" value={schedule.tpr} onChange={e => handleScheduleChange({...schedule, tpr: e.target.value})}>
                <option value="q1h">q1h</option><option value="q2h">q2h</option><option value="q4h">q4h</option><option value="q6h">q6h</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">GI / Full Exam</label>
              <select className="input-field" value={schedule.gi} onChange={e => handleScheduleChange({...schedule, gi: e.target.value})}>
                <option value="q2h">q2h</option><option value="q4h">q4h</option><option value="q6h">q6h</option><option value="q12h">q12h</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Clinicopathology</label>
              <select className="input-field" value={schedule.clinpath} onChange={e => handleScheduleChange({...schedule, clinpath: e.target.value})}>
                <option value="q6h">q6h</option><option value="q12h">q12h</option><option value="q24h">q24h</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Laminitis Check</label>
              <select className="input-field" value={schedule.laminitis} onChange={e => handleScheduleChange({...schedule, laminitis: e.target.value})}>
                <option value="q6h">q6h</option><option value="q12h">q12h</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
