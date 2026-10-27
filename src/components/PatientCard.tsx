import React, { useState } from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Clock,
  CheckCircle,
  Pill,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import type { Patient, Medication } from '../types';
import { useHospital } from '../context/HospitalContext';
import { evaluateVitals, getVitalStatusBadgeColor } from '../utils/vitalsChecker';
import { getMedicationTimeLabel } from '../utils/medicationScheduler';
import { MissedMedicationModal } from './MissedMedicationModal';

interface PatientCardProps {
  patient: Patient;
  onOpenMedications: (patient: Patient) => void;
  onOpenVitals: (patient: Patient) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onOpenMedications,
  onOpenVitals,
}) => {
  const { markMedicationGiven, currentTime, clinicalThresholds } = useHospital();
  const [missedMed, setMissedMed] = useState<Medication | null>(null);

  const vitalsEval = evaluateVitals(patient.vitals, clinicalThresholds);

  // Find the most urgent or next pending medication
  const pendingMeds = patient.medications.filter(
    (m) => (m.status === 'overdue' || m.status === 'due' || m.status === 'upcoming') && !m.discontinued
  );

  const sortedPendingMeds = [...pendingMeds].sort((a, b) => {
    const priority = { overdue: 0, due: 1, upcoming: 2, completed: 3, skipped: 4 };
    return priority[a.status] - priority[b.status];
  });

  const nextMed: Medication | undefined = sortedPendingMeds[0];
  const completedCount = patient.medications.filter((m) => m.status === 'completed').length;
  const totalCount = patient.medications.filter((m) => !m.discontinued).length;

  const hrBadge = getVitalStatusBadgeColor(vitalsEval.heartRateStatus);
  const spO2Badge = getVitalStatusBadgeColor(vitalsEval.spO2Status);
  const bpBadge = getVitalStatusBadgeColor(vitalsEval.bpStatus);
  const tempBadge = getVitalStatusBadgeColor(vitalsEval.tempStatus);

  const isCritical = vitalsEval.overallStatus === 'critical' || nextMed?.status === 'overdue';

  return (
    <>
      <div
        className={`bg-white rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
          isCritical
            ? 'border-rose-300 ring-1 ring-rose-200'
            : patient.triageStatus === 'needs-attention'
            ? 'border-amber-300'
            : 'border-slate-200 hover:border-sky-300'
        }`}
      >
        {/* Top Banner: Bed Number & Status */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold text-xs border border-sky-100 shadow-2xs">
                {patient.bedNumber}
              </span>
              <div>
                <h3
                  className="text-base font-bold text-slate-900 hover:text-sky-700 cursor-pointer transition-colors"
                  onClick={() => onOpenMedications(patient)}
                >
                  {patient.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {patient.age}y • {patient.gender} • <span className="text-slate-600">{patient.diagnosis}</span>
                </p>
              </div>
            </div>

            {/* Triage Badge */}
            {vitalsEval.overallStatus === 'critical' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full animate-pulse">
                <ShieldAlert className="w-3 h-3" /> Critical Vitals
              </span>
            ) : nextMed?.status === 'overdue' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> Overdue Med
              </span>
            ) : nextMed?.status === 'due' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                Due Now
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Stable
              </span>
            )}
          </div>

          {/* Doctor & Ward */}
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="truncate max-w-[200px]">{patient.doctor}</span>
            <span className="text-slate-500 font-medium">{patient.ward}</span>
          </div>

          {/* Live Vitals Grid */}
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3 h-3 text-sky-600" /> Patient Vitals
              </span>
              <button
                onClick={() => onOpenVitals(patient)}
                className="text-[11px] font-medium text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-0.5"
              >
                Update vitals
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {/* Heart Rate */}
              <div className={`p-2 rounded-lg border text-center transition-all ${hrBadge.bg} ${hrBadge.border}`}>
                <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500">
                  <Heart
                    className={`w-3 h-3 ${
                      vitalsEval.heartRateStatus === 'critical'
                        ? 'text-rose-600 animate-bounce'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>HR</span>
                </div>
                <div className={`text-sm font-bold mt-0.5 ${hrBadge.text}`}>
                  {patient.vitals.heartRate}
                  <span className="text-[9px] font-normal text-slate-400 ml-0.5">bpm</span>
                </div>
              </div>

              {/* SpO2 */}
              <div className={`p-2 rounded-lg border text-center transition-all ${spO2Badge.bg} ${spO2Badge.border}`}>
                <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500">
                  <Activity
                    className={`w-3 h-3 ${
                      vitalsEval.spO2Status === 'critical' ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  />
                  <span>SpO₂</span>
                </div>
                <div className={`text-sm font-bold mt-0.5 ${spO2Badge.text}`}>
                  {patient.vitals.spO2}
                  <span className="text-[9px] font-normal text-slate-400 ml-0.5">%</span>
                </div>
              </div>

              {/* Blood Pressure */}
              <div className={`p-2 rounded-lg border text-center transition-all ${bpBadge.bg} ${bpBadge.border}`}>
                <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500">
                  <span>BP</span>
                </div>
                <div className={`text-xs font-bold mt-0.5 ${bpBadge.text}`}>
                  {patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia}
                </div>
              </div>

              {/* Temperature */}
              <div className={`p-2 rounded-lg border text-center transition-all ${tempBadge.bg} ${tempBadge.border}`}>
                <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500">
                  <Thermometer className="w-3 h-3 text-slate-400" />
                  <span>Temp</span>
                </div>
                <div className={`text-sm font-bold mt-0.5 ${tempBadge.text}`}>
                  {patient.vitals.temperature.toFixed(1)}°
                </div>
              </div>
            </div>
          </div>

          {/* Next / Due Medication Focus Box */}
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Pill className="w-3 h-3 text-sky-600" /> Next Medication
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {completedCount}/{totalCount} Completed
              </span>
            </div>

            {nextMed ? (
              (() => {
                const timeInfo = getMedicationTimeLabel(nextMed, currentTime);
                const isOverdue = nextMed.status === 'overdue';
                const isDue = nextMed.status === 'due';

                return (
                  <div
                    className={`p-3 rounded-xl border transition-all ${
                      isOverdue
                        ? 'bg-rose-50/70 border-rose-300'
                        : isDue
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {nextMed.name}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                            {nextMed.dosage}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium uppercase px-1 rounded bg-slate-200/70">
                            {nextMed.route}
                          </span>
                        </div>

                        <div className="mt-1 flex items-center gap-1.5">
                          <Clock className={`w-3 h-3 ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`} />
                          <span
                            className={`text-xs font-semibold ${
                              isOverdue
                                ? 'text-rose-700'
                                : isDue
                                ? 'text-amber-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {timeInfo.label}
                          </span>
                        </div>

                        {nextMed.instructions && (
                          <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                            "{nextMed.instructions}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: 1-Click Given + Missed/Skip */}
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <button
                        onClick={() => markMedicationGiven(patient.id, nextMed.id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] ${
                          isOverdue
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                            : isDue
                            ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-200'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Medicine Given</span>
                      </button>

                      <button
                        onClick={() => setMissedMed(nextMed)}
                        className="py-2 px-2.5 rounded-lg text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 transition-colors flex items-center justify-center gap-1"
                        title="Mark dose as missed or withheld with reason"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Missed</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-800 font-semibold text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>All doses completed for now</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  24h recurring meds will appear automatically
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer: Quick Actions */}
        <div className="bg-slate-50/80 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => onOpenMedications(patient)}
            className="font-medium text-slate-700 hover:text-sky-600 flex items-center gap-1 transition-colors"
          >
            <span>All Prescriptions ({patient.medications.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOpenVitals(patient)}
            className="font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <span>Vitals History</span>
          </button>
        </div>
      </div>

      {/* Missed Medication Modal */}
      <MissedMedicationModal
        patient={patient}
        medication={missedMed}
        isOpen={!!missedMed}
        onClose={() => setMissedMed(null)}
      />
    </>
  );
};
