export type UserRole = 'ADMIN' | 'POLICE' | 'HOSPITAL' | 'DRIVER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Ambulance {
  id: number;
  vehicle_number: string;
  driver_name: string;
  latitude: number;
  longitude: number;
  status: 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE_PATIENT' | 'ARRIVED_PATIENT' | 'EN_ROUTE_HOSPITAL' | 'ARRIVED_HOSPITAL' | 'MAINTENANCE';
  vehicle_type: 'ALS' | 'BLS' | 'ICU';
  equipment_level: 'BASIC' | 'ADVANCED' | 'ICU_LEVEL';
  patient_capacity: number;
  updated_at: string;
}

export interface Hospital {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  available_beds: number;
  icu_beds: number;
  trauma_capacity: boolean;
  emergency_capacity: number;
  status: 'OPERATIONAL' | 'BUSY' | 'FULL';
  contact_number?: string;
}

export interface Emergency {
  id: number;
  patient_count: number;
  critical_patient_count: number;
  emergency_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  status: 'CREATED' | 'ANALYZED' | 'DISPATCHED' | 'POLICE_NOTIFIED' | 'CORRIDOR_ACTIVE' | 'HOSPITAL_ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  police_corridor_requested: boolean;
  police_corridor_acknowledged: boolean;
  police_corridor_active: boolean;
  hospital_accepted: boolean;
  created_at: string;
}

export interface RecommendedAmbulance {
  ambulance: Ambulance;
  distance_km: number;
  traffic_level: string;
  predicted_eta: number;
  score: number;
  reasoning: string[];
  assigned_patients: number;
}

export interface RecommendedHospital {
  hospital: Hospital;
  distance_km: number;
  predicted_eta: number;
  score: number;
  reasoning: string[];
  assigned_patients: number;
}

export interface RouteGeometry {
  total_distance_km: number;
  total_eta_minutes: number;
  geometry: [number, number][];
  mode?: string;
}

export interface PriorityAssessment {
  level: string;
  corridor_recommended: boolean;
  total_estimated_arrival_minutes: number;
  reasons: string[];
}

export interface EmergencyAnalysisResult {
  emergency_id: number;
  severity: string;
  patient_count: number;
  critical_patient_count: number;
  recommended_ambulance: RecommendedAmbulance;
  recommended_hospital: RecommendedHospital;
  route: RouteGeometry;
  priority_assessment: PriorityAssessment;
  police_alert_created: boolean;
}

export interface PoliceAlert {
  id: number;
  emergency_id: number;
  route_json: string;
  destination_hospital_name: string;
  ambulance_vehicle_number: string;
  patient_count: number;
  critical_count: number;
  severity: string;
  eta_minutes: number;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'PRIORITY_ACTIVE' | 'DECLINED' | 'COMPLETED';
  created_at: string;
  acknowledged_at?: string;
}

export interface DashboardSummary {
  active_emergencies: number;
  available_ambulances: number;
  ambulances_en_route: number;
  total_hospitals: number;
  available_hospitals: number;
  critical_emergencies: number;
  average_response_time_minutes: number;
}
