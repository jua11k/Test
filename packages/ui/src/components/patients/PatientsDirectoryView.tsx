import React, { useState, useMemo } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Patient, Species } from '../../types';

export const PatientsDirectoryView: React.FC = () => {
  const {
    patients,
    addPatient,
    setSelectedPatientId,
    setActiveTab,
    setIsAppointmentModalOpen,
    showToast,
  } = useTenant();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  // New patient modal form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newSpecies, setNewSpecies] = useState<Species>('canino');
  const [newBreed, setNewBreed] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newTutorName, setNewTutorName] = useState('');
  const [newTutorPhone, setNewTutorPhone] = useState('');

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      // Category filter
      if (selectedFilter === 'caninos' && p.species !== 'canino') return false;
      if (selectedFilter === 'felinos' && p.species !== 'felino') return false;
      if (selectedFilter === 'hospitalizados' && p.status !== 'hospitalizado') return false;
      if (selectedFilter === 'vacunas' && p.status !== 'vacuna') return false;
      if (selectedFilter === 'tratamiento' && p.status !== 'tratamiento') return false;

      // Text query
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.microchip.toLowerCase().includes(q) ||
        p.tutor.name.toLowerCase().includes(q) ||
        p.tutor.phone.toLowerCase().includes(q)
      );
    });
  }, [patients, selectedFilter, searchTerm]);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newTutorName.trim()) {
      showToast('Por favor completa el nombre de la mascota y del tutor', 'error', 'error');
      return;
    }

    const microRandom = `98102000${Math.floor(1000000 + Math.random() * 9000000)}`;
    const codeRandom = `#MC-${Math.floor(10000 + Math.random() * 90000)}`;

    addPatient({
      code: codeRandom,
      name: newPatientName,
      species: newSpecies,
      breed: newBreed || 'Mestizo',
      gender: 'macho',
      neutered: true,
      age: newAge || '1 año',
      microchip: microRandom,
      status: 'sano',
      photoUrl:
        newSpecies === 'canino'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ12UwB0nvDxhygfsgTOWKr_GE32va2lyrE_4mefr4cpwjy0CIn14MHczhmet_P44VqW0pzIrN4pi_I4WmbUs-gIMye69PY4hQPYv6DpKgy1trPjboUnxqCNDwfVuaIzXRDTTPpAvj_Cyc57K8jBHn8I_NukozhPjprwwonD97WaaFgtDCpx9z5k24pD_pKzNqwZR6fRcxgXibBbW19tp3xhEXtU1W6N5sSCZMeuRjRKo355iqckwm'
          : newSpecies === 'felino'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr4vN_zYT5HcX3OsRf7qAlFAlRtSmfuNbDotAi_2KxPRiz3mEx2Dif8LZHxnQ_XakWGqeRZResO9cCzMdDfx6T9Q1sj2JS4KEq6BZxR6u9ic1K8Stif6dTcYpiICj7pI-5wti_ELWiUJUIs52PjL9x4GBLY84v5-igzLWMRvQj3rnqeg7pYDuhkUYl7mKhxl5aMVG0PW3P5RqL34OgaPDhxQPfcBQ3a0AlqKF4Oe5ZbLqF1h-Ec5Kr'
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-yj-K-hc2sz00pLCIzBhC8SA2Am9KapTkoyewfsRO-IHQtQzvdD1QBlaR9oZ1vtPeYqz6l4w0Eg_eaXFWWExaSImVfVIazRvRSB0uSEGOGqePCouY1hjNVgrSyci0y5irgIozsFefW9SFcoaEcsaOfmnjBNorKOjzrHYyOLgc-TJjtzxFa4nwUiSvSxjwc4c_n5hdPqFspcEUHp-JC93um5pO_MX4NwaHCdXSycuqG5GTFbo2Pb5K',
      weightKg: 12.5,
      bodyConditionScore: '5 / 9 (Ideal)',
      criticalAlerts: [],
      chronicConditions: [],
      tutor: {
        name: newTutorName,
        phone: newTutorPhone || '+34 600 000 000',
        email: `${newTutorName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      },
      sedeId: 'sede-norte',
    });

    setNewPatientName('');
    setNewBreed('');
    setNewAge('');
    setNewTutorName('');
    setNewTutorPhone('');
    setShowAddPatientModal(false);
  };

  const getStatusBadge = (patient: Patient) => {
    switch (patient.status) {
      case 'hospitalizado':
        return (
          <div className="shrink-0 flex items-center gap-1 bg-error-container text-on-error-container px-2.5 py-1 rounded-full text-xs font-bold">
            <span className="material-symbols-outlined text-[14px]">local_hospital</span>
            <span>Hospitalizado (Box 3)</span>
          </div>
        );
      case 'tratamiento':
        return (
          <div className="shrink-0 flex items-center gap-1 bg-surface-container-high text-on-secondary-fixed-variant px-2.5 py-1 rounded-full text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px] text-tertiary">medication</span>
            <span>En Tratamiento</span>
          </div>
        );
      case 'vacuna':
        return (
          <div className="shrink-0 flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-2.5 py-1 rounded-full text-xs font-semibold">
            <span className="material-symbols-outlined text-[14px]">vaccines</span>
            <span>Vacuna Rabia</span>
          </div>
        );
      case 'sano':
      default:
        return (
          <div className="shrink-0 flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed px-2.5 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"></span>
            <span>Sano</span>
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-3.5 max-w-7xl mx-auto w-full pb-20">
      {/* Header de Sección */}
      <div className="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[22px]">pets</span>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                Directorio de Pacientes
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Total: <span className="font-semibold text-on-surface">1,420 registrados</span> •{' '}
              <span className="text-primary font-semibold">8 en clínica hoy</span>
            </p>
          </div>

          <button
            onClick={() => setShowAddPatientModal(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-xs active:scale-95 transition-all shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Nuevo Paciente</span>
          </button>
        </div>

        {/* Barra de Búsqueda y Scanner */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
              search
            </span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-xs sm:text-sm rounded-lg pl-10 pr-8 py-2.5 outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all border border-transparent focus:border-primary shadow-inner"
              placeholder="Buscar por nombre, microchip, tutor o teléfono..."
              type="text"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <button
            onClick={() => showToast('Escáner de Microchip ISO 11784 listo', 'qr_code_scanner')}
            aria-label="Escanear Microchip o QR"
            className="w-10 h-10 flex items-center justify-center bg-surface-container-low text-primary hover:bg-surface-container rounded-lg shadow-xs active:scale-95 transition-all shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
          </button>

          <button
            onClick={() => showToast('Filtros avanzados disponibles', 'tune')}
            aria-label="Filtro avanzado"
            className="w-10 h-10 flex items-center justify-center bg-surface-container-low text-on-surface-variant hover:bg-surface-container rounded-lg shadow-xs active:scale-95 transition-all shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>

        {/* Chips de Filtros Horizontales */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedFilter('todos')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
              selectedFilter === 'todos'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>Todos</span>
            <span className="bg-primary-container text-on-primary-container px-1.5 py-0.2 rounded-full text-[10px]">
              1,420
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('caninos')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              selectedFilter === 'caninos'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>🐶 Caninos</span>
            <span className="text-[11px] opacity-80">845</span>
          </button>

          <button
            onClick={() => setSelectedFilter('felinos')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              selectedFilter === 'felinos'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>🐱 Felinos</span>
            <span className="text-[11px] opacity-80">490</span>
          </button>

          <button
            onClick={() => setSelectedFilter('hospitalizados')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              selectedFilter === 'hospitalizados'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-error-container text-on-error-container hover:bg-error-container/80'
            }`}
            type="button"
          >
            <span>🏥 Hospitalizados</span>
            <span className="font-bold text-[11px]">6</span>
          </button>

          <button
            onClick={() => setSelectedFilter('vacunas')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              selectedFilter === 'vacunas'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>💉 Vacunas</span>
            <span className="text-[11px] opacity-80">28</span>
          </button>

          <button
            onClick={() => setSelectedFilter('tratamiento')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              selectedFilter === 'tratamiento'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>⚠️ En Tratamiento</span>
            <span className="text-[11px] opacity-80">14</span>
          </button>
        </div>
      </div>

      {/* Lista Clínica de Pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredPatients.map((patient) => {
          const isMax = patient.name.toLowerCase() === 'max';
          const isHospitalized = patient.status === 'hospitalizado';
          const isVaccine = patient.status === 'vacuna';

          return (
            <div
              key={patient.id}
              className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container relative flex flex-col gap-2.5 transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      className="w-12 h-12 rounded-xl object-cover shadow-xs ring-1 ring-outline-variant/30"
                      src={patient.photoUrl}
                      alt={patient.name}
                    />
                    <span className="absolute -bottom-1 -right-1 bg-surface-variant text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                      {patient.species === 'canino'
                        ? '🐶'
                        : patient.species === 'felino'
                        ? '🐱'
                        : '🐰'}
                    </span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-base font-bold text-on-surface truncate">
                        {patient.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                        {patient.code}
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant truncate">
                      {patient.gender === 'macho' ? 'Macho' : 'Hembra'} • {patient.age} •{' '}
                      {patient.breed}
                    </span>
                  </div>
                </div>

                {getStatusBadge(patient)}
              </div>

              {/* Tutor Info Bar */}
              <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0 text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-outline shrink-0">
                    person
                  </span>
                  <span className="font-medium truncate">{patient.tutor.name}</span>
                </div>

                <a
                  className="inline-flex items-center gap-1 text-primary text-xs font-semibold bg-surface-container-lowest px-2 py-1 rounded-md shadow-2xs hover:bg-primary hover:text-on-primary transition-colors"
                  href={`tel:${patient.tutor.phone}`}
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span>{patient.tutor.phone}</span>
                </a>
              </div>

              {/* Fila de Acciones Rápidas */}
              <div className="pt-1 flex items-center justify-between gap-1.5">
                {isHospitalized ? (
                  <>
                    <button
                      onClick={() =>
                        showToast(`Abriendo telemetría Box 3 UCI para ${patient.name}`, 'monitor_heart')
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-surface-container-low text-primary text-xs font-semibold rounded-lg hover:bg-surface-container active:scale-98 transition-all"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
                      <span>Monitor UCI</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        setActiveTab('expediente');
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-surface-container text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container-high active:scale-98 transition-all"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                      <span>Ver Historia</span>
                    </button>
                  </>
                ) : isVaccine ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        setActiveTab('expediente');
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-surface-container text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container-high active:scale-98 transition-all"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                      <span>Ver Historia</span>
                    </button>
                    <button
                      onClick={() =>
                        showToast(
                          `Dosis de vacuna antirrábica registrada para ${patient.name}`,
                          'vaccines'
                        )
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-primary-fixed text-on-primary-fixed text-xs font-bold rounded-lg hover:bg-primary-fixed-dim active:scale-98 transition-all"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">syringe</span>
                      <span>Aplicar Vacuna</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        setActiveTab('expediente');
                      }}
                      className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold shadow-xs active:scale-98 transition-all ${
                        isMax
                          ? 'bg-primary text-on-primary hover:bg-primary-container'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">clinical_notes</span>
                      <span>{isMax ? 'Historia Clínica' : 'Ver Historia'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsAppointmentModalOpen(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high active:scale-98 transition-all"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                      <span>Agendar Control</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => showToast(`Opciones avanzadas para ${patient.name}`, 'more_vert')}
                  aria-label="Más opciones"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high shrink-0"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isMax ? 'edit' : 'more_vert'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación y Resumen Inferior */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-xs border border-surface-container flex items-center justify-between gap-2 mt-1">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-on-surface">Página 1 de 237</span>
          <span className="text-xs text-on-surface-variant truncate">
            Mostrando {filteredPatients.length} de 1,420 pacientes
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            aria-label="Página anterior"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-low text-outline opacity-50 cursor-not-allowed"
            disabled
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            onClick={() => showToast('Cargando siguientes 6 registros clínicos', 'sync')}
            aria-label="Página siguiente"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container text-primary hover:bg-surface-container-high active:scale-95 transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Modal: Nuevo Paciente */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-surface-container flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">pets</span>
                <h3 className="font-display font-bold text-lg text-on-surface">
                  Registrar Nuevo Paciente
                </h3>
              </div>
              <button
                onClick={() => setShowAddPatientModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Nombre Paciente *</label>
                  <input
                    required
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="Ej. Bruno"
                    className="p-2 rounded-lg bg-surface-container-low text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Especie</label>
                  <select
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value as Species)}
                    className="p-2 rounded-lg bg-surface-container-low text-sm outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="canino">🐶 Canino</option>
                    <option value="felino">🐱 Felino</option>
                    <option value="exotico">🐰 Exótico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Raza</label>
                  <input
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    placeholder="Ej. Labrador, Mestizo..."
                    className="p-2 rounded-lg bg-surface-container-low text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Edad</label>
                  <input
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="Ej. 2 años"
                    className="p-2 rounded-lg bg-surface-container-low text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="border-t border-surface-container pt-3 flex flex-col gap-2.5">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Datos del Tutor
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">Nombre Tutor *</label>
                    <input
                      required
                      value={newTutorName}
                      onChange={(e) => setNewTutorName(e.target.value)}
                      placeholder="Ej. Andrea Gómez"
                      className="p-2 rounded-lg bg-surface-container-low text-sm outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">Teléfono / WhatsApp</label>
                    <input
                      value={newTutorPhone}
                      onChange={(e) => setNewTutorPhone(e.target.value)}
                      placeholder="+34 655 443 322"
                      className="p-2 rounded-lg bg-surface-container-low text-sm outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant font-medium text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-xs"
                >
                  Guardar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
