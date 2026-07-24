import ExpandableText from './ExpandableText';

const triggers = [
  { param: 'Heart rate', condition: 'Persistent >60 bpm, or rising despite analgesia/fluids', reason: 'Rising HR tracks pain, hypovolaemia and endotoxemia; admission HR is an independent risk factor for post-op mortality.', action: 'Reassess pain & perfusion; notify surgeon; check PCV/lactate.' },
  { param: 'Nasogastric reflux', condition: '>=2 L at any single check, or net reflux on the NGT', reason: 'Post-op reflux after large colon surgery is uncommon but a strong negative prognostic sign (survival ~44% vs ~95% without).', action: 'Leave/re-pass NGT and decompress; withhold enteral intake; notify surgeon; prokinetic per orders.' },
  { param: 'Fever + colic signs', condition: 'Rectal T >38.9°C with new colic pain post-op', reason: 'New fever plus colic after intestinal surgery raises concern for a surgical complication (leakage, obstruction, peritonitis).', action: 'Full exam; consider abdominal ultrasound / abdominocentesis; notify surgeon urgently.' },
  { param: 'Blood lactate', condition: 'Peripheral lactate >4 mmol/L, or failure to clear / rising over serial samples', reason: 'Admission peripheral lactate >=3.2 and post-correction >=5 mmol/L are associated with poorer survival; failure to clear signals ongoing hypoperfusion.', action: 'Bolus balanced crystalloid per orders; reassess CV status; notify surgeon; recheck in 1-2 h.' },
  { param: 'PCV / TP', condition: 'PCV >50% (esp. with TP <4.5 g/dL), or a sharp rise', reason: 'Rising PCV with falling protein indicates plasma loss / haemoconcentration from mucosal injury and endotoxemia; admission PCV is a mortality risk factor.', action: 'Increase fluid support per orders; consider colloids/plasma; notify surgeon.' },
  { param: 'Digital pulses / feet', condition: 'Bounding digital pulses, increased hoof heat, weight-shifting, or Obel >=1', reason: 'Sepsis-associated laminitis is a feared sequela of endotoxemic colic; distal-limb cryotherapy reduces incidence and severity in the at-risk window.', action: 'Confirm/continue continuous digital cryotherapy on both forefeet; foot support; notify surgeon.' },
  { param: "'On ice?' score", condition: 'Score >=70%, or climbing across consecutive checks', reason: 'A high composite SIRS + high-risk-lesion score marks the developmental window for laminitis, before lameness appears.', action: 'Start / continue digital cryotherapy (hoof <10°C); confirm plan with surgeon.' },
  { param: 'Pain', condition: 'Pain score >=2 or escalating analgesia requirement', reason: 'Breakthrough or escalating pain can signal ischaemia, obstruction, or a developing surgical complication.', action: 'Reassess; analgesia per orders; if unresponsive, notify surgeon for re-evaluation.' },
  { param: 'Manure / GI transit', condition: 'No manure by 24-48 h, or progressive abdominal distension', reason: 'Delayed transit or distension may indicate ileus, impaction at the anastomosis, or re-displacement.', action: 'Rectal exam per clinician; withhold/adjust feed; notify surgeon.' },
  { param: 'Urine output / creatinine', condition: 'No urine 6-8 h despite fluids, or rising creatinine', reason: 'Oliguria or azotaemia signals inadequate perfusion or acute kidney injury (NSAID + hypovolaemia risk).', action: 'Verify fluid delivery & catheter; recheck creatinine; notify surgeon; review NSAID dosing.' },
  { param: 'Incision / catheter', condition: 'New heat, swelling, discharge, dehiscence; catheter-site heat/pain', reason: 'Early detection of incisional infection or thrombophlebitis limits morbidity.', action: 'Clean & document; notify surgeon; consider ultrasound of incision / catheter site.' },
];

export default function DecisionTriggers() {
  return (
    <div className="card">
      <h2 className="card-title text-danger">DECISION TRIGGERS — WHEN TO CALL THE ATTENDING SURGEON</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Parameter</th>
              <th style={{ width: '25%' }}>Call / act if...</th>
              <th style={{ width: '35%' }}>Why it matters</th>
              <th style={{ width: '25%' }}>Immediate action</th>
            </tr>
          </thead>
          <tbody>
            {triggers.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{row.param}</td>
                <td className="text-danger"><ExpandableText text={row.condition} maxLength={60} /></td>
                <td className="text-muted"><ExpandableText text={row.reason} maxLength={80} /></td>
                <td style={{ fontWeight: 500 }}><ExpandableText text={row.action} maxLength={60} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
