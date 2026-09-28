import { text, timestamp, uuid, boolean, real, integer, date, pgSchema } from 'drizzle-orm/pg-core';

// Regla 01 y 09: Esquema de dominio aislado
export const veterinariaSchema = pgSchema('Veterinaria');

export const tenants = veterinariaSchema.table('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  commercialName: text('commercial_name').notNull(),
  brandTag: text('brand_tag'),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color'),
  secondaryColor: text('secondary_color'),
  taxId: text('tax_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const users = veterinariaSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('clinical_staff'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const sedes = veterinariaSchema.table('sedes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  tag: text('tag').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  phone: text('phone').notNull(),
  isEmergency24h: boolean('is_emergency_24h').notNull().default(false),
  activeShift: text('active_shift'),
  totalBeds: integer('total_beds').default(0),
  occupiedBeds: integer('occupied_beds').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const veterinarians = veterinariaSchema.table('veterinarians', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  sedeId: uuid('sede_id').references(() => sedes.id, { onDelete: 'restrict' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role').notNull(),
  specialty: text('specialty').notNull(),
  registrationNumber: text('registration_number').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const clients = veterinariaSchema.table('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  dni: text('dni'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address'),
  notes: text('notes'),
  totalVisits: integer('total_visits').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const patients = veterinariaSchema.table('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  species: text('species').notNull(),
  breed: text('breed').notNull(),
  gender: text('gender').notNull(),
  neutered: boolean('neutered').notNull().default(false),
  age: text('age').notNull(),
  microchip: text('microchip'),
  status: text('status').notNull(),
  photoUrl: text('photo_url'),
  weightKg: real('weight_kg'),
  bodyConditionScore: text('body_condition_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const appointments = veterinariaSchema.table('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  sedeId: uuid('sede_id').references(() => sedes.id, { onDelete: 'restrict' }).notNull(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  veterinarianId: uuid('veterinarian_id').references(() => veterinarians.id, { onDelete: 'restrict' }).notNull(),
  time: text('time').notNull(),
  date: date('date').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  reason: text('reason').notNull(),
  roomBox: text('room_box').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export const clinicalNotes = veterinariaSchema.table('clinical_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  veterinarianId: uuid('veterinarian_id').references(() => veterinarians.id, { onDelete: 'restrict' }).notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'consulta' | 'urgencia' | 'preventivo' | 'cirugia'
  narrative: text('narrative').notNull(),
  plan: text('plan'),
  temp: text('temp'),
  heartRate: text('heart_rate'),
  respRate: text('resp_rate'),
  weight: text('weight'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
