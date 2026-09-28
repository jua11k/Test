import React, { useState, useMemo } from 'react';
import { useTenant } from '../../context/TenantContext';
import { ClinicalNote } from '../../types';

export const ClinicalRecordView: React.FC = () => {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    setActiveTab,
    clinicalNotes,
    addClinicalNote,
    updatePatient,
    currentTenant,
    currentSede,
    showToast,
  } = useTenant();

  // Active Clinical Subtab
  const [activeSubTab, setActiveSubTab] = useState<
    'consultas' | 'vacunas' | 'laboratorio' | 'recetas'
  >('consultas');

  // Modals state
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);
  const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
  const [showNewVaccineModal, setShowNewVaccineModal] = useState(false);
  const [selectedDicomImage, setSelectedDicomImage] = useState<string | null>(null);

  // Timeline filters and search
  const [timelineTypeFilter, setTimelineTypeFilter] = useState<'all' | 'consulta' | 'urgencia' | 'cirugia' | 'preventivo'>('all');
  const [timelineSearch, setTimelineSearch] = useState('');

  // Selected Patient
  const patient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Form State: Add Clinical Note
  const [noteTitle, setNoteTitle] = useState('');
  const [noteType, setNoteType] = useState<'consulta' | 'urgencia' | 'preventivo' | 'cirugia'>('consulta');
  const [anamnesis, setAnamnesis] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [temp, setTemp] = useState('38.5°C');
  const [heartRate, setHeartRate] = useState('92 lpm');
  const [respRate, setRespRate] = useState('22 rpm');
  const [weight, setWeight] = useState(`${patient.weightKg} kg`);

  // Form State: Add Alert / Chronic Condition
  const [alertType, setAlertType] = useState<'alergia' | 'cronica'>('alergia');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'alta' | 'moderada'>('alta');

  // Form State: Email to Tutor
  const [emailSubject, setEmailSubject] = useState(`Historial Clínico Veterinario Oficial - ${patient.name}`);
  const [emailMessage, setEmailMessage] = useState(
    `Estimado/a ${patient.tutor.name},\n\nLe adjuntamos el expediente médico oficial actualizado, pautas de tratamiento y registro sanitario para ${patient.name} (${patient.breed}).\n\nCualquier duda, nuestro equipo médico está a su entera disposición en ${currentSede.phone}.\n\nAtentamente,\n${currentTenant.name} · ${currentSede.name}`
  );

  // Filter clinical notes for the current patient
  const patientNotes = useMemo(() => {
    return clinicalNotes.filter((note) => {
      // Direct patient match or default demo notes for patient-max
      if (patient.id === 'patient-max' && (note.patientId === 'patient-max' || !note.patientId)) return true;
      return note.patientId === patient.id;
    });
  }, [clinicalNotes, patient.id]);

  // Filtered timeline notes by search and type
  const filteredTimelineNotes = useMemo(() => {
    return patientNotes.filter((note) => {
      if (timelineTypeFilter !== 'all' && note.type !== timelineTypeFilter) return false;
      if (!timelineSearch.trim()) return true;
      const q = timelineSearch.toLowerCase();
      return (
        note.title.toLowerCase().includes(q) ||
        note.narrative.toLowerCase().includes(q) ||
        (note.plan && note.plan.toLowerCase().includes(q)) ||
        (note.tags && note.tags.some((t) => t.toLowerCase().includes(q))) ||
        note.veterinarianName.toLowerCase().includes(q)
      );
    });
  }, [patientNotes, timelineTypeFilter, timelineSearch]);

  // Submit Note Handler
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !anamnesis.trim()) {
      showToast('Por favor completa el motivo de consulta y la evolución clínica', 'error', 'error');
      return;
    }

    addClinicalNote({
      patientId: patient.id,
      date: 'Hoy · 24 Octubre 2024',
      time: '12:30 PM',
      title: noteTitle,
      type: noteType,
      typeLabel:
        noteType === 'cirugia'
          ? 'Nota Quirúrgica'
          : noteType === 'urgencia'
          ? 'Urgencia Médica'
          : noteType === 'preventivo'
          ? 'Control Preventivo'
          : 'Consulta de Control',
      veterinarianName: 'Dra. Elena Mendoza',
      veterinarianRegistration: 'Colegiada Nº 2841',
      veterinarianSpecialty: 'Traumatología y Cirugía Ortopédica',
      vitals: {
        temp,
        fc: heartRate,
        fr: respRate,
        weight,
      },
      narrative: `${anamnesis}${diagnosis ? ` | Diagnóstico: ${diagnosis}` : ''}`,
      plan: treatmentPlan,
      tags: ['Evolución EMR', noteType === 'urgencia' ? 'Urgencias' : 'Control Clínico'],
      badgeColor: 'bg-primary-fixed text-on-primary-fixed',
    });

    setNoteTitle('');
    setAnamnesis('');
    setDiagnosis('');
    setTreatmentPlan('');
    setShowAddNoteModal(false);
  };

  // Submit Alert Handler
  const handleAddAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim()) {
      showToast('Por favor describe la alerta sanitaria o alergia', 'error', 'error');
      return;
    }

    if (alertType === 'alergia') {
      const updated = [...(patient.criticalAlerts || []), alertTitle];
      updatePatient(patient.id, { criticalAlerts: updated });
      showToast(`Alerta de alergia crítica registrada para ${patient.name}`, 'warning');
    } else {
      const updated = [...(patient.chronicConditions || []), alertTitle];
      updatePatient(patient.id, { chronicConditions: updated });
      showToast(`Condición crónica registrada para ${patient.name}`, 'medical_information');
    }

    setAlertTitle('');
    setShowAddAlertModal(false);
  };

  // Send Email Handler
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Historial clínico oficial enviado con éxito a ${patient.tutor.email}`, 'mark_email_read');
    setShowEmailModal(false);
  };

  // Export PDF Handler
  const handleOpenPdfPreview = () => {
    setShowPdfPreviewModal(true);
    showToast('Abriendo vista previa oficial de expediente EMR', 'picture_as_pdf');
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 gap-5 max-w-7xl mx-auto pb-28">
      {/* 1. BARRA SUPERIOR: Navegación, Switcher de Pacientes y Estado EMR */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 sm:px-5 sm:py-3 rounded-2xl border border-surface-container/90 shadow-[0_1px_3px_rgba(11,28,48,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pacientes')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all text-xs font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Volver al Directorio de Pacientes</span>
          </button>

          <span className="hidden sm:inline text-outline/50">|</span>

          {/* Switcher Rápido de Pacientes */}
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[17px] text-primary">swap_horiz</span>
            <span className="hidden md:inline font-medium">Cambiar Paciente:</span>
            <select
              value={patient.id}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                const selected = patients.find((p) => p.id === e.target.value);
                if (selected) {
                  showToast(`Cambiando a expediente de ${selected.name} (${selected.breed})`, 'pets');
                }
              }}
              className="bg-surface-container-low text-xs font-bold text-on-surface py-1 px-2.5 rounded-lg border border-surface-container outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.breed}) - {p.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Expediente EMR Activo · {currentSede.name}</span>
          </div>
        </div>
      </section>

      {/* 2. ENCABEZADO PRINCIPAL: Foto, Nombre, Especie, Edad, Peso Actual y ALERTAS MÉDICAS CRÍTICAS (EN ROJO) */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-[0_1px_4px_rgba(11,28,48,0.03)] border border-surface-container/90 flex flex-col gap-5">
        {/* Identidad del Paciente y Métricas Vitales */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Identidad */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            {/* Foto con insignia de especie */}
            <div className="relative shrink-0">
              <img
                alt={`${patient.name} - ${patient.breed}`}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-sm ring-2 ring-primary/20"
                src={patient.photoUrl}
              />
              <span
                className="absolute -bottom-1.5 -right-1.5 bg-primary text-on-primary rounded-full p-1.5 shadow-md flex items-center justify-center border-2 border-white"
                title={`Especie: ${patient.species}`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {patient.species === 'canino'
                    ? 'pets'
                    : patient.species === 'felino'
                    ? 'cruelty_free'
                    : 'pest_control_rodent'}
                </span>
              </span>
            </div>

            {/* Datos Principales */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight truncate">
                  {patient.name}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant border border-surface-container-high">
                  {patient.code}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold uppercase tracking-wider">
                  {patient.species === 'canino'
                    ? 'Canino (Perro)'
                    : patient.species === 'felino'
                    ? 'Felino (Gato)'
                    : 'Exótico'}
                </span>
                {patient.status === 'hospitalizado' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300 text-xs font-bold animate-pulse">
                    Hospitalizado
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant mt-1.5">
                <span className="font-medium text-on-surface">
                  {patient.gender === 'macho' ? 'Macho castrado' : 'Hembra'}
                </span>
                <span>·</span>
                <span className="font-semibold text-primary">{patient.breed}</span>
                <span>·</span>
                <span>
                  Edad: <strong className="text-on-surface font-semibold">{patient.age}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1 font-mono">
                <span>
                  Microchip ISO: <strong>{patient.microchip}</strong>
                </span>
                {patient.currentRoom && (
                  <>
                    <span>·</span>
                    <span className="text-secondary font-semibold">{patient.currentRoom}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Widgets de Peso Actual y Condición Corporal */}
          <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto">
            {/* Widget: Peso Actual */}
            <div className="flex-1 sm:flex-initial bg-surface-container-low/80 p-3 sm:px-4 sm:py-3 rounded-2xl border border-surface-container flex flex-col justify-between min-w-[140px]">
              <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <span>Peso Actual</span>
                <span className="material-symbols-outlined text-primary text-[18px]">scale</span>
              </div>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface tabular-nums">
                  {patient.weightKg}
                </span>
                <span className="text-xs font-bold text-on-surface-variant">kg</span>
              </div>
              <span className="text-[11px] text-primary font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                {patient.weightDeltaText || '+0.3 kg vs último'}
              </span>
            </div>

            {/* Widget: Condición Corporal */}
            <div className="flex-1 sm:flex-initial bg-surface-container-low/80 p-3 sm:px-4 sm:py-3 rounded-2xl border border-surface-container flex flex-col justify-between min-w-[140px]">
              <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <span>Cond. Corporal</span>
                <span className="material-symbols-outlined text-secondary text-[18px]">monitor_heart</span>
              </div>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface tabular-nums">
                  {patient.bodyConditionScore.split('/')[0].trim() || '5'}
                </span>
                <span className="text-xs font-semibold text-on-surface-variant">/ 9 (Ideal)</span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium truncate">
                {patient.bodyConditionNotes || 'Vigor & marcha limpia'}
              </span>
            </div>
          </div>
        </div>

        {/* ⚠️ SECCIÓN CRÍTICA: ALERTAS MÉDICAS CRÍTICAS EN ROJO */}
        <div className="pt-3 border-t border-surface-container/70 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[17px] text-red-600">emergency</span>
                Alertas Sanitarias Críticas y Contraindicaciones Médicas
              </span>
            </div>

            <button
              onClick={() => setShowAddAlertModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-xs font-bold transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>+ Añadir Alerta Médica</span>
            </button>
          </div>

          {/* Tarjeta 1: Alérgico a medicamentos (EN ROJO DE ALTO IMPACTO) */}
          <div className="bg-red-50/95 border-2 border-red-400 text-red-950 p-4 rounded-2xl flex items-start gap-3.5 shadow-[0_2px_8px_rgba(220,38,38,0.08)]">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px] animate-pulse">warning</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-md border border-red-300">
                    Alerta Médica Crítica · Severidad Alta
                  </span>
                  <span className="text-[10px] font-extrabold uppercase bg-red-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                    Riesgo Vital
                  </span>
                </div>
                <span className="text-[11px] font-bold text-red-800 font-mono">
                  Registrado por: Dra. Mendoza (Col. 2841)
                </span>
              </div>

              <p className="text-sm sm:text-base font-extrabold text-red-900 mt-1.5 leading-snug">
                {patient.criticalAlerts && patient.criticalAlerts.length > 0
                  ? `Alérgico a: ${patient.criticalAlerts.join(', ')}`
                  : 'Alérgico a medicamentos: Betalactámicos y Penicilina (Amoxicilina, Ampicilina, Cefalexina)'}
              </p>

              <div className="mt-1.5 p-2.5 rounded-xl bg-white/70 border border-red-200/80 text-xs text-red-900 flex flex-col gap-0.5">
                <span className="font-bold text-red-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-red-600">block</span>
                  Contraindicación Absoluta:
                </span>
                <span>
                  Riesgo severo de shock anafiláctico, edema laríngeo agudo y colapso respiratorio. En caso de requerir antibioterapia, utilizar exclusivamente <strong>macrólidos, fluoroquinolonas o clindamicina</strong> como alternativa segura verificada.
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Enfermedad crónica diagnosticada (EN ÁMBAR / ROJO SUAVE) */}
          <div className="bg-amber-50/90 border border-amber-300 text-amber-950 p-3.5 sm:p-4 rounded-2xl flex items-start gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">medical_information</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                  Enfermedad Crónica Diagnosticada · Seguimiento Activo
                </span>
                <span className="text-[11px] font-bold text-amber-900">
                  Control Semestral Requerido
                </span>
              </div>

              <p className="text-sm font-bold text-amber-950 mt-1">
                {patient.chronicConditions && patient.chronicConditions.length > 0
                  ? patient.chronicConditions.join(' · ')
                  : 'Displasia de Cadera Bilateral (Grado I-II) con osteoartritis leve secundaria'}
              </p>

              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                Plan de manejo activo: Condroprotectores orales continuos (Cosequin Advanced 1 comp/24h), control de peso estricto para evitar sobrecarga articular, evitar ejercicio de salto en frío y radiología de control cada 6 meses.
              </p>
            </div>
          </div>
        </div>

        {/* Ficha Rápida del Tutor del Paciente */}
        <div className="bg-surface-container-low/70 p-3.5 rounded-2xl border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20">
              {patient.tutor.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <span className="font-bold text-sm text-on-surface block">
                Propietario / Tutor: {patient.tutor.name}
              </span>
              <span className="text-on-surface-variant font-mono text-xs">
                {patient.tutor.phone} · {patient.tutor.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${patient.tutor.phone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>Llamar</span>
            </a>
            <a
              href={`https://wa.me/${patient.tutor.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-semibold text-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. BOTONES DE ACCIÓN PRIMARIOS: Añadir nueva nota clínica, Exportar a PDF, Enviar por Email */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Acción 1: Añadir nueva nota clínica */}
        <button
          onClick={() => setShowAddNoteModal(true)}
          className="h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-display font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">note_add</span>
          <span>Añadir nueva nota clínica</span>
        </button>

        {/* Acción 2: Exportar historia clínica a PDF */}
        <button
          onClick={handleOpenPdfPreview}
          className="h-12 bg-surface-container-lowest hover:bg-surface-container text-primary rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-surface-container shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          <span>Exportar historia clínica a PDF</span>
        </button>

        {/* Acción 3: Enviar a propietario por Email */}
        <button
          onClick={() => setShowEmailModal(true)}
          className="h-12 bg-surface-container-lowest hover:bg-surface-container text-secondary rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-surface-container shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
          <span>Enviar a propietario por Email</span>
        </button>
      </section>

      {/* 4. PESTAÑAS (TABS) DE NAVEGACIÓN CLÍNICA */}
      <section className="flex flex-col gap-4">
        {/* Barra de Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-surface-container-low/70 rounded-2xl border border-surface-container overflow-x-auto no-scrollbar">
          {/* Tab 1: Consultas */}
          <button
            onClick={() => setActiveSubTab('consultas')}
            className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'consultas'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">stethoscope</span>
            <span>Consultas</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeSubTab === 'consultas'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              {patientNotes.length}
            </span>
          </button>

          {/* Tab 2: Vacunas y Desparasitación */}
          <button
            onClick={() => setActiveSubTab('vacunas')}
            className={`flex-1 min-w-[180px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'vacunas'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">vaccines</span>
            <span>Vacunas y Desparasitación</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeSubTab === 'vacunas'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              4
            </span>
          </button>

          {/* Tab 3: Exámenes de Laboratorio */}
          <button
            onClick={() => setActiveSubTab('laboratorio')}
            className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'laboratorio'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">biotech</span>
            <span>Exámenes de Laboratorio</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeSubTab === 'laboratorio'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              3
            </span>
          </button>

          {/* Tab 4: Recetas */}
          <button
            onClick={() => setActiveSubTab('recetas')}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'recetas'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">prescriptions</span>
            <span>Recetas</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeSubTab === 'recetas'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              3
            </span>
          </button>
        </div>

        {/* 5. CONTENIDO DE PESTAÑAS */}

        {/* TAB 1: CONSULTAS (Timeline Cronológico de Visitas Médicas y Diagnósticos) */}
        {activeSubTab === 'consultas' && (
          <div className="flex flex-col gap-4">
            {/* Cabecera del Timeline con Filtros Rápidos de Productividad */}
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(11,28,48,0.02)]">
              <div>
                <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">timeline</span>
                  <span>Registro Cronológico de Visitas Médicas y Diagnósticos</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Evolución clínica longitudinal, constantes fisiológicas y juicios diagnósticos del expediente
                </p>
              </div>

              {/* Filtros de Tipo y Buscador Rápido */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline">
                    search
                  </span>
                  <input
                    value={timelineSearch}
                    onChange={(e) => setTimelineSearch(e.target.value)}
                    placeholder="Buscar en evolución o fármaco..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container w-48 sm:w-56"
                  />
                  {timelineSearch && (
                    <button
                      onClick={() => setTimelineSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  value={timelineTypeFilter}
                  onChange={(e) => setTimelineTypeFilter(e.target.value as any)}
                  className="py-1.5 px-3 rounded-xl bg-surface-container-low text-xs font-semibold text-on-surface border border-surface-container outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="all">Todas las Consultas ({patientNotes.length})</option>
                  <option value="consulta">Control / Rutina</option>
                  <option value="urgencia">Urgencias Médicas</option>
                  <option value="cirugia">Cirugías & Post-Op</option>
                  <option value="preventivo">Medicina Preventiva</option>
                </select>
              </div>
            </div>

            {/* TIMELINE PRINCIPAL */}
            {filteredTimelineNotes.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-2xl p-10 text-center border border-surface-container flex flex-col items-center justify-center gap-3">
                <span className="material-symbols-outlined text-4xl text-outline">clinical_notes</span>
                <p className="font-bold text-base text-on-surface">No hay consultas registradas para este filtro</p>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Puedes registrar la primera evolución clínica del paciente o cambiar los términos de búsqueda.
                </p>
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-primary-container transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Añadir Primera Evolución Clínica</span>
                </button>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 flex flex-col gap-5 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container-high">
                {filteredTimelineNotes.map((note) => {
                  const isUrgencia = note.type === 'urgencia';
                  const isCirugia = note.type === 'cirugia';
                  const isPreventivo = note.type === 'preventivo';

                  let accentColor = 'bg-primary';
                  let nodeIcon = 'stethoscope';
                  let badgeBg = 'bg-primary-fixed text-on-primary-fixed';

                  if (isUrgencia) {
                    accentColor = 'bg-amber-600';
                    nodeIcon = 'emergency';
                    badgeBg = 'bg-amber-100 text-amber-900 border border-amber-300';
                  } else if (isCirugia) {
                    accentColor = 'bg-red-600';
                    nodeIcon = 'medical_services';
                    badgeBg = 'bg-red-100 text-red-900 border border-red-300';
                  } else if (isPreventivo) {
                    accentColor = 'bg-secondary';
                    nodeIcon = 'vaccines';
                    badgeBg = 'bg-secondary-fixed text-on-secondary-fixed';
                  }

                  return (
                    <article
                      key={note.id}
                      className="relative bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(11,28,48,0.03)] border border-surface-container/90 flex flex-col gap-3.5 hover:shadow-md transition-all group"
                    >
                      {/* Nodo del Timeline */}
                      <span
                        className={`absolute -left-[30px] sm:-left-[38px] top-6 w-7 h-7 sm:w-8 sm:h-8 rounded-full ${accentColor} text-white flex items-center justify-center shadow-sm ring-4 ring-surface`}
                        title={note.typeLabel}
                      >
                        <span className="material-symbols-outlined text-[15px] sm:text-[17px]">
                          {nodeIcon}
                        </span>
                      </span>

                      {/* Encabezado de la Visita */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${badgeBg}`}>
                              {note.typeLabel}
                            </span>
                            <span className="text-xs font-bold text-on-surface-variant font-mono">
                              {note.date} {note.time && `· ${note.time}`}
                            </span>
                          </div>
                          <h4 className="font-display font-bold text-base sm:text-lg text-on-surface group-hover:text-primary transition-colors">
                            {note.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => showToast(`Copiando pauta de consulta: ${note.title}`, 'content_copy')}
                            className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                            title="Copiar evolución"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                          </button>
                        </div>
                      </div>

                      {/* Veterinario Actuante */}
                      <div className="flex items-center gap-2.5 bg-surface-container-low/70 p-2.5 rounded-xl border border-surface-container">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 text-white ${accentColor}`}>
                          EM
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-on-surface truncate">
                            {note.veterinarianName}
                          </p>
                          <p className="text-[11px] text-on-surface-variant truncate">
                            {note.veterinarianRegistration} · {note.veterinarianSpecialty}
                          </p>
                        </div>
                      </div>

                      {/* Signos Vitales Fisiológicos */}
                      {note.vitals && (
                        <div className="grid grid-cols-4 gap-2 bg-surface-container-low/50 p-2.5 rounded-xl text-center border border-surface-container/70">
                          <div>
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                              Temp
                            </span>
                            <span className="text-xs font-extrabold text-on-surface font-mono">
                              {note.vitals.temp}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                              FC
                            </span>
                            <span className="text-xs font-extrabold text-on-surface font-mono">
                              {note.vitals.fc}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                              FR
                            </span>
                            <span className="text-xs font-extrabold text-on-surface font-mono">
                              {note.vitals.fr}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                              Peso
                            </span>
                            <span className="text-xs font-extrabold text-primary font-mono">
                              {note.vitals.weight}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Evolución Clínica y Juicio Diagnóstico */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-primary">clinical_notes</span>
                          Evolución Clínica & Hallazgos Físicos
                        </span>
                        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                          {note.narrative}
                        </p>
                      </div>

                      {/* Plan Terapéutico & Posología */}
                      {note.plan && (
                        <div className="bg-surface-container-low/80 p-3 rounded-xl border border-surface-container space-y-1">
                          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[17px]">medication</span>
                            Plan Terapéutico, Posología & Indicaciones al Tutor
                          </span>
                          <p className="text-xs text-on-surface leading-relaxed font-medium">
                            {note.plan}
                          </p>
                        </div>
                      )}

                      {/* Tags y Archivos Adjuntos (Radiología DICOM, Fotos de herida) */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-surface-container/70">
                        <div className="flex flex-wrap gap-1.5">
                          {note.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[11px] font-semibold"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>

                        {note.attachments && note.attachments.length > 0 && (
                          <div className="flex items-center gap-2">
                            {note.attachments.map((att, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setSelectedDicomImage(att.name);
                                  showToast(`Abriendo visor de estudio: ${att.name}`, att.icon);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary text-primary text-xs font-bold border border-surface-container-high transition-all"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[16px]">{att.icon}</span>
                                <span>{att.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VACUNAS Y DESPARASITACIÓN */}
        {activeSubTab === 'vacunas' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(11,28,48,0.03)] border border-surface-container/90 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">vaccines</span>
                  <span>Cartilla Sanitaria Oficial e Inmunizaciones</span>
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Calendario biológico, lotes de biológicos aplicados y vencimientos oficiales
                </p>
              </div>

              <button
                onClick={() => setShowNewVaccineModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Registrar Vacuna</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[22px]">vaccines</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">Rabia Anual Obligatoria</span>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Vigente
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Biológico: <strong>Nobivac Rabies</strong> · Lote: <strong>#NB-9428</strong> · Col. Nº 2841
                    </p>
                    <p className="text-[11px] text-primary font-semibold mt-0.5">
                      Aplicada: 10/07/2024 · Próximo vencimiento: 10/07/2025
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Certificado oficial antirrábico generado con firma sanitaria', 'verified')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-primary hover:bg-surface-container-high transition-colors"
                >
                  Certificado
                </button>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[22px]">shield</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">
                        Polivalente Canina Heptavalente (DHPPi + L4)
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Vigente
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Protección contra Moquillo, Parvovirus, Hepatitis y Leptospirosis · Lote: #NL-1102
                    </p>
                    <p className="text-[11px] text-secondary font-semibold mt-0.5">
                      Aplicada: 10/07/2024 · Refuerzo anual programado
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Sello de cartilla digital EMR validado', 'check')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-secondary hover:bg-surface-container-high transition-colors"
                >
                  Sello EMR
                </button>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[22px]">medication</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">
                        Desparasitación Interna (Milbemax Canino)
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                        Trimestral
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Milbemicina oxima + Prazicuantel (1 comprimido vía oral ajustado a {patient.weightKg} kg)
                    </p>
                    <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                      Última toma: 15/09/2024 · Próxima dosis recomendada: 15/12/2024
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Recordatorio de desparasitación enviado al tutor', 'chat')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Aviso WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXÁMENES DE LABORATORIO */}
        {activeSubTab === 'laboratorio' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(11,28,48,0.03)] border border-surface-container/90 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">biotech</span>
                  <span>Exámenes de Laboratorio & Diagnóstico por Imagen</span>
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Informes hematológicos, bioquímicos y estudios radiológicos DICOM sincronizados
                </p>
              </div>

              <button
                onClick={() => showToast('Apertura de gestor de archivos analíticos DICOM', 'upload_file')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                <span>Subir Informe / Placa</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Examen 1 */}
              <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">biotech</span>
                    <span className="font-bold text-sm text-on-surface">Hemograma Completo</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Normal
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-2.5 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Hematíes</span>
                    <span className="font-bold text-on-surface font-mono">7.1 M/µL</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Leucocitos</span>
                    <span className="font-bold text-on-surface font-mono">10.2 K/µL</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Plaquetas</span>
                    <span className="font-bold text-on-surface font-mono">285 K/µL</span>
                  </div>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Realizado: 24/10/2024 · Analizador LaserCyte In-House
                </p>
                <button
                  onClick={() => showToast('Descargando PDF de analítica hematológica', 'download')}
                  className="w-full py-2 rounded-lg bg-surface-container text-xs font-semibold text-primary hover:bg-surface-container-high transition-colors"
                >
                  Descargar Informe Analítico
                </button>
              </div>

              {/* Examen 2 */}
              <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">science</span>
                    <span className="font-bold text-sm text-on-surface">Perfil Bioquímico Completo</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Óptimo
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-2.5 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Creatinina</span>
                    <span className="font-bold text-on-surface font-mono">1.1 mg/dL</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Urea</span>
                    <span className="font-bold text-on-surface font-mono">28 mg/dL</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">ALT / GPT</span>
                    <span className="font-bold text-on-surface font-mono">34 U/L</span>
                  </div>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Realizado: 24/10/2024 · Catalyst Dx IDEXX
                </p>
                <button
                  onClick={() => showToast('Descargando curva bioquímica en PDF', 'download')}
                  className="w-full py-2 rounded-lg bg-surface-container text-xs font-semibold text-secondary hover:bg-surface-container-high transition-colors"
                >
                  Descargar Informe Bioquímico
                </button>
              </div>

              {/* Examen 3: Radiología Digital con Visor DICOM PACS */}
              <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container flex flex-col gap-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">radiology</span>
                    <span className="font-bold text-sm text-on-surface">
                      Estudio Radiológico Digital (2 proyecciones DICOM)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-bold">
                    PACS Sincronizado
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Proyecciones: Ventrodorsal de pelvis extendida y mediolateral articular derecha.
                </p>
                <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container text-xs text-on-surface leading-relaxed">
                  <strong>Juicio Radiológico:</strong> Buena alineación ósea. Remodelación coxofemoral bilateral compatible con displasia de cadera controlada Grado I-II. No se evidencian fisuras ni signos de reacción perióstica agresiva.
                </div>
                <button
                  onClick={() => setSelectedDicomImage('RX CONTROL ARTICULAR DICOM')}
                  className="py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  <span>Abrir Visor Radiológico DICOM PACS</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RECETAS */}
        {activeSubTab === 'recetas' && (
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(11,28,48,0.03)] border border-surface-container/90 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container flex-wrap gap-2">
              <div>
                <h3 className="font-display font-bold text-base text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">prescriptions</span>
                  <span>Pautas Farmacéuticas y Recetas Médicas Activas</span>
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Prescripciones oficiales firmadas digitalmente con código QR sanitario colegial
                </p>
              </div>

              <button
                onClick={() => setShowNewPrescriptionModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Nueva Receta Digital</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-surface-container-low/70 border border-surface-container flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-[20px]">pill</span>
                    </span>
                    <div>
                      <span className="font-bold text-sm text-on-surface block">
                        Cosequin Advanced Canino (Condroprotector)
                      </span>
                      <span className="text-xs text-primary font-semibold">
                        Tratamiento Activo · En curso (restan 42 días)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Vigente
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-lg text-xs space-y-1 border border-surface-container">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Posología:</span>
                    <span className="font-bold text-on-surface">1 comprimido cada 24 horas vía oral</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Duración de la pauta:</span>
                    <span className="font-semibold text-on-surface">60 días seguidos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Veterinario emisor:</span>
                    <span>Dra. Elena Mendoza (Col. 2841)</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => showToast('Receta oficial firmada enviada al tutor por WhatsApp', 'send')}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    Enviar al Tutor
                  </button>
                  <button
                    onClick={() => showToast('Descargando receta con QR sanitario oficial', 'picture_as_pdf')}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors"
                  >
                    Descargar Receta PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* MODAL 1: Añadir Nueva Nota Clínica (ACCIÓN PRIMARIA 1) */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl border border-surface-container flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[24px]">note_add</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-on-surface">
                    Añadir Nueva Nota Clínica · {patient.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Registro de evolución clínica, exploración física y pauta en expediente EMR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface">Tipo de Consulta *</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm font-semibold outline-none focus:ring-1 focus:ring-primary border border-surface-container cursor-pointer"
                  >
                    <option value="consulta">Consulta de Control / Rutina</option>
                    <option value="urgencia">Urgencia Médica</option>
                    <option value="cirugia">Procedimiento Quirúrgico</option>
                    <option value="preventivo">Medicina Preventiva</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface">Título / Motivo Clínico *</label>
                  <input
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Ej. Revisión post-operatoria articular"
                    className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
              </div>

              {/* Panel de Signos Vitales Fisiológicos */}
              <div className="p-3 bg-surface-container-low/70 rounded-xl border border-surface-container flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Signos Vitales y Triaje Fisiológico
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-on-surface-variant font-medium">Temp (°C)</label>
                    <input
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      className="p-1.5 rounded-lg bg-surface-container-lowest text-xs font-mono font-bold outline-none border border-surface-container"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-on-surface-variant font-medium">FC (lpm)</label>
                    <input
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      className="p-1.5 rounded-lg bg-surface-container-lowest text-xs font-mono font-bold outline-none border border-surface-container"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-on-surface-variant font-medium">FR (rpm)</label>
                    <input
                      value={respRate}
                      onChange={(e) => setRespRate(e.target.value)}
                      className="p-1.5 rounded-lg bg-surface-container-lowest text-xs font-mono font-bold outline-none border border-surface-container"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-on-surface-variant font-medium">Peso</label>
                    <input
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="p-1.5 rounded-lg bg-surface-container-lowest text-xs font-mono font-bold outline-none border border-surface-container"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">
                  Evolución Clínica & Hallazgos Físicos *
                </label>
                <textarea
                  required
                  rows={3}
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                  placeholder="Detalla anamnesis, auscultación cardiopulmonar, palpación abdominal, movilidad articular, estado de mucosas..."
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Diagnóstico / Juicio Clínico</label>
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Ej. Post-operatorio satisfactorio, osteoartritis controlada"
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">
                  Plan Terapéutico, Medicación & Posología
                </label>
                <textarea
                  rows={2}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="Pauta farmacológica, dosis por kg, indicaciones para el propietario y próxima cita de control..."
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-medium text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-xs transition-all"
                >
                  Guardar en Expediente EMR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Vista Previa y Exportación a PDF Sanitario (ACCIÓN PRIMARIA 2) */}
      {showPdfPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-3xl p-6 shadow-2xl border border-surface-container flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-on-surface">
                    Vista Previa de Historia Clínica Oficial (PDF EMR)
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Documento sanitario oficial listo para impresión o descarga con firma colegial
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPdfPreviewModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Hoja Simil-Papel Sanitario */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-sm text-slate-800 font-sans space-y-5 print:p-0">
              {/* Membrete Oficial de la Clínica */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                <div className="space-y-0.5">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
                    {currentTenant.name.toUpperCase()}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {currentSede.name} · CIF: {currentTenant.taxId}
                  </p>
                  <p className="text-xs text-slate-600">
                    {currentSede.address}, {currentSede.city} · Tel: {currentSede.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-300 px-2.5 py-1 rounded">
                    EMR #{patient.code}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Fecha de emisión: {new Date().toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              {/* Ficha del Paciente y Tutor */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <p className="font-bold text-slate-900">DATOS DEL PACIENTE:</p>
                  <p>Nombre: <strong>{patient.name}</strong> ({patient.species.toUpperCase()})</p>
                  <p>Raza: {patient.breed} · Sexo: {patient.gender}</p>
                  <p>Edad: {patient.age} · Peso actual: {patient.weightKg} kg</p>
                  <p className="font-mono">Microchip: {patient.microchip}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">PROPIETARIO / TUTOR:</p>
                  <p>Nombre: <strong>{patient.tutor.name}</strong></p>
                  <p>Teléfono: {patient.tutor.phone}</p>
                  <p>Email: {patient.tutor.email}</p>
                  <p>Sede de referencia: {currentSede.name}</p>
                </div>
              </div>

              {/* Alertas Médicas en el Documento */}
              <div className="bg-red-50 border-2 border-red-400 p-3 rounded-lg text-xs text-red-950">
                <p className="font-black uppercase tracking-wider text-red-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-red-600">warning</span>
                  ALERTAS MÉDICAS CRÍTICAS Y CONTRAINDICACIONES:
                </p>
                <p className="font-bold text-red-900 mt-0.5">
                  Alérgico a medicamentos: Betalactámicos y Penicilinas (Amoxicilina/Ampicilina). Riesgo anafiláctico.
                </p>
                <p className="text-[11px] text-red-800">
                  Patología crónica: Displasia de cadera bilateral controlada.
                </p>
              </div>

              {/* Historial Cronológico de Consultas */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  HISTORIAL CLÍNICO LONGITUDINAL:
                </h4>
                {patientNotes.map((note) => (
                  <div key={note.id} className="border-l-2 border-teal-700 pl-3 py-1 space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{note.title} ({note.typeLabel})</span>
                      <span className="font-mono text-slate-500">{note.date}</span>
                    </div>
                    {note.vitals && (
                      <p className="text-[11px] text-slate-600 font-mono">
                        Constantes: Temp: {note.vitals.temp} · FC: {note.vitals.fc} · FR: {note.vitals.fr} · Peso: {note.vitals.weight}
                      </p>
                    )}
                    <p className="text-slate-700">{note.narrative}</p>
                    {note.plan && (
                      <p className="text-slate-800 bg-slate-50 p-1.5 rounded">
                        <strong>Tratamiento:</strong> {note.plan}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Firma y Sello Colegial */}
              <div className="flex justify-between items-end pt-6 border-t border-slate-200 text-xs text-slate-600">
                <div className="space-y-0.5">
                  <p>Documento expedido electrónicamente con validez médico-sanitaria.</p>
                  <p className="font-mono text-[10px]">HASH-SHA256: 8f4c910e192b8d03... VERIFICADO</p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-700 mb-1"></div>
                  <p className="font-bold text-slate-900">Dra. Elena Mendoza</p>
                  <p className="text-[11px]">Colegiada Nº 2841</p>
                </div>
              </div>
            </div>

            {/* Acciones de Exportación */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setShowPdfPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-medium text-xs hover:bg-surface-container-high transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  showToast('Abriendo cuadro de diálogo de impresión', 'print');
                }}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-primary font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Imprimir Informe</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Descargando Historia_Clinica_${patient.name}_${patient.code.replace('#', '')}.pdf`, 'download_done');
                  setShowPdfPreviewModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Descargar Archivo PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Enviar a Propietario por Email (ACCIÓN PRIMARIA 3) */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  mark_email_read
                </span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Enviar Expediente a Propietario por Email
                </h3>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Destinatario (Tutor Oficial)</label>
                <input
                  disabled
                  value={`${patient.tutor.name} <${patient.tutor.email}>`}
                  className="p-2 rounded-xl bg-surface-container text-xs text-on-surface border border-surface-container opacity-90 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Asunto del Correo</label>
                <input
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface">Mensaje al Tutor</label>
                <textarea
                  rows={4}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container resize-none leading-relaxed"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-low flex items-center gap-2 text-xs text-on-surface-variant border border-surface-container">
                <span className="material-symbols-outlined text-primary text-[18px]">attach_file</span>
                <span>Se adjuntará automáticamente el PDF oficial de la historia médica EMR firmado digitalmente.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container text-on-surface-variant font-medium text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold text-xs transition-colors shadow-xs"
                >
                  Confirmar y Enviar Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Añadir Alerta Médica Crítica */}
      {showAddAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-5 shadow-2xl border border-surface-container flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-[22px]">warning</span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Añadir Alerta Sanitaria · {patient.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAddAlertModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddAlertSubmit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface">Tipo de Alerta Médica</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertType('alergia')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      alertType === 'alergia'
                        ? 'bg-red-50 border-red-400 text-red-800'
                        : 'bg-surface-container-low border-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">block</span>
                    <span>Alergia a Medicamento</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('cronica')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      alertType === 'cronica'
                        ? 'bg-amber-50 border-amber-400 text-amber-900'
                        : 'bg-surface-container-low border-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">medical_information</span>
                    <span>Enfermedad Crónica</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface">Descripción / Fármaco Contraindicado *</label>
                <input
                  required
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder={
                    alertType === 'alergia'
                      ? 'Ej. Alérgico a Metronidazol / AINES / Cefalosporinas'
                      : 'Ej. Cardiopatía dilatada estadio B2, Insuficiencia renal'
                  }
                  className="p-2.5 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddAlertModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold shadow-xs hover:bg-red-700 transition-colors"
                >
                  Guardar Alerta en Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Visor DICOM PACS Interactivo */}
      {selectedDicomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl w-full max-w-4xl p-5 shadow-2xl border border-slate-700 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-teal-400 text-[24px]">radiology</span>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Visor DICOM PACS · {selectedDicomImage}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Paciente: {patient.name} ({patient.code}) · Adquisición 24/10/2024 10:45:00
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDicomImage(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Simulación de Visor Radiológico de Alta Fidelidad */}
            <div className="relative bg-black rounded-xl p-4 flex flex-col items-center justify-center min-h-[360px] border border-slate-800">
              <div className="absolute top-3 left-3 text-[11px] font-mono text-teal-400 space-y-0.5">
                <p>kV: 72 · mA: 160 · s: 0.05</p>
                <p>PROYECCIÓN: VD PELVIS EXTENDIDA</p>
                <p>MATRIZ: 2048 x 2048 DICOM 3.0</p>
              </div>

              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <span className="material-symbols-outlined text-slate-700 text-8xl">bones</span>
                  <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80"></div>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  Calidad diagnóstica validada · Sin fracturas agudas · Osteoartritis coxofemoral bilateral
                </p>
              </div>

              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => showToast('Ajuste de contraste Window/Level aplicado', 'contrast')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
                >
                  W/L
                </button>
                <button
                  onClick={() => showToast('Zoom 200% activado', 'zoom_in')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
                >
                  Zoom
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setSelectedDicomImage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Nueva Receta Digital */}
      {showNewPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-5 shadow-2xl border border-surface-container flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">prescriptions</span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Emitir Nueva Receta Digital · {patient.name}
                </h3>
              </div>
              <button
                onClick={() => setShowNewPrescriptionModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface">Medicamento / Fármaco</label>
                <input
                  placeholder="Ej. Cimalgex 80mg, Onsior, Cosequin..."
                  className="p-2.5 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Posología</label>
                  <input
                    placeholder="Ej. 1 comp cada 24h"
                    className="p-2 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Duración</label>
                  <input
                    placeholder="Ej. 30 días"
                    className="p-2 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowNewPrescriptionModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('Receta digital oficial emitida con firma colegial y código QR', 'verified');
                    setShowNewPrescriptionModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-xs hover:bg-primary-container transition-colors"
                >
                  Firmar y Emitir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Registrar Vacuna */}
      {showNewVaccineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-5 shadow-2xl border border-surface-container flex flex-col gap-3.5">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">vaccines</span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Registrar Aplicación de Vacuna · {patient.name}
                </h3>
              </div>
              <button
                onClick={() => setShowNewVaccineModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface">Tipo de Vacuna / Biológico</label>
                <select className="p-2.5 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container cursor-pointer font-medium">
                  <option>Antirrábica Obligatoria (Nobivac Rabies)</option>
                  <option>Polivalente Canina Heptavalente (DHPPi + L4)</option>
                  <option>Tos de las Perreras (Bordetella bronchiseptica)</option>
                  <option>Triple Felina (Panleucopenia, Rinotraqueítis, Calicivirus)</option>
                  <option>Leucemia Felina (FeLV)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Lote del Biológico</label>
                  <input
                    placeholder="#NB-9941"
                    className="p-2 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container font-mono uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Próximo Vencimiento</label>
                  <input
                    type="date"
                    defaultValue="2025-10-24"
                    className="p-2 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowNewVaccineModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('Vacuna registrada en cartilla oficial EMR con sello colegial', 'vaccines');
                    setShowNewVaccineModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-xs hover:bg-primary-container transition-colors"
                >
                  Confirmar Aplicación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
