-- 🚀 SQL de Inicialización para Postgres
-- Generado para cumplir la Regla 01 y 09 (Drizzle + MultiTenant) - DOMINIO: VETERINARIA SAAS

-- Instalar extensión UUID en el esquema público
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA "public";

-- Crear y usar el esquema específico del dominio
CREATE SCHEMA IF NOT EXISTS "Veterinaria";
SET search_path TO "Veterinaria", "public";

-- 1. Tabla Maestra de Tenants (SaaS)
CREATE TABLE IF NOT EXISTS "tenants" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"commercial_name" text NOT NULL,
	"brand_tag" text,
	"logo_url" text,
	"primary_color" text,
	"secondary_color" text,
	"tax_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

-- 2. Usuarios del Sistema (Roles: clinical_staff, tutor_portal, admin)
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"email" text NOT NULL UNIQUE,
	"password_hash" text,
	"role" text DEFAULT 'clinical_staff' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

-- 3. Sedes (Veterinarias/Clínicas)
CREATE TABLE IF NOT EXISTS "sedes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"name" text NOT NULL,
	"tag" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"phone" text NOT NULL,
	"is_emergency_24h" boolean DEFAULT false NOT NULL,
	"active_shift" text,
	"total_beds" integer DEFAULT 0,
	"occupied_beds" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

-- 4. Veterinarios (Trabajadores Médicos)
CREATE TABLE IF NOT EXISTS "veterinarians" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"sede_id" uuid NOT NULL REFERENCES "sedes"("id") ON DELETE RESTRICT,
	"user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"specialty" text NOT NULL,
	"registration_number" text NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

-- 5. Clientes (Tutores)
CREATE TABLE IF NOT EXISTS "clients" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE,
	"name" text NOT NULL,
	"dni" text,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"notes" text,
	"total_visits" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

-- 6. Pacientes (Mascotas)
CREATE TABLE IF NOT EXISTS "patients" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"species" text NOT NULL, -- canino, felino, exotico
	"breed" text NOT NULL,
	"gender" text NOT NULL, -- macho, hembra
	"neutered" boolean DEFAULT false NOT NULL,
	"age" text NOT NULL,
	"microchip" text,
	"status" text NOT NULL, -- sano, hospitalizado, tratamiento, vacuna, urgencia
	"photo_url" text,
	"weight_kg" real,
	"body_condition_score" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

-- 7. Citas Médicas (Appointments)
CREATE TABLE IF NOT EXISTS "appointments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"sede_id" uuid NOT NULL REFERENCES "sedes"("id") ON DELETE RESTRICT,
	"patient_id" uuid NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
	"veterinarian_id" uuid NOT NULL REFERENCES "veterinarians"("id") ON DELETE RESTRICT,
	"time" text NOT NULL,
	"date" date NOT NULL,
	"duration_minutes" integer NOT NULL,
	"type" text NOT NULL, -- consulta, vacunacion, cirugia, urgencia
	"status" text NOT NULL, -- programada, en_espera, en_curso, etc
	"reason" text NOT NULL,
	"room_box" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

-- Indices de Rendimiento (Regla 09)
CREATE INDEX idx_users_tenant ON "users"("tenant_id");
CREATE INDEX idx_sedes_tenant ON "sedes"("tenant_id");
CREATE INDEX idx_veterinarians_tenant_sede ON "veterinarians"("tenant_id", "sede_id");
CREATE INDEX idx_clients_tenant ON "clients"("tenant_id");
CREATE INDEX idx_patients_tenant_client ON "patients"("tenant_id", "client_id");
CREATE INDEX idx_appointments_tenant_date ON "appointments"("tenant_id", "date");

-- Insertar Data Mínima de Arranque
INSERT INTO "tenants" ("id", "slug", "name", "commercial_name") VALUES ('00000000-0000-0000-0000-000000000001', 'vet-principal', 'Veterinaria Manila', 'Manila Vet') ON CONFLICT DO NOTHING;
INSERT INTO "users" ("tenant_id", "email", "role") VALUES ('00000000-0000-0000-0000-000000000001', 'admin@manila.com', 'clinical_staff') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "Veterinaria"."clinical_notes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"veterinarian_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"narrative" text NOT NULL,
	"plan" text,
	"temp" text,
	"heart_rate" text,
	"resp_rate" text,
	"weight" text,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

DO $$ BEGIN
 ALTER TABLE "Veterinaria"."clinical_notes" ADD CONSTRAINT "clinical_notes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "Veterinaria"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "Veterinaria"."clinical_notes" ADD CONSTRAINT "clinical_notes_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "Veterinaria"."patients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "Veterinaria"."clinical_notes" ADD CONSTRAINT "clinical_notes_veterinarian_id_veterinarians_id_fk" FOREIGN KEY ("veterinarian_id") REFERENCES "Veterinaria"."veterinarians"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_clinical_notes_tenant_patient ON "Veterinaria"."clinical_notes"("tenant_id", "patient_id");
