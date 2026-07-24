import { useState } from 'react';
import { Activity, Calculator, FileText, BookOpen, Stethoscope } from 'lucide-react';
import './index.css';

// Components
import Flowsheet from './components/Flowsheet';
import DoseCalculator from './components/DoseCalculator';
import data from './data.json';

const appData = data as Record<string, any>;

function App() {
  const [activeTab, setActiveTab] = useState('Flowsheet');
  
  const tabs = [
    { id: 'Flowsheet', icon: <Activity size={18} />, label: 'Flowsheet' },
    { id: 'Dose Calculator', icon: <Calculator size={18} />, label: 'Dose Calculator' },
    { id: 'Standing Orders', icon: <FileText size={18} />, label: 'Orders' },
    { id: 'References', icon: <BookOpen size={18} />, label: 'References' },
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
                  <td key={colIdx}>{row[col] !== null ? String(row[col]) : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <Stethoscope color="var(--primary-color)" />
          Colic Flowsheet
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-content">
        {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
        <nav className="nav-container">
          <div className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem', display: 'none' }} id="nav-label">
            Menu
          </div>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
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

          {activeTab === 'Flowsheet' && <Flowsheet />}
          {activeTab === 'Dose Calculator' && <DoseCalculator />}
          {activeTab === 'Standing Orders' && renderTable('Standing Orders')}
          {activeTab === 'References' && renderTable('References')}
          
        </section>
      </main>
    </div>
  );
}

export default App;
