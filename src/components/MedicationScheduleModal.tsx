import React, { useState } from 'react';
import {
  X,
  Pill,
  Clock,
  CheckCircle,
  Plus,
  RotateCcw,
  ShieldAlert,
  Check,
  AlertTriangle,
  Trash2,
  Calendar,
} from 'lucide-react';
import type { Patient, MedicationRoute, Medication } from '../types';
import { useHospital } from '../context/HospitalContext';
import { getMedicationTimeLabel } from '../utils/medicationScheduler';
import { MissedMedicationModal } from './MissedMedicationModal';

interface MedicationScheduleModalProps {
  patient: Patient | null;
  onClose: () => void;
}

export const MedicationScheduleModal: React.FC<MedicationScheduleModalProps> = ({
  patient,
  onClose,
}) => {
  const {
    markMedicationGiven,
    undoMedicationGiven,
    deleteMedication,
    addMedication,
    currentTime,
    selectedDate,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'schedule' | 'add'>('schedule');
  const [noteInputs, setNoteInputs] = useState<{ [medId: string]: string }>({});

  // Missed modal state
  const [missedMed, setMissedMed] = useState<Medication | null>(null);

  // New medication form state
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newRoute, setNewRoute] = useState<MedicationRoute>('Oral');
  const [newTime, setNewTime] = useState('14:00');
  const [newFrequency, setNewFrequency] = useState('Once Daily (24h)');
  const [newInstructions, setNewInstructions] = useState('');

  if (!patient) return null;

  const handleMarkGiven = (medId: string) => {
    const notes = noteInputs[medId] || '';
    markMedicationGiven(patient.id, medId, notes);
    setNoteInputs((prev) => ({ ...prev, [medId]: '' }));
  };

  const handleDelete = (med: Medication) => {
    const confirmed = window.confirm(
      `Discontinue ${med.name} (${med.dosage})?\n\nThis will remove it from the patient's active schedule as stopped by the doctor.`
    );
    if (confirmed) {
      deleteMedication(patient.id, med.id, 'Discontinued by Attending Physician');
    }
  };

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDosage) return;

    addMedication(patient.id, {
      name: newName,
      dosage: newDosage,
      route: newRoute,
      scheduledTime: newTime,
      instructions: newInstructions,
      frequency: newFrequency,
    });

    setNewName('');
    setNewDosage('');
    setNewInstructions('');
    setActiveTab('schedule');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs px-2 py-0.5 rounded bg-sky-600 text-white">
                    {patient.bedNumber}
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">{patient.name}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {patient.age}y {patient.gender} • {patient.diagnosis} •{' '}
                  <span className="font-semibold text-slate-700">Schedule Date: {selectedDate}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Allergy Alert Notice */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className="bg-amber-50 px-5 py-2 border-b border-amber-200 flex items-center gap-2 text-xs font-medium text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Known Allergies: <strong>{patient.allergies.join(', ')}</strong>
              </span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-semibold justify-between items-center">
            <div className="flex">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-3 mr-6 border-b-2 transition-all ${
                  activeTab === 'schedule'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                24h Medication Schedule ({patient.medications.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`py-3 border-b-2 flex items-center gap-1 transition-all ${
                  activeTab === 'add'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Prescribe Medication</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Cycle: 24 Hours</span>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {activeTab === 'schedule' ? (
              <div className="space-y-4">
                {patient.medications.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Pill className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm">No active medications currently prescribed.</p>
                  </div>
                ) : (
                  patient.medications.map((med) => {
                    const timing = getMedicationTimeLabel(med, currentTime);
                    const isCompleted = med.status === 'completed';
                    const isSkipped = med.status === 'skipped';
                    const isOverdue = med.status === 'overdue';
                    const isDue = med.status === 'due';

                    return (
                      <div
                        key={med.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isCompleted
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : isSkipped
                            ? 'bg-rose-50/30 border-rose-200'
                            : isOverdue
                            ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200'
                            : isDue
                            ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          {/* Med Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {med.dosage}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                                {med.route}
                              </span>
                              {med.frequency && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {med.frequency}
                                </span>
                              )}

                              {/* Status Pill */}
                              {isCompleted ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  Completed
                                </span>
                              ) : isSkipped ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                  Withheld / Missed
                                </span>
                              ) : isOverdue ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                                  Overdue
                                </span>
                              ) : isDue ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                                  Due Now
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  Upcoming
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-xs font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span
                                className={
                                  isCompleted
                                    ? 'text-emerald-700 font-semibold'
                                    : isSkipped
                                    ? 'text-rose-700 font-semibold'
                                    : isOverdue
                                    ? 'text-rose-700 font-bold'
                                    : isDue
                                    ? 'text-amber-700 font-bold'
                                    : 'text-slate-600'
                                }
                              >
                                {isSkipped
                                  ? `Scheduled for ${med.scheduledTime} - Not Administered`
                                  : timing.label}
                              </span>
                            </div>

                            {med.instructions && (
                              <p className="text-xs text-slate-500 mt-1 italic">
                                Instructions: {med.instructions}
                              </p>
                            )}

                            {/* Completed Audit Stamp */}
                            {isCompleted && (
                              <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-100/70 p-2 rounded-lg border border-emerald-200">
                                <p className="font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Administered: {med.administeredAt} by {med.administeredBy}
                                </p>
                                {med.notes && (
                                  <p className="mt-0.5 text-emerald-900 italic">"{med.notes}"</p>
                                )}
                              </div>
                            )}

                            {/* Missed Reason Stamp */}
                            {isSkipped && (
                              <div className="mt-2 text-[11px] text-rose-900 bg-rose-50 p-2 rounded-lg border border-rose-200">
                                <p className="font-bold flex items-center gap-1 text-rose-700">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  Reason Missed/Withheld: {med.missedReason}
                                </p>
                                <p className="text-slate-500 text-[10px] mt-0.5">
                                  Logged by {med.administeredBy}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex sm:flex-col items-center gap-2 shrink-0">
                            {!isCompleted && !isSkipped ? (
                              <div className="w-full flex sm:flex-col gap-1.5">
                                <button
                                  onClick={() => handleMarkGiven(med.id)}
                                  className={`w-full px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-2xs transition-all flex items-center justify-center gap-1.5 ${
                                    isOverdue
                                      ? 'bg-rose-600 hover:bg-rose-700'
                                      : 'bg-sky-600 hover:bg-sky-700'
                                  }`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>Given</span>
                                </button>

                                <button
                                  onClick={() => setMissedMed(med)}
                                  className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1"
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Missed / Skip</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => undoMedicationGiven(patient.id, med.id)}
                                className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 p-1 hover:underline"
                                title="Undo administration status"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset status</span>
                              </button>
                            )}

                            {/* Delete / Discontinue by Doctor */}
                            <button
                              onClick={() => handleDelete(med)}
                              className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 p-1 transition-colors"
                              title="Delete/Discontinue medication (e.g. stopped by doctor)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Discontinue</span>
                            </button>
                          </div>
                        </div>

                        {/* Optional administration note entry for pending meds */}
                        {!isCompleted && !isSkipped && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Optional note before marking given..."
                              value={noteInputs[med.id] || ''}
                              onChange={(e) =>
                                setNoteInputs((prev) => ({ ...prev, [med.id]: e.target.value }))
                              }
                              className="text-xs flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 placeholder-slate-400"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Add Prescription Form */
              <form onSubmit={handleAddMedication} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paracetamol, Ciprofloxacin, Metformin"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500 mg, 10 mL, 20 IU"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Route</label>
                    <select
                      value={newRoute}
                      onChange={(e) => setNewRoute(e.target.value as MedicationRoute)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Oral">Oral (PO)</option>
                      <option value="IV">Intravenous (IV)</option>
                      <option value="IM">Intramuscular (IM)</option>
                      <option value="SC">Subcutaneous (SC)</option>
                      <option value="Inhalation">Inhalation (Neb)</option>
                      <option value="Topical">Topical</option>
                      <option value="Sublingual">Sublingual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Scheduled Time (24h) *
                    </label>
                    <input
                      type="time"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Frequency (24h Cycle)
                    </label>
                    <select
                      value={newFrequency}
                      onChange={(e) => setNewFrequency(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Once Daily (24h)">Once Daily (Every 24 Hours)</option>
                      <option value="Twice Daily (12h)">Twice Daily (Every 12 Hours)</option>
                      <option value="Thrice Daily (8h)">Thrice Daily (Every 8 Hours)</option>
                      <option value="Four Times Daily (6h)">Four Times Daily (Every 6 Hours)</option>
                      <option value="As Needed (PRN)">As Needed (PRN)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nurse Instructions / Clinical Precautions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Check blood pressure before administering, infuse over 20 mins"
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow-xs"
                  >
                    Save Prescription
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Hospital Electronic Medication Administration Record (eMAR)</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Missed Medication Reason Modal */}
      <MissedMedicationModal
        patient={patient}
        medication={missedMed}
        isOpen={!!missedMed}
        onClose={() => setMissedMed(null)}
      />
    </>
  );
};
