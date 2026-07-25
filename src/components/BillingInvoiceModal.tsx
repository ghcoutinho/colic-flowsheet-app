import React from 'react';
import { Patient } from '../types';
import { X, Printer, Receipt, FileText, CheckCircle2 } from 'lucide-react';

interface BillingInvoiceModalProps {
  patient: Patient;
  onClose: () => void;
}

export const BillingInvoiceModal: React.FC<BillingInvoiceModalProps> = ({ patient, onClose }) => {
  // Mock billing logic
  const daysInICU = 3;
  const icuDailyRate = 850.00;
  const icuTotal = daysInICU * icuDailyRate;
  
  const hasSurgery = patient.surgicalProcedure && patient.surgicalProcedure.trim().length > 0;
  const surgeryFee = hasSurgery ? 4500.00 : 0;
  
  const pharmacyLabsEst = 1250.00; // Mock estimate for meds and bloodwork

  const subtotal = icuTotal + surgeryFee + pharmacyLabsEst;
  const tax = subtotal * 0.05; // 5% mock tax
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-surface-container-lowest/75 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 print:p-0 print:bg-surface-container border border-surface-container-high print:block">
      <div className="bg-surface-container border border-surface-container-high rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-surface-container-highest print:shadow-none print:border-none print:max-w-full">
        
        {/* Header - Hidden in Print (Replaced by clean invoice header) */}
        <div className="flex items-center justify-between border-b pb-3 print:hidden mb-6">
          <div>
            <h2 className="text-xl font-black text-on-surface flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> Issue Bill / Invoice
            </h2>
            <p className="text-xs text-outline-variant">Preview and print estimated charges.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="p-2 bg-surface-container-lowest hover:bg-slate-200 text-on-surface-variant rounded-lg font-bold flex items-center gap-2 text-xs transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-outline hover:bg-surface-container-lowest rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- INVOICE CONTENT (Printable Area) --- */}
        <div className="space-y-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary text-on-primary rounded-xl flex items-center justify-center text-on-surface font-black text-xl border border-surface-container-highest">
                CMT
              </div>
              <div>
                <h1 className="text-2xl font-black text-on-surface tracking-tight">{patient.facility || 'Veterinary Teaching Hospital'}</h1>
                <p className="text-sm text-outline-variant font-medium">Equine Colic & ICU Department</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">INVOICE</h2>
              <p className="text-xs font-bold text-outline-variant mt-1">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-xs text-slate-400">Invoice #: INV-{Math.floor(10000 + Math.random() * 90000)}</p>
            </div>
          </div>

          <hr className="border-surface-container-highest" />

          {/* Client & Patient Info */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
              <p className="font-bold text-on-surface">{patient.ownerEmergencyContact || 'Owner Name Not Provided'}</p>
              <p className="text-sm text-outline">Client ID: CLI-{Math.floor(1000 + Math.random() * 9000)}</p>
            </div>
            <div className="space-y-1 bg-surface-container-low p-4 rounded-xl border border-surface-container-highest">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Patient Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-outline-variant">Name:</div>
                <div className="font-bold text-on-surface">{patient.name}</div>
                <div className="text-outline-variant">ID:</div>
                <div className="font-bold text-on-surface">{patient.patientId}</div>
                <div className="text-outline-variant">Surgeon:</div>
                <div className="font-bold text-on-surface">{patient.assignedSurgeon}</div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-on-surface">
                  <th className="py-3 px-2 text-xs font-black uppercase tracking-wider">Description</th>
                  <th className="py-3 px-2 text-xs font-black uppercase tracking-wider text-center">Qty</th>
                  <th className="py-3 px-2 text-xs font-black uppercase tracking-wider text-right">Unit Price</th>
                  <th className="py-3 px-2 text-xs font-black uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-sm">
                <tr>
                  <td className="py-4 px-2">
                    <div className="font-bold text-on-surface">ICU Daily Rate</div>
                    <div className="text-xs text-outline-variant">Includes standard monitoring, TPR, stall boarding</div>
                  </td>
                  <td className="py-4 px-2 text-center font-semibold text-on-surface-variant">{daysInICU} days</td>
                  <td className="py-4 px-2 text-right text-on-surface-variant">${icuDailyRate.toFixed(2)}</td>
                  <td className="py-4 px-2 text-right font-bold text-on-surface">${icuTotal.toFixed(2)}</td>
                </tr>
                {hasSurgery && (
                  <tr>
                    <td className="py-4 px-2">
                      <div className="font-bold text-on-surface">Surgical Procedure</div>
                      <div className="text-xs text-outline-variant">{patient.surgicalProcedure}</div>
                    </td>
                    <td className="py-4 px-2 text-center font-semibold text-on-surface-variant">1</td>
                    <td className="py-4 px-2 text-right text-on-surface-variant">${surgeryFee.toFixed(2)}</td>
                    <td className="py-4 px-2 text-right font-bold text-on-surface">${surgeryFee.toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-4 px-2">
                    <div className="font-bold text-on-surface">Pharmacy & Laboratory (Estimated)</div>
                    <div className="text-xs text-outline-variant">Medications, IV Fluids, Bloodwork, PCV/TP, Lactate</div>
                  </td>
                  <td className="py-4 px-2 text-center font-semibold text-on-surface-variant">1 block</td>
                  <td className="py-4 px-2 text-right text-on-surface-variant">${pharmacyLabsEst.toFixed(2)}</td>
                  <td className="py-4 px-2 text-right font-bold text-on-surface">${pharmacyLabsEst.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-3 text-sm">
              <div className="flex justify-between text-outline">
                <span>Subtotal:</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-outline border-b pb-3">
                <span>Tax (5%):</span>
                <span className="font-bold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg text-on-surface font-black pt-1">
                <span>Total Due:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-12 text-center space-y-2">
            <div className="flex justify-center text-emerald-500 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-xs font-bold text-outline-variant">Thank you for trusting us with your horse's care.</p>
            <p className="text-[10px] text-slate-400">Please remit payment within 15 days. Subject to 1.5% late fee.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
