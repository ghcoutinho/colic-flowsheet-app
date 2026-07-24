import { useState, useEffect } from 'react';
import { Plus, Activity, Pill } from 'lucide-react';
import { drugDatabase, evaluateParameterColor, defaultRound, parseFreqHours, sortRoundsByTime, ceilToHour, projectDueTimes } from '../utils/algorithms';
import type { PatientProfile, RoundData, DrugConfig } from '../utils/algorithms';

const MED_HORIZON_HOURS = 24;

type Props = {
  patient: PatientProfile;
};

export default function Flowsheet({ patient }: Props) {

  const [rounds, setRounds] = useState<RoundData[]>(() => {
    const saved = localStorage.getItem('cmt_rounds');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [{ ...defaultRound, hr: 44, temp: 37.8, pcv: 38, tp: 6.5 }];
  });

  const [schedule, setSchedule] = useState({
    tpr: 'q2h',
    gi: 'q4h',
    clinpath: 'q12h',
    laminitis: 'q6h',
    incision: 'q12h'
  });

  const [rxList, setRxList] = useState<DrugConfig[]>(() => {
    const savedRx = localStorage.getItem('cmt_rxList');
    if (savedRx) {
      try { return JSON.parse(savedRx); } catch (e) {}
    }
    return [];
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("Antibiotics");
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(0);
  const [selectedFreq, setSelectedFreq] = useState<string>('6');
  const [customDoseRate, setCustomDoseRate] = useState<number | ''>('');
  const [customConc, setCustomConc] = useState<number | ''>('');

  // CRI Stop form state
  const [stoppingDrugIndex, setStoppingDrugIndex] = useState<number | null>(null);
  const [stoppingTime, setStoppingTime] = useState<string>('12:00');
  const [stoppingReason, setStoppingReason] = useState<string>('improved motility');
  const [stoppingNote, setStoppingNote] = useState<string>('');

  useEffect(() => {
    const drugTemplate = drugDatabase[selectedCategory]?.[selectedDrugIndex];
    if (drugTemplate) {
      setSelectedFreq(drugTemplate.freq || '6');
      setCustomDoseRate(drugTemplate.doseRate);
      setCustomConc(drugTemplate.conc);
    }
  }, [selectedCategory, selectedDrugIndex]);


  useEffect(() => {
    localStorage.setItem('cmt_rounds', JSON.stringify(rounds));
  }, [rounds]);

  useEffect(() => {
    const savedSch = localStorage.getItem('cmt_schedule');
    if (savedSch) {
      try { setSchedule(JSON.parse(savedSch)); } catch (e) { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cmt_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('cmt_rxList', JSON.stringify(rxList));
  }, [rxList]);

  const addDrugToFlowsheet = () => {
    const drugTemplate = drugDatabase[selectedCategory][selectedDrugIndex];
    // Avoid adding the same drug twice (the schedule is keyed by drug name).
    if (rxList.some(d => d.name === drugTemplate.name)) return;
    const newRx: DrugConfig = {
      ...drugTemplate,
      doseRate: Number(customDoseRate) || drugTemplate.doseRate,
      conc: customConc !== '' ? Number(customConc) : drugTemplate.conc,
      freq: selectedFreq
    };
    setRxList([...rxList, newRx]);
    // Immediately project the dose schedule at the drug's own frequency.
    setRounds(prev => buildDrugSchedule(newRx.name, newRx.freq, prev));
  };

  const removeDrugFromFlowsheet = (drugIndex: number) => {
    const drugName = rxList[drugIndex].name;
    setRxList(rxList.filter((_, i) => i !== drugIndex));
    // Strip this drug's markers from every round.
    setRounds(prev => prev.map(r => {
      if (!r.medications || !(drugName in r.medications)) return r;
      const meds = { ...r.medications };
      delete meds[drugName];
      return { ...r, medications: meds };
    }));
  };

  const addRound = () => {
    // 1. Get current time and next full hour
    const now = new Date();
    let nextHourDate = new Date(now);
    nextHourDate.setMinutes(0, 0, 0);
    nextHourDate.setHours(now.getHours() + 1);

    // 2. Determine end of shift (07:00 or 19:00)
    const currentHour = now.getHours();
    let shiftEndDate = new Date(nextHourDate);
    if (currentHour >= 7 && currentHour < 19) {
      // Day shift ends at 19:00 today
      shiftEndDate.setHours(19, 0, 0, 0);
    } else {
      // Night shift ends at 07:00
      shiftEndDate.setHours(7, 0, 0, 0);
      if (currentHour >= 19) {
        // Ends tomorrow
        shiftEndDate.setDate(shiftEndDate.getDate() + 1);
      }
    }

    // 3. Get interval from TPR schedule (e.g. 'q2h' -> 2)
    const intervalStr = schedule.tpr;
    const intervalHours = parseInt(intervalStr.replace('q', '').replace('h', '')) || 2;

    const newRounds: RoundData[] = [];
    let loopDate = new Date(nextHourDate);

    // 4. Generate rounds until end of shift
    // If the next full hour is ALREADY past the shift end (e.g. it's 18:30 and shift ends at 19:00, next hour is 19:00)
    // we still add that boundary round.
    while (loopDate <= shiftEndDate) {
      const timeStr = loopDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      // Avoid duplicate times if user clicks multiple times
      const alreadyExists = rounds.some(r => r.time === timeStr);
      if (!alreadyExists && newRounds.some(r => r.time === timeStr) === false) {
        newRounds.push({ ...defaultRound, time: timeStr });
      }

      loopDate.setHours(loopDate.getHours() + intervalHours);
    }
    
    // If we didn't generate any future rounds (e.g. shift just ended), just add one manual round
    if (newRounds.length === 0) {
      const manualTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      newRounds.push({ ...defaultRound, time: manualTime });
    }

    // Merge, keep chronological order, then re-apply each drug's schedule so the
    // newly-added columns pick up any DUE doses that fall on them.
    let merged = sortRoundsByTime([...rounds, ...newRounds]);
    for (const drug of rxList) {
      merged = buildDrugSchedule(drug.name, drug.freq, merged);
    }
    setRounds(merged);
  };

  const updateRound = (index: number, field: keyof RoundData, value: any) => {
    const newRounds = [...rounds];
    newRounds[index] = { ...newRounds[index], [field]: value };
    setRounds(newRounds);
  };

  const deleteRound = (index: number) => {
    if (rounds.length <= 1) {
      alert("At least one round must remain on the flowsheet.");
      return;
    }
    const rTime = rounds[index]?.time || 'this round';
    if (window.confirm(`Delete round at ${rTime}?`)) {
      setRounds(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Place DUE markers at the given times, creating new round columns when a
  // matching time doesn't exist yet. GIVEN doses are never overwritten.
  const placeDueMarkers = (rs: RoundData[], drugName: string, times: string[]): RoundData[] => {
    const result = [...rs];
    const seen = new Set<string>();
    for (const t of times) {
      if (seen.has(t)) continue;
      seen.add(t);
      const idx = result.findIndex(r => r.time === t);
      if (idx !== -1) {
        if (result[idx].medications?.[drugName] === 'GIVEN') continue;
        result[idx] = { ...result[idx], medications: { ...(result[idx].medications || {}), [drugName]: 'DUE' } };
      } else {
        result.push({ ...defaultRound, time: t, medications: { [drugName]: 'DUE' } });
      }
    }
    return result;
  };

  // Rebuild the DUE/CRI markers for a single drug across all rounds, preserving
  // any GIVEN doses. Anchoring:
  //  - if a dose has been GIVEN, the next dose is due one interval after the
  //    latest given time (a late dose pushes the next one back);
  //  - otherwise doses are projected from the first round's time (due now).
  const buildDrugSchedule = (drugName: string, freq: string | undefined, currentRounds: RoundData[]): RoundData[] => {
    // Clear previous DUE / CRI markers for this drug (keep GIVEN).
    let newRounds = currentRounds.map(r => {
      const state = r.medications?.[drugName];
      if (state === 'DUE' || state === 'CRI') {
        const meds = { ...r.medications };
        delete meds[drugName];
        return { ...r, medications: meds };
      }
      return r;
    });

    const f = (freq || '').trim().toUpperCase();

    // CRI: mark every round as continuously running.
    if (f === 'CRI') {
      newRounds = newRounds.map(r => ({
        ...r,
        medications: { ...(r.medications || {}), [drugName]: r.medications?.[drugName] === 'GIVEN' ? 'GIVEN' : 'CRI' }
      }));
      return sortRoundsByTime(newRounds);
    }

    // Determine the anchor time.
    const givenRounds = sortRoundsByTime(newRounds.filter(r => r.medications?.[drugName] === 'GIVEN'));
    const sorted = sortRoundsByTime(newRounds);
    const hasGiven = givenRounds.length > 0;
    const anchor = ceilToHour(hasGiven ? givenRounds[givenRounds.length - 1].time : (sorted[0]?.time || defaultRound.time));

    // STAT: a single dose at the anchor, only while nothing has been given.
    if (f === 'STAT') {
      if (!hasGiven) newRounds = placeDueMarkers(newRounds, drugName, [anchor]);
      return sortRoundsByTime(newRounds);
    }

    const interval = parseFreqHours(freq);
    if (!interval) return sortRoundsByTime(newRounds); // PRN / unknown freq: no auto-schedule

    // If a dose was given, start the projection one interval later (the given
    // dose covers the anchor); otherwise the first dose is due at the anchor.
    const times = projectDueTimes(anchor, interval, MED_HORIZON_HOURS);
    const dueTimes = hasGiven ? times.slice(1) : times;
    newRounds = placeDueMarkers(newRounds, drugName, dueTimes);
    return sortRoundsByTime(newRounds);
  };

  const updateMedicationRound = (index: number, drugName: string, isGiven: boolean, freq?: string) => {
    setRounds(prev => {
      const rs = [...prev];
      const meds = { ...(rs[index].medications || {}) };
      if (isGiven) meds[drugName] = 'GIVEN';
      else delete meds[drugName];
      rs[index] = { ...rs[index], medications: meds };
      return buildDrugSchedule(drugName, freq, rs);
    });
  };

  const updateDrugFreq = (drugIndex: number, newFreq: string) => {
    const drugName = rxList[drugIndex].name;
    setRxList(rxList.map((d, i) => (i === drugIndex ? { ...d, freq: newFreq } : d)));
    setRounds(prev => buildDrugSchedule(drugName, newFreq, prev));
  };

  const setCriStopInfo = (drugIndex: number, stopTime: string, stopReason: string, stopNote = '') => {
    setRxList(prev => prev.map((d, i) => i === drugIndex ? { ...d, stopTime, stopReason, stopNote } : d));
    setStoppingDrugIndex(null);
  };

  const clearCriStopInfo = (drugIndex: number) => {
    setRxList(prev => prev.map((d, i) => {
      if (i === drugIndex) {
        const copy = { ...d };
        delete copy.stopTime;
        delete copy.stopReason;
        delete copy.stopNote;
        return copy;
      }
      return d;
    }));
  };

  const discontinueDrug = (drugIndex: number) => {
    const lastTime = rounds.length > 0 ? rounds[rounds.length - 1].time : '12:00';
    setRxList(prev => prev.map((d, i) => i === drugIndex ? { ...d, discontinued: true, discontinuedTime: lastTime } : d));
  };

  const resumeDrug = (drugIndex: number) => {
    setRxList(prev => prev.map((d, i) => {
      if (i === drugIndex) {
        const copy = { ...d };
        delete copy.discontinued;
        delete copy.discontinuedTime;
        return copy;
      }
      return d;
    }));
  };

  return (
    <div className="flex-col gap-4">
      {/* Prescription Builder */}
      <div className="card" style={{ padding: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
          <Pill size={16} /> Add Medication to Flowsheet
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Category</label>
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
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Drug</label>
            <select 
              value={selectedDrugIndex} 
              onChange={e => setSelectedDrugIndex(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            >
              {drugDatabase[selectedCategory].map((d, i) => (
                <option key={i} value={i}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>
              Dose Rate ({drugDatabase[selectedCategory][selectedDrugIndex]?.unit})
            </label>
            <input
              type="number"
              step="any"
              value={customDoseRate}
              onChange={e => setCustomDoseRate(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600 }}
            />
          </div>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>
              Conc ({drugDatabase[selectedCategory][selectedDrugIndex]?.concUnit || '-'})
            </label>
            <input
              type="number"
              step="any"
              value={customConc}
              onChange={e => setCustomConc(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600 }}
              placeholder="Conc..."
            />
          </div>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', fontWeight: 600 }}>Freq (hours)</label>
            <select 
              value={selectedFreq} 
              onChange={e => setSelectedFreq(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600 }}
            >
              {['1', '2', '4', '6', '8', '12', '24', 'CRI', 'STAT'].map(f => (
                <option key={f} value={f}>{f === 'CRI' || f === 'STAT' ? f : `every ${f}h`}</option>
              ))}
            </select>
          </div>
          <div>
            <button className="btn btn-primary" onClick={addDrugToFlowsheet} style={{ width: '100%' }}>
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="card-title" style={{ marginBottom: 0, borderBottom: 'none' }}><Activity size={18} style={{display:'inline', marginRight: '4px'}}/> Clinical Flowsheet</h2>
          <button className="btn btn-primary" onClick={addRound}><Plus size={16} /> Add Round</button>
        </div>
        <div className="table-container" style={{ maxHeight: 'calc(100vh - 220px)', minHeight: '350px' }}>
          <table className="table-fixed-col">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Target</th>
              {rounds.map((r, i) => (
                <th key={i} style={{ minWidth: '130px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem' }}>
                    <input type="time" value={r.time} onChange={e => updateRound(i, 'time', e.target.value)} style={{ background: 'transparent', border: 'none', fontWeight: 600, color: 'inherit', width: '100%' }} />
                    <button
                      type="button"
                      className="med-remove"
                      title={`Delete round at ${r.time}`}
                      onClick={() => deleteRound(i)}
                      style={{ opacity: 0.6, fontSize: '1.1rem', padding: '0 2px', lineHeight: 1 }}
                    >×</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Vitals */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-main)' }}>VITALS & PERFUSION <span className="badge ml-2" style={{fontSize: '0.65rem'}}>{schedule.tpr}</span></td></tr>
            <tr>
              <td>Heart Rate (bpm)</td><td className="text-muted">28–44</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" value={r.hr} onChange={e => updateRound(i, 'hr', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: evaluateParameterColor('hr', r.hr), fontWeight: evaluateParameterColor('hr', r.hr) !== 'inherit' ? 700 : 400 }} /></td>)}
            </tr>
            <tr>
              <td>Resp Rate (/min)</td><td className="text-muted">10–24</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" value={r.rr} onChange={e => updateRound(i, 'rr', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: evaluateParameterColor('rr', r.rr), fontWeight: evaluateParameterColor('rr', r.rr) !== 'inherit' ? 700 : 400 }} /></td>)}
            </tr>
            <tr>
              <td>Temp (°C)</td><td className="text-muted">37.2–38.5</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" step="0.1" value={r.temp} onChange={e => updateRound(i, 'temp', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: evaluateParameterColor('temp', r.temp), fontWeight: evaluateParameterColor('temp', r.temp) !== 'inherit' ? 700 : 400 }} /></td>)}
            </tr>
            <tr>
              <td>Mucous membranes</td><td className="text-muted">pink</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.mm} onChange={e => updateRound(i, 'mm', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="pink">pink</option><option value="pale">pale</option><option value="injected">injected</option><option value="toxic line">toxic line</option><option value="purple">purple</option><option value="cyanotic">cyanotic</option><option value="icteric">icteric</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>CRT (sec)</td><td className="text-muted">≤ 2</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" value={r.crt} onChange={e => updateRound(i, 'crt', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: evaluateParameterColor('crt', r.crt), fontWeight: evaluateParameterColor('crt', r.crt) !== 'inherit' ? 700 : 400 }} /></td>)}
            </tr>
            <tr>
              <td>Mentation</td><td className="text-muted">BAR</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.mentation} onChange={e => updateRound(i, 'mentation', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="BAR">BAR</option><option value="QAR">QAR</option><option value="Depressed">Depressed</option><option value="Obtunded">Obtunded</option>
                  </select>
                </td>
              ))}
            </tr>
            
            {/* Pain */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-main)' }}>PAIN ASSESSMENT</td></tr>
            <tr>
              <td>Pain score (0-3)</td><td className="text-muted">0</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" value={r.painScore} onChange={e => updateRound(i, 'painScore', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: typeof r.painScore === 'number' && r.painScore >= 2 ? 'var(--danger)' : 'inherit' }} /></td>)}
            </tr>
            <tr>
              <td>Pain behavior</td><td className="text-muted">none</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.painBehavior} onChange={e => updateRound(i, 'painBehavior', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="none">none</option><option value="pawing">pawing</option><option value="flank watching">flank watching</option><option value="rolling">rolling</option><option value="kicking abdomen">kicking abdomen</option><option value="bruxism">bruxism</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Analgesia given?</td><td className="text-muted">-</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.analgesiaGiven} onChange={e => updateRound(i, 'analgesiaGiven', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="Y">Y</option><option value="N">N</option>
                  </select>
                </td>
              ))}
            </tr>

            {/* GI */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-main)' }}>GI FUNCTION <span className="badge ml-2" style={{fontSize: '0.65rem'}}>{schedule.gi}</span></td></tr>
            <tr>
              <td>Gut sounds (0-4)</td><td className="text-muted">all quad</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.gutSounds} onChange={e => updateRound(i, 'gutSounds', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="normal 4-quad">normal 4-quad</option><option value="reduced">reduced</option><option value="absent">absent</option><option value="hypermotile">hypermotile</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Reflux Vol (L)</td><td className="text-muted">&lt; 2 L</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" step="0.5" value={r.refluxVol} onChange={e => updateRound(i, 'refluxVol', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: typeof r.refluxVol === 'number' && r.refluxVol >= 2 ? 'var(--danger)' : 'inherit' }} /></td>)}
            </tr>
            <tr>
              <td>Reflux appearance</td><td className="text-muted">-</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.refluxApp} onChange={e => updateRound(i, 'refluxApp', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="none">none</option><option value="green/feed">green/feed</option><option value="brown/foul">brown/foul</option><option value="hemorrhagic">hemorrhagic</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>NGT left in place?</td><td className="text-muted">N</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.ngtLeft} onChange={e => updateRound(i, 'ngtLeft', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="Y">Y</option><option value="N">N</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Manure passed?</td><td className="text-muted">Y</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.manurePassed} onChange={e => updateRound(i, 'manurePassed', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="Y">Y</option><option value="N">N</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Fecal character</td><td className="text-muted">-</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.fecalChar} onChange={e => updateRound(i, 'fecalChar', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="normal">normal</option><option value="soft/cow-pie">soft/cow-pie</option><option value="diarrhea">diarrhea</option><option value="dry/firm">dry/firm</option><option value="none">none</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Abdominal distension</td><td className="text-muted">0</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" value={r.abDistension} onChange={e => updateRound(i, 'abDistension', e.target.value === '' ? '' : Number(e.target.value))} /></td>)}
            </tr>

            {/* ClinPath */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-main)' }}>CLINICOPATHOLOGY <span className="badge ml-2" style={{fontSize: '0.65rem'}}>{schedule.clinpath}</span></td></tr>
            <tr>
              <td>PCV (%)</td><td className="text-muted">32-45</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" step="1" value={r.pcv} onChange={e => updateRound(i, 'pcv', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: evaluateParameterColor('pcv', r.pcv), fontWeight: evaluateParameterColor('pcv', r.pcv) !== 'inherit' ? 700 : 400 }} /></td>)}
            </tr>
            <tr>
              <td>TP (g/dL)</td><td className="text-muted">6.0-8.0</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" step="0.1" value={r.tp} onChange={e => updateRound(i, 'tp', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: evaluateParameterColor('tp', r.tp), fontWeight: evaluateParameterColor('tp', r.tp) !== 'inherit' ? 700 : 400 }} /></td>)}
            </tr>
            <tr>
              <td>Lactate (mmol/L)</td><td className="text-muted">&lt; 2.0</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" step="0.1" value={r.lactate} onChange={e => updateRound(i, 'lactate', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: evaluateParameterColor('lactate', r.lactate), fontWeight: evaluateParameterColor('lactate', r.lactate) !== 'inherit' ? 700 : 400 }} /></td>)}
            </tr>
            <tr>
              <td>WBC (×10³/µL)</td><td className="text-muted">5–12.5</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" step="0.1" value={r.wbc} onChange={e => updateRound(i, 'wbc', e.target.value === '' ? '' : Number(e.target.value))} style={{ color: typeof r.wbc === 'number' && (r.wbc < 5 || r.wbc > 12.5) ? 'var(--danger)' : 'inherit' }} /></td>)}
            </tr>
            <tr>
              <td>Glucose (mg/dL)</td><td className="text-muted">75-115</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" value={r.bg} onChange={e => updateRound(i, 'bg', e.target.value === '' ? '' : Number(e.target.value))} /></td>)}
            </tr>
            <tr>
              <td>Creatinine (mg/dL)</td><td className="text-muted">&lt; 1.8</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" step="0.1" value={r.creatinine} onChange={e => updateRound(i, 'creatinine', e.target.value === '' ? '' : Number(e.target.value))} /></td>)}
            </tr>

            {/* Fluids */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem' }}>FLUIDS & OUTPUT</td></tr>
            <tr>
              <td>IV Fluid Type</td><td className="text-muted">per order</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.ivFluidType} onChange={e => updateRound(i, 'ivFluidType', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="LRS">LRS</option><option value="Plasmalyte-A">Plasmalyte-A</option><option value="0.9% NaCl">0.9% NaCl</option><option value="Hypertonic">Hypertonic</option><option value="5% Dextrose">5% Dextrose</option><option value="Plasma">Plasma</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>IV Rate</td><td className="text-muted">per order</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.ivRate} onChange={e => updateRound(i, 'ivRate', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="maint">maint</option><option value="2x maint">2x maint</option><option value="bolus">bolus</option><option value="off">off</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Vol Infused (L)</td><td className="text-muted">-</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" step="0.5" value={r.volInfused} onChange={e => updateRound(i, 'volInfused', e.target.value === '' ? '' : Number(e.target.value))} /></td>)}
            </tr>
            <tr>
              <td>Urine passed?</td><td className="text-muted">Y</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.urinePassed} onChange={e => updateRound(i, 'urinePassed', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="Y">Y</option><option value="N">N</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Urine Out (L)</td><td className="text-muted">-</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" step="0.5" value={r.urineOut} onChange={e => updateRound(i, 'urineOut', e.target.value === '' ? '' : Number(e.target.value))} /></td>)}
            </tr>

            {/* Laminitis */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem' }}>LAMINITIS & CRYOTHERAPY <span className="badge ml-2" style={{fontSize: '0.65rem'}}>{schedule.laminitis}</span></td></tr>
            <tr>
              <td>Digital pulse LF/RF</td><td className="text-muted">normal</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.pulseFront} onChange={e => updateRound(i, 'pulseFront', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="normal">normal</option><option value="bounding">bounding</option><option value="faint/absent">faint/absent</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Digital pulse LH/RH</td><td className="text-muted">normal</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.pulseHind} onChange={e => updateRound(i, 'pulseHind', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="normal">normal</option><option value="bounding">bounding</option><option value="faint/absent">faint/absent</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Hoof heat</td><td className="text-muted">cool</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.hoofHeat} onChange={e => updateRound(i, 'hoofHeat', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="cool">cool</option><option value="warm">warm</option><option value="hot">hot</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Weight-shift/stance</td><td className="text-muted">normal</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.weightShift} onChange={e => updateRound(i, 'weightShift', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="normal">normal</option><option value="frequent shifting">frequent shifting</option><option value="camped out">camped out</option><option value="sawhorse">sawhorse</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Obel Grade (0-4)</td><td className="text-muted">0</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" value={r.obelGrade} onChange={e => updateRound(i, 'obelGrade', e.target.value === '' ? '' : Number(e.target.value))} /></td>)}
            </tr>
            <tr>
              <td>Cryotherapy ON?</td><td className="text-muted">Y/N</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.cryoOn} onChange={e => updateRound(i, 'cryoOn', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="Y">Y</option><option value="N">N</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>Hoof Temp Achieved</td><td className="text-muted">&lt;10°C</td>
              {rounds.map((r, i) => <td key={i} className="editable-cell"><input type="number" value={r.hoofTemp} onChange={e => updateRound(i, 'hoofTemp', e.target.value === '' ? '' : Number(e.target.value))} /></td>)}
            </tr>
            
            {/* Incision */}
            <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem' }}>INCISION & CATHETER <span className="badge ml-2" style={{fontSize: '0.65rem'}}>{schedule.incision}</span></td></tr>
            <tr>
              <td>Incision status</td><td className="text-muted">clean</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.incision} onChange={e => updateRound(i, 'incision', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="clean/dry">clean/dry</option><option value="swelling">swelling</option><option value="serosanguinous">serosanguinous</option><option value="purulent">purulent</option><option value="dehiscence">dehiscence</option>
                  </select>
                </td>
              ))}
            </tr>
            <tr>
              <td>IV Cath Site</td><td className="text-muted">clean</td>
              {rounds.map((r, i) => (
                <td key={i} className="editable-cell">
                  <select value={r.ivCath} onChange={e => updateRound(i, 'ivCath', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none' }}>
                    <option value=""></option><option value="clean/no heat">clean/no heat</option><option value="warm">warm</option><option value="swollen">swollen</option><option value="painful">painful</option><option value="thrombosed">thrombosed</option>
                  </select>
                </td>
              ))}
            </tr>

            {/* Medications */}
            {rxList.length > 0 && (
              <>
                <tr><td colSpan={100} style={{ backgroundColor: 'var(--bg-main)', fontWeight: 600, fontSize: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span>MEDICATIONS</span>
                    <span className="med-legend">
                      <span><i className="med-key med-key-due" /> Due</span>
                      <span><i className="med-key med-key-given" /> Given</span>
                      <span><i className="med-key med-key-cri" /> CRI</span>
                    </span>
                  </span>
                </td></tr>
                {rxList.map((drug, drugIndex) => {
                   const freqOptions = ['1','2','4','6','8','12','24','CRI','STAT'];
                   const drugFreq = drug.freq || '';
                   // Preserve range/custom freqs (e.g. '12') as a selectable option.
                   const showCustomFreq = drugFreq && !freqOptions.includes(drugFreq);
                   const w = Number(patient.weight) || 0;
                   const rate = Number(drug.doseRate) || 0;
                   const conc = drug.conc !== '' ? Number(drug.conc) : null;
                   
                   let suggestedText = '-';
                   if (w > 0) {
                     const hourlyRate = drug.unit.includes('/min') ? rate * 60 : rate;
                     const totalDose = w * hourlyRate;
                     if (drug.type === 'fluid') {
                       suggestedText = `${totalDose.toLocaleString()} ${drug.unit.includes('/h') || drug.unit.includes('/min') ? 'mL/h' : 'mL'}`;
                     } else {
                       if (conc && conc > 0) {
                         const vol = totalDose / conc;
                         suggestedText = `${vol.toLocaleString(undefined, {maximumFractionDigits: 2})} ${drug.type === 'cri' || drug.unit.includes('/h') || drug.unit.includes('/min') ? 'mL/h' : drug.concUnit.includes('tablet') ? 'tabs' : 'mL'}`;
                       } else {
                         suggestedText = `${totalDose.toLocaleString()} ${drug.unit.split('/')[0]}`;
                       }
                     }
                   }

                   return (
                     <tr key={drugIndex}>
                       <td>
                         <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                           <button
                             type="button"
                             className="med-remove"
                             title={`Remove ${drug.name}`}
                             onClick={() => removeDrugFromFlowsheet(drugIndex)}
                           >×</button>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
                              <span style={{ fontWeight: 600 }}>{drug.name}</span>
                              <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                                <select
                                  className="med-freq"
                                  value={drugFreq}
                                  onChange={e => updateDrugFreq(drugIndex, e.target.value)}
                                  disabled={drug.discontinued}
                                >
                                  {showCustomFreq && <option value={drugFreq}>{drugFreq}h</option>}
                                  {!drugFreq && <option value="">PRN</option>}
                                  {freqOptions.map(o => <option key={o} value={o}>{o === 'CRI' || o === 'STAT' ? o : `${o}h`}</option>)}
                                </select>

                                {!drug.discontinued && (
                                  <button
                                    type="button"
                                    className="btn btn-ghost"
                                    style={{ fontSize: '0.65rem', padding: '2px 5px', color: '#dc2626', fontWeight: 600 }}
                                    onClick={() => discontinueDrug(drugIndex)}
                                    title="Discontinue future doses of this medication"
                                  >
                                    Discontinue
                                  </button>
                                )}

                                {(drugFreq === 'CRI' || drug.type === 'cri') && !drug.stopTime && !drug.discontinued && stoppingDrugIndex !== drugIndex && (
                                  <button
                                    type="button"
                                    className="btn btn-ghost"
                                    style={{ fontSize: '0.65rem', padding: '2px 5px', color: 'var(--danger)' }}
                                    onClick={() => {
                                      const lastT = rounds.length > 0 ? rounds[rounds.length - 1].time : '12:00';
                                      setStoppingDrugIndex(drugIndex);
                                      setStoppingTime(lastT);
                                      setStoppingReason('improved motility');
                                      setStoppingNote('');
                                    }}
                                  >
                                    + Stop CRI
                                  </button>
                                )}
                              </div>

                              {/* Discontinued badge */}
                              {drug.discontinued && (
                                <div style={{ fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                                  <span className="badge" style={{ fontSize: '0.65rem', padding: '2px 6px', width: 'fit-content', backgroundColor: '#64748b', color: 'white' }}>
                                    🚫 Discontinued
                                  </span>
                                  <button
                                    type="button"
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.65rem', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline', padding: 0 }}
                                    onClick={() => resumeDrug(drugIndex)}
                                  >
                                    Re-activate
                                  </button>
                                </div>
                              )}

                              {/* CRI Stopped info badge */}
                              {drug.stopTime && (
                                <div style={{ fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                                  <span className="badge danger" style={{ fontSize: '0.65rem', padding: '2px 6px', width: 'fit-content' }}>
                                    Stopped @ {drug.stopTime} ({drug.stopReason})
                                  </span>
                                  {drug.stopNote && <span className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.65rem' }}>"{drug.stopNote}"</span>}
                                  <button
                                    type="button"
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.65rem', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline', padding: 0 }}
                                    onClick={() => clearCriStopInfo(drugIndex)}
                                  >
                                    Resume CRI
                                  </button>
                                </div>
                              )}

                              {/* CRI Stop Form */}
                              {stoppingDrugIndex === drugIndex && (
                                <div style={{ padding: '0.5rem', marginTop: '0.36rem', background: 'var(--danger-light)', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', border: '1px solid var(--danger)' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--danger)' }}>Stop CRI Infusion</div>
                                  <div>
                                    <label style={{ fontSize: '0.68rem', display: 'block', fontWeight: 600 }}>Stop Time</label>
                                    <input type="time" value={stoppingTime} onChange={e => setStoppingTime(e.target.value)} style={{ padding: '2px 4px', fontSize: '0.75rem', width: '100%' }} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.68rem', display: 'block', fontWeight: 600 }}>Reason / Complication</label>
                                    <select value={stoppingReason} onChange={e => setStoppingReason(e.target.value)} style={{ padding: '2px 4px', fontSize: '0.75rem', width: '100%' }}>
                                      <option value="improved motility">improved motility</option>
                                      <option value="reaction">reaction</option>
                                      <option value="other">other</option>
                                    </select>
                                  </div>
                                  {stoppingReason === 'other' && (
                                    <div>
                                      <label style={{ fontSize: '0.68rem', display: 'block', fontWeight: 600 }}>Details</label>
                                      <input type="text" value={stoppingNote} onChange={e => setStoppingNote(e.target.value)} placeholder="Specify reason..." style={{ padding: '2px 4px', fontSize: '0.75rem', width: '100%' }} />
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem' }}>
                                    <button type="button" className="btn btn-primary" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => setCriStopInfo(drugIndex, stoppingTime, stoppingReason, stoppingNote)}>Save Stop</button>
                                    <button type="button" className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => setStoppingDrugIndex(null)}>Cancel</button>
                                  </div>
                                </div>
                              )}
                            </div>
                         </div>
                       </td>
                       <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span>{suggestedText}</span>
                            <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 400 }}>
                              ({drug.doseRate} {drug.unit} {drug.conc ? `@ ${drug.conc} ${drug.concUnit}` : ''})
                            </span>
                          </div>
                       </td>
                       {rounds.map((r, i) => {
                         const medState = r.medications?.[drug.name];
                         const isDue = medState === 'DUE';
                         const isGiven = medState === 'GIVEN';
                         const isCri = medState === 'CRI';

                         if (drug.discontinued && !isGiven) {
                           return (
                             <td key={i} className="med-cell" style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', fontSize: '0.7rem', textAlign: 'center' }} title="Discontinued">
                               <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Discontinued</span>
                             </td>
                           );
                         }

                         if (isCri) {
                           const isStopped = drug.stopTime && r.time >= drug.stopTime;
                           if (isStopped) {
                             return (
                               <td key={i} className="med-cell" style={{ backgroundColor: '#fdecea', color: 'var(--danger)', fontSize: '0.75rem', textAlign: 'center' }} title={`CRI Stopped at ${drug.stopTime}: ${drug.stopReason}`}>
                                 <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                                   <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>⏹ STOPPED</span>
                                   <span className="badge danger" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>{drug.stopReason}</span>
                                 </span>
                               </td>
                             );
                           }
                           return <td key={i} className="med-cell med-cri" title="CRI — continuous infusion">▶ {suggestedText}</td>;
                         }
                         if (isGiven || isDue) {
                           return (
                             <td key={i} className={`med-cell ${isGiven ? 'med-given' : 'med-due'}`} title={isGiven ? 'Given' : 'Due'}>
                               <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                                 <input
                                   type="checkbox"
                                   checked={isGiven}
                                   onChange={e => updateMedicationRound(i, drug.name, e.target.checked, drug.freq)}
                                 />
                                 <span>{suggestedText !== '-' ? suggestedText : ''}</span>
                               </label>
                             </td>
                           );
                         }
                         // Not scheduled at this time — muted dot, click to log an off-schedule dose.
                         return (
                           <td key={i} className="med-cell">
                             <button
                               type="button"
                               className="med-empty"
                               title="Record off-schedule dose"
                               onClick={() => updateMedicationRound(i, drug.name, true, drug.freq)}
                             >·</button>
                           </td>
                         );
                       })}
                     </tr>
                   );
                })}
              </>
            )}

          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}
