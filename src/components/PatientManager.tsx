import { useState, useEffect } from 'react';
import { defaultPatient, defaultRound } from '../utils/algorithms';
import type { PatientProfile, RoundData, DrugConfig } from '../utils/algorithms';
import { Save, Plus, FolderOpen, Trash2 } from 'lucide-react';

type SavedSession = {
  id: string; // unique timestamp or uuid
  timestamp: number;
  patient: PatientProfile;
  rounds: RoundData[];
  rxList: DrugConfig[];
  schedule: any;
};

type Props = {
  currentPatient: PatientProfile;
  onSessionChange: (newPatient: PatientProfile) => void;
};

export default function PatientManager({ currentPatient, onSessionChange }: Props) {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cmt_saved_patients');
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSaveCurrent = () => {
    // Read current state directly from localStorage since it's constantly updated
    const patientStr = localStorage.getItem('cmt_patient');
    const roundsStr = localStorage.getItem('cmt_rounds');
    const rxListStr = localStorage.getItem('cmt_rxList');
    const scheduleStr = localStorage.getItem('cmt_schedule');

    const patient = patientStr ? JSON.parse(patientStr) : currentPatient;
    const rounds = roundsStr ? JSON.parse(roundsStr) : [];
    const rxList = rxListStr ? JSON.parse(rxListStr) : [];
    const schedule = scheduleStr ? JSON.parse(scheduleStr) : { tpr: '2h', gi: '4h', clinpath: '12h', laminitis: '12h', incision: '24h' };

    const newSession: SavedSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      patient,
      rounds,
      rxList,
      schedule
    };

    const newSaved = [newSession, ...savedSessions];
    setSavedSessions(newSaved);
    localStorage.setItem('cmt_saved_patients', JSON.stringify(newSaved));
    alert('Patient session saved successfully!');
  };

  const handleNewPatient = () => {
    if (!window.confirm('Are you sure? This will clear all current rounds, formulary, and patient data.')) return;
    
    localStorage.setItem('cmt_patient', JSON.stringify(defaultPatient));
    localStorage.setItem('cmt_rounds', JSON.stringify([{ ...defaultRound }]));
    localStorage.setItem('cmt_rxList', JSON.stringify([]));
    localStorage.setItem('cmt_schedule', JSON.stringify({ tpr: '2h', gi: '4h', clinpath: '12h', laminitis: '12h', incision: '24h' }));
    
    onSessionChange(defaultPatient);
  };

  const handleLoadPatient = (session: SavedSession) => {
    if (!window.confirm(`Load session for ${session.patient.id || 'Unnamed Patient'}? Current unsaved progress will be lost.`)) return;

    localStorage.setItem('cmt_patient', JSON.stringify(session.patient));
    localStorage.setItem('cmt_rounds', JSON.stringify(session.rounds));
    localStorage.setItem('cmt_rxList', JSON.stringify(session.rxList));
    localStorage.setItem('cmt_schedule', JSON.stringify(session.schedule));

    onSessionChange(session.patient);
  };

  const handleDeletePatient = (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this saved patient?')) return;
    const newSaved = savedSessions.filter(s => s.id !== id);
    setSavedSessions(newSaved);
    localStorage.setItem('cmt_saved_patients', JSON.stringify(newSaved));
  };

  return (
    <div className="flex-col gap-4">
      <div className="card" style={{ padding: '2rem', borderTop: '4px solid var(--primary-color)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0', color: 'var(--primary-color)' }}>
          Session Management
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSaveCurrent}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={18} /> Save Current Patient
          </button>
          
          <button 
            className="btn" 
            onClick={handleNewPatient}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <Plus size={18} /> Start New Patient
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
          Saved Patients
        </h3>
        
        {savedSessions.length === 0 ? (
          <p className="text-muted">No patients saved yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Saved On</th>
                  <th>Patient ID</th>
                  <th>Surgeon</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedSessions.map(session => (
                  <tr key={session.id}>
                    <td>{new Date(session.timestamp).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{session.patient.id || 'Unnamed'}</td>
                    <td>{session.patient.surgeon || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn"
                          onClick={() => handleLoadPatient(session)}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <FolderOpen size={14} /> Load
                        </button>
                        <button 
                          className="btn text-danger"
                          onClick={() => handleDeletePatient(session.id)}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', background: 'var(--danger-light)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
