import type { PatientProfile } from '../utils/algorithms';
import { User } from 'lucide-react';

type Props = {
  patient: PatientProfile;
  setPatient: (p: PatientProfile) => void;
};

export default function Identification({ patient, setPatient }: Props) {
  return (
    <div className="card" style={{ padding: '2rem', borderTop: '4px solid var(--primary-color)' }}>
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
  );
}
