import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { evaluateVitals } from '../utils/vitalsChecker';

interface ShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({ isOpen, onClose }) => {
  const { patients, currentNurse, currentTimeDisplay } = useHospital();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">
              Shift Handover Summary & Clinical Audit
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow-2xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Handover Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  APEX MEMORIAL HOSPITAL
                </h1>
                <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                  Nursing Shift Handover & Medication Administration Record
                </p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p>
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>
                <p>
                  <strong>Report Time:</strong> {currentTimeDisplay}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Duty Nurse:</span>
                <span className="font-bold text-slate-800">{currentNurse.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Staff ID:</span>
                <span className="font-bold text-slate-800">{currentNurse.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Shift:</span>
                <span className="font-bold text-slate-800">{currentNurse.shift}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Patients:</span>
                <span className="font-bold text-slate-800">{patients.length} Inpatients</span>
              </div>
            </div>
          </div>

          {/* Patient Handover Table */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
              Ward Bed Status & Pending Medication Summary
            </h3>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-r border-slate-200">Bed / Patient</th>
                    <th className="p-2 border-r border-slate-200">Diagnosis</th>
                    <th className="p-2 border-r border-slate-200">Latest Vitals</th>
                    <th className="p-2 border-r border-slate-200">Pending / Overdue Meds</th>
                    <th className="p-2">Completed Today</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {patients.map((p) => {
                    const vitalEval = evaluateVitals(p.vitals);
                    const pendingMeds = p.medications.filter(
                      (m) => m.status === 'overdue' || m.status === 'due' || m.status === 'upcoming'
                    );
                    const completedMeds = p.medications.filter((m) => m.status === 'completed');

                    return (
                      <tr key={p.id} className="align-top">
                        <td className="p-2 border-r border-slate-200 font-semibold">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold text-[11px] mb-0.5">
                            {p.bedNumber}
                          </span>
                          <div className="text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {p.age}y {p.gender}
                          </div>
                        </td>

                        <td className="p-2 border-r border-slate-200 text-slate-700">
                          {p.diagnosis}
                          {p.allergies.length > 0 && (
                            <div className="text-[10px] text-amber-700 font-semibold mt-1">
                              Allergies: {p.allergies.join(', ')}
                            </div>
                          )}
                        </td>

                        <td className="p-2 border-r border-slate-200">
                          <div
                            className={`font-semibold ${
                              vitalEval.overallStatus === 'critical'
                                ? 'text-rose-700'
                                : vitalEval.overallStatus === 'warning'
                                ? 'text-amber-700'
                                : 'text-slate-700'
                            }`}
                          >
                            SpO₂: {p.vitals.spO2}% • HR: {p.vitals.heartRate} bpm
                          </div>
                          <div className="text-slate-500 text-[10px]">
                            BP: {p.vitals.bloodPressureSys}/{p.vitals.bloodPressureDia} mmHg • Temp:{' '}
                            {p.vitals.temperature.toFixed(1)}°F
                          </div>
                          {vitalEval.alerts.length > 0 && (
                            <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                              ⚠️ {vitalEval.alerts[0]}
                            </div>
                          )}
                        </td>

                        <td className="p-2 border-r border-slate-200">
                          {pendingMeds.length > 0 ? (
                            <div className="space-y-1">
                              {pendingMeds.map((m) => (
                                <div
                                  key={m.id}
                                  className={`text-[11px] ${
                                    m.status === 'overdue'
                                      ? 'text-rose-700 font-bold'
                                      : m.status === 'due'
                                      ? 'text-amber-700 font-semibold'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  • {m.name} ({m.dosage}) @ {m.scheduledTime} [
                                  {m.status.toUpperCase()}]
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-medium">
                              ✓ All scheduled doses given
                            </span>
                          )}
                        </td>

                        <td className="p-2 text-slate-600">
                          {completedMeds.length > 0 ? (
                            <div className="space-y-0.5 text-[10px]">
                              {completedMeds.map((m) => (
                                <div key={m.id}>
                                  ✓ {m.name} ({m.dosage}) - {m.administeredAt}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">None logged yet</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Handover signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-xs text-slate-700">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold">Outgoing Nurse Signature:</p>
                <p className="text-slate-500 mt-1">{currentNurse.name} ({currentNurse.id})</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold">Incoming Nurse Signature:</p>
                <p className="text-slate-400 italic mt-1">Pending handover acceptance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden in print) */}
        <div className="no-print p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Click Print to generate official shift handover document or PDF</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
