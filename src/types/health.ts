// Health Monitoring Type Definitions

export interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  age?: number;
  gender?: string;
  phone?: string;
  emergency_contact?: string;
  medical_conditions?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthMetrics {
  id: string;
  patient_id: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  body_temperature?: number;
  blood_oxygen?: number;
  stress_level?: number; // 1-10
  sleep_hours?: number;
  sleep_quality_rating?: number; // 1-5
  recorded_at: string;
  created_at: string;
}

export interface DoctorNote {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthAlert {
  id: string;
  patient_id: string;
  metric_type: string;
  alert_type: 'warning' | 'critical' | 'info';
  message: string;
  value?: string;
  is_resolved: boolean;
  created_at: string;
}

export interface HealthMetricsInput {
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  body_temperature?: number;
  blood_oxygen?: number;
  stress_level?: number;
  sleep_hours?: number;
  sleep_quality_rating?: number;
}