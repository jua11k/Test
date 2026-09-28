import React, { useState, useMemo } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Appointment, AppointmentType } from '../../types';

export const AgendaView: React.FC = () => {
  const {
    appointments,
    veterinarians,
    setIsAppointmentModalOpen,
    setSelectedPatientId,
    setActiveTab,
    showToast,
  } = useTenant();

  // Calendar View Mode: 'dia' | 'semana' | 'mes'
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('semana');

  // Selected Date Anchor (defaults to 2024-10-24)
  const [selectedDate, setSelectedDate] = useState('2024-10-24');

  // Selected Veterinarian Filter for Shift Management
  const [selectedVetFilter, setSelectedVetFilter] = useState<string>('all');

  // Detail Modal for clicked appointment
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Filter appointments by veterinarian if filter active
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedVetFilter === 'all') return true;
      return apt.veterinarianId === selectedVetFilter;
    });
  }, [appointments, selectedVetFilter]);

  // Color helper according to the user specification:
  // - Azul para consulta general
  // - Rojo para cirugías
  // - Verde para vacunación
  // - Ámbar / Naranja para urgencias
  const getColorStyles = (type: AppointmentType) => {
    switch (type) {
      case 'consulta':
        return {
          pill: 'bg-blue-600 text-white',
          badge: 'bg-blue-100 text-blue-900 border-blue-200',
          card: 'bg-blue-50/90 text-blue-950 border-blue-300 hover:border-blue-500',
          stripe: 'bg-blue-600',
          dot: 'bg-blue-600',
          label: 'Consulta General',
        };
      case 'cirugia':
        return {
          pill: 'bg-red-600 text-white',
          badge: 'bg-red-100 text-red-900 border-red-200',
          card: 'bg-red-50/90 text-red-950 border-red-300 hover:border-red-500',
          stripe: 'bg-red-600',
          dot: 'bg-red-600',
          label: 'Cirugía / Proc.',
        };
      case 'vacunacion':
        return {
          pill: 'bg-emerald-600 text-white',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          card: 'bg-emerald-50/90 text-emerald-950 border-emerald-300 hover:border-emerald-500',
          stripe: 'bg-emerald-600',
          dot: 'bg-emerald-600',
          label: 'Vacunación',
        };
      case 'urgencia':
        return {
          pill: 'bg-amber-600 text-white',
          badge: 'bg-amber-100 text-amber-900 border-amber-200',
          card: 'bg-amber-50/90 text-amber-950 border-amber-300 hover:border-amber-500',
          stripe: 'bg-amber-600',
          dot: 'bg-amber-600',
          label: 'Urgencia Médica',
        };
      default:
        return {
          pill: 'bg-primary text-white',
          badge: 'bg-primary-fixed text-on-primary-fixed',
          card: 'bg-surface-container-lowest text-on-surface border-surface-container',
          stripe: 'bg-primary',
          dot: 'bg-primary',
          label: 'Consulta',
        };
    }
  };

  // Week days configuration around 2024-10-24
  const weekDays = [
    { dateStr: '2024-10-21', dayName: 'Lunes', dayNum: '21', isToday: false },
    { dateStr: '2024-10-22', dayName: 'Martes', dayNum: '22', isToday: false },
    { dateStr: '2024-10-23', dayName: 'Miércoles', dayNum: '23', isToday: false },
    { dateStr: '2024-10-24', dayName: 'Jueves', dayNum: '24', isToday: true },
    { dateStr: '2024-10-25', dayName: 'Viernes', dayNum: '25', isToday: false },
    { dateStr: '2024-10-26', dayName: 'Sábado', dayNum: '26', isToday: false },
    { dateStr: '2024-10-27', dayName: 'Domingo', dayNum: '27', isToday: false },
  ];

  // Month grid for October 2024 (starts on Tuesday Oct 1, 31 days)
  const monthDays = useMemo(() => {
    // 35 cells (padding Monday Sept 30, Oct 1..31, Nov 1..3)
    const days = [];
    // Sept 30 padding
    days.push({ dayNum: 30, dateStr: '2024-09-30', isCurrentMonth: false, isToday: false });
    for (let i = 1; i <= 31; i++) {
      const dateStr = `2024-10-${i < 10 ? `0${i}` : i}`;
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === '2024-10-24',
      });
    }
    // Nov 1..3 padding
    days.push({ dayNum: 1, dateStr: '2024-11-01', isCurrentMonth: false, isToday: false });
    days.push({ dayNum: 2, dateStr: '2024-11-02', isCurrentMonth: false, isToday: false });
    days.push({ dayNum: 3, dateStr: '2024-11-03', isCurrentMonth: false, isToday: false });
    return days;
  }, []);

  // Time hours for daily view (08:00 to 18:00)
  const dayHourSlots = [
    '08:00 AM',
    '08:30 AM',
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '01:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
  ];

  // Current active vet profile
  const activeVet = veterinarians.find((v) => v.id === selectedVetFilter);

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5 max-w-7xl mx-auto w-full pb-28">
      {/* 1. BARRA SUPERIOR: Título, Leyenda de Colores, Filtro de Turnos y CTA Principal */}
      <section className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Módulo de Agendamiento & Quirófano
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
              Calendario Médico y Turnos
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Gestión centralizada de turnos médicos, boxes clínicos y quirófanos
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón "+ Nueva Cita" */}
            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="h-11 px-5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-display font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">calendar_add_on</span>
              <span>+ Nueva Cita</span>
            </button>
          </div>
        </div>

        {/* 2. LEYENDA OBLIGATORIA: Citas diferenciadas por colores según tipo de atención */}
        <div className="pt-3 border-t border-surface-container/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider shrink-0 mr-1">
              Tipo de Cita:
            </span>

            {/* Azul: Consulta General */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Consulta General (Azul)</span>
            </div>

            {/* Rojo: Cirugía */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>Cirugías (Rojo)</span>
            </div>

            {/* Verde: Vacunación */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Vacunación (Verde)</span>
            </div>

            {/* Ámbar: Urgencia */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <span>Urgencias (Ámbar)</span>
            </div>
          </div>

          {/* Selector de Vista: Diaria, Semanal, Mensual */}
          <div className="p-1 bg-surface-container-low rounded-xl flex items-center gap-1 border border-surface-container shrink-0">
            <button
              onClick={() => {
                setViewMode('dia');
                showToast('Vista de agenda diaria activa', 'calendar_today');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'dia'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Diaria
            </button>
            <button
              onClick={() => {
                setViewMode('semana');
                showToast('Vista semanal de turnos activa', 'calendar_view_week');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'semana'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Semanal
            </button>
            <button
              onClick={() => {
                setViewMode('mes');
                showToast('Vista mensual activa', 'calendar_month');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'mes'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Mensual
            </button>
          </div>
        </div>

        {/* 3. GESTIÓN DE TURNOS DE LOS MÉDICOS: Filtro y Perfil del Profesional */}
        <div className="bg-surface-container-low/80 p-3.5 rounded-xl border border-surface-container flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div>
              <span className="text-xs font-bold text-on-surface block">
                Gestión de Turnos por Médico Veterinario:
              </span>
              <p className="text-[11px] text-on-surface-variant">
                {activeVet
                  ? `Filtrando agenda de: ${activeVet.name} (${activeVet.specialty})`
                  : 'Visualizando agenda compartida de todo el equipo clínico'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedVetFilter}
              onChange={(e) => {
                setSelectedVetFilter(e.target.value);
                const vet = veterinarians.find((v) => v.id === e.target.value);
                showToast(
                  vet ? `Turno activo: ${vet.name}` : 'Agenda compartida de todos los médicos',
                  'person'
                );
              }}
              className="bg-surface-container-lowest text-xs font-bold text-on-surface py-2 px-3 rounded-xl border border-surface-container outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">👥 Todos los Médicos (Turno Completo)</option>
              {veterinarians.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  👨‍⚕️ {vet.name} · {vet.specialty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 4. VISTA CENTRAL DEL CALENDARIO: DIARIA, SEMANAL O MENSUAL */}

      {/* A) VISTA MENSUAL (Mes Completo Octubre 2024) */}
      {viewMode === 'mes' && (
        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] overflow-hidden flex flex-col">
          {/* Header del Mes */}
          <div className="p-4 sm:px-6 flex items-center justify-between border-b border-surface-container">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-on-surface">
                Octubre 2024
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed">
                {filteredAppointments.length} turnos programados
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Mes anterior: Septiembre 2024', 'chevron_left')}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={() => setSelectedDate('2024-10-24')}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-primary transition-colors"
                type="button"
              >
                Hoy (24 Oct)
              </button>
              <button
                onClick={() => showToast('Mes siguiente: Noviembre 2024', 'chevron_right')}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Días de la semana en la cabecera */}
          <div className="grid grid-cols-7 border-b border-surface-container bg-surface-container-low/50 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider py-2.5">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          {/* Matriz Mensual de Días */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-surface-container/70">
            {monthDays.map((day, idx) => {
              const dayApts = filteredAppointments.filter((a) => a.date === day.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDate(day.dateStr);
                    if (dayApts.length > 0) {
                      setViewMode('dia');
                      showToast(`Visualizando día ${day.dayNum} Octubre (${dayApts.length} citas)`, 'calendar_today');
                    } else {
                      setIsAppointmentModalOpen(true);
                    }
                  }}
                  className={`min-h-[95px] sm:min-h-[115px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    day.isToday
                      ? 'bg-primary/5 ring-2 ring-primary/40 ring-inset'
                      : day.isCurrentMonth
                      ? 'bg-surface-container-lowest hover:bg-surface-container-low/50'
                      : 'bg-surface-container-low/30 text-outline'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        day.isToday
                          ? 'bg-primary text-on-primary shadow-xs font-extrabold'
                          : day.isCurrentMonth
                          ? 'text-on-surface group-hover:text-primary'
                          : 'text-outline'
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    {dayApts.length > 0 && (
                      <span className="text-[10px] font-bold text-on-surface-variant font-mono hidden sm:inline">
                        {dayApts.length} {dayApts.length === 1 ? 'cita' : 'citas'}
                      </span>
                    )}
                  </div>

                  {/* Pastillas de Citas Diferenciadas por Colores */}
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayApts.slice(0, 2).map((apt) => {
                      const colors = getColorStyles(apt.type);
                      return (
                        <div
                          key={apt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(apt);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate flex items-center gap-1 shadow-2xs ${colors.pill}`}
                          title={`${apt.time} - ${apt.patientName} (${colors.label})`}
                        >
                          <span className="truncate">
                            {apt.time.split(' ')[0]} {apt.patientName}
                          </span>
                        </div>
                      );
                    })}

                    {dayApts.length > 2 && (
                      <span className="text-[9px] font-bold text-primary pl-1">
                        +{dayApts.length - 2} más
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-primary font-bold">+ Agendar</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* B) VISTA SEMANAL (Semana Central con Bloques de Color) */}
      {viewMode === 'semana' && (
        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] overflow-hidden flex flex-col">
          {/* Header de la Semana */}
          <div className="p-4 sm:px-6 flex items-center justify-between border-b border-surface-container flex-wrap gap-2">
            <div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-on-surface flex items-center gap-2">
                <span>Semana del 21 al 27 de Octubre 2024</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed">
                  Semana 43
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant">
                Distribución semanal de turnos quirúrgicos, consultas y vacunaciones
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Semana anterior: 14 - 20 Octubre', 'chevron_left')}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={() => showToast('Semana actual sincronizada', 'today')}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-primary transition-colors"
                type="button"
              >
                Esta Semana
              </button>
              <button
                onClick={() => showToast('Semana siguiente: 28 Oct - 3 Nov', 'chevron_right')}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Columnas de los 7 Días de la Semana */}
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-surface-container/80 min-h-[500px]">
            {weekDays.map((day) => {
              const dayApts = filteredAppointments.filter((a) => a.date === day.dateStr);

              return (
                <div
                  key={day.dateStr}
                  className={`flex flex-col p-3 transition-colors ${
                    day.isToday ? 'bg-primary/5' : 'bg-surface-container-lowest'
                  }`}
                >
                  {/* Encabezado del Día */}
                  <div
                    className={`pb-2.5 mb-2.5 border-b border-surface-container flex items-center justify-between ${
                      day.isToday ? 'border-primary/40' : ''
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        {day.dayName}
                      </p>
                      <p
                        className={`text-lg font-extrabold ${
                          day.isToday ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {day.dayNum}
                      </p>
                    </div>

                    {day.isToday ? (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                        Hoy
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-on-surface-variant font-bold">
                        {dayApts.length} {dayApts.length === 1 ? 'turno' : 'turnos'}
                      </span>
                    )}
                  </div>

                  {/* Lista de Turnos del Día */}
                  <div className="flex flex-col gap-2.5 flex-1">
                    {dayApts.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-3 text-center rounded-xl border border-dashed border-surface-container-high/60 my-2">
                        <span className="material-symbols-outlined text-[20px] text-outline">
                          event_busy
                        </span>
                        <span className="text-[11px] text-outline font-medium mt-1">Sin citas</span>
                        <button
                          onClick={() => {
                            setSelectedDate(day.dateStr);
                            setIsAppointmentModalOpen(true);
                          }}
                          className="mt-2 text-[10px] font-bold text-primary hover:underline"
                        >
                          + Agendar
                        </button>
                      </div>
                    ) : (
                      dayApts.map((apt) => {
                        const colors = getColorStyles(apt.type);

                        return (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className={`p-2.5 rounded-xl border relative overflow-hidden flex flex-col gap-1.5 transition-all shadow-2xs hover:shadow-md cursor-pointer ${colors.card}`}
                          >
                            {/* Barra cromática vertical */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.stripe}`}></div>

                            {/* Header de la tarjeta */}
                            <div className="flex items-center justify-between gap-1 pl-1">
                              <span className="font-mono text-xs font-extrabold">
                                {apt.time}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${colors.badge}`}
                              >
                                {colors.label.split(' ')[0]}
                              </span>
                            </div>

                            {/* Paciente */}
                            <div className="flex items-center gap-2 pl-1">
                              <img
                                src={apt.photoUrl}
                                alt={apt.patientName}
                                className="w-6 h-6 rounded-md object-cover ring-1 ring-black/10"
                              />
                              <div className="min-w-0">
                                <span className="font-display font-bold text-xs truncate block leading-tight">
                                  {apt.patientName}
                                </span>
                                <span className="text-[10px] opacity-80 truncate block">
                                  {apt.tutorName}
                                </span>
                              </div>
                            </div>

                            {/* Motivo */}
                            <p className="text-[11px] leading-tight font-medium line-clamp-2 pl-1 opacity-90">
                              {apt.reason}
                            </p>

                            {/* Footer con Box y Veterinario */}
                            <div className="pt-1 border-t border-black/10 flex items-center justify-between text-[10px] pl-1 font-mono">
                              <span className="truncate">{apt.roomBox.split('-')[0].trim()}</span>
                              <span className="font-bold opacity-80">{apt.durationLabel}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Botón rápido "+ Agendar" al pie del día */}
                  <button
                    onClick={() => {
                      setSelectedDate(day.dateStr);
                      setIsAppointmentModalOpen(true);
                    }}
                    className="mt-2 w-full py-1.5 rounded-lg bg-surface-container/60 hover:bg-surface-container text-xs font-bold text-primary flex items-center justify-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>Turno</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* C) VISTA DIARIA (Cronograma por Horas de Hoy / Día Seleccionado) */}
      {viewMode === 'dia' && (
        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] p-5 sm:p-6 flex flex-col gap-4">
          {/* Header del Día */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-display font-extrabold text-lg shadow-sm">
                24
              </div>
              <div>
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-on-surface">
                  Jueves, 24 de Octubre de 2024
                </h2>
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span>Jornada Quirúrgica y Consultas en Curso</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Día anterior: Miércoles 23 Octubre', 'chevron_left')}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                onClick={() => setSelectedDate('2024-10-24')}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-primary transition-colors"
                type="button"
              >
                Hoy
              </button>
              <button
                onClick={() => showToast('Día siguiente: Viernes 25 Octubre', 'chevron_right')}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Timeline de Franjas Horarias */}
          <div className="flex flex-col gap-3 relative mt-2">
            {/* Indicador de Hora Actual */}
            <div className="relative flex items-center gap-3 pl-16 my-1">
              <div className="absolute left-0 w-14 text-right font-mono text-xs text-primary font-black">
                10:00 AM
              </div>
              <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary-fixed"></div>
              <div className="h-0.5 flex-1 bg-primary rounded-full"></div>
            </div>

            {/* Listado de Turnos de Hoy */}
            {filteredAppointments
              .filter((a) => a.date === '2024-10-24')
              .map((apt) => {
                const colors = getColorStyles(apt.type);
                const isEnCurso = apt.status === 'en_curso';

                return (
                  <div key={apt.id} className="flex gap-3 sm:gap-4 items-start">
                    {/* Hora */}
                    <div className="w-14 pt-2 text-right flex flex-col items-end shrink-0 font-mono">
                      <span className="text-xs sm:text-sm font-extrabold text-on-surface">
                        {apt.time.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-bold">
                        {apt.time.split(' ')[1] || 'AM'}
                      </span>
                    </div>

                    {/* Tarjeta de la Cita */}
                    <div
                      onClick={() => setSelectedAppointment(apt)}
                      className={`flex-1 rounded-2xl p-4 sm:p-5 shadow-xs border relative overflow-hidden flex flex-col gap-3 transition-all hover:shadow-md cursor-pointer ${
                        colors.card
                      } ${isEnCurso ? 'ring-2 ring-primary border-primary' : ''}`}
                    >
                      {/* Borde lateral de color clínico */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colors.stripe}`}></div>

                      {/* Header de la tarjeta */}
                      <div className="flex items-start justify-between gap-3 pl-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${colors.badge}`}>
                            {colors.label}
                          </span>
                          <span className="text-xs font-bold font-mono opacity-80">
                            {apt.durationLabel}
                          </span>
                        </div>

                        {isEnCurso ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold flex items-center gap-1.5 animate-pulse shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-white"></span>
                            <span>En Consulta Ahora</span>
                          </span>
                        ) : apt.status === 'completada' ? (
                          <span className="text-primary text-xs font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            <span>Completada</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold">
                            {apt.statusLabel}
                          </span>
                        )}
                      </div>

                      {/* Datos del Paciente y Tutor */}
                      <div className="flex items-center gap-3.5 pl-1">
                        <img
                          src={apt.photoUrl}
                          alt={apt.patientName}
                          className="w-12 h-12 rounded-xl object-cover shadow-2xs ring-2 ring-black/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-extrabold text-base text-on-surface">
                              {apt.patientName}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.2 rounded bg-surface-container text-on-surface-variant">
                              {apt.species === 'canino' ? '🐶 Perro' : apt.species === 'felino' ? '🐱 Gato' : '🐰 Exótico'}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                            {apt.breed} · Propietario: <strong>{apt.tutorName}</strong> ({apt.tutorPhone})
                          </p>
                        </div>
                      </div>

                      {/* Motivo de Consulta y Sala Asignada */}
                      <div className="bg-white/80 p-3 rounded-xl border border-black/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">
                            stethoscope
                          </span>
                          <span className="font-bold text-on-surface">{apt.reason}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                          <span>{apt.roomBox}</span>
                          <span>·</span>
                          <span>{apt.veterinarianName}</span>
                        </div>
                      </div>

                      {/* Acciones Rápidas de la Cita */}
                      <div className="flex items-center justify-end gap-2 pt-1 pl-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatientId(apt.patientId);
                            setActiveTab('expediente');
                            showToast(`Abriendo historia clínica de ${apt.patientName}`, 'clinical_notes');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-primary font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                          <span>Ver Expediente EMR</span>
                        </button>
                        <a
                          href={`https://wa.me/${apt.tutorPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          <span>Aviso WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Slots Disponibles para Agendamiento Rápido */}
            <div className="mt-4 pt-4 border-t border-surface-container/70 flex flex-col gap-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-16">
                Huecos Libres en Agenda de Hoy:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pl-16">
                {['02:00 PM', '02:30 PM', '05:00 PM', '06:00 PM'].map((slotTime) => (
                  <button
                    key={slotTime}
                    type="button"
                    onClick={() => {
                      setSelectedDate('2024-10-24');
                      setIsAppointmentModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{slotTime} Libre</span>
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. MODAL DE DETALLE RÁPIDO DE CITA SELECCIONADA */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full ${getColorStyles(selectedAppointment.type).dot}`}></span>
                <h3 className="font-display font-extrabold text-lg text-on-surface">
                  Detalle del Turno Médico
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Contenido del Detalle */}
            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-surface-container">
                <img
                  src={selectedAppointment.photoUrl}
                  alt={selectedAppointment.patientName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-on-surface">
                      {selectedAppointment.patientName}
                    </span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${getColorStyles(selectedAppointment.type).badge}`}>
                      {getColorStyles(selectedAppointment.type).label}
                    </span>
                  </div>
                  <p className="text-on-surface-variant">
                    {selectedAppointment.breed} · Tutor: <strong>{selectedAppointment.tutorName}</strong> ({selectedAppointment.tutorPhone})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-surface-container-low/70 p-3 rounded-xl border border-surface-container">
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Fecha y Hora</span>
                  <p className="font-bold text-on-surface mt-0.5">{selectedAppointment.date} · {selectedAppointment.time}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Duración</span>
                  <p className="font-bold text-on-surface mt-0.5">{selectedAppointment.durationLabel}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Veterinario Responsable</span>
                  <p className="font-bold text-primary mt-0.5">{selectedAppointment.veterinarianName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">Sala / Box</span>
                  <p className="font-bold text-on-surface mt-0.5">{selectedAppointment.roomBox}</p>
                </div>
              </div>

              <div className="bg-surface-container-low/70 p-3 rounded-xl border border-surface-container">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase">Motivo Clínico de Consulta</span>
                <p className="font-semibold text-on-surface mt-1">{selectedAppointment.reason}</p>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Recordatorio de cita enviado a ${selectedAppointment.tutorPhone}`, 'chat');
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-bold hover:bg-surface-container-high transition-colors"
                >
                  Recordatorio WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatientId(selectedAppointment.patientId);
                    setActiveTab('expediente');
                    setSelectedAppointment(null);
                    showToast(`Abriendo historia clínica de ${selectedAppointment.patientName}`, 'clinical_notes');
                  }}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-xs hover:bg-primary-container transition-colors"
                >
                  Ir al Expediente EMR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
