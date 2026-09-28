export type UserRole = 'clinical_staff' | 'tutor_portal';

export interface Sede {
  id: string;
  tenantId: string;
  name: string;
  tag: string;
  address: string;
  city: string;
  phone: string;
  isEmergency24h: boolean;
  activeShift: string;
  totalBeds: number;
  occupiedBeds: number;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  commercialName: string;
  brandTag: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  taxId: string;
  sedes: Sede[];
}

export interface Veterinarian {
  id: string;
  tenantId: string;
  sedeId: string;
  name: string;
  role: string;
  specialty: string;
  registrationNumber: string;
  avatarUrl: string;
}

export type Species = 'canino' | 'felino' | 'exotico';
export type PatientHealthStatus = 'sano' | 'hospitalizado' | 'tratamiento' | 'vacuna' | 'urgencia';

export interface PatientTutor {
  name: string;
  phone: string;
  email: string;
}

export interface Patient {
  id: string;
  code: string;
  name: string;
  species: Species;
  breed: string;
  gender: 'macho' | 'hembra';
  neutered: boolean;
  age: string;
  microchip: string;
  status: PatientHealthStatus;
  statusDetail?: string;
  photoUrl: string;
  weightKg: number;
  weightDeltaText?: string;
  bodyConditionScore: string;
  bodyConditionNotes?: string;
  criticalAlerts: string[];
  chronicConditions: string[];
  tutor: PatientTutor;
  sedeId: string;
  currentRoom?: string;
}

export type AppointmentType = 'consulta' | 'vacunacion' | 'cirugia' | 'urgencia';
export type AppointmentStatus =
  | 'en_sala'
  | 'en_curso'
  | 'confirmado'
  | 'completada'
  | 'programada'
  | 'en_espera'
  | 'por_llegar';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  species: Species;
  breed: string;
  photoUrl: string;
  tutorName: string;
  tutorPhone: string;
  time: string;
  date: string;
  durationMinutes: number;
  durationLabel: string;
  type: AppointmentType;
  status: AppointmentStatus;
  statusLabel: string;
  reason: string;
  roomBox: string;
  veterinarianName: string;
  veterinarianId: string;
  autoReminder: boolean;
  sedeId: string;
  badgeStyle?: string;
}

export interface ClinicalVitals {
  temp: string;
  fc: string;
  fr: string;
  weight: string;
}

export interface ClinicalAttachment {
  name: string;
  type: string;
  icon: string;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  date: string;
  time: string;
  title: string;
  type: 'consulta' | 'urgencia' | 'preventivo' | 'cirugia';
  typeLabel: string;
  veterinarianName: string;
  veterinarianRegistration: string;
  veterinarianSpecialty: string;
  vitals?: ClinicalVitals;
  narrative: string;
  plan?: string;
  tags: string[];
  attachments?: ClinicalAttachment[];
  resolvedStatus?: string;
  badgeColor?: string;
}

export type ServiceCategory =
  | 'Consulta'
  | 'Cirugía'
  | 'Ecografía'
  | 'Rayos X'
  | 'Exámenes'
  | 'Consultas'
  | 'Cirugías'
  | 'Imagen'
  | 'Laboratorio';

export interface ServiceCatalogItem {
  id: string;
  code: string;
  category: ServiceCategory;
  name: string;
  price: number;
  priceSubtext: string;
  durationMinutes: number;
  inCatalog: boolean;
  sedeId?: string;
}

export interface ReminderRule {
  id: string;
  name: string;
  categoryBadge: string;
  description: string;
  channel: 'whatsapp' | 'sms' | 'both';
  active: boolean;
  icon: string;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  templateText: string;
  channel: 'whatsapp' | 'sms';
  variables: string[];
}

export interface ClientPetSummary {
  id: string;
  name: string;
  species: Species;
  breed: string;
  photoUrl?: string;
  isEsteticaOnly?: boolean;
}

export interface ClientRecord {
  id: string;
  name: string;
  dni?: string;
  email: string;
  phone: string;
  address?: string;
  pets: ClientPetSummary[];
  lastVisitDate: string;
  lastVisitReason: string;
  lastVisitDoctor?: string;
  totalVisits: number;
  hasActiveAppointment?: boolean;
  isEsteticaOnly?: boolean;
  notes?: string;
}

export interface ToastMessage {

  id: string;
  message: string;
  icon?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
