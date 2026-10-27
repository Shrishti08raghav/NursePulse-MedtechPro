import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Header } from './components/Header';
import { TriageStats } from './components/TriageStats';
import { AlertBanner } from './components/AlertBanner';
import { FilterBar } from './components/FilterBar';
import { PatientCard } from './components/PatientCard';
import { PatientListView } from './components/PatientListView';
import { MedicationScheduleModal } from './components/MedicationScheduleModal';
import { VitalsModal } from './components/VitalsModal';
import { AddPatientModal } from './components/AddPatientModal';
import { ShiftReportModal } from './components/ShiftReportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { QRUnlockModal } from './components/QRUnlockModal';
import { evaluateVitals } from './utils/vitalsChecker';
import type { Patient } from './types';
import { Plus, Users, BellRing, VolumeX } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const {
    patients,
    activeFilter,
    searchQuery,
    isAdminMode,
    isAlarmRinging,
    silenceActiveAlarm,
    clinicalThresholds,
  } = useHospital();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPatientForMeds, setSelectedPatientForMeds] = useState<Patient | null>(null);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<Patient | null>(null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isShiftReportOpen, setIsShiftReportOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  // If in Admin Mode, render the dedicated Admin Console
  if (isAdminMode) {
    return <AdminDashboard />;
  }

  // Filter patients
  const filteredPatients = patients.filter((patient) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = patient.name.toLowerCase().includes(q);
      const matchesBed = patient.bedNumber.toLowerCase().includes(q);
      const matchesDiag = patient.diagnosis.toLowerCase().includes(q);
      const matchesDoctor = patient.doctor.toLowerCase().includes(q);
      const matchesMed = patient.medications.some((m) => m.name.toLowerCase().includes(q));

      if (!matchesName && !matchesBed && !matchesDiag && !matchesDoctor && !matchesMed) {
        return false;
      }
    }

    // 2. Active Tab / Ward Filter
    const vitalEval = evaluateVitals(patient.vitals, clinicalThresholds);
    const hasOverdue = patient.medications.some((m) => m.status === 'overdue');
    const hasDue = patient.medications.some((m) => m.status === 'due');
    const hasCompleted = patient.medications.some((m) => m.status === 'completed');

    if (activeFilter === 'all') return true;
    if (activeFilter === 'attention') {
      return vitalEval.overallStatus !== 'normal' || hasOverdue || hasDue;
    }
    if (activeFilter === 'overdue') return hasOverdue;
    if (activeFilter === 'vitals') return vitalEval.overallStatus !== 'normal';
    if (activeFilter === 'completed') return hasCompleted;

    // Ward check
    return patient.ward === activeFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header */}
      <Header
        onOpenAddPatient={() => setIsAddPatientOpen(true)}
        onOpenShiftReport={() => setIsShiftReportOpen(true)}
        onOpenQRUnlock={() => setIsQROpen(true)}
      />

      {/* Persistent Floating Alarm Silence Bar */}
      {isAlarmRinging && (
        <div className="sticky top-16 z-40 bg-rose-600 text-white px-4 py-2.5 shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold">
            <BellRing className="w-5 h-5 animate-spin" />
            <span>CRITICAL CLINICAL ALARM RINGING! Immediate Attention Required</span>
          </div>
          <button
            onClick={silenceActiveAlarm}
            className="px-4 py-1.5 rounded-lg bg-white text-rose-700 text-xs font-extrabold hover:bg-rose-50 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
            <span>Silence / Stop Alarm</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Triage Overview Metrics */}
        <TriageStats />

        {/* Real-time Alerts Banner */}
        <AlertBanner onSelectPatient={(patient) => setSelectedPatientForMeds(patient)} />

        {/* Filter and Search Bar */}
        <FilterBar viewMode={viewMode} setViewMode={setViewMode} />

        {/* Patient Bed Matrix */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No patients found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No patients match your current filter or search criteria. Try changing filters or admitting a new patient.
            </p>
            <button
              onClick={() => setIsAddPatientOpen(true)}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Admit New Patient</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onOpenMedications={(p) => setSelectedPatientForMeds(p)}
                onOpenVitals={(p) => setSelectedPatientForVitals(p)}
              />
            ))}
          </div>
        ) : (
          <PatientListView
            patients={filteredPatients}
            onOpenMedications={(p) => setSelectedPatientForMeds(p)}
            onOpenVitals={(p) => setSelectedPatientForVitals(p)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 py-4 bg-white text-center text-xs text-slate-500">
        <p>
          NursePulse™ • MedTech Hospital Medication Tracking & Clinical Alert System • Tip: Hold logo for 1.5s to open Admin QR Panel
        </p>
      </footer>

      {/* Modals */}
      <MedicationScheduleModal
        patient={selectedPatientForMeds}
        onClose={() => setSelectedPatientForMeds(null)}
      />

      <VitalsModal
        patient={selectedPatientForVitals}
        onClose={() => setSelectedPatientForVitals(null)}
      />

      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
      />

      <ShiftReportModal
        isOpen={isShiftReportOpen}
        onClose={() => setIsShiftReportOpen(false)}
      />

      <QRUnlockModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HospitalProvider>
      <DashboardContent />
    </HospitalProvider>
  );
};

export default App;
