import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { PatientProfile, DrugConfig } from '../utils/algorithms';
import { drugDatabase } from '../utils/algorithms';

export default function DoseCalculator() {
  const [patientWeight, setPatientWeight] = useState<number | ''>(500);
  const [selectedCategory, setSelectedCategory] = useState<string>("Antibiotics");
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(0);
  
  const [rxList, setRxList] = useState<DrugConfig[]>([]);

  // Load weight from Patient Profile on mount
  useEffect(() => {
    const saved = localStorage.getItem('cmt_patient');
    if (saved) {
      try {
        const p: PatientProfile = JSON.parse(saved);
        if (p.weight) setPatientWeight(p.weight);
      } catch (e) {}
    }
  }, []);

  // Load rxList from local storage on mount
  useEffect(() => {
    const savedRx = localStorage.getItem('cmt_rxList');
    if (savedRx) {
      try {
        setRxList(JSON.parse(savedRx));
      } catch(e) {}
    }
  }, []);

  // Save rxList to local storage on change
  useEffect(() => {
    localStorage.setItem('cmt_rxList', JSON.stringify(rxList));
  }, [rxList]);

  const addDrug = () => {
    const drugTemplate = drugDatabase[selectedCategory][selectedDrugIndex];
    setRxList([...rxList, { ...drugTemplate }]);
  };

  const removeDrug = (index: number) => {
    setRxList(rxList.filter((_, i) => i !== index));
  };

  const updateDrug = (index: number, field: keyof DrugConfig, value: any) => {
    const newList = [...rxList];
    newList[index] = { ...newList[index], [field]: value };
    setRxList(newList);
  };

  return (
    <div className="flex-col gap-4">
      
      {/* Rx Builder UI */}
      <div className="card">
        <h2 className="card-title">Prescription Builder</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Patient Weight (kg)</label>
            <input 
              type="number" 
              value={patientWeight} 
              onChange={(e) => setPatientWeight(e.target.value === '' ? '' : Number(e.target.value))} 
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600, color: 'var(--primary-color)' }}
              placeholder="e.g. 500"
            />
            <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Pulled from Flowsheet Profile</span>
          </div>

          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Category</label>
            <select 
              value={selectedCategory} 
              onChange={e => { setSelectedCategory(e.target.value); setSelectedDrugIndex(0); }}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            >
              {Object.keys(drugDatabase).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Drug</label>
            <select 
              value={selectedDrugIndex} 
              onChange={e => setSelectedDrugIndex(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            >
              {drugDatabase[selectedCategory].map((d, i) => (
                <option key={i} value={i}>{d.name} ({d.doseRate} {d.unit})</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={addDrug}>
              <Plus size={16} /> Add to Rx
            </button>
          </div>
        </div>
      </div>

      <div className="card table-container">
        <h2 className="card-title">Medication Administration Record (MAR)</h2>
        <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
          * Clinical decision support only. Verify all auto-calculated doses and rates against your formulary.
        </p>
        
        {rxList.length === 0 ? (
          <div className="text-muted text-center py-4">No drugs added. Build a prescription above.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Drug / Fluid</th>
                <th>Dose Rate</th>
                <th>Total Dose</th>
                <th>Concentration</th>
                <th>Final Volume</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rxList.map((drug, idx) => {
                const w = Number(patientWeight) || 0;
                const rate = Number(drug.doseRate) || 0;
                const conc = drug.conc !== '' ? Number(drug.conc) : null;
                
                let totalDose = w > 0 ? (w * rate) : 0;
                let volumeStr = '-';
                let doseStr = '-';

                if (totalDose > 0) {
                  if (drug.type === 'fluid') {
                    doseStr = '-';
                    volumeStr = `${totalDose.toLocaleString()} ${drug.unit.includes('/h') ? 'mL/h' : 'mL'}`;
                  } else {
                    doseStr = `${totalDose.toLocaleString()} ${drug.unit.split('/')[0]}`;
                    if (conc && conc > 0) {
                      const vol = totalDose / conc;
                      volumeStr = `${vol.toLocaleString(undefined, {maximumFractionDigits: 2})} ${drug.type === 'cri' ? 'mL/h' : drug.concUnit.includes('tablet') ? 'tabs' : 'mL'}`;
                    }
                  }
                }

                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>
                      {drug.name} <br/> 
                      <input 
                        type="text" 
                        value={drug.freq || ''} 
                        onChange={e => updateDrug(idx, 'freq', e.target.value)}
                        placeholder="freq"
                        style={{ fontSize: '0.75rem', width: '60px', padding: '2px', border: '1px solid var(--border-color)' }}
                      />
                    </td>
                    <td className="editable-cell">
                      <input 
                        type="number" 
                        step="0.01"
                        value={drug.doseRate} 
                        onChange={e => updateDrug(idx, 'doseRate', Number(e.target.value))}
                      />
                      <span className="text-muted ml-1" style={{fontSize:'0.75rem'}}>{drug.unit}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{doseStr}</td>
                    <td className="editable-cell">
                      {drug.type !== 'fluid' && (
                        <>
                          <input 
                            type="number" 
                            value={drug.conc} 
                            onChange={e => updateDrug(idx, 'conc', e.target.value === '' ? '' : Number(e.target.value))}
                          />
                          <span className="text-muted ml-1" style={{fontSize:'0.75rem'}}>{drug.concUnit}</span>
                        </>
                      )}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '1.1rem' }}>{volumeStr}</td>
                    <td>
                      <button onClick={() => removeDrug(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
