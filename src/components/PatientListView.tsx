import { CheckCircle, Clock } from 'lucide-react';
import type { Patient, Medication } from '../types';
import { useHospital } from '../context/HospitalContext';
import { evaluateVitals, getVitalStatusBadgeColor } from '../utils/vitalsChecker';
import { getMedicationTimeLabel } from '../utils/medicationScheduler';

interface PatientListViewProps {
  patients: Patient[];
  onOpenMedications: (patient: Patient) => void;
  onOpenVitals: (patient: Patient) => void;
}

export const PatientListView: React.FC<PatientListViewProps> = ({
  patients,
  onOpenMedications,
  onOpenVitals,
}) => {
  const { markMedicationGiven, currentTime } = useHospital();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Bed & Patient</th>
              <th className="py-3 px-4">Diagnosis</th>
              <th className="py-3 px-4 text-center">SpO₂</th>
              <th className="py-3 px-4 text-center">HR</th>
              <th className="py-3 px-4 text-center">BP</th>
              <th className="py-3 px-4 text-center">Temp</th>
              <th className="py-3 px-4">Next Due Medication</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {patients.map((patient) => {
              const vitalsEval = evaluateVitals(patient.vitals);
              const pendingMeds = patient.medications.filter(
                (m) => m.status === 'overdue' || m.status === 'due' || m.status === 'upcoming'
              );
              const nextMed: Medication | undefined = pendingMeds[0];

              const spO2Color = getVitalStatusBadgeColor(vitalsEval.spO2Status);
              const hrColor = getVitalStatusBadgeColor(vitalsEval.heartRateStatus);
              const bpColor = getVitalStatusBadgeColor(vitalsEval.bpStatus);
              const tempColor = getVitalStatusBadgeColor(vitalsEval.tempStatus);

              return (
                <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Bed & Patient */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                        {patient.bedNumber}
                      </span>
                      <div>
                        <div
                          onClick={() => onOpenMedications(patient)}
                          className="font-bold text-slate-900 hover:text-sky-600 cursor-pointer"
                        >
                          {patient.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {patient.age}y • {patient.gender} • {patient.ward}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Diagnosis */}
                  <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                    {patient.diagnosis}
                  </td>

                  {/* SpO2 */}
                  <td className="py-3 px-4 text-center">
                    <span
                      onClick={() => onOpenVitals(patient)}
                      className={`inline-block px-2 py-0.5 rounded font-bold cursor-pointer ${spO2Color.bg} ${spO2Color.text} ${spO2Color.border} border`}
                    >
                      {patient.vitals.spO2}%
                    </span>
                  </td>

                  {/* HR */}
                  <td className="py-3 px-4 text-center">
                    <span
                      onClick={() => onOpenVitals(patient)}
                      className={`inline-block px-2 py-0.5 rounded font-bold cursor-pointer ${hrColor.bg} ${hrColor.text} ${hrColor.border} border`}
                    >
                      {patient.vitals.heartRate} bpm
                    </span>
                  </td>

                  {/* BP */}
                  <td className="py-3 px-4 text-center">
                    <span
                      onClick={() => onOpenVitals(patient)}
                      className={`inline-block px-2 py-0.5 rounded font-bold cursor-pointer ${bpColor.bg} ${bpColor.text} ${bpColor.border} border`}
                    >
                      {patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia}
                    </span>
                  </td>

                  {/* Temp */}
                  <td className="py-3 px-4 text-center">
                    <span
                      onClick={() => onOpenVitals(patient)}
                      className={`inline-block px-2 py-0.5 rounded font-bold cursor-pointer ${tempColor.bg} ${tempColor.text} ${tempColor.border} border`}
                    >
                      {patient.vitals.temperature.toFixed(1)}°F
                    </span>
                  </td>

                  {/* Next Due Med */}
                  <td className="py-3 px-4">
                    {nextMed ? (
                      (() => {
                        const timing = getMedicationTimeLabel(nextMed, currentTime);
                        const isOverdue = nextMed.status === 'overdue';
                        const isDue = nextMed.status === 'due';
                        return (
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1">
                              <span>{nextMed.name}</span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({nextMed.dosage})
                              </span>
                            </div>
                            <div
                              className={`text-[11px] font-medium flex items-center gap-1 mt-0.5 ${
                                isOverdue
                                  ? 'text-rose-600 font-bold'
                                  : isDue
                                  ? 'text-amber-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{timing.label}</span>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-slate-400 italic">No pending meds</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    {nextMed ? (
                      <button
                        onClick={() => markMedicationGiven(patient.id, nextMed.id)}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                          nextMed.status === 'overdue'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : nextMed.status === 'due'
                            ? 'bg-sky-600 hover:bg-sky-700 text-white'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Given</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenMedications(patient)}
                        className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                      >
                        View Logs
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
