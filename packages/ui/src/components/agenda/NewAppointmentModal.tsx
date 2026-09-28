import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { AppointmentType } from '../../types';

export const NewAppointmentModal: React.FC = () => {
  const {
    isAppointmentModalOpen,
    setIsAppointmentModalOpen,
    addAppointment,
    patients,
    veterinarians,
    currentSede,
    showToast,
  } = useTenant();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'patient-max');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('consulta');
  const [reason, setReason] = useState('Revisión traumatológica y evaluación articular');
  const [selectedVetId, setSelectedVetId] = useState<string>(veterinarians[0]?.id || 'vet-mendoza');
  const [date, setDate] = useState('2024-10-24');
  const [time, setTime] = useState('10:30 AM');
  const [selectedBox, setSelectedBox] = useState('Box 1 - Consultas Generales');
  const [autoReminder, setAutoReminder] = useState(true);

  if (!isAppointmentModalOpen) return null;

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const currentVet = veterinarians.find((v) => v.id === selectedVetId) || veterinarians[0];

  const quickReasons = [
    'Revisión traumatológica',
    'Vacunación anual polivalente',
    'Cirugía / Esterilización',
    'Chequeo general preventivo',
    'Limpieza dental ultrasonido',
    'Cojera / Dolor agudo',
  ];

  const timeSlots = [
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '01:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
    '05:00 PM',
    '05:30 PM',
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      showToast('Por favor introduce el motivo de consulta', 'error', 'error');
      return;
    }

    const duration =
      appointmentType === 'cirugia' ? 90 : appointmentType === 'urgencia' ? 45 : 30;

    addAppointment({
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      species: currentPatient.species,
      breed: currentPatient.breed,
      photoUrl: currentPatient.photoUrl,
      tutorName: currentPatient.tutor.name,
      tutorPhone: currentPatient.tutor.phone,
      time,
      date,
      durationMinutes: duration,
      durationLabel: `${duration} min`,
      type: appointmentType,
      status: 'programada',
      statusLabel: 'Programada',
      reason: reason.trim(),
      roomBox: selectedBox,
      veterinarianName: currentVet.name,
      veterinarianId: currentVet.id,
      autoReminder,
      sedeId: currentSede.id,
    });

    setIsAppointmentModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-surface-container my-auto">
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 bg-surface-container-lowest flex items-center justify-between border-b border-surface-container">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">calendar_add_on</span>
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-on-surface">
                Agendar Nueva Cita Médica
              </h2>
              <p className="text-xs text-on-surface-variant">
                Asigna el turno médico, paciente, profesional y sala clínica sin sobrecarga
              </p>
            </div>
          </div>
          <button
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            onClick={() => setIsAppointmentModalOpen(false)}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Formulario Espacioso y Organizado */}
        <form onSubmit={handleConfirm} className="flex flex-col flex-1 overflow-y-auto p-6 gap-5">
          {/* SECCIÓN 1: Selección de Propietario / Paciente */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">person_search</span>
                <span>Propietario / Paciente *</span>
              </label>
              <span className="text-[11px] text-primary font-bold">
                Directorio Activo ({patients.length} pacientes)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-container-low/70 p-3.5 rounded-2xl border border-surface-container">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-surface-container-lowest font-bold text-xs sm:text-sm text-on-surface p-2.5 rounded-xl border border-surface-container outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      Tutor: {p.tutor.name} ➔ Paciente: {p.name} ({p.species === 'canino' ? '🐶 Perro' : p.species === 'felino' ? '🐱 Gato' : '🐰 Exótico'} - {p.breed}) - {p.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ficha Resumen del Paciente Seleccionado */}
              <div className="flex items-center gap-3 sm:col-span-2 bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container/70">
                <img
                  src={currentPatient.photoUrl}
                  alt={currentPatient.name}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-primary/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-on-surface truncate">
                      {currentPatient.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-surface-container text-on-surface-variant font-bold">
                      {currentPatient.code}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">
                    Tutor: <strong>{currentPatient.tutor.name}</strong> · Tel: {currentPatient.tutor.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Tipo de Atención Médica Diferenciada por Colores */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">palette</span>
              <span>Tipo de Atención Médica (Diferenciación por Colores) *</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Opción 1: Consulta General (AZUL) */}
              <button
                type="button"
                onClick={() => setAppointmentType('consulta')}
                className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  appointmentType === 'consulta'
                    ? 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-2 ring-blue-600/30'
                    : 'bg-surface-container-lowest border-surface-container text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-white"></span>
                  <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                    Azul
                  </span>
                </div>
                <div>
                  <p className="font-extrabold text-xs">Consulta General</p>
                  <p className="text-[11px] opacity-75 mt-0.5">30 min · Rutina</p>
                </div>
              </button>

              {/* Opción 2: Cirugía (ROJO) */}
              <button
                type="button"
                onClick={() => setAppointmentType('cirugia')}
                className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  appointmentType === 'cirugia'
                    ? 'bg-red-50 border-red-600 text-red-950 shadow-xs ring-2 ring-red-600/30'
                    : 'bg-surface-container-lowest border-surface-container text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-white"></span>
                  <span className="text-[10px] font-bold uppercase bg-red-100 text-red-800 px-1.5 py-0.2 rounded">
                    Rojo
                  </span>
                </div>
                <div>
                  <p className="font-extrabold text-xs">Cirugía / Proc.</p>
                  <p className="text-[11px] opacity-75 mt-0.5">90 min · Quirófano</p>
                </div>
              </button>

              {/* Opción 3: Vacunación (VERDE) */}
              <button
                type="button"
                onClick={() => setAppointmentType('vacunacion')}
                className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  appointmentType === 'vacunacion'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs ring-2 ring-emerald-600/30'
                    : 'bg-surface-container-lowest border-surface-container text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 ring-2 ring-white"></span>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                    Verde
                  </span>
                </div>
                <div>
                  <p className="font-extrabold text-xs">Vacunación</p>
                  <p className="text-[11px] opacity-75 mt-0.5">20 min · Cartilla</p>
                </div>
              </button>

              {/* Opción 4: Urgencia (ÁMBAR) */}
              <button
                type="button"
                onClick={() => setAppointmentType('urgencia')}
                className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                  appointmentType === 'urgencia'
                    ? 'bg-amber-50 border-amber-600 text-amber-950 shadow-xs ring-2 ring-amber-600/30'
                    : 'bg-surface-container-lowest border-surface-container text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-600 ring-2 ring-white"></span>
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                    Ámbar
                  </span>
                </div>
                <div>
                  <p className="font-extrabold text-xs">Urgencia Médica</p>
                  <p className="text-[11px] opacity-75 mt-0.5">Inmediata · Triaje</p>
                </div>
              </button>
            </div>
          </div>

          {/* SECCIÓN 3: Motivo de Consulta con Sugerencias Rápidas */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">clinical_notes</span>
              <span>Motivo de Consulta / Síntomas *</span>
            </label>

            <input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Control de herida quirúrgica, vacunación polivalente anual..."
              className="w-full bg-surface-container-lowest text-on-surface text-xs sm:text-sm font-medium rounded-xl p-3 border border-surface-container outline-none focus:ring-2 focus:ring-primary shadow-2xs"
            />

            {/* Chips de sugerencias rápidas */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase">Sugerencias:</span>
              {quickReasons.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(qr)}
                  className="px-2.5 py-0.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN 4: Médico Veterinario Asignado */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
              <span>Médico Veterinario Asignado *</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {veterinarians.map((vet) => {
                const isSelected = selectedVetId === vet.id;
                return (
                  <button
                    key={vet.id}
                    type="button"
                    onClick={() => setSelectedVetId(vet.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary'
                        : 'bg-surface-container-lowest border-surface-container text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <img
                      src={vet.avatarUrl}
                      alt={vet.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-primary/20"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold truncate">{vet.name}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{vet.specialty}</p>
                      <span className="text-[9px] font-mono text-primary font-bold">
                        {vet.registrationNumber}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 5: Fecha y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">event</span>
                <span>Fecha del Turno *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="p-2.5 rounded-xl bg-surface-container-lowest text-xs sm:text-sm font-bold text-on-surface border border-surface-container outline-none focus:ring-2 focus:ring-primary shadow-2xs"
              />
              <div className="flex items-center gap-1.5 mt-0.5">
                <button
                  type="button"
                  onClick={() => setDate('2024-10-24')}
                  className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] font-bold text-on-surface"
                >
                  Hoy (24 Oct)
                </button>
                <button
                  type="button"
                  onClick={() => setDate('2024-10-25')}
                  className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] font-bold text-on-surface"
                >
                  Mañana (25 Oct)
                </button>
                <button
                  type="button"
                  onClick={() => setDate('2024-10-28')}
                  className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] font-bold text-on-surface"
                >
                  Lunes (28 Oct)
                </button>
              </div>
            </div>

            {/* Hora y Slots */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                <span>Hora del Turno *</span>
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="p-2.5 rounded-xl bg-surface-container-lowest text-xs sm:text-sm font-bold text-on-surface border border-surface-container outline-none focus:ring-2 focus:ring-primary shadow-2xs cursor-pointer"
              >
                {timeSlots.map((ts) => (
                  <option key={ts} value={ts}>
                    {ts}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-on-surface-variant font-medium">
                Franja estimada: {appointmentType === 'cirugia' ? '90 minutos' : appointmentType === 'urgencia' ? '45 minutos' : '30 minutos'}
              </span>
            </div>
          </div>

          {/* SECCIÓN 6: Sala / Box Clínico y Recordatorio Automático */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">meeting_room</span>
                <span>Sala / Box Asignado</span>
              </label>
              <select
                value={selectedBox}
                onChange={(e) => setSelectedBox(e.target.value)}
                className="p-2.5 rounded-xl bg-surface-container-lowest text-xs sm:text-sm font-bold text-on-surface border border-surface-container outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="Box 1 - Consultas Generales">Box 1 - Consultas Generales</option>
                <option value="Box 2 - Medicina Preventiva">Box 2 - Medicina Preventiva</option>
                <option value="Box 3 - Felinos y Exóticos">Box 3 - Felinos y Exóticos</option>
                <option value="Quirófano 1 Central">Quirófano 1 Central</option>
                <option value="Box Urgencias Triaje">Box Urgencias Triaje</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-container-low/70 rounded-2xl border border-surface-container self-end">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#25D366] text-[20px]">chat</span>
                <div>
                  <p className="text-xs font-bold text-on-surface">Recordatorio WhatsApp</p>
                  <p className="text-[10px] text-on-surface-variant">Notificar al tutor automáticamente</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoReminder}
                onChange={(e) => setAutoReminder(e.target.checked)}
                className="w-5 h-5 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Pie de Acciones del Formulario */}
          <div className="pt-4 border-t border-surface-container flex items-center justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={() => setIsAppointmentModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-display font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              <span>Confirmar y Agendar Turno</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
