import { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Sliders,
  FileSpreadsheet,
  Users,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import type { ClinicalThresholds } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    setIsAdminMode,
    patients,
    auditLogs,
    clinicalThresholds,
    updateClinicalThresholds,
    resetAllData,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'analytics' | 'audit' | 'thresholds' | 'roster'>('analytics');
  const [draftThresholds, setDraftThresholds] = useState<ClinicalThresholds>(clinicalThresholds);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate ward occupancy
  const wardMap: { [ward: string]: number } = {};
  patients.forEach((p) => {
    wardMap[p.ward] = (wardMap[p.ward] || 0) + 1;
  });

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinicalThresholds(draftThresholds);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAdminMode(false)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Nurse Station</span>
              </button>

              <div className="h-6 w-px bg-slate-700 mx-2 hidden sm:block" />

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                    Hospital Administration Console
                    <span className="text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full">
                      SUPERUSER
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-400">
                    Apex Memorial Hospital • Central Governance Station
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={resetAllData}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset System DB</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-slate-300 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Ward & Bed Occupancy</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Medication Administration Audit Log ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('thresholds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'thresholds'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Clinical Alert Thresholds</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'roster'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Nursing Duty Roster</span>
          </button>
        </div>

        {/* Tab 1: Ward & Bed Occupancy */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Total Ward Beds</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">12 Beds</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  100% Operational Readiness
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Admitted Inpatients</span>
                <div className="text-3xl font-extrabold text-sky-600 mt-1">
                  {patients.length} Patients
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1">
                  Occupancy: {Math.round((patients.length / 12) * 100)}% Capacity
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Total Active Prescriptions</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  {patients.reduce((acc, p) => acc + p.medications.length, 0)} Doses
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1">
                  Tracked across 24h schedules
                </div>
              </div>
            </div>

            {/* Ward Distribution Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
                Departmental Ward Breakdown
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="p-3">Ward / Unit</th>
                    <th className="p-3 text-center">Inpatients</th>
                    <th className="p-3">Assigned Doctors</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(wardMap).map(([ward, count]) => (
                    <tr key={ward} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{ward}</td>
                      <td className="p-3 text-center font-semibold text-sky-700">{count} Beds</td>
                      <td className="p-3 text-slate-600">Attending Specialist Assigned</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          Active & Monitored
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Medication Administration Audit Log */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Comprehensive Medication Administration Log (MAR)
                </h3>
                <p className="text-xs text-slate-500">
                  Complete audit trail including given doses, missed reasons, and doctor discontinuations
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800">
                {auditLogs.length} Recorded Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Time & Date</th>
                    <th className="p-3">Bed & Patient</th>
                    <th className="p-3">Medication</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Clinical Reason / Notes</th>
                    <th className="p-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70">
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{entry.timestamp}</span>
                        <span className="text-[10px] text-slate-400 block">{entry.date}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-sky-700">{entry.bedNumber}</span>
                        <div className="text-slate-800 font-semibold">{entry.patientName}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900">{entry.medicationName}</span>
                        <span className="text-slate-500 text-[11px] block">{entry.dosage}</span>
                      </td>
                      <td className="p-3">
                        {entry.action === 'Administered' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Given
                          </span>
                        ) : entry.action === 'Missed/Withheld' ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Missed / Withheld
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            {entry.action}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700 max-w-xs font-medium">
                        {entry.reason ? (
                          <span className={entry.action === 'Missed/Withheld' ? 'text-rose-700 font-semibold' : ''}>
                            {entry.reason}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None specified</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-semibold whitespace-nowrap">
                        {entry.nurseName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Clinical Alert Threshold Configurations */}
        {activeTab === 'thresholds' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs max-w-2xl mx-auto animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-600" />
                Configure Clinical Vital Alarm Thresholds
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize warning and critical telemetry trigger cutoffs for the entire ward.
              </p>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Threshold parameters saved and applied to all patient monitors!</span>
              </div>
            )}

            <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">
                    SpO₂ Critical Alarm Cutoff (%)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">Triggers loud hypoxia alert below this</p>
                  <input
                    type="number"
                    min={70}
                    max={98}
                    value={draftThresholds.spO2Critical}
                    onChange={(e) =>
                      setDraftThresholds({ ...draftThresholds, spO2Critical: Number(e.target.value) })
                    }
                    className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">
                    SpO₂ Warning Cutoff (%)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">Triggers low oxygen warning</p>
                  <input
                    type="number"
                    min={85}
                    max={99}
                    value={draftThresholds.spO2Warning}
                    onChange={(e) =>
                      setDraftThresholds({ ...draftThresholds, spO2Warning: Number(e.target.value) })
                    }
                    className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">
                    HR Tachycardia Critical (bpm)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">High heart rate trigger</p>
                  <input
                    type="number"
                    min={100}
                    max={180}
                    value={draftThresholds.hrHighCritical}
                    onChange={(e) =>
                      setDraftThresholds({
                        ...draftThresholds,
                        hrHighCritical: Number(e.target.value),
                      })
                    }
                    className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">
                    HR Bradycardia Critical (bpm)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">Low heart rate trigger</p>
                  <input
                    type="number"
                    min={30}
                    max={60}
                    value={draftThresholds.hrLowCritical}
                    onChange={(e) =>
                      setDraftThresholds({ ...draftThresholds, hrLowCritical: Number(e.target.value) })
                    }
                    className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">
                    Systolic BP Crisis (mmHg)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">Crisis hypertension limit</p>
                  <input
                    type="number"
                    min={140}
                    max={220}
                    value={draftThresholds.bpSysCritical}
                    onChange={(e) =>
                      setDraftThresholds({
                        ...draftThresholds,
                        bpSysCritical: Number(e.target.value),
                      })
                    }
                    className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">
                    High Fever Critical (°F)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">Fever emergency limit</p>
                  <input
                    type="number"
                    step={0.1}
                    min={100}
                    max={106}
                    value={draftThresholds.tempHighCritical}
                    onChange={(e) =>
                      setDraftThresholds({
                        ...draftThresholds,
                        tempHighCritical: Number(e.target.value),
                      })
                    }
                    className="w-full text-base font-bold px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Clinical Thresholds</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Nursing Duty Roster */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs animate-in fade-in duration-150">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
              Staff Nursing Shift Roster & Credentials
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-3">Staff Member</th>
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">Assigned Shift</th>
                  <th className="p-3">Duty Location</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">Nurse Sarah Jenkins, RN</td>
                  <td className="p-3 font-mono text-slate-600">RN-8842</td>
                  <td className="p-3 text-slate-700">Day Shift (07:00 - 19:00)</td>
                  <td className="p-3 text-slate-700">General Ward Hub & Cardiology</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      On Duty (Active)
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">Nurse Mark Rivera, RN</td>
                  <td className="p-3 font-mono text-slate-600">RN-7621</td>
                  <td className="p-3 text-slate-700">Night Shift (19:00 - 07:00)</td>
                  <td className="p-3 text-slate-700">Surgical Ward & ICU</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                      Handover Complete
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">Nurse Ananya Patel, BSN</td>
                  <td className="p-3 font-mono text-slate-600">RN-9104</td>
                  <td className="p-3 text-slate-700">Day Shift (07:00 - 19:00)</td>
                  <td className="p-3 text-slate-700">Pulmonology & Step-Down</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      On Duty (Active)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
