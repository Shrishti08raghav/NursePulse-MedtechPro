import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type {
  Patient,
  Medication,
  VitalSignReading,
  SystemAlert,
  NurseProfile,
  ClinicalThresholds,
  MedicationAuditEntry,
} from '../types';
import { INITIAL_PATIENTS } from '../data/mockPatients';
import { evaluateVitals, DEFAULT_THRESHOLDS } from '../utils/vitalsChecker';
import { calculateMedicationStatus, minutesTo12Hour } from '../utils/medicationScheduler';
import { soundEffects } from '../utils/audio';

interface HospitalContextType {
  patients: Patient[];
  currentTime: string;
  currentTimeDisplay: string;
  selectedDate: string; // "YYYY-MM-DD"
  setSelectedDate: (date: string) => void;
  goToNextDay: () => void;
  goToPrevDay: () => void;
  goToToday: () => void;
  audioEnabled: boolean;
  toggleAudio: () => void;
  testAudio: () => void;
  isAlarmRinging: boolean;
  silenceActiveAlarm: () => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentNurse: NurseProfile;
  alerts: SystemAlert[];
  dismissAlert: (id: string) => void;
  markMedicationGiven: (patientId: string, medId: string, notes?: string) => void;
  markMedicationMissed: (patientId: string, medId: string, reason: string) => void;
  undoMedicationGiven: (patientId: string, medId: string) => void;
  deleteMedication: (patientId: string, medId: string, reason?: string) => void;
  addMedication: (patientId: string, newMed: Omit<Medication, 'id' | 'patientId' | 'status'>) => void;
  updateVitals: (patientId: string, newVitals: Omit<VitalSignReading, 'timestamp' | 'recordedBy'>) => void;
  addPatient: (newPatient: Omit<Patient, 'id' | 'vitalsHistory'>) => void;
  fastForwardTime: (minutes: number) => void;
  simulateDemoAlert: (patientId: string, emergencyType: 'hypoxia' | 'tachycardia' | 'hypertensive') => void;
  resetAllData: () => void;
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  clinicalThresholds: ClinicalThresholds;
  updateClinicalThresholds: (thresholds: ClinicalThresholds) => void;
  auditLogs: MedicationAuditEntry[];
}

