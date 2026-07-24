import React, { useState } from 'react';
import { Patient } from '../types';
import { Clock, Check, X, AlertCircle } from 'lucide-react';

interface AddRoundModalProps {
  patient: Patient;
  timeSlots: string[];
  onClose: () => void;
  onAddRoundValues: (timeSlot: string, roundData: { [rowId: string]: string }) => void;
}

export const AddRoundModal: React.FC<AddRoundModalProps> = ({
  patient,
  timeSlots,
  onClose,
  onAddRoundValues,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string>('14:00');
  const [formData, setFormData] = useState<{ [rowId: string]: string }>({
    hr: '48',
    temp: '38.1',
    pcv_vital: '35',
    rr: '12',
    mm: 'pink',
    crt: '2.0',
    mentation: 'BAR',
    pain_score: '2',
    gut_sounds: '2/4 Hypo',
    reflux_vol: '0.5',
    ht_pcv: '45',
    lactate: '2.8',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRoundValues(selectedSlot, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">Record Vitals Round</h2>
            <p className="text-xs text-slate-500">Patient: {patient.name} ({patient.patientId})</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time Slot Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Time Slot:</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm"
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot} {slot === '14:00' ? '(NOW)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Vitals Form Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
            <div>
              <label className="text-slate-600 block mb-1">Heart Rate (bpm):</label>
              <input
                type="number"
                value={formData.hr || ''}
                onChange={(e) => setFormData({ ...formData, hr: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                placeholder="28-44"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">Temp (°C):</label>
              <input
                type="number"
                step="0.1"
                value={formData.temp || ''}
                onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                placeholder="37.2-38.5"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">Resp Rate (/min):</label>
              <input
                type="number"
                value={formData.rr || ''}
                onChange={(e) => setFormData({ ...formData, rr: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                placeholder="10-24"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">PCV (%):</label>
              <input
                type="number"
                value={formData.ht_pcv || ''}
                onChange={(e) => setFormData({ ...formData, ht_pcv: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                placeholder="32-45"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">Blood Lactate (mmol/L):</label>
              <input
                type="number"
                step="0.1"
                value={formData.lactate || ''}
                onChange={(e) => setFormData({ ...formData, lactate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                placeholder="< 2.0"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">Pain Score (0-3):</label>
              <input
                type="number"
                value={formData.pain_score || ''}
                onChange={(e) => setFormData({ ...formData, pain_score: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">Reflux Volume (L):</label>
              <input
                type="number"
                step="0.1"
                value={formData.reflux_vol || ''}
                onChange={(e) => setFormData({ ...formData, reflux_vol: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                placeholder="< 2.0"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">Mentation:</label>
              <select
                value={formData.mentation || 'BAR'}
                onChange={(e) => setFormData({ ...formData, mentation: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold"
              >
                <option value="BAR">BAR (Bright, Alert)</option>
                <option value="QAR">QAR (Quiet, Alert)</option>
                <option value="Depressed">Depressed</option>
                <option value="Obtunded">Obtunded</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Save Round Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
