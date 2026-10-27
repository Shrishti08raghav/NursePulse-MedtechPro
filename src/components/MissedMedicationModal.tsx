import { useState } from 'react';
import { X, AlertCircle, Save } from 'lucide-react';
import type { Medication, Patient } from '../types';
import { useHospital } from '../context/HospitalContext';

interface MissedMedicationModalProps {
  patient: Patient | null;
  medication: Medication | null;
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_REASONS = [
  'Patient Refused Medication',
  'Patient Fasting (NPO) for Surgery/Procedure',
  'Withheld per Attending Doctor\'s Orders',
  'Patient Vomiting / Severe Nausea',
  'Vital Sign Contraindication (Low BP / HR)',
  'Medication Temporarily Out of Stock in Ward Pharmacy',
  'Other / Custom Clinical Reason',
];

export const MissedMedicationModal: React.FC<MissedMedicationModalProps> = ({
  patient,
  medication,
  isOpen,
  onClose,
}) => {
  const { markMedicationMissed } = useHospital();
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !patient || !medication) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      selectedReason === 'Other / Custom Clinical Reason' && customReason.trim()
        ? `Other: ${customReason.trim()}`
        : selectedReason;

    markMedicationMissed(patient.id, medication.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 bg-rose-50/70 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Log Missed / Withheld Medication
              </h3>
              <p className="text-xs text-slate-500">
                Mandatory Clinical Documentation for Unadministered Dose
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Medication Details Card */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-sky-700 mr-2">[{patient.bedNumber}]</span>
              <span className="font-bold text-slate-800">{patient.name}</span>
            </div>
            <span className="text-slate-500">Scheduled: {medication.scheduledTime}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-900">{medication.name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
              {medication.dosage}
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
              {medication.route}
            </span>
          </div>
        </div>

        {/* Reason Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Clinical Reason for Missed / Withheld Dose *
            </label>
            <div className="space-y-2">
              {COMMON_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-rose-50/70 border-rose-300 text-rose-900 font-semibold ring-1 ring-rose-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="missedReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Other / Custom Clinical Reason' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specify Reason Details *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Explain why the medication could not be given..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Record Missed Reason</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
