import React, { useState } from 'react';
import {
  X,
  Activity,
  Heart,
  Thermometer,
  Wind,
  AlertTriangle,
  History,
  Save,
} from 'lucide-react';
import type { Patient, VitalSignReading } from '../types';
import { useHospital } from '../context/HospitalContext';
import { evaluateVitals } from '../utils/vitalsChecker';

interface VitalsModalProps {
  patient: Patient | null;
  onClose: () => void;
}

export const VitalsModal: React.FC<VitalsModalProps> = ({ patient, onClose }) => {
  const { updateVitals } = useHospital();

  const [heartRate, setHeartRate] = useState<number>(patient ? patient.vitals.heartRate : 75);
  const [spO2, setSpO2] = useState<number>(patient ? patient.vitals.spO2 : 98);
  const [bpSys, setBpSys] = useState<number>(patient ? patient.vitals.bloodPressureSys : 120);
  const [bpDia, setBpDia] = useState<number>(patient ? patient.vitals.bloodPressureDia : 80);
  const [temp, setTemp] = useState<number>(patient ? patient.vitals.temperature : 98.6);
  const [respRate, setRespRate] = useState<number>(
    patient ? patient.vitals.respiratoryRate || 16 : 16
  );
  const [showHistory, setShowHistory] = useState(false);

  if (!patient) return null;

  // Live evaluation of current draft values
  const draftVitals: VitalSignReading = {
    heartRate,
    spO2,
    bloodPressureSys: bpSys,
    bloodPressureDia: bpDia,
    temperature: temp,
    respiratoryRate: respRate,
    timestamp: 'Draft',
  };
  const liveEvaluation = evaluateVitals(draftVitals);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVitals(patient.id, {
      heartRate: Number(heartRate),
      spO2: Number(spO2),
      bloodPressureSys: Number(bpSys),
      bloodPressureDia: Number(bpDia),
      temperature: Number(temp),
      respiratoryRate: Number(respRate),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs px-2 py-0.5 rounded bg-sky-600 text-white">
                  {patient.bedNumber}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Update Vital Signs
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.name} • {patient.diagnosis}
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

        {/* Live Warning Notice if draft contains abnormal readings */}
        {liveEvaluation.alerts.length > 0 && (
          <div
            className={`px-5 py-2.5 border-b text-xs font-semibold flex items-center gap-2 ${
              liveEvaluation.overallStatus === 'critical'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {liveEvaluation.overallStatus === 'critical' ? 'CRITICAL ALERT: ' : 'WARNING: '}
              {liveEvaluation.alerts.join(' • ')}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {showHistory ? 'Telemetry & Vitals History' : 'Enter Latest Bedside Measurements'}
            </span>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>{showHistory ? 'Back to Input' : 'View Past Readings'}</span>
            </button>
          </div>

          {!showHistory ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {/* Heart Rate */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" /> Heart Rate (HR)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">60-100 bpm</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={30}
                      max={220}
                      required
                      value={heartRate}
                      onChange={(e) => setHeartRate(Number(e.target.value))}
                      className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-500">bpm</span>
                  </div>
                </div>

                {/* SpO2 */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-sky-500" /> Oxygen Sat (SpO₂)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">95-100%</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={60}
                      max={100}
                      required
                      value={spO2}
                      onChange={(e) => setSpO2(Number(e.target.value))}
                      className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-500">%</span>
                  </div>
                </div>

                {/* Blood Pressure Systolic */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                    <span>Blood Pressure (Sys)</span>
                    <span className="text-[10px] text-slate-400 font-normal">90-120 mmHg</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={50}
                      max={260}
                      required
                      value={bpSys}
                      onChange={(e) => setBpSys(Number(e.target.value))}
                      className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-500">mmHg</span>
                  </div>
                </div>

                {/* Blood Pressure Diastolic */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                    <span>Blood Pressure (Dia)</span>
                    <span className="text-[10px] text-slate-400 font-normal">60-80 mmHg</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={30}
                      max={160}
                      required
                      value={bpDia}
                      onChange={(e) => setBpDia(Number(e.target.value))}
                      className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-500">mmHg</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Body Temp (°F)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">97.8 - 99.1°F</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={0.1}
                      min={90}
                      max={110}
                      required
                      value={temp}
                      onChange={(e) => setTemp(Number(e.target.value))}
                      className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-500">°F</span>
                  </div>
                </div>

                {/* Respiratory Rate */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-teal-500" /> Resp Rate
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">12-20 bpm</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={8}
                      max={60}
                      required
                      value={respRate}
                      onChange={(e) => setRespRate(Number(e.target.value))}
                      className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-500">/min</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Vital Readings</span>
                </button>
              </div>
            </form>
          ) : (
            /* History view */
            <div className="space-y-3">
              {patient.vitalsHistory && patient.vitalsHistory.length > 0 ? (
                patient.vitalsHistory.map((reading, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs"
                  >
                    <div className="flex items-center justify-between text-slate-500 mb-2 font-semibold">
                      <span>Logged at {reading.timestamp}</span>
                      <span>By: {reading.recordedBy || 'Nurse on Duty'}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white p-1.5 rounded border border-slate-200 font-semibold">
                        HR: {reading.heartRate} bpm
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-200 font-semibold">
                        SpO₂: {reading.spO2}%
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-200 font-semibold">
                        BP: {reading.bloodPressureSys}/{reading.bloodPressureDia}
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-200 font-semibold">
                        Temp: {reading.temperature.toFixed(1)}°F
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-6 text-xs">No prior readings logged.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
