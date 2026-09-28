import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';

export const DashboardView: React.FC = () => {
  const {
    currentSede,
    setActiveTab,
    setSelectedPatientId,
    setIsAppointmentModalOpen,
    showToast,
  } = useTenant();

  const [activeFilter, setActiveFilter] = useState<'all' | 'urgencias' | 'control' | 'exoticos'>('all');
  const [listSearch, setListSearch] = useState('');

  // Queue of upcoming clinical consultations for today
  const upcomingQueue = [
    {
      id: 'toby',
      name: 'Toby',
      species: 'Canino',
      speciesIcon: '🐶',
      age: '4 años',
      breed: 'Golden Retriever',
      code: '#MC-98421',
      tutorName: 'Carlos Morales',
      tutorPhone: '+34 612 345 678',
      time: '09:30 AM',
      type: 'Consulta General',
      typeColor: 'bg-secondary-fixed text-on-secondary-fixed border-secondary/20',
      reason: 'Control post-quirúrgico traumatología y retiro de vendaje',
      box: 'Box 1 - Traumatología',
      doctor: 'Dra. Elena Mendoza',
      status: 'En sala',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      hasPulse: true,
      category: 'control',
      patientId: 'patient-max',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBqDjElCXaifQJgGnVeahMYILSE6MMETVY961dbnllGjTv0VqSTviXHzUhTecaoV5ahZlT-fz5pay8ZfqfGvMb_u-IeF6zO5Vioc6_VDfushNoKggQTw5iwsLioETAsqvB7e2nca5-yq0qpXbvS2B4opPRG06LDUAbwXJA-cPH7yIByOYWtlFypyUM-XtsgC2js3nEMFgZfyisn6MqLaIjPL8lHHtnO0vxLkGbWEedqS7yFhuZN3Kwy',
    },
    {
      id: 'luna',
      name: 'Luna',
      species: 'Felino',
      speciesIcon: '🐱',
      age: '2 años',
      breed: 'Siamés',
      code: '#MC-44102',
      tutorName: 'Elena Rivas',
      tutorPhone: '+34 689 778 899',
      time: '10:15 AM',
      type: 'Vacunación & Prevención',
      typeColor: 'bg-primary-fixed text-on-primary-fixed border-primary/20',
      reason: 'Triple Felina anual + Desparasitación interna preventiva',
      box: 'Box 3 - Felinos y Exóticos',
      doctor: 'Dra. Elena Mendoza',
      status: 'Confirmado',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
      hasPulse: false,
      category: 'control',
      patientId: 'patient-luna',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDyfELSrJqnG8F0ecjUJCrqVHQhrx5qA1JsCdyp-FR37eoTOeIxksFkASZdcNdycAQTruN9AXnuSLxJyLdGTKxcL8xc26JsLNMrBltuMKIDMxgzRkLhmaSVXIUtwQmu73bKysMwq8VGnuo4_JJ-cmJxvtzdYiXYFli_9MKejvw-GRTbwvr4al7mI1SeFR6dvoxMHzINUoPMcqQ73BwlW83J0yfsBhYaLCzHOWP8yEzOmOEyAnUqI66X',
    },
    {
      id: 'rocky',
      name: 'Rocky',
      species: 'Canino',
      speciesIcon: '🐶',
      age: '5 años',
      breed: 'Bulldog Francés',
      code: '#MC-77284',
      tutorName: 'Andrés Silva',
      tutorPhone: '+34 677 890 123',
      time: '11:00 AM',
      type: 'Urgencia Triaje',
      typeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      reason: 'Dermatitis alérgica aguda con prurito severo e hiperemia',
      box: 'Box Urgencias Triaje',
      doctor: 'Dr. Alejandro Ramos',
      status: 'Triage listo',
      statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
      hasPulse: false,
      category: 'urgencias',
      patientId: 'patient-kira',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCILyh8ynjkCEHuhXAxc3vDT5LWoXSrsSjsea-v1k5N4c8yIT1NxWJ_BaYDCa2poAUk2Fx1S5Zkd63NE_5ocIY7Z24yyRg2RQtcJZCYEo3B4n2LTAfNOVOFDz1BZZGy_9KT9LHECOr023rpj2_f7w-ZfoAhmI5QKk0K70tq5m1-FS7IpUKI4SjXYFRz7PcgD6bC2i97Re9iuwSeh7ZN8elnnn1EgUpxUMDpEZS7ZNrA3JQZEU7Pv4Y8',
    },
    {
      id: 'milo',
      name: 'Milo',
      species: 'Exótico',
      speciesIcon: '🐰',
      age: '1 año',
      breed: 'Conejo Belier',
      code: '#MC-05183',
      tutorName: 'Sofía Castro',
      tutorPhone: '+34 633 456 789',
      time: '11:45 AM',
      type: 'Especialidades',
      typeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      reason: 'Revisión odontológica preventiva y control de curvas de peso',
      box: 'Box 2 - Consultas Generales',
      doctor: 'Dra. Elena Mendoza',
      status: 'Por llegar',
      statusColor: 'bg-slate-100 text-slate-700 border-slate-200',
      hasPulse: false,
      category: 'exoticos',
      patientId: 'patient-nala',
      photoUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAmpY8pa7Ds6AUNbTEdmU0fDikIvfPKXnTNoy-NGIgeqwYa7mYWdPvbGe2LmofELi7SUtBywEz1JPFsoKxZA9I_KD_21be82qo4_cc9bOrBCRmi4Ei8oeUSL0ZyTgRxarP6ZftPD73oTyDwLEpr9rsO9iFWvxPnLIzftsH68MWEmb_auSFlxc36l2LwT9THoEvV2xWEEEpzL0FEjeZ61E3h6oPx8Jb7EtD4CrM0dr2Gt8Q3XJKgzTu9',
    },
  ];

  const filteredQueue = upcomingQueue.filter((item) => {
    if (activeFilter !== 'all' && item.category !== activeFilter) return false;
    if (!listSearch) return true;
    const q = listSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.tutorName.toLowerCase().includes(q) ||
      item.breed.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 gap-6 max-w-7xl mx-auto pb-28">
      {/* 1. Header de Sección con Bienvenida y Botones Principales (CTAs) */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-surface-container/80 shadow-[0_1px_3px_rgba(11,28,48,0.03)]">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {currentSede.activeShift}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {currentSede.name} · {currentSede.address}
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Hola, Dra. Elena Mendoza{' '}
            <span className="inline-block transform hover:rotate-12 transition-transform cursor-default">
              👋
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Panel clínico hospitalario · <span className="font-semibold text-primary">4 pacientes en espera de consulta</span>
          </p>
        </div>

        {/* Botones Principales (Call to Action) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* CTA 1: Nueva Consulta */}
          <button
            onClick={() => setIsAppointmentModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all group"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px] transition-transform group-hover:scale-110">
              add_circle
            </span>
            <span className="tracking-tight whitespace-nowrap">+ Nueva Consulta</span>
          </button>

          {/* CTA 2: Registrar Paciente */}
          <button
            onClick={() => {
              setActiveTab('pacientes');
              showToast('Directorio clínico abierto para nuevo registro', 'person_add');
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-surface-container shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all group"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px] text-primary transition-transform group-hover:scale-110">
              person_add
            </span>
            <span className="tracking-tight whitespace-nowrap">Registrar Paciente</span>
          </button>
        </div>
      </section>

      {/* 2. Panel de Indicadores (KPIs): Tarjetas de Datos de Software Empresarial */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">monitoring</span>
            <h2 className="font-display font-bold text-base sm:text-lg text-on-surface">
              Panel de Indicadores Clínicos (KPIs)
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Actualización en vivo · Hoy 24 Octubre
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {/* KPI 1: Consultas Programadas de Hoy */}
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Consultas Programadas Hoy
                </span>
                <span className="text-[11px] text-outline mt-0.5">
                  Turno matutino y vespertino
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[22px]">calendar_today</span>
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface tabular-nums tracking-tight">
                  18
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">trending_up</span> +12%
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                <span>12 completadas · 4 en espera · 2 urgencias</span>
              </p>
            </div>

            <div className="pt-2.5 border-t border-surface-container/80 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Próximo turno:</span>
              <span className="font-semibold text-primary">09:30 AM (Toby)</span>
            </div>
          </div>

          {/* KPI 2: Pacientes Hospitalizados */}
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Pacientes Hospitalizados
                </span>
                <span className="text-[11px] text-outline mt-0.5">
                  Capacidad y ocupación clínica
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[22px]">hotel</span>
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface tabular-nums tracking-tight">
                  6{' '}
                  <span className="text-lg sm:text-xl font-medium text-on-surface-variant">
                    / 10
                  </span>
                </span>
                <span className="text-xs font-semibold text-secondary bg-secondary-fixed/40 px-2 py-0.5 rounded-full">
                  60% ocupación
                </span>
              </div>
              {/* Visual Occupancy Bar */}
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-secondary h-full rounded-full transition-all duration-500"
                  style={{ width: '60%' }}
                ></div>
              </div>
              <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></span>
                <span>2 en UCI intensiva · 4 en observación</span>
              </p>
            </div>

            <div className="pt-2.5 border-t border-surface-container/80 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-medium">Disponibles:</span>
              <span className="font-semibold text-secondary">4 camas libres</span>
            </div>
          </div>

          {/* KPI 3: Alertas de Vacunación */}
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Alertas de Vacunación
                </span>
                <span className="text-[11px] text-outline mt-0.5">
                  Campañas preventivas y vencimientos
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <span className="material-symbols-outlined text-[22px]">vaccines</span>
              </div>
            </div>

            <div className="my-3">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface tabular-nums tracking-tight">
                  9
                </span>
                <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                  3 vencen esta semana
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
                <span>5 caninas · 4 felinas con aviso WhatsApp</span>
              </p>
            </div>

            <div className="pt-2.5 border-t border-surface-container/80 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setActiveTab('servicios');
                  showToast('Abriendo gestor de recordatorios por WhatsApp', 'chat');
                }}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
                type="button"
              >
                <span>Ver reglas de envío</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Bot Activo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sección de "Próximas Consultas" en Formato de Lista */}
      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] p-4 sm:p-6 flex flex-col gap-4">
        {/* Cabecera de la Lista con Filtros y Búsqueda */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-surface-container/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base sm:text-lg text-on-surface">
                  Próximas Consultas
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold font-mono">
                  {filteredQueue.length} turnos
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Cola clínica en tiempo real y asignación de consultorios
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Buscador rápido en la lista */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                placeholder="Filtrar por paciente o tutor..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline border border-surface-container focus:border-primary focus:bg-surface-container-lowest outline-none transition-colors"
              />
            </div>

            {/* Categorías de Filtro */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container/60">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Todas (4)
              </button>
              <button
                onClick={() => setActiveFilter('urgencias')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'urgencias'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Urgencias (1)
              </button>
              <button
                onClick={() => setActiveFilter('control')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'control'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Control & Vacunas (2)
              </button>
              <button
                onClick={() => setActiveFilter('exoticos')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'exoticos'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                Exóticos (1)
              </button>
            </div>
          </div>
        </div>

        {/* Formato Lista / Tabla Clínica de Próximas Consultas */}
        <div className="flex flex-col divide-y divide-surface-container/60">
          {filteredQueue.map((item) => (
            <div
              key={item.id}
              className="py-3.5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-3.5 group hover:bg-surface-container-low/40 p-2 rounded-xl transition-colors"
            >
              {/* Columna 1: Paciente y Tutor */}
              <div className="flex items-center gap-3 min-w-0 md:w-5/12">
                <div className="relative shrink-0">
                  <img
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shadow-2xs ring-1 ring-outline-variant/30"
                    src={item.photoUrl}
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-container-lowest text-xs flex items-center justify-center shadow-xs border border-surface-container">
                    {item.speciesIcon}
                  </span>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-display font-bold text-sm sm:text-base text-on-surface truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      ({item.species} · {item.breed} · {item.age})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 truncate">
                    <span className="font-medium text-on-surface">Tutor: {item.tutorName}</span>
                    <span>·</span>
                    <a
                      href={`tel:${item.tutorPhone}`}
                      className="text-primary hover:underline font-mono"
                    >
                      {item.tutorPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Columna 2: Hora, Tipo, Motivo y Box */}
              <div className="flex flex-col min-w-0 md:w-4/12 gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded-md">
                    {item.time}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.typeColor}`}
                  >
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-on-surface font-medium line-clamp-1">
                  {item.reason}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      door_front
                    </span>
                    {item.box}
                  </span>
                  <span>·</span>
                  <span className="truncate">{item.doctor}</span>
                </div>
              </div>

              {/* Columna 3: Estado y Acciones Rápidas */}
              <div className="flex items-center justify-between md:justify-end gap-2.5 md:w-3/12 shrink-0 pt-1 md:pt-0">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.statusColor}`}
                >
                  {item.hasPulse && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  )}
                  <span>{item.status}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Botón Llamar a Box */}
                  <button
                    onClick={() =>
                      showToast(
                        `Llamada enviada: ${item.name} asignado a ${item.box}`,
                        'notifications_active'
                      )
                    }
                    title="Llamar paciente a Box"
                    className="h-8 px-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-2xs active:scale-95 transition-all flex items-center gap-1"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">door_front</span>
                    <span className="hidden sm:inline">Llamar Box</span>
                  </button>

                  {/* Botón Ver Ficha EMR */}
                  <button
                    onClick={() => {
                      setSelectedPatientId(item.patientId);
                      setActiveTab('expediente');
                    }}
                    title="Abrir expediente clínico completo"
                    className="h-8 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold active:scale-95 transition-all flex items-center gap-1"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px]">clinical_notes</span>
                    <span className="hidden sm:inline">Ver Ficha</span>
                  </button>

                  {/* Opciones */}
                  <button
                    onClick={() =>
                      showToast(`Opciones de turno para ${item.name}`, 'more_vert')
                    }
                    className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    type="button"
                    aria-label="Más opciones"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer de la Lista con Enlace al Calendario Completo */}
        <div className="pt-2 border-t border-surface-container/70 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Mostrando 4 pacientes programados en sala y próximos</span>
          <button
            onClick={() => setActiveTab('agenda')}
            className="text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            type="button"
          >
            <span>Ver agenda médica completa</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};
