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
    <div className="fixed inset-0 bg-surface-container-lowest/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container border border-surface-container-high rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-surface-container-highest space-y-5 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-lg font-black text-on-surface">Record Vitals Round</h2>
            <p className="text-xs text-outline-variant">Patient: {patient.name} ({patient.patientId})</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-outline rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time Slot Selector */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-1">Time Slot:</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl font-bold text-on-surface text-sm"
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
              <label className="text-outline block mb-1">Heart Rate (bpm):</label>
              <input
                type="number"
                value={formData.hr || ''}
                onChange={(e) => setFormData({ ...formData, hr: e.target.value })}
                className="w-full p-2 border border-outline-variant rounded-lg font-bold"
                placeholder="28-44"
              />
            </div>

            <div>
              <label className="text-outline block mb-1">Temp (°C):</label>
              <input
                type="number"
                step="0.1"
                value={formData.temp || ''}
                onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                className="w-full p-2 border border-outline-variant rounded-lg font-bold"
                placeholder="37.2-38.5"
              />
            </div>

            <div>
              <label className="text-outline block mb-1">Resp Rate (/min):</label>
              <input
                type="number"
                value={formData.rr || ''}
                onChange={(e) => setFormData({ ...formData, rr: e.target.value })}
                className="w-full p-2 border border-outline-variant rounded-lg font-bold"
                placeholder="10-24"
              />
            </div>

            <div>
              <label className="text-outline block mb-1">PCV (%):</label>
              <input
                type="number"
                value={formData.ht_pcv || ''}
                onChange={(e) => setFormData({ ...formData, ht_pcv: e.target.value })}
                className="w-full p-2 border border-outline-variant rounded-lg font-bold"
                placeholder="32-45"
              />
            </div>

            <div>
              <label className="text-outline block mb-1">Blood Lactate (mmol/L):</label>
              <input
                type="number"
                step="0.1"
                value={formData.lactate || ''}
                onChange={(e) => setFormData({ ...formData, lactate: e.target.value })}
                className="w-full p-2 border border-outline-variant rounded-lg font-bold"
                placeholder="< 2.0"
              />
            </div>

            <div>
              <label className="text-outline block mb-1">Pain Score (0-3):</label>
              <input
                type="number"
                value={formData.pain_score || ''}
                onChange={(e) => setFormData({ ...formData, pain_score: e.target.value })}
                className="w-full p-2 border border-outline-variant rounded-lg font-bold"
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-outline block mb-1">Reflux Volume (L):</label>
              <input
                type="number"
                step="0.1"
                value={formData.reflux_vol || ''}
                onChange={(e) => setFormData({ ...formData, reflux_vol: e.target.value })}
                className="w-full p-2 border border-outline-variant rounded-lg font-bold"
                placeholder="< 2.0"
              />
            </div>

            <div>
              <label className="text-outline block mb-1">Mentation:</label>
              <select
                value={formData.mentation || 'BAR'}
                onChange={(e) => setFormData({ ...formData, mentation: e.target.value })}
                className="w-full p-2 border border-outline-variant rounded-lg font-bold"
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
              className="px-4 py-2 rounded-xl text-xs font-semibold text-outline hover:bg-surface-container-lowest"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary hover:opacity-90 text-on-surface text-xs font-bold rounded-xl border border-surface-container-highest"
            >
              Save Round Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
