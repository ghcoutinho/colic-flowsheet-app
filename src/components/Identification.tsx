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
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Surgeon Name</label>
            <input 
              type="text" 
              value={patient.surgeon} 
              onChange={e => setPatient({...patient, surgeon: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
              placeholder="Surgeon name..." 
            />
          </div>

          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Resident Name</label>
            <input 
              type="text" 
              value={patient.resident || ''} 
              onChange={e => setPatient({...patient, resident: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
              placeholder="Resident name..." 
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
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Colic Lesion</label>
            <select 
              value={patient.lesion} 
              onChange={e => setPatient({...patient, lesion: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
            >
              <option value="Large Colon Volvulus / Torsion">Large Colon Volvulus / Torsion</option>
              <option value="Pelvic Flexure Impaction">Pelvic Flexure Impaction</option>
              <option value="Small Intestinal Strangulation (Lipoma)">Small Intestinal Strangulation (Lipoma)</option>
              <option value="Epiploic Foramen Entrapment">Epiploic Foramen Entrapment</option>
              <option value="Nephrosplenic Entrapment (LDD)">Nephrosplenic Entrapment (LDD)</option>
              <option value="Right Dorsal Displacement">Right Dorsal Displacement</option>
              <option value="Cecal Impaction / Dysfunction">Cecal Impaction / Dysfunction</option>
              <option value="Small Intestinal Intussusception">Small Intestinal Intussusception</option>
              <option value="Anterior Enteritis (DPJ)">Anterior Enteritis (DPJ)</option>
              <option value="Non-strangulating Infarction">Non-strangulating Infarction</option>
              <option value="Peritonitis / Rupture">Peritonitis / Rupture</option>
              <option value="Other Lesion">Other Lesion</option>
            </select>
          </div>

          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Surgical Procedure</label>
            <select 
              value={patient.procedure || 'Enterotomy & Decompression'} 
              onChange={e => setPatient({...patient, procedure: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
            >
              <option value="Enterotomy & Decompression">Enterotomy & Decompression</option>
              <option value="Small Intestinal Resection & Anastomosis">Small Intestinal Resection & Anastomosis</option>
              <option value="Manual Reduction / Repositioning">Manual Reduction / Repositioning</option>
              <option value="Typhlotomy">Typhlotomy</option>
              <option value="Abdominal Lavage & Drainage">Abdominal Lavage & Drainage</option>
              <option value="Exploratory Celiotomy (No Resection)">Exploratory Celiotomy (No Resection)</option>
              <option value="Euthanasia Intra-op">Euthanasia Intra-op</option>
              <option value="Medical / Conservative (No Surgery)">Medical / Conservative (No Surgery)</option>
              <option value="Other Procedure">Other Procedure</option>
            </select>
          </div>
          
          <div>
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Resection Performed?</label>
            <select 
              value={patient.resection || 'No'} 
              onChange={e => setPatient({...patient, resection: e.target.value})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 600 }} 
            >
              <option value="No">No</option>
              <option value="Yes (Small Intestinal)">Yes (Small Intestinal)</option>
              <option value="Yes (Large Colon)">Yes (Large Colon)</option>
              <option value="Yes (Jejunocaecostomy)">Yes (Jejunocaecostomy)</option>
            </select>
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
            <label className="text-muted" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>High Laminitis Risk?</label>
            <select 
              value={patient.highLaminitisRisk ? 'Yes' : 'No'} 
              onChange={e => setPatient({...patient, highLaminitisRisk: e.target.value === 'Yes'})} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-card)', fontWeight: 700, color: patient.highLaminitisRisk ? 'var(--danger)' : 'inherit' }} 
            >
              <option value="Yes">Yes (LCV / Colitis / Sepsis)</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        {/* Attending Veterinary Team & Signature Block */}
        <div style={{ marginTop: '2rem', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--primary-color)' }}>
              Attending Veterinary Clinicians & Official Signatures
            </h3>
            <button 
              type="button" 
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              onClick={() => {
                const newSurgeon = prompt('Enter Surgeon Name:', patient.surgeon || '');
                const newResident = prompt('Enter Resident Name:', patient.resident || '');
                setPatient({
                  ...patient,
                  surgeon: newSurgeon !== null ? newSurgeon : patient.surgeon,
                  resident: newResident !== null ? newResident : (patient.resident || '')
                });
              }}
            >
              <User size={14} /> + Add / Switch Clinicians
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px border var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Attending Surgeon</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>Dr. {patient.surgeon || '____________________'}</div>
              <div style={{ marginTop: '1.5rem', borderBottom: '1px dashed #94a3b8', width: '80%' }}></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Signature, DVM / DACVS</div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px border var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Attending Resident</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.25rem' }}>Dr. {patient.resident || '____________________'}</div>
              <div style={{ marginTop: '1.5rem', borderBottom: '1px dashed #94a3b8', width: '80%' }}></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Signature, DVM / Resident</div>
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