const STORAGE_KEY = 'nursepulse_patients_v2';
const TIME_KEY = 'nursepulse_time_v2';
const DATE_KEY = 'nursepulse_date_v2';
const THRESHOLDS_KEY = 'nursepulse_thresholds_v2';
const AUDIT_KEY = 'nursepulse_audit_v2';

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current date tracking (YYYY-MM-DD)
  const getTodayDateStr = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return localStorage.getItem(DATE_KEY) || getTodayDateStr();
  });

  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const saved = localStorage.getItem(TIME_KEY);
    return saved ? Number(saved) : 12 * 60 + 15; // 12:15 PM
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PATIENTS;
      }
    }
    return INITIAL_PATIENTS;
  });

  const [clinicalThresholds, setClinicalThresholds] = useState<ClinicalThresholds>(() => {
    const saved = localStorage.getItem(THRESHOLDS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_THRESHOLDS;
      }
    }
    return DEFAULT_THRESHOLDS;
  });

  const [auditLogs, setAuditLogs] = useState<MedicationAuditEntry[]>(() => {
    const saved = localStorage.getItem(AUDIT_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'init-1',
        patientId: 'p-101',
        patientName: 'Jonathan Miller',
        bedNumber: 'Bed 101',
        medicationName: 'Clopidogrel (Plavix)',
        dosage: '75 mg',
        action: 'Administered',
        timestamp: '08:12 AM',
        date: getTodayDateStr(),
        nurseName: 'Nurse Mark Rivera, RN',
        reason: 'Routine post-stent therapy',
      },
    ];
  });

  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isAlarmRinging, setIsAlarmRinging] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  const currentNurse: NurseProfile = {
    name: 'Nurse Sarah Jenkins, RN',
    id: 'RN-8842',
    shift: 'Day Shift (07:00 - 19:00)',
    ward: 'General Hospital Ward Hub',
  };

  const currentHours = Math.floor(currentMinutes / 60) % 24;
  const currentMins = currentMinutes % 60;
  const currentTime = `${currentHours.toString().padStart(2, '0')}:${currentMins.toString().padStart(2, '0')}`;
  const currentTimeDisplay = minutesTo12Hour(currentMinutes);

  // Sync audio ringing state
  useEffect(() => {
    soundEffects.setAlarmListener((ringing) => {
      setIsAlarmRinging(ringing);
    });
  }, []);

  const toggleAudio = () => {
    setAudioEnabled((prev) => {
      const next = !prev;
      soundEffects.enabled = next;
      if (!next) soundEffects.stopAlertAlarm();
      return next;
    });
  };

  const testAudio = () => {
    soundEffects.unlockContext();
    soundEffects.testSound();
  };

  const silenceActiveAlarm = () => {
    soundEffects.stopAlertAlarm();
    setIsAlarmRinging(false);
  };

  // Date Navigation Helpers
  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const nextDate = d.toISOString().split('T')[0];
    setSelectedDate(nextDate);
  };

  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const prevDate = d.toISOString().split('T')[0];
    setSelectedDate(prevDate);
  };

  const goToToday = () => {
    setSelectedDate(getTodayDateStr());
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(TIME_KEY, currentMinutes.toString());
  }, [currentMinutes]);

  useEffect(() => {
    localStorage.setItem(DATE_KEY, selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(clinicalThresholds));
  }, [clinicalThresholds]);

  useEffect(() => {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Recalculate dynamic alerts and statuses based on current time & selected date
  const recomputeAlertsAndStatuses = useCallback(() => {
    const todayStr = getTodayDateStr();
    const isSelectedDayToday = selectedDate === todayStr;
    const isSelectedDayFuture = selectedDate > todayStr;
    const newAlerts: SystemAlert[] = [];

    setPatients((prevPatients) =>
      prevPatients.map((patient) => {
        // Evaluate medications for the selected 24h cycle
        const updatedMeds = patient.medications
          .filter((m) => !m.discontinued)
          .map((med) => {
            // If viewing future date, 24h recurring meds reset to upcoming/due for that date
            if (isSelectedDayFuture) {
              const status = calculateMedicationStatus({ ...med, status: 'upcoming' }, currentTime);
              return {
                ...med,
                status,
                date: selectedDate,
                administeredAt: undefined,
                administeredBy: undefined,
                missedReason: undefined,
              };
            }

            // If viewing today
            if (isSelectedDayToday) {
              const newStatus = calculateMedicationStatus(med, currentTime);
              if (newStatus === 'overdue' && med.status !== 'completed' && med.status !== 'skipped') {
                newAlerts.push({
                  id: `alert-med-${med.id}`,
                  patientId: patient.id,
                  patientName: patient.name,
                  bedNumber: patient.bedNumber,
                  type: 'medication_overdue',
                  message: `Overdue Medication: ${med.name} (${med.dosage}) scheduled at ${med.scheduledTime}`,
                  severity: 'warning',
                  timestamp: currentTimeDisplay,
                  resolved: false,
                });
              }
              return { ...med, status: newStatus };
            }

            return med;
          });

        // Evaluate vitals with configurable clinical thresholds
        const vitalEval = evaluateVitals(patient.vitals, clinicalThresholds);
        if (vitalEval.overallStatus === 'critical') {
          vitalEval.alerts.forEach((msg, idx) => {
            newAlerts.push({
              id: `alert-vital-${patient.id}-${idx}`,
              patientId: patient.id,
              patientName: patient.name,
              bedNumber: patient.bedNumber,
              type: 'vital_critical',
              message: msg,
              severity: 'critical',
              timestamp: patient.vitals.timestamp || currentTimeDisplay,
              resolved: false,
            });
          });
        }

        // Compute triage status
        let triageStatus: 'critical' | 'needs-attention' | 'stable' = 'stable';
        const hasOverdue = updatedMeds.some((m) => m.status === 'overdue');
        const hasDue = updatedMeds.some((m) => m.status === 'due');

        if (vitalEval.overallStatus === 'critical') {
          triageStatus = 'critical';
        } else if (hasOverdue || vitalEval.overallStatus === 'warning') {
          triageStatus = 'critical';
        } else if (hasDue) {
          triageStatus = 'needs-attention';
        }

        return {
          ...patient,
          medications: updatedMeds,
          triageStatus,
        };
      })
    );

    setAlerts(newAlerts);
  }, [currentTime, currentTimeDisplay, selectedDate, clinicalThresholds]);

  useEffect(() => {
    recomputeAlertsAndStatuses();
  }, [currentMinutes, selectedDate, clinicalThresholds, recomputeAlertsAndStatuses]);

  // Keep selectedPatient reference in sync
  useEffect(() => {
    if (selectedPatient) {
      const updated = patients.find((p) => p.id === selectedPatient.id);
      if (updated) setSelectedPatient(updated);
    }
  }, [patients, selectedPatient]);

  // 1-Click "Medicine Given"
  const markMedicationGiven = (patientId: string, medId: string, notes?: string) => {
    soundEffects.unlockContext();
    soundEffects.playSuccessChime();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#0284c7', '#10b981', '#38bdf8', '#34d399'],
      });
    } catch {
      // Confetti fallback
    }

    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const updatedMeds = patient.medications.map((med) => {
          if (med.id !== medId) return med;

          // Add to audit logs
          const auditEntry: MedicationAuditEntry = {
            id: `audit-${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            bedNumber: patient.bedNumber,
            medicationName: med.name,
            dosage: med.dosage,
            action: 'Administered',
            timestamp: currentTimeDisplay,
            date: selectedDate,
            nurseName: currentNurse.name,
            reason: notes || 'Administered per daily schedule',
          };
          setAuditLogs((logs) => [auditEntry, ...logs]);

          return {
            ...med,
            status: 'completed' as const,
            administeredAt: currentTimeDisplay,
            administeredBy: currentNurse.name,
            notes: notes || med.notes,
            date: selectedDate,
          };
        });

        return { ...patient, medications: updatedMeds };
      })
    );
  };

  // Mark medication missed/skipped with clinical reason
  const markMedicationMissed = (patientId: string, medId: string, reason: string) => {
    soundEffects.unlockContext();
    soundEffects.playWarningChime();

    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const updatedMeds = patient.medications.map((med) => {
          if (med.id !== medId) return med;

          // Add to audit logs
          const auditEntry: MedicationAuditEntry = {
            id: `audit-missed-${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            bedNumber: patient.bedNumber,
            medicationName: med.name,
            dosage: med.dosage,
            action: 'Missed/Withheld',
            reason: reason,
            timestamp: currentTimeDisplay,
            date: selectedDate,
            nurseName: currentNurse.name,
          };
          setAuditLogs((logs) => [auditEntry, ...logs]);

          return {
            ...med,
            status: 'skipped' as const,
            missedReason: reason,
            administeredAt: `Withheld @ ${currentTimeDisplay}`,
            administeredBy: currentNurse.name,
            date: selectedDate,
          };
        });

        return { ...patient, medications: updatedMeds };
      })
    );
  };

  // Undo accidental mark
  const undoMedicationGiven = (patientId: string, medId: string) => {
    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const updatedMeds = patient.medications.map((med) => {
          if (med.id !== medId) return med;
          const status = calculateMedicationStatus(med, currentTime);
          return {
            ...med,
            status,
            administeredAt: undefined,
            administeredBy: undefined,
            missedReason: undefined,
          };
        });

        return { ...patient, medications: updatedMeds };
      })
    );
  };

  // Delete / Discontinue Medication (e.g. Doctor removed it)
  const deleteMedication = (patientId: string, medId: string, reason?: string) => {
    soundEffects.unlockContext();
    soundEffects.playWarningChime();

    setPatients((prev) =>
      prev.map((patient) => {
        if (patient.id !== patientId) return patient;

        const medToDelete = patient.medications.find((m) => m.id === medId);
        if (medToDelete) {
          const auditEntry: MedicationAuditEntry = {
            id: `audit-del-${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            bedNumber: patient.bedNumber,
            medicationName: medToDelete.name,
            dosage: medToDelete.dosage,
            action: 'Discontinued by Doctor',
            reason: reason || 'Discontinued by Attending Physician',
            timestamp: currentTimeDisplay,
            date: selectedDate,
            nurseName: currentNurse.name,
          };
          setAuditLogs((logs) => [auditEntry, ...logs]);
        }

        return {
          ...patient,
          medications: patient.medications.filter((m) => m.id !== medId),
        };
      })
    );
  };

  // Add new prescription
  const addMedication = (
    patientId: string,
    newMed: Omit<Medication, 'id' | 'patientId' | 'status'>
  ) => {
    const med: Medication = {
      ...newMed,
      id: `m-${patientId}-${Date.now()}`,
      patientId,
      status: 'upcoming',
      date: selectedDate,
      frequency: newMed.frequency || 'Once Daily (24h)',
    };
    med.status = calculateMedicationStatus(med, currentTime);

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const auditEntry: MedicationAuditEntry = {
          id: `audit-add-${Date.now()}`,
          patientId: p.id,
          patientName: p.name,
          bedNumber: p.bedNumber,
          medicationName: med.name,
          dosage: med.dosage,
          action: 'Prescribed',
          timestamp: currentTimeDisplay,
          date: selectedDate,
          nurseName: currentNurse.name,
          reason: 'New medical order entered',
        };
        setAuditLogs((logs) => [auditEntry, ...logs]);

        return { ...p, medications: [...p.medications, med] };
      })
    );
  };

  // Update vitals
  const updateVitals = (
    patientId: string,
    newVitals: Omit<VitalSignReading, 'timestamp' | 'recordedBy'>
  ) => {
    soundEffects.unlockContext();
    const fullReading: VitalSignReading = {
      ...newVitals,
      timestamp: currentTimeDisplay,
      recordedBy: currentNurse.name,
    };

    const evalResult = evaluateVitals(fullReading, clinicalThresholds);
    if (evalResult.overallStatus === 'critical') {
      soundEffects.startContinuousAlertAlarm();
    } else if (evalResult.overallStatus === 'warning') {
      soundEffects.playWarningChime();
    } else {
      soundEffects.playSuccessChime();
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          vitals: fullReading,
          vitalsHistory: [fullReading, ...(p.vitalsHistory || [])],
        };
      })
    );
  };

  // Add patient
  const addPatient = (newPatient: Omit<Patient, 'id' | 'vitalsHistory'>) => {
    const patient: Patient = {
      ...newPatient,
      id: `p-${Date.now()}`,
      vitalsHistory: [
        { ...newPatient.vitals, timestamp: currentTimeDisplay, recordedBy: currentNurse.name },
      ],
    };
    setPatients((prev) => [patient, ...prev]);
  };

  // Fast forward time
  const fastForwardTime = (minutes: number) => {
    setCurrentMinutes((prev) => prev + minutes);
  };

  // Demo simulator: Trigger abnormal vital emergency with continuous alarm
  const simulateDemoAlert = (
    patientId: string,
    emergencyType: 'hypoxia' | 'tachycardia' | 'hypertensive'
  ) => {
    soundEffects.unlockContext();
    soundEffects.startContinuousAlertAlarm();

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        let vitalsUpdate: Partial<VitalSignReading> = {};
        if (emergencyType === 'hypoxia') {
          vitalsUpdate = { spO2: 87, heartRate: 118, respiratoryRate: 28 };
        } else if (emergencyType === 'tachycardia') {
          vitalsUpdate = { heartRate: 142, bloodPressureSys: 155, bloodPressureDia: 95 };
        } else if (emergencyType === 'hypertensive') {
          vitalsUpdate = { bloodPressureSys: 188, bloodPressureDia: 112, heartRate: 104 };
        }

        const newReading: VitalSignReading = {
          ...p.vitals,
          ...vitalsUpdate,
          timestamp: currentTimeDisplay,
          recordedBy: 'Continuous Monitor (Telemetry)',
        };

        return {
          ...p,
          vitals: newReading,
          vitalsHistory: [newReading, ...p.vitalsHistory],
        };
      })
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const updateClinicalThresholds = (thresholds: ClinicalThresholds) => {
    setClinicalThresholds(thresholds);
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIME_KEY);
    localStorage.removeItem(DATE_KEY);
    localStorage.removeItem(THRESHOLDS_KEY);
    localStorage.removeItem(AUDIT_KEY);
    soundEffects.stopAlertAlarm();
    setPatients(INITIAL_PATIENTS);
    setCurrentMinutes(12 * 60 + 15);
    setSelectedDate(getTodayDateStr());
    setClinicalThresholds(DEFAULT_THRESHOLDS);
    setAlerts([]);
    setSelectedPatient(null);
  };

  return (
    <HospitalContext.Provider
      value={{
        patients,
        currentTime,
        currentTimeDisplay,
        selectedDate,
        setSelectedDate,
        goToNextDay,
        goToPrevDay,
        goToToday,
        audioEnabled,
        toggleAudio,
        testAudio,
        isAlarmRinging,
        silenceActiveAlarm,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        currentNurse,
        alerts,
        dismissAlert,
        markMedicationGiven,
        markMedicationMissed,
        undoMedicationGiven,
        deleteMedication,
        addMedication,
        updateVitals,
        addPatient,
        fastForwardTime,
        simulateDemoAlert,
        resetAllData,
        selectedPatient,
        setSelectedPatient,
        isAdminMode,
        setIsAdminMode,
        clinicalThresholds,
        updateClinicalThresholds,
        auditLogs,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
