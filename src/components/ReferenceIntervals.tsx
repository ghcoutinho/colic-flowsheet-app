import { useState, useEffect } from 'react';
import defaultData from '../data/referenceIntervals.json';
import { Edit2, Save } from 'lucide-react';

type ReferenceItem = {
  name: string;
  reference: string;
  notes: string;
};

type ReferenceCategory = {
  category: string;
  parameters: ReferenceItem[];
};

export default function ReferenceIntervals() {
  const [data, setData] = useState<ReferenceCategory[]>(() => {
    const saved = localStorage.getItem('cmt_reference_intervals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse reference intervals from localStorage');
      }
    }
    return defaultData;
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    localStorage.setItem('cmt_reference_intervals', JSON.stringify(data));
  }, [data]);

  const updateValue = (catIndex: number, paramIndex: number, newValue: string) => {
    const newData = [...data];
    newData[catIndex].parameters[paramIndex].reference = newValue;
    setData(newData);
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all values to Cornell AHDC defaults?')) {
      setData(defaultData);
      setEditing(false);
    }
  };

  return (
    <div className="flex-col gap-4">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title" style={{ marginBottom: 0, borderBottom: 'none' }}>Clinical Reference Intervals</h2>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => setEditing(!editing)}>
              {editing ? <><Save size={16} /> Done Editing</> : <><Edit2 size={16} /> Edit My Lab Values</>}
            </button>
          </div>
        </div>
        <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
          By default, these are Cornell AHDC (Advia 2120 / Cobas) adult horse intervals. 
          You can edit the "Reference Interval" column below so it matches your in-house laboratory values.
          These values are saved to your device.
        </p>

        {editing && (
          <button className="btn" style={{ marginBottom: '1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }} onClick={resetToDefaults}>
            Reset to Cornell Defaults
          </button>
        )}

        {data.map((cat, catIndex) => (
          <div key={catIndex} className="table-container mb-4">
            <h3 className="mb-2" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{cat.category}</h3>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Parameter</th>
                  <th style={{ width: '30%' }}>Reference Interval</th>
                  <th style={{ width: '40%' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {cat.parameters.map((param, paramIndex) => (
                  <tr key={paramIndex}>
                    <td style={{ fontWeight: 500 }}>{param.name}</td>
                    <td className={editing ? 'editable-cell' : ''}>
                      {editing ? (
                        <input
                          type="text"
                          value={param.reference}
                          onChange={(e) => updateValue(catIndex, paramIndex, e.target.value)}
                          style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: 600 }}>{param.reference}</span>
                      )}
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.875rem' }}>{param.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
