import type {
  VitalSignReading,
  VitalCheckResult,
  VitalStatusLevel,
  ClinicalThresholds,
} from '../types';

export const DEFAULT_THRESHOLDS: ClinicalThresholds = {
  spO2Critical: 90,
  spO2Warning: 95,
  hrHighCritical: 120,
  hrLowCritical: 50,
  bpSysCritical: 160,
  bpDiaCritical: 100,
  tempHighCritical: 102.0,
};

export function evaluateVitals(
  vitals: VitalSignReading,
  thresholds: ClinicalThresholds = DEFAULT_THRESHOLDS
): VitalCheckResult {
  const alerts: string[] = [];

  // Heart Rate (BPM)
  let heartRateStatus: VitalStatusLevel = 'normal';
  if (vitals.heartRate < thresholds.hrLowCritical) {
    heartRateStatus = 'critical';
    alerts.push(`Critical Bradycardia: HR is ${vitals.heartRate} bpm (< ${thresholds.hrLowCritical})`);
  } else if (vitals.heartRate > thresholds.hrHighCritical) {
    heartRateStatus = 'critical';
    alerts.push(`Severe Tachycardia: HR is ${vitals.heartRate} bpm (> ${thresholds.hrHighCritical})`);
  } else if (vitals.heartRate < 60 || vitals.heartRate > 100) {
    heartRateStatus = 'warning';
    alerts.push(`Abnormal Heart Rate: ${vitals.heartRate} bpm`);
  }

  // SpO2 (%)
  let spO2Status: VitalStatusLevel = 'normal';
  if (vitals.spO2 < thresholds.spO2Critical) {
    spO2Status = 'critical';
    alerts.push(`Severe Hypoxemia: SpO₂ is ${vitals.spO2}% (< ${thresholds.spO2Critical}%) - Oxygen required`);
  } else if (vitals.spO2 < thresholds.spO2Warning) {
    spO2Status = 'warning';
    alerts.push(`Borderline Low Oxygen: SpO₂ is ${vitals.spO2}% (< ${thresholds.spO2Warning}%)`);
  }

  // Blood Pressure (mmHg)
  let bpStatus: VitalStatusLevel = 'normal';
  if (
    vitals.bloodPressureSys >= thresholds.bpSysCritical ||
    vitals.bloodPressureDia >= thresholds.bpDiaCritical
  ) {
    bpStatus = 'critical';
    alerts.push(`Stage 2 / Crisis Hypertension: BP ${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg`);
  } else if (vitals.bloodPressureSys < 85 || vitals.bloodPressureDia < 55) {
    bpStatus = 'critical';
    alerts.push(`Hypotension Shock Risk: BP ${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg`);
  } else if (vitals.bloodPressureSys >= 130 || vitals.bloodPressureDia >= 85) {
    bpStatus = 'warning';
    alerts.push(`Elevated Blood Pressure: ${vitals.bloodPressureSys}/${vitals.bloodPressureDia} mmHg`);
  }

  // Temperature (°F)
  let tempStatus: VitalStatusLevel = 'normal';
  if (vitals.temperature >= thresholds.tempHighCritical) {
    tempStatus = 'critical';
    alerts.push(`High Grade Fever: Temp ${vitals.temperature.toFixed(1)}°F (≥ ${thresholds.tempHighCritical}°F)`);
  } else if (vitals.temperature < 95.5) {
    tempStatus = 'critical';
    alerts.push(`Hypothermia: Temp ${vitals.temperature.toFixed(1)}°F (< 95.5°F)`);
  } else if (vitals.temperature >= 100.4) {
    tempStatus = 'warning';
    alerts.push(`Low-to-Mid Fever: Temp ${vitals.temperature.toFixed(1)}°F`);
  }

  // Overall status determination
  let overallStatus: VitalStatusLevel = 'normal';
  if (
    heartRateStatus === 'critical' ||
    spO2Status === 'critical' ||
    bpStatus === 'critical' ||
    tempStatus === 'critical'
  ) {
    overallStatus = 'critical';
  } else if (
    heartRateStatus === 'warning' ||
    spO2Status === 'warning' ||
    bpStatus === 'warning' ||
    tempStatus === 'warning'
  ) {
    overallStatus = 'warning';
  }

  return {
    heartRateStatus,
    spO2Status,
    bpStatus,
    tempStatus,
    overallStatus,
    alerts,
  };
}

export function getVitalStatusBadgeColor(level: VitalStatusLevel): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (level) {
    case 'critical':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'warning':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'normal':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
  }
}
