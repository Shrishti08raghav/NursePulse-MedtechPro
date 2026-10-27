export type MedicationStatus = 'upcoming' | 'due' | 'overdue' | 'completed' | 'skipped';

export type MedicationRoute = 'Oral' | 'IV' | 'IM' | 'SC' | 'Inhalation' | 'Topical' | 'Sublingual';

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  route: MedicationRoute;
  scheduledTime: string; // "HH:MM" 24h format, e.g., "08:00", "14:00"
  instructions?: string;
  status: MedicationStatus;
  administeredAt?: string; // e.g. "12:15 PM"
  administeredBy?: string; // e.g. "Nurse Sarah Jenkins, RN"
  notes?: string;
  date?: string; // "YYYY-MM-DD"
  missedReason?: string; // e.g. "Patient Refused", "NPO for Surgery"
  discontinued?: boolean;
  discontinuedReason?: string;
  frequency?: string; // e.g. "Once Daily (24h)", "Twice Daily (12h)"
}

export interface VitalSignReading {
  heartRate: number; // bpm (60 - 100 normal)
  spO2: number; // % (95 - 100 normal)
  bloodPressureSys: number; // mmHg (90 - 120 normal)
  bloodPressureDia: number; // mmHg (60 - 80 normal)
  temperature: number; // °F (97.8 - 99.1 normal)
  respiratoryRate: number; // breaths/min (12 - 20 normal)
  timestamp: string;
  recordedBy?: string;
}

export type VitalStatusLevel = 'normal' | 'warning' | 'critical';

export interface VitalCheckResult {
  heartRateStatus: VitalStatusLevel;
  spO2Status: VitalStatusLevel;
  bpStatus: VitalStatusLevel;
  tempStatus: VitalStatusLevel;
  overallStatus: VitalStatusLevel;
  alerts: string[];
}

export interface ClinicalThresholds {
  spO2Critical: number; // default 90
  spO2Warning: number; // default 95
  hrHighCritical: number; // default 120
  hrLowCritical: number; // default 50
  bpSysCritical: number; // default 160
  bpDiaCritical: number; // default 100
  tempHighCritical: number; // default 102.0
}

export interface Patient {
  id: string;
  bedNumber: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  ward: string;
  doctor: string;
  admissionDate: string;
  allergies: string[];
  vitals: VitalSignReading;
  vitalsHistory: VitalSignReading[];
  medications: Medication[];
  triageStatus: 'critical' | 'needs-attention' | 'stable';
}

export interface SystemAlert {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  type: 'medication_overdue' | 'vital_critical' | 'vital_warning' | 'medication_due';
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
  resolved: boolean;
}

export interface NurseProfile {
  name: string;
  id: string;
  shift: string;
  ward: string;
}

export interface MedicationAuditEntry {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  medicationName: string;
  dosage: string;
  action: 'Administered' | 'Missed/Withheld' | 'Discontinued by Doctor' | 'Prescribed';
  reason?: string;
  timestamp: string;
  date: string;
  nurseName: string;
}
