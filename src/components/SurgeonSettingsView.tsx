import React, { useState } from 'react';
import { Patient, SurgeonScheduleSettings } from '../types';
import { Settings, Clock, AlertTriangle, ShieldCheck, UserCheck, Save, Check } from 'lucide-react';

interface SurgeonSettingsViewProps {
  patient: Patient;
  settings: SurgeonScheduleSettings;
  onSaveSettings: (newSettings: SurgeonScheduleSettings) => void;
}

export const SurgeonSettingsView: React.FC<SurgeonSettingsViewProps> = ({
  patient,
  settings: initialSettings,
  onSaveSettings,
}) => {
  const [settings, setSettings] = useState<SurgeonScheduleSettings>(initialSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tprOptions = ['q1h', 'q2h', 'q4h', 'q6h', 'q12h'] as const;
  const giOptions = ['q2h', 'q4h', 'q6h', 'q12h', 'q24h'] as const;
  const clinPathOptions = ['q4h', 'q6h', 'q12h', 'q24h', 'STAT'] as const;

  const handleSave = () => {
    onSaveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Preview hourly matrix logic
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  const parseIntervalHours = (intervalStr: string) => {
    if (intervalStr === 'STAT') return 1;
    const num = parseInt(intervalStr.replace('q', '').replace('h', ''));
    return isNaN(num) ? 4 : num;
  };

  const isDue = (hourIndex: number, intervalStr: string) => {
    const step = parseIntervalHours(intervalStr);
    return hourIndex % step === 0;
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-20 md:pb-8">
      {/* Title Header */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high text-center">
        <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight flex items-center justify-center gap-2">
          Surgeon Monitoring Settings
        </h1>
        <p className="text-xs text-outline-variant mt-1">
          Custom ICU monitoring schedules & "Call Surgeon" threshold triggers
        </p>
      </div>

      {/* 1. TPR Interval Selector Card */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-4 sm:p-5 border border-surface-container-highest border border-surface-container-high space-y-3">
        <div className="bg-primary text-on-primary text-on-surface p-3 rounded-xl flex items-center gap-2.5 font-bold text-sm border border-surface-container-high">
          <span>🐴</span> TPR (Temp, Pulse, Respiration)
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {tprOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSettings({ ...settings, tprInterval: opt })}
              className={`flex-1 min-w-[60px] py-2 rounded-xl text-xs font-bold transition-all border ${
                settings.tprInterval === opt
                  ? 'bg-primary text-on-primary text-on-surface border-blue-600 border border-surface-container-highest scale-102'
                  : 'bg-surface-container-low text-on-surface-variant border-surface-container-highest hover:bg-surface-container-lowest'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 2. GI Exams Interval Selector Card */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-4 sm:p-5 border border-surface-container-highest border border-surface-container-high space-y-3">
        <div className="bg-emerald-600 text-on-surface p-3 rounded-xl flex items-center gap-2.5 font-bold text-sm border border-surface-container-high">
          <span>🩺</span> GI Exams (Auscultation, Reflux)
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {giOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSettings({ ...settings, giInterval: opt })}
              className={`flex-1 min-w-[60px] py-2 rounded-xl text-xs font-bold transition-all border ${
                settings.giInterval === opt
                  ? 'bg-primary text-on-primary text-on-surface border-blue-600 border border-surface-container-highest scale-102'
                  : 'bg-surface-container-low text-on-surface-variant border-surface-container-highest hover:bg-surface-container-lowest'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Clinicopathology Interval Selector Card */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-4 sm:p-5 border border-surface-container-highest border border-surface-container-high space-y-3">
        <div className="bg-purple-600 text-on-surface p-3 rounded-xl flex items-center gap-2.5 font-bold text-sm border border-surface-container-high">
          <span>🔬</span> Clinicopathology (PCV, TP, Lactate)
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {clinPathOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSettings({ ...settings, clinPathInterval: opt })}
              className={`flex-1 min-w-[60px] py-2 rounded-xl text-xs font-bold transition-all border ${
                settings.clinPathInterval === opt
                  ? 'bg-primary text-on-primary text-on-surface border-blue-600 border border-surface-container-highest scale-102'
                  : 'bg-surface-container-low text-on-surface-variant border-surface-container-highest hover:bg-surface-container-lowest'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Schedule Table (Matching Screenshot) */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high space-y-3">
        <h3 className="text-sm font-bold text-on-surface">Preview Schedule</h3>

        <div className="overflow-x-auto rounded-xl border border-surface-container-highest">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-highest font-bold text-on-surface-variant">
                <th className="p-2.5 text-left border-r border-surface-container-highest">Time</th>
                <th className="p-2.5 border-r border-surface-container-highest">TPR ({settings.tprInterval})</th>
                <th className="p-2.5 border-r border-surface-container-highest">GI Exams ({settings.giInterval})</th>
                <th className="p-2.5">ClinPath ({settings.clinPathInterval})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {hours.map((h, idx) => {
                const tprDue = isDue(idx, settings.tprInterval);
                const giDue = isDue(idx, settings.giInterval);
                const cpDue = isDue(idx, settings.clinPathInterval);

                return (
                  <tr key={h} className="hover:bg-surface-container-low">
                    <td className="p-2 text-left font-bold text-on-surface border-r border-surface-container-highest bg-surface-container-low/50">{h}</td>
                    <td className="p-2 border-r border-surface-container-highest">
                      {tprDue && (
                        <span className="px-2.5 py-1 bg-sky-200 text-sky-900 font-extrabold text-[10px] rounded-md inline-block shadow-xs">
                          DUE
                        </span>
                      )}
                    </td>
                    <td className="p-2 border-r border-surface-container-highest">
                      {giDue && (
                        <span className="px-2.5 py-1 bg-emerald-200 text-emerald-900 font-extrabold text-[10px] rounded-md inline-block shadow-xs">
                          DUE
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      {cpDue && (
                        <span className="px-2.5 py-1 bg-purple-200 text-purple-900 font-extrabold text-[10px] rounded-md inline-block shadow-xs">
                          DUE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Surgeon Triggers Card (Matching Screenshot 4/7) */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high space-y-3">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          🚩 Call Surgeon Triggers
        </h3>
        <p className="text-xs text-outline-variant">Thresholds that trigger immediate surgeon alert</p>

        <div className="space-y-2 text-xs font-semibold text-on-surface">
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
            <span>🚩 Heart Rate &gt; 80 bpm</span>
            <span className="text-outline-variant text-[11px]">Active</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
            <span>🚩 Pain Score &gt; 7</span>
            <span className="text-outline-variant text-[11px]">Active</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
            <span>🚩 Reflux &gt; 2L</span>
            <span className="text-outline-variant text-[11px]">Active</span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container-highest flex items-center justify-between">
            <span>🚩 Respiratory Rate &gt; 30/min</span>
            <span className="text-outline-variant text-[11px]">Active</span>
          </div>
        </div>
      </div>

      {/* Save Settings Button */}
      <button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 border border-outline-variant transition-all active:scale-98 ${
          savedSuccess ? 'bg-emerald-600 text-on-surface' : 'bg-primary text-on-primary hover:opacity-90 text-on-surface'
        }`}
        id="save-settings-btn"
      >
        {savedSuccess ? (
          <>
            <Check className="w-5 h-5" /> Settings Saved!
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Save Settings
          </>
        )}
      </button>
    </div>
  );
};
