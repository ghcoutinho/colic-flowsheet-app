import { useState } from 'react';
import { Activity, AlertTriangle, Calculator, FileText, BookOpen, Stethoscope, Menu, Info } from 'lucide-react';
import data from './data.json';
import './index.css';

// Type definitions
type SheetData = {
  columns: string[];
  data: Record<string, any>[];
};

const appData = data as Record<string, SheetData>;

function App() {
  const [activeTab, setActiveTab] = useState('Flowsheet');
  const [weight, setWeight] = useState<number>(500);
  
  const tabs = [
    { id: 'Flowsheet', icon: <Activity size={18} />, label: 'Flowsheet' },
    { id: 'Call Surgeon Triggers', icon: <AlertTriangle size={18} />, label: 'Call Triggers' },
    { id: 'Standing Orders', icon: <FileText size={18} />, label: 'Standing Orders' },
    { id: 'Dose Calculator', icon: <Calculator size={18} />, label: 'Dose Calculator' },
    { id: 'References', icon: <BookOpen size={18} />, label: 'References' },
    { id: 'How to Use', icon: <Info size={18} />, label: 'How to Use' },
  ];

  const renderTable = (sheetName: string) => {
    const sheet = appData[sheetName];
    if (!sheet || !sheet.data) return <p>No data available for this section.</p>;
    
    // Filter out rows that are completely empty or just headers/metadata based on the first column
    const validData = sheet.data.filter(row => {
      const firstColValue = row[sheet.columns[0]];
      return firstColValue !== null && firstColValue !== undefined && firstColValue !== '';
    });

    return (
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {sheet.columns.map((col, idx) => (
                <th key={idx}>{col.startsWith('Unnamed:') ? '' : col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {validData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {sheet.columns.map((col, colIdx) => (
                  <td key={colIdx}>{row[col] !== null ? String(row[col]) : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCalculator = () => {
    const sheet = appData['Dose Calculator'];
    if (!sheet) return null;

    // Hardcode some of the parsing for the dose calculator based on typical structure
    const drugs = sheet.data.filter(row => {
      const firstCol = row[sheet.columns[0]];
      return firstCol && typeof firstCol === 'string' && firstCol !== 'Drug' && !firstCol.includes('CALCULATOR') && !firstCol.includes('BOLUS');
    });

    return (
      <div className="flex-col gap-4">
        <div className="card" style={{ maxWidth: '400px' }}>
          <h2 className="card-title">Patient Weight</h2>
          <div className="input-group">
            <label className="input-label">Body Weight (kg)</label>
            <input 
              type="number" 
              className="input-field" 
              value={weight} 
              onChange={(e) => setWeight(Number(e.target.value) || 0)} 
            />
          </div>
        </div>

        <div className="card" style={{ overflowX: 'auto' }}>
          <h2 className="card-title">Calculated Doses</h2>
          <table>
            <thead>
              <tr>
                <th>Drug</th>
                <th>Indication</th>
                <th>Dose Rate</th>
                <th>Total Dose</th>
                <th>Concentration</th>
                <th>Volume (mL)</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((drug, idx) => {
                const name = drug[sheet.columns[0]];
                const indication = drug['Unnamed: 1'];
                const doseRateStr = drug['Unnamed: 3'];
                const doseRateUnit = drug['Unnamed: 4'];
                const concStr = drug['Unnamed: 6'];
                const concUnit = drug['Unnamed: 7'];

                const doseRate = Number(doseRateStr) || 0;
                const conc = Number(concStr) || 0;
                
                const totalDose = doseRate > 0 ? (weight * doseRate) : 0;
                const volume = (totalDose > 0 && conc > 0) ? (totalDose / conc).toFixed(2) : '-';

                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{name}</td>
                    <td className="text-muted">{indication}</td>
                    <td>{doseRateStr ? `${doseRateStr} ${doseRateUnit || ''}` : '-'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                      {totalDose > 0 ? `${totalDose.toLocaleString()} ${doseRateUnit?.split('/')[0] || ''}` : '-'}
                    </td>
                    <td>{concStr ? `${concStr} ${concUnit || ''}` : '-'}</td>
                    <td style={{ fontWeight: 600 }}>{volume}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <Stethoscope color="var(--primary-color)" />
          PostOp Colic Flowsheet & Care Plan
        </div>
        <div>
          <button className="btn btn-primary">
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="mb-4 text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 1rem' }}>
            Sections
          </div>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <section className="content-area">
          <div className="mb-4">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {activeTab}
            </h1>
            <p className="text-muted">
              {activeTab === 'Dose Calculator' 
                ? 'Enter the patient weight to automatically calculate required doses.' 
                : 'Review the protocol and requirements below.'}
            </p>
          </div>

          {activeTab === 'Dose Calculator' ? renderCalculator() : renderTable(activeTab)}
          
        </section>
      </main>
    </div>
  );
}

export default App;
