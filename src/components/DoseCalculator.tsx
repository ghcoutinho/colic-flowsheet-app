import { useState } from 'react';

type DrugConfig = {
  name: string;
  type: 'bolus' | 'cri' | 'fluid';
  doseRate: number;
  unit: string;
  conc: number | '';
  concUnit: string;
  freq?: string;
};

const defaultDrugs: DrugConfig[] = [
  { name: 'Potassium/Sodium Penicillin G', type: 'bolus', doseRate: 22000, unit: 'IU/kg', conc: 1000000, concUnit: 'IU/mL', freq: 'q6h' },
  { name: 'Procaine Penicillin G', type: 'bolus', doseRate: 22000, unit: 'IU/kg', conc: 300000, concUnit: 'IU/mL', freq: 'q12-24h' },
  { name: 'Gentamicin', type: 'bolus', doseRate: 6.6, unit: 'mg/kg', conc: 100, concUnit: 'mg/mL', freq: 'q24h' },
  { name: 'Flunixin meglumine', type: 'bolus', doseRate: 1.1, unit: 'mg/kg', conc: 50, concUnit: 'mg/mL', freq: 'q12h' },
  { name: 'Lidocaine 2% CRI', type: 'cri', doseRate: 3.0, unit: 'mg/kg/h', conc: 20, concUnit: 'mg/mL' },
  { name: 'LRS Maintenance', type: 'fluid', doseRate: 3.0, unit: 'mL/kg/h', conc: '', concUnit: '' },
  { name: 'LRS Resuscitation Bolus', type: 'fluid', doseRate: 20, unit: 'mL/kg', conc: '', concUnit: '' },
  { name: 'Hypertonic Saline 7.2%', type: 'fluid', doseRate: 4, unit: 'mL/kg', conc: '', concUnit: '' },
];

export default function DoseCalculator() {
  const [weight, setWeight] = useState<number | ''>(500);
  const [drugs, setDrugs] = useState<DrugConfig[]>(defaultDrugs);

  const updateDrug = (index: number, field: keyof DrugConfig, value: any) => {
    const newDrugs = [...drugs];
    newDrugs[index] = { ...newDrugs[index], [field]: value };
    setDrugs(newDrugs);
  };

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
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} 
            placeholder="e.g. 500"
          />
        </div>
      </div>

      <div className="card table-container">
        <h2 className="card-title">Dose Calculator (Verify Before Use)</h2>
        <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
          * Clinical decision support only. Verify all doses and rates against your formulary.
        </p>
        <table>
          <thead>
            <tr>
              <th>Drug / Fluid</th>
              <th>Dose Rate</th>
              <th>Total Dose</th>
              <th>Concentration</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {drugs.map((drug, idx) => {
              const w = Number(weight) || 0;
              const rate = Number(drug.doseRate) || 0;
              const conc = drug.conc !== '' ? Number(drug.conc) : null;
              
              let totalDose = w > 0 ? (w * rate) : 0;
              let volumeStr = '-';
              let doseStr = '-';

              if (totalDose > 0) {
                if (drug.type === 'fluid') {
                  doseStr = '-'; // Fluids don't have a separate "dose", total is the volume
                  volumeStr = `${totalDose.toLocaleString()} ${drug.unit.includes('/h') ? 'mL/h' : 'mL'}`;
                } else {
                  doseStr = `${totalDose.toLocaleString()} ${drug.unit.split('/')[0]}`;
                  if (conc && conc > 0) {
                    const vol = totalDose / conc;
                    volumeStr = `${vol.toLocaleString(undefined, {maximumFractionDigits: 2})} ${drug.unit.includes('/h') ? 'mL/h' : 'mL'}`;
                  }
                }
              }

              return (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{drug.name} <br/> <span className="text-muted" style={{fontSize: '0.75rem'}}>{drug.freq}</span></td>
                  <td className="editable-cell">
                    <input 
                      type="number" 
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
                  <td style={{ fontWeight: 600 }}>{volumeStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
