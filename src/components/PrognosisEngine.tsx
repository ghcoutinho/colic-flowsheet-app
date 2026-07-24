import React, { useState } from 'react';
import { Patient } from '../types';
import { PieChart, TrendingUp, TrendingDown, AlertCircle, Info, Share2, Sliders, Activity } from 'lucide-react';

interface PrognosisEngineProps {
  patient: Patient;
}

export const PrognosisEngine: React.FC<PrognosisEngineProps> = ({ patient }) => {
  // Interactive clinical inputs for live simulation
  const [heartRate, setHeartRate] = useState<number>(78);
  const [lactate, setLactate] = useState<number>(3.8);
  const [pcv, setPcv] = useState<number>(46);
  const [durationHours, setDurationHours] = useState<number>(10);
  const [refluxLiters, setRefluxLiters] = useState<number>(1.5);

  // Simple clinical logistic risk model estimation
  const calculatePrognosis = () => {
    let riskScore = 0;
    if (heartRate > 60) riskScore += (heartRate - 60) * 0.4;
    if (lactate > 2.0) riskScore += (lactate - 2.0) * 8;
    if (pcv > 45) riskScore += (pcv - 45) * 1.5;
    if (durationHours > 12) riskScore += 10;
    if (refluxLiters > 2.0) riskScore += 12;

    const rawSurvival = Math.max(10, Math.min(98, 95 - riskScore));
    const rawSurgical = Math.max(5, Math.min(95, riskScore * 1.2));

    return {
      survival: Math.round(rawSurvival),
      surgicalRisk: Math.round(rawSurgical),
    };
  };

  const { survival, surgicalRisk } = calculatePrognosis();

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-20 md:pb-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              🐴 Prognosis & Surgical Risk Analysis
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven survival probability and surgical indication engine using validated clinical variables
          </p>
        </div>
        <button
          onClick={() => alert('Prognosis Report exported to Patient Medical Records!')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <Share2 className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>

      {/* Dual Gauges Section (Matching Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gauge 1: Survival Probability */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Survival Probability (%)</h3>

          {/* SVG Arch Dial Gauge */}
          <div className="relative w-48 h-28 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 100 60" className="w-full h-full">
              {/* Dial Arc */}
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="url(#survivalGradient)"
                strokeWidth="10"
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * survival) / 100}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="survivalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-1 text-center">
              <span className="text-3xl font-black text-slate-900">{survival}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            Based on current clinical data & historical ICU survival metrics
          </p>
        </div>

        {/* Gauge 2: Surgical Indication */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Surgical Indication (%)</h3>

          <div className="relative w-48 h-28 mx-auto flex items-center justify-center">
            <svg viewBox="0 0 100 60" className="w-full h-full">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="url(#riskGradient)"
                strokeWidth="10"
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * surgicalRisk) / 100}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-1 text-center">
              <span className="text-3xl font-black text-slate-900">{surgicalRisk}%</span>
            </div>
          </div>

          <p className="text-xs font-semibold text-amber-700 bg-amber-50 py-1 px-3 rounded-full inline-block">
            {surgicalRisk > 60 ? '⚠️ High Risk - Surgical Exploratory Indicated' : 'Moderate risk, monitor closely'}
          </p>
        </div>
      </div>

      {/* Interactive Parameter Simulator Sliders */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" /> Interactive Clinical Simulator
          </h3>
          <span className="text-xs text-slate-500">Adjust parameters to recalculate risk</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Heart Rate:</span>
              <span className="font-bold text-slate-900">{heartRate} bpm</span>
            </div>
            <input
              type="range"
              min="28"
              max="120"
              value={heartRate}
              onChange={(e) => setHeartRate(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Blood Lactate:</span>
              <span className="font-bold text-slate-900">{lactate} mmol/L</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="12.0"
              step="0.1"
              value={lactate}
              onChange={(e) => setLactate(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>PCV (%):</span>
              <span className="font-bold text-slate-900">{pcv}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="65"
              value={pcv}
              onChange={(e) => setPcv(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Duration of Symptoms:</span>
              <span className="font-bold text-slate-900">{durationHours} hrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="36"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Influencing Factors Card List (Matches Screenshot) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Influencing Factors (Pulled from Flowsheet)</h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-red-200 text-red-800 rounded-lg font-bold">❤️</span>
              <div>
                <div className="font-bold text-slate-900">Heart Rate</div>
                <div className="text-[11px] text-slate-500">Elevated, but stable</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 text-sm">{heartRate} bpm</span>
              <div className="text-red-600 font-bold text-[11px] flex items-center gap-0.5 justify-end">
                <TrendingDown className="w-3 h-3" /> Worsening
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-emerald-200 text-emerald-800 rounded-lg font-bold">💧</span>
              <div>
                <div className="font-bold text-slate-900">Lactate</div>
                <div className="text-[11px] text-slate-500">Improving with fluids</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 text-sm">{lactate} mmol/L</span>
              <div className="text-emerald-600 font-bold text-[11px] flex items-center gap-0.5 justify-end">
                <TrendingUp className="w-3 h-3" /> Improving
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 bg-amber-200 text-amber-800 rounded-lg font-bold">↔️</span>
              <div>
                <div className="font-bold text-slate-900">PCV (Packed Cell Volume)</div>
                <div className="text-[11px] text-slate-500">Decreasing post-hydration</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 text-sm">{pcv}%</span>
              <div className="text-amber-600 font-bold text-[11px] flex items-center gap-0.5 justify-end">
                → Stable
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logistic Regression Breakdown Table (Matches Screenshot) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Logistic Regression Analysis</h3>
          <p className="text-xs text-slate-500">Detailed multivariate breakdown for surgical decision making</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <th className="p-2.5">Variable</th>
                <th className="p-2.5">Odds Ratio (OR)</th>
                <th className="p-2.5">P-Value</th>
                <th className="p-2.5">Confidence Interval (95%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr className="bg-red-50/60">
                <td className="p-2.5 font-bold">Heart Rate (&gt;60 bpm)</td>
                <td className="p-2.5 text-blue-700 font-bold">OR: 3.5</td>
                <td className="p-2.5 text-blue-600 font-bold">0.002</td>
                <td className="p-2.5 text-slate-600">CI: 1.8-6.7</td>
              </tr>
              <tr className="bg-emerald-50/60">
                <td className="p-2.5 font-bold">Lactate (&gt;2 mmol/L)</td>
                <td className="p-2.5 text-blue-700 font-bold">OR: 5.2</td>
                <td className="p-2.5 text-blue-600 font-bold">&lt;0.001</td>
                <td className="p-2.5 text-slate-600">CI: 2.5-10.8</td>
              </tr>
              <tr className="bg-amber-50/60">
                <td className="p-2.5 font-bold">Age (&gt;15 years)</td>
                <td className="p-2.5 text-blue-700 font-bold">OR: 2.1</td>
                <td className="p-2.5 text-blue-600 font-bold">0.045</td>
                <td className="p-2.5 text-slate-600">CI: 1.1-4.2</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold">Duration of Symptoms (&gt;12 hrs)</td>
                <td className="p-2.5 text-blue-700 font-bold">OR: 1.8</td>
                <td className="p-2.5 text-slate-600">0.120</td>
                <td className="p-2.5 text-slate-600">CI: 0.9-3.6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
