import { Users, Activity, CheckCircle2, Clock } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import { evaluateVitals } from '../utils/vitalsChecker';

export const TriageStats: React.FC = () => {
  const { patients, activeFilter, setActiveFilter } = useHospital();

  const totalPatients = patients.length;

  // Count medications across all patients
  let totalMeds = 0;
  let overdueMeds = 0;
  let dueSoonMeds = 0;
  let completedMeds = 0;

  // Count abnormal vitals
  let abnormalVitalsCount = 0;

  patients.forEach((patient) => {
    patient.medications.forEach((med) => {
      totalMeds++;
      if (med.status === 'overdue') overdueMeds++;
      else if (med.status === 'due') dueSoonMeds++;
      else if (med.status === 'completed') completedMeds++;
    });

    const vitalEval = evaluateVitals(patient.vitals);
    if (vitalEval.overallStatus !== 'normal') {
      abnormalVitalsCount++;
    }
  });

  const completionPct = totalMeds > 0 ? Math.round((completedMeds / totalMeds) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Patients */}
      <div
        onClick={() => setActiveFilter('all')}
        className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
          activeFilter === 'all'
            ? 'border-sky-400 ring-2 ring-sky-100'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Active Inpatients</span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800">{totalPatients}</span>
          <span className="text-xs text-slate-500 font-medium">Beds occupied</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span>Click to view all patients</span>
        </div>
      </div>

      {/* 2. Overdue Medications */}
      <div
        onClick={() => setActiveFilter('overdue')}
        className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
          overdueMeds > 0 ? 'bg-rose-50/40 border-rose-200' : 'border-slate-200'
        } ${activeFilter === 'overdue' ? 'ring-2 ring-rose-300 border-rose-500' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
            Overdue Meds
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              overdueMeds > 0 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={`text-2xl sm:text-3xl font-bold ${
              overdueMeds > 0 ? 'text-rose-600' : 'text-slate-800'
            }`}
          >
            {overdueMeds}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {dueSoonMeds > 0 ? `+ ${dueSoonMeds} due soon` : 'requiring action'}
          </span>
        </div>
        <div className="mt-2 text-[11px] font-medium text-rose-600 flex items-center gap-1">
          {overdueMeds > 0 ? 'Action required immediately' : 'All schedules on track'}
        </div>
      </div>

      {/* 3. Abnormal Vitals */}
      <div
        onClick={() => setActiveFilter('vitals')}
        className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
          abnormalVitalsCount > 0 ? 'bg-amber-50/40 border-amber-200' : 'border-slate-200'
        } ${activeFilter === 'vitals' ? 'ring-2 ring-amber-300 border-amber-500' : ''}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
            Abnormal Vitals
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              abnormalVitalsCount > 0
                ? 'bg-amber-100 text-amber-700 animate-pulse'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={`text-2xl sm:text-3xl font-bold ${
              abnormalVitalsCount > 0 ? 'text-amber-700' : 'text-slate-800'
            }`}
          >
            {abnormalVitalsCount}
          </span>
          <span className="text-xs text-slate-500 font-medium">Patients flagged</span>
        </div>
        <div className="mt-2 text-[11px] font-medium text-amber-700 flex items-center gap-1">
          {abnormalVitalsCount > 0 ? 'SpO₂, HR or BP out of range' : 'All vitals within normal range'}
        </div>
      </div>

      {/* 4. Completed Doses */}
      <div
        onClick={() => setActiveFilter('completed')}
        className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
          activeFilter === 'completed'
            ? 'border-emerald-400 ring-2 ring-emerald-100'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Medication Adherence</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-800">{completedMeds}</span>
          <span className="text-xs text-emerald-600 font-medium font-semibold">{completionPct}% given</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span>{totalMeds} total prescribed doses today</span>
        </div>
      </div>
    </div>
  );
};
