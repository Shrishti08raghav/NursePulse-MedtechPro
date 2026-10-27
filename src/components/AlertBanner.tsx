import { AlertTriangle, X, ArrowRight, Activity, Clock } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';
import type { Patient } from '../types';

interface AlertBannerProps {
  onSelectPatient: (patient: Patient) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ onSelectPatient }) => {
  const { alerts, dismissAlert, patients } = useHospital();

  if (alerts.length === 0) return null;

  // Prioritize critical alerts first
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    return 0;
  });

  const topAlert = sortedAlerts[0];
  const relatedPatient = patients.find((p) => p.id === topAlert.patientId);

  return (
    <div
      className={`mb-6 rounded-xl border p-4 transition-all shadow-sm ${
        topAlert.severity === 'critical'
          ? 'bg-rose-50/90 border-rose-300 text-rose-900'
          : 'bg-amber-50/90 border-amber-300 text-amber-900'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              topAlert.severity === 'critical'
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-amber-500 text-white'
            }`}
          >
            {topAlert.type === 'vital_critical' ? (
              <Activity className="w-5 h-5" />
            ) : topAlert.type === 'medication_overdue' ? (
              <Clock className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  topAlert.severity === 'critical'
                    ? 'bg-rose-200 text-rose-800'
                    : 'bg-amber-200 text-amber-800'
                }`}
              >
                {topAlert.severity === 'critical' ? 'Urgent Alert' : 'Attention Needed'}
              </span>
              <span className="font-semibold text-sm">
                [{topAlert.bedNumber}] {topAlert.patientName}
              </span>
              <span className="text-xs opacity-75">• {topAlert.timestamp}</span>
            </div>
            <p className="text-xs sm:text-sm mt-0.5 font-medium">{topAlert.message}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {alerts.length > 1 && (
            <span className="text-xs font-semibold px-2 py-1 bg-white/70 rounded-md border border-slate-200 text-slate-700">
              +{alerts.length - 1} more alert{alerts.length > 2 ? 's' : ''}
            </span>
          )}

          {relatedPatient && (
            <button
              onClick={() => onSelectPatient(relatedPatient)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white shadow-2xs border border-slate-300 hover:bg-slate-50 transition-all text-slate-800"
            >
              <span>View Patient</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => dismissAlert(topAlert.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-all"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
