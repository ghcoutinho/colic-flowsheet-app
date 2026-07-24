import { useState, useEffect, type CSSProperties } from 'react';
import { Calculator, FileText, BookOpen, Stethoscope, AlertTriangle, User, Users } from 'lucide-react';
import './index.css';

// Components
import Flowsheet from './components/Flowsheet';
import DoseCalculator from './components/DoseCalculator';
import ReferenceIntervals from './components/ReferenceIntervals';
import PrognosisCalculator from './components/PrognosisCalculator';
import DecisionTriggers from './components/DecisionTriggers';
import ExpandableText from './components/ExpandableText';
import Identification from './components/Identification';
import PatientManager from './components/PatientManager';
import { defaultPatient } from './utils/algorithms';
import type { PatientProfile } from './utils/algorithms';
import data from './data.json';

const appData = data as Record<string, any>;

const HorseIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.87 3.09C11.53 2.37 12.72 2 14.15 2c1.78 0 3.2 1.34 3.4 3 .2.1 1.05.5 2 1 1 1 2.22 2.65 2.22 3.65 0 .5-.2.5-1.22 1.5a7 7 0 0 1-1.63 1.15c-.24 2.26-1.57 3.55-3.32 4.1a5 5 0 0 1-1.6.3v4.3L12 22l-2-2v-4.3c-.5-.1-1-.25-1.47-.45-2.04-1-3.15-2.9-3.48-5.25L4 8l3-3a6.83 6.83 0 0 1 3.87-1.91z"/>
  </svg>
);

// Per-tab colour identity (dermatograma-style): c = accent, d = darker, l = light tint
const TAB_THEME: Record<string, { c: string; d: string; l: string }> = {
  'Patients':        { c: '#3A7373', d: '#2f5f5f', l: '#e4eeee' },
  'Identification':  { c: '#557C67', d: '#456654', l: '#e7f0ea' },
  'Flowsheet':       { c: '#2C3E50', d: '#212f3d', l: '#e6eaef' },
  'Prognosis':       { c: '#D27357', d: '#b45c41', l: '#f6e6df' },
  'Dose Calculator': { c: '#C9922F', d: '#a97a22', l: '#f6edd8' },
  'Standing Orders': { c: '#7A5AA6', d: '#5f4685', l: '#ece4f4' },
  'References':      { c: '#3A7373', d: '#2f5f5f', l: '#e4eeee' },
  'Triggers':        { c: '#C0392B', d: '#a12f23', l: '#f7e0dd' },
};

function App() {
  const [activeTab, setActiveTab] = useState('Patients');
  const [sessionId, setSessionId] = useState<number>(Date.now());
  const [patient, setPatient] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem('cmt_patient');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultPatient;
  });

  const handleSessionChange = (newPatient: PatientProfile) => {
    setPatient(newPatient);
    setSessionId(Date.now()); // trigger remounts
  };

  useEffect(() => {
    localStorage.setItem('cmt_patient', JSON.stringify(patient));
  }, [patient]);
  
  const tabs = [
    { id: 'Patients', icon: <Users size={18} />, label: 'Patients' },
    { id: 'Identification', icon: <User size={18} />, label: 'Patient ID' },
    { id: 'Flowsheet', icon: <HorseIcon size={18} />, label: 'Flowsheet' },
    { id: 'Prognosis', icon: <Calculator size={18} />, label: 'Prognosis' },
    { id: 'Dose Calculator', icon: <Calculator size={18} />, label: 'Dose Calculator' },
    { id: 'Standing Orders', icon: <FileText size={18} />, label: 'Orders' },
    { id: 'References', icon: <BookOpen size={18} />, label: 'References' },
    { id: 'Triggers', icon: <AlertTriangle size={18} />, label: 'Triggers' },
  ];

  const renderTable = (sheetName: string) => {
    const sheet = appData[sheetName];
    if (!sheet || !sheet.data) return <div className="card"><p>No data available for {sheetName}.</p></div>;
    
    const validData = sheet.data.filter((row: any) => {
      const firstColValue = row[sheet.columns[0]];
      return firstColValue !== null && firstColValue !== undefined && firstColValue !== '';
    });

    return (
      <div className="card table-container">
        <table>
          <thead>
            <tr>
              {sheet.columns.map((col: string, idx: number) => (
                <th key={idx}>{col.startsWith('Unnamed:') ? '' : col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {validData.map((row: any, rowIdx: number) => (
              <tr key={rowIdx}>
                {sheet.columns.map((col: string, colIdx: number) => (
                  <td key={colIdx}><ExpandableText text={row[col] !== null ? String(row[col]) : ''} maxLength={80} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const theme = TAB_THEME[activeTab] || TAB_THEME['Patients'];
  const themeVars = {
    '--primary-color': theme.c,
    '--primary-hover': theme.d,
    '--primary-light': theme.l,
  } as CSSProperties;

  return (
    <div className="app-container" style={themeVars}>
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <Stethoscope />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span>CMT — Colic Monitoring Tool</span>
            <span className="header-sub">Post-op equine acute abdomen · {activeTab}</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-content">
        {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
        <nav className="nav-container">
          <div className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem', display: 'none' }} id="nav-label">
            Menu
          </div>
          {tabs.map((tab, i) => {
            const t = TAB_THEME[tab.id] || TAB_THEME['Patients'];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span
                  className="nav-badge"
                  style={{ background: isActive ? t.c : t.l, color: isActive ? '#fff' : t.d }}
                >{i + 1}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <section className="content-area">
          <div className="mb-4">
            <h1 className="text-xl mb-2">{activeTab}</h1>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              {activeTab === 'Dose Calculator' 
                ? 'Interactive weight-based calculator. Verfiy all rates against your formulary.' 
                : activeTab === 'Flowsheet'
                ? 'Record rounds and monitor clinical parameters. Ice score and alerts calculate automatically.'
                : 'Review standard protocols.'}
            </p>
          </div>

          {activeTab === 'Patients' && <PatientManager currentPatient={patient} onSessionChange={handleSessionChange} />}
          {activeTab === 'Identification' && <Identification key={sessionId} patient={patient} setPatient={setPatient} />}
          {activeTab === 'Flowsheet' && <Flowsheet key={sessionId} patient={patient} />}
          {activeTab === 'Prognosis' && <PrognosisCalculator key={`${sessionId}_prognosis`} />}
          {activeTab === 'Dose Calculator' && <DoseCalculator patient={patient} setPatient={setPatient} />}
          {activeTab === 'Standing Orders' && renderTable('Standing Orders')}
          {activeTab === 'References' && <ReferenceIntervals />}
          {activeTab === 'Triggers' && <DecisionTriggers />}
          
        </section>
      </main>
    </div>
  );
}

export default App;
