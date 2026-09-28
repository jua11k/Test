import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { ClientOtpModal } from './ClientOtpModal';
import { VetLogo } from '../common/VetLogo';
import { AppointmentType } from '../../types';

interface TutorPortalViewProps {
  isStaffPreview?: boolean;
}

export const TutorPortalView: React.FC<TutorPortalViewProps> = ({ isStaffPreview = false }) => {
  const { currentTenant, currentSede, addAppointment, showToast, setUserRole } = useTenant();

  // Booking Stepper state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedServiceType, setSelectedServiceType] = useState<
    'general' | 'vacunacion' | 'especialista'
  >('general');
  const [selectedServiceName, setSelectedServiceName] = useState('Consulta General');
  const [selectedPrice, setSelectedPrice] = useState(45);
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [petSpecies, setPetSpecies] = useState<'canino' | 'felino' | 'exotico'>('canino');

  // Mini Calendar State (Octubre 2024)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(24);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');
  const [timePeriodFilter, setTimePeriodFilter] = useState<'todos' | 'manana' | 'tarde'>('todos');

  // Form state
  const [tutorName, setTutorName] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');
  const [petName, setPetName] = useState('');
  const [consultReason, setConsultReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpModalAction, setOtpModalAction] = useState<'historial' | 'laboratorio' | 'login'>(
    'historial'
  );

  // WhatsApp Floating Tooltip State
  const [showWhatsappTooltip, setShowWhatsappTooltip] = useState(true);

  // Consultation Types Catalog
  const consultationTypes = [
    {
      id: 'general' as const,
      type: 'consulta' as AppointmentType,
      name: 'Consulta General',
      tag: 'Recomendado',
      badgeColor: 'bg-sky-100 text-sky-800',
      icon: 'stethoscope',
      iconBg: 'bg-sky-50 text-sky-700',
      price: 45,
      duration: '30 min',
      description:
        'Chequeo físico completo: auscultación cardiopulmonar, revisión de ojos, oídos, boca, peso y signos vitales.',
    },
    {
      id: 'vacunacion' as const,
      type: 'vacunacion' as AppointmentType,
      name: 'Vacunación & Desparasitación',
      tag: 'Prevención',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: 'vaccines',
      iconBg: 'bg-emerald-50 text-emerald-700',
      price: 35,
      duration: '20 min',
      description:
        'Inmunización oficial con cartilla sanitaria: Rabia, Polivalente (DHPPi/Leptospirosis) o desparasitación interna.',
    },
    {
      id: 'especialista' as const,
      type: 'cirugia' as AppointmentType,
      name: 'Consulta Especialista',
      tag: 'Avanzado',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: 'biotech',
      iconBg: 'bg-amber-50 text-amber-800',
      price: 65,
      duration: '45 min',
      description:
        'Evaluación especializada en traumatología, dermatología, ecografía diagnóstica o control prequirúrgico.',
    },
  ];

  // Available slots for morning and afternoon
  const morningSlots = ['09:15 AM', '10:00 AM', '10:30 AM', '11:15 AM', '12:00 PM'];
  const afternoonSlots = ['16:00 PM', '16:45 PM', '17:30 PM', '18:15 PM', '19:00 PM'];

  // Days in October 2024 (calendar matrix: Oct 2024 starts on Tuesday, 31 days)
  // Days of week: L, M, X, J, V, S, D
  const calendarDays = [
    { day: null }, // Mon before Oct 1
    { day: 1, available: false },
    { day: 2, available: false },
    { day: 3, available: false },
    { day: 4, available: false },
    { day: 5, available: false, isWeekend: true },
    { day: 6, available: false, isWeekend: true },
    { day: 7, available: false },
    { day: 8, available: false },
    { day: 9, available: false },
    { day: 10, available: false },
    { day: 11, available: false },
    { day: 12, available: false, isWeekend: true },
    { day: 13, available: false, isWeekend: true },
    { day: 14, available: false },
    { day: 15, available: false },
    { day: 16, available: false },
    { day: 17, available: false },
    { day: 18, available: false },
    { day: 19, available: false, isWeekend: true },
    { day: 20, available: false, isWeekend: true },
    { day: 21, available: true },
    { day: 22, available: true },
    { day: 23, available: true },
    { day: 24, available: true, isToday: true },
    { day: 25, available: true },
    { day: 26, available: true, isWeekend: true },
    { day: 27, available: false, isWeekend: true },
    { day: 28, available: true },
    { day: 29, available: true },
    { day: 30, available: true },
    { day: 31, available: true },
  ];

  const handleSelectService = (item: (typeof consultationTypes)[0]) => {
    setSelectedServiceType(item.id);
    setSelectedServiceName(item.name);
    setSelectedPrice(item.price);
    setSelectedDuration(item.duration);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorName.trim() || !petName.trim() || !tutorPhone.trim()) {
      showToast('Por favor completa los datos obligatorios marcados con *', 'warning', 'warning');
      return;
    }

    const newCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingCode(newCode);

    const formattedDate = `2024-10-${selectedCalendarDay.toString().padStart(2, '0')}`;

    addAppointment({
      patientId: `patient-${Date.now()}`,
      patientName: petName,
      species: petSpecies,
      breed:
        petSpecies === 'canino'
          ? 'Canino (Perro)'
          : petSpecies === 'felino'
          ? 'Felino (Gato)'
          : 'Mascota Exótica',
      photoUrl:
        petSpecies === 'canino'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ12UwB0nvDxhygfsgTOWKr_GE32va2lyrE_4mefr4cpwjy0CIn14MHczhmet_P44VqW0pzIrN4pi_I4WmbUs-gIMye69PY4hQPYv6DpKgy1trPjboUnxqCNDwfVuaIzXRDTTPpAvj_Cyc57K8jBHn8I_NukozhPjprwwonD97WaaFgtDCpx9z5k24pD_pKzNqwZR6fRcxgXibBbW19tp3xhEXtU1W6N5sSCZMeuRjRKo355iqckwm'
          : petSpecies === 'felino'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr4vN_zYT5HcX3OsRf7qAlFAlRtSmfuNbDotAi_2KxPRiz3mEx2Dif8LZHxnQ_XakWGqeRZResO9cCzMdDfx6T9Q1sj2JS4KEq6BZxR6u9ic1K8Stif6dTcYpiICj7pI-5wti_ELWiUJUIs52PjL9x4GBLY84v5-igzLWMRvQj3rnqeg7pYDuhkUYl7mKhxl5aMVG0PW3P5RqL34OgaPDhxQPfcBQ3a0AlqKF4Oe5ZbLqF1h-Ec5Kr'
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-yj-K-hc2sz00pLCIzBhC8SA2Am9KapTkoyewfsRO-IHQtQzvdD1QBlaR9oZ1vtPeYqz6l4w0Eg_eaXFWWExaSImVfVIazRvRSB0uSEGOGqePCouY1hjNVgrSyci0y5irgIozsFefW9SFcoaEcsaOfmnjBNorKOjzrHYyOLgc-TJjtzxFa4nwUiSvSxjwc4c_n5hdPqFspcEUHp-JC93um5pO_MX4NwaHCdXSycuqG5GTFbo2Pb5K',
      tutorName,
      tutorPhone,
      time: selectedTimeSlot,
      date: formattedDate,
      durationMinutes: selectedServiceType === 'especialista' ? 45 : 30,
      durationLabel: selectedDuration,
      type:
        selectedServiceType === 'vacunacion'
          ? 'vacunacion'
          : selectedServiceType === 'especialista'
          ? 'cirugia'
          : 'consulta',
      status: 'confirmado',
      statusLabel: 'Confirmado',
      reason: consultReason.trim() ? `${selectedServiceName}: ${consultReason}` : selectedServiceName,
      roomBox:
        selectedServiceType === 'vacunacion'
          ? 'Box 2 • Medicina Preventiva'
          : selectedServiceType === 'especialista'
          ? 'Box 3 • Diagnóstico'
          : 'Box 1 • Dra. Mendoza',
      veterinarianName:
        selectedServiceType === 'especialista' ? 'Dr. Alejandro Ramos' : 'Dra. Elena Mendoza',
      veterinarianId: selectedServiceType === 'especialista' ? 'vet-ramos' : 'vet-mendoza',
      autoReminder: true,
      sedeId: currentSede.id,
      badgeStyle:
        selectedServiceType === 'vacunacion'
          ? 'bg-emerald-100 text-emerald-900'
          : selectedServiceType === 'especialista'
          ? 'bg-amber-100 text-amber-900'
          : 'bg-blue-100 text-blue-900',
    });

    setBookingSuccess(true);
    showToast(`¡Cita confirmada! Código #${newCode}`, 'task_alt');
  };

  const handleOpenOtp = (action: 'historial' | 'laboratorio' | 'login') => {
    setOtpModalAction(action);
    setIsOtpModalOpen(true);
  };

  const scrollToBooking = () => {
    const el = document.getElementById('agendamiento-flujo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const resetBookingForm = () => {
    setBookingSuccess(false);
    setStep(1);
    setPetName('');
    setConsultReason('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9FBFA] via-white to-[#F4F9F7] text-on-surface flex flex-col font-sans">
      {/* 0. SaaS URL Generation Bar (Muestra cómo el software SaaS genera este enlace para la clínica) */}
      <div className="bg-surface-container-high/90 border-b border-surface-container text-on-surface-variant text-xs py-2 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">URL Pública generada por SaaS:</span>
            <code className="px-2 py-0.5 rounded-md bg-surface-container-lowest font-mono text-[11px] text-primary border border-surface-container font-semibold">
              app.sistema.com/{currentTenant.slug || 'veterinaria-patitas'}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                showToast(
                  'Enlace copiado al portapapeles: app.sistema.com/veterinaria-patitas',
                  'content_copy'
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-semibold text-[11px] border border-surface-container shadow-2xs transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              <span>Copiar Enlace</span>
            </button>

            {isStaffPreview && (
              <button
                type="button"
                onClick={() => setUserRole('clinical_staff')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary text-on-primary font-semibold text-[11px] shadow-2xs transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">dashboard</span>
                <span>Volver a EMR</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1. Encabezado (Header) de la Clínica */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-[0_2px_12px_rgba(0,104,95,0.04)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3">
          {/* Logo & Clinic Information */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-xs">
              <VetLogo size={32} className="h-8 w-8 object-contain" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-display font-bold text-base sm:text-lg text-emerald-950 truncate leading-tight">
                  {currentTenant.name || 'Clínica Veterinaria Patitas'}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                   Fear Free®
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-on-surface-variant truncate mt-0.5">
                <span className="material-symbols-outlined text-[15px] text-emerald-700 shrink-0">
                  pin_drop
                </span>
                <span className="truncate">{currentSede.address}</span>
                <span className="hidden md:inline text-emerald-800 font-medium">
                  · Abierto Hoy hasta 20:30
                </span>
              </div>
            </div>
          </div>

          {/* Iniciar Sesión Button & Modo Clínico Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenOtp('login')}
              type="button"
              className="min-h-[40px] px-3.5 sm:px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/80 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-700">
                account_circle
              </span>
              <span>Iniciar Sesión</span>
            </button>

            <button
              onClick={() => {
                setUserRole('clinical_staff');
                showToast('Cambiado a Modo Clínico EMR', 'stethoscope');
              }}
              title="Cambiar a Modo Clínico EMR"
              type="button"
              className="min-h-[40px] px-2.5 sm:px-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                medical_services
              </span>
              <span className="hidden sm:inline">Modo Clínico</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-5 flex flex-col gap-8 flex-1">
        {/* 2. Sección Principal (Hero) Empático */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6F4F1] via-[#F0FDF9] to-[#ECFDF5] border border-emerald-100/80 p-6 sm:p-8 shadow-sm">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-teal-200/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Left Column: Text & CTA */}
            <div className="flex-1 flex flex-col items-start gap-3.5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-2xs">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                  pets
                </span>
                <span>Cuidado Veterinario de Excelencia & Amor Animal</span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-emerald-950 tracking-tight leading-tight">
                Cuidamos con amor y ciencia a tu mejor amigo 🐾
              </h1>

              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Atención médica cálida, sin estrés y con la más alta tecnología clínica. Desde chequeos
                preventivos hasta cirugías y laboratorio digital con resultados directos a tu móvil.
              </p>

              {/* Call to Action GRANDE y DESTACADO */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full pt-2">
                <button
                  onClick={scrollToBooking}
                  type="button"
                  className="min-h-[52px] px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                  <span>Agendar Nueva Cita</span>
                </button>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-on-surface-variant px-2">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">
                    check_circle
                  </span>
                  <span>Sin pago por adelantado · Confirmación inmediata</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant pt-2 border-t border-emerald-200/50 w-full mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex text-amber-400">★★★★★</span>
                  <strong className="text-emerald-950 font-bold">4.9/5</strong>
                  <span>(1,500+ tutores)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                    chat
                  </span>
                  <span>Avisos por WhatsApp</span>
                </div>
                <div className="flex items-center gap-1.5 text-error font-medium">
                  <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                  <span>Urgencias 24h</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="w-full md:w-72 lg:w-80 shrink-0">
              <div className="relative rounded-2xl overflow-hidden shadow-md border-4 border-white/80 group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqvNf-hEU7jTnh1gwPtTCu2pfsdk9AN_E5Sl7wBNaAKDSkiiN3tKonG5VArFHmFcSJsiK6XyJe883qswE-vSW7VvzJEHGgCfOSaaXkhDSkxLFZU09OTwcG0m_W466XOVw2CChQsyxsuV__GspldQb7VnUlEfDA-2plRDANUXp3pbQ93KI7-iYMMJkCaMvcLWwnOb_Ou7tBM2PIIhazfw8URLpMKEGvtmS7QcS-6bGxt93m-5DtHn5t"
                  alt="Veterinaria examinando perro con amor y ternura"
                  className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400">
                      verified
                    </span>
                    <span className="font-semibold">Protocolo Amigable Fear Free®</span>
                  </div>
                  <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-mono">
                    Box Climatizado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Flujo de Agendamiento Online (Stepper Interactivo) */}
        <section
          id="agendamiento-flujo"
          className="scroll-mt-24 rounded-3xl bg-white border border-emerald-100 p-5 sm:p-7 shadow-sm flex flex-col gap-6"
        >
          {/* Stepper Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
                </span>
                <h2 className="font-display font-bold text-lg sm:text-xl text-emerald-950">
                  Reserva tu Cita en 3 Pasos
                </h2>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 ml-10">
                Selecciona servicio, horario de atención y déjanos tus datos de contacto
              </p>
            </div>

            {/* Stepper Progress Tabs */}
            <div className="flex items-center gap-1.5 bg-surface-container-low p-1.5 rounded-2xl border border-surface-container">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  step === 1
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    step === 1 ? 'bg-emerald-600 text-white' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  1
                </span>
                <span>Servicio</span>
              </button>

              <span className="text-on-surface-variant/40">›</span>

              <button
                type="button"
                onClick={() => setStep(2)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  step === 2
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    step === 2 ? 'bg-emerald-600 text-white' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  2
                </span>
                <span>Fecha & Hora</span>
              </button>

              <span className="text-on-surface-variant/40">›</span>

              <button
                type="button"
                onClick={() => setStep(3)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  step === 3
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    step === 3 ? 'bg-emerald-600 text-white' : 'bg-surface-container text-on-surface'
                  }`}
                >
                  3
                </span>
                <span>Confirmar</span>
              </button>
            </div>
          </div>

          {/* PASO 1: SELECCIONAR TIPO DE CONSULTA */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-base text-emerald-950">
                    Paso 1: ¿Qué tipo de atención necesita tu mascota?
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Elige el procedimiento que mejor se adapte al motivo de tu visita
                  </p>
                </div>

                {/* Pet Species Selector */}
                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-2xl border border-surface-container">
                  <button
                    type="button"
                    onClick={() => setPetSpecies('canino')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      petSpecies === 'canino'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    <span>🐶 Perro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetSpecies('felino')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      petSpecies === 'felino'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    <span>🐱 Gato</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetSpecies('exotico')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      petSpecies === 'exotico'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    <span>🐰 Exótico</span>
                  </button>
                </div>
              </div>

              {/* Service Cards (General, Vacunación, Especialista) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {consultationTypes.map((item) => {
                  const isSelected = selectedServiceType === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectService(item)}
                      className={`relative p-4 rounded-3xl cursor-pointer transition-all flex flex-col justify-between gap-3 border-2 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-surface-container bg-surface-container-lowest hover:border-emerald-200 hover:bg-emerald-50/20'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.iconBg}`}
                          >
                            <span className="material-symbols-outlined text-[24px]">
                              {item.icon}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                          >
                            {item.tag}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-sm sm:text-base text-emerald-950">
                            {item.name}
                          </h4>
                          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>{item.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-sm text-emerald-800">{item.price}€</span>
                          <span className="material-symbols-outlined text-[20px] text-emerald-600">
                            {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="min-h-[46px] px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>Continuar a Fecha y Horario</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: ELEGIR FECHA Y HORA EN MINI CALENDARIO INTERACTIVO */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-emerald-950">
                    Paso 2: Selecciona día y franja horaria
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Servicio elegido: <strong>{selectedServiceName}</strong> ({selectedDuration} ·{' '}
                    {selectedPrice}€)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Cambiar servicio</span>
                </button>
              </div>

              {/* Layout 2 columns: Mini Calendar on Left, Time Slots on Right */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Mini Calendario Interactivo */}
                <div className="md:col-span-7 bg-surface-container-low/60 rounded-3xl p-4 border border-surface-container flex flex-col gap-3">
                  {/* Calendar Month Header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-700 text-[20px]">
                        calendar_month
                      </span>
                      <span className="font-display font-bold text-sm text-emerald-950">
                        Octubre 2024
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>Días con turnos</span>
                    </div>
                  </div>

                  {/* Day of Week Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-on-surface-variant uppercase">
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mié</span>
                    <span>Jue</span>
                    <span>Vie</span>
                    <span>Sáb</span>
                    <span>Dom</span>
                  </div>

                  {/* Month Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((item, idx) => {
                      if (!item.day) {
                        return <div key={`empty-${idx}`} className="h-9"></div>;
                      }

                      const isSelected = selectedCalendarDay === item.day;
                      const isAvailable = item.available;

                      return (
                        <button
                          key={`day-${item.day}`}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setSelectedCalendarDay(item.day)}
                          className={`h-10 rounded-2xl flex flex-col items-center justify-center relative font-display font-medium text-xs transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-sm scale-105 z-10'
                              : isAvailable
                              ? 'bg-white text-emerald-950 hover:bg-emerald-100/70 border border-emerald-200/60 font-semibold cursor-pointer'
                              : 'text-on-surface-variant/40 cursor-not-allowed bg-transparent'
                          }`}
                        >
                          <span>{item.day}</span>
                          {item.isToday && !isSelected && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-600"></span>
                          )}
                          {isAvailable && !isSelected && (
                            <span className="w-1 h-1 rounded-full bg-emerald-500/60 mt-0.5"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Day Selected Detail */}
                  <div className="p-2.5 rounded-2xl bg-white border border-surface-container flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-medium">Día seleccionado:</span>
                    <span className="font-bold text-emerald-950">
                      Jueves, {selectedCalendarDay} de Octubre de 2024
                    </span>
                  </div>
                </div>

                {/* Right: Hours Grid & Assigned Clinician */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  {/* Doctor Assigned Card */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center gap-3">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPdF3OITlUtL05AGmUCvKXbstlVZXU0I5buNBHEXZ2dceiCljuOnUm7HQMXZimOIOJh-tk6G1G3YNdKUUhXL9JaVsDHrZwb1Dwjak3imJ9s-b_d6EojxnmRB-ufEj0TS3g_gCKUiI7egNnF49r6AF2o3s_RIlolIdyYwe0rwQA1JNcFaKxygy597EIx0kJ_axmhoju7-HiT2it0wdxCsBTHI9kMTFvHRczuQp5RvKgmvB3mWj6sTG5"
                      alt="Dra. Elena Mendoza"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-300 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">
                        Médico Veterinario de Turno
                      </p>
                      <h4 className="font-display font-bold text-xs sm:text-sm text-emerald-950 truncate">
                        Dra. Elena Mendoza
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Fear Free® · Box 1 Consultas
                      </p>
                    </div>
                  </div>

                  {/* Shift Filter (Mañana / Tarde) */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-on-surface-variant font-medium mr-1">Turno:</span>
                    <button
                      type="button"
                      onClick={() => setTimePeriodFilter('todos')}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                        timePeriodFilter === 'todos'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimePeriodFilter('manana')}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                        timePeriodFilter === 'manana'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      Mañana
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimePeriodFilter('tarde')}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                        timePeriodFilter === 'tarde'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      Tarde
                    </button>
                  </div>

                  {/* Morning Slots */}
                  {(timePeriodFilter === 'todos' || timePeriodFilter === 'manana') && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-amber-500">
                          wb_sunny
                        </span>
                        Turno Mañana:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
                        {morningSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-2 rounded-2xl text-xs font-semibold text-center transition-all ${
                              selectedTimeSlot === slot
                                ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-500/20'
                                : 'bg-white hover:bg-emerald-50 text-emerald-950 border border-surface-container'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {(timePeriodFilter === 'todos' || timePeriodFilter === 'tarde') && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-teal-600">
                          wb_twilight
                        </span>
                        Turno Tarde:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
                        {afternoonSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-2 rounded-2xl text-xs font-semibold text-center transition-all ${
                              selectedTimeSlot === slot
                                ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-500/20'
                                : 'bg-white hover:bg-emerald-50 text-emerald-950 border border-surface-container'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next to Step 3 */}
              <div className="flex items-center justify-between pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="min-h-[46px] px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>Continuar a Datos del Paciente</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: FORMULARIO CORTO Y CONFIRMACIÓN */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-emerald-950">
                    Paso 3: Datos de la Mascota y Tutor
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Te enviaremos la confirmación instantánea por WhatsApp y correo electrónico
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Cambiar fecha/hora</span>
                </button>
              </div>

              {/* Booking Summary Box */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">event_available</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs sm:text-sm text-emerald-950">
                      {selectedServiceName} · {selectedPrice}€
                    </h4>
                    <p className="text-xs text-on-surface-variant">
                      Jueves {selectedCalendarDay} de Octubre, 2024 ·{' '}
                      <strong className="text-emerald-800">{selectedTimeSlot}</strong> ({selectedDuration})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-xl bg-white text-emerald-800 font-bold border border-emerald-200">
                    Sin Pago Previo
                  </span>
                </div>
              </div>

              {!bookingSuccess ? (
                <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                  {/* Grid 2 Columns for Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tutor Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-emerald-950">
                        Nombre y Apellidos del Tutor *
                      </label>
                      <input
                        type="text"
                        required
                        value={tutorName}
                        onChange={(e) => setTutorName(e.target.value)}
                        placeholder="Ej. Camila Morales"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container focus:border-emerald-600 focus:bg-white text-xs sm:text-sm text-on-surface outline-none transition-all"
                      />
                    </div>

                    {/* Tutor Phone */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-emerald-950">
                        Móvil / WhatsApp (para recordatorios) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={tutorPhone}
                        onChange={(e) => setTutorPhone(e.target.value)}
                        placeholder="+34 612 345 678"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container focus:border-emerald-600 focus:bg-white text-xs sm:text-sm text-on-surface outline-none transition-all"
                      />
                    </div>

                    {/* Pet Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-emerald-950">
                        Nombre de tu Mascota *
                      </label>
                      <input
                        type="text"
                        required
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="Ej. Milo"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container focus:border-emerald-600 focus:bg-white text-xs sm:text-sm text-on-surface outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-emerald-950">
                        Correo Electrónico (opcional)
                      </label>
                      <input
                        type="email"
                        value={tutorEmail}
                        onChange={(e) => setTutorEmail(e.target.value)}
                        placeholder="tutor@ejemplo.com"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container focus:border-emerald-600 focus:bg-white text-xs sm:text-sm text-on-surface outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Consultation Motive & Chips */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-emerald-950">
                      Motivo de la Consulta o Síntomas (opcional)
                    </label>
                    <input
                      type="text"
                      value={consultReason}
                      onChange={(e) => setConsultReason(e.target.value)}
                      placeholder="Ej. Chequeo anual, cojea de la pata derecha, picor en orejas..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container focus:border-emerald-600 focus:bg-white text-xs sm:text-sm text-on-surface outline-none transition-all"
                    />

                    {/* Clickable Quick Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        Sugerencias rápidas:
                      </span>
                      {[
                        'Chequeo rutinario',
                        'Vacuna obligatoria',
                        'Problema digestivo',
                        'Revisión dental',
                        'Certificado de viaje',
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setConsultReason(chip)}
                          className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant hover:bg-emerald-100 hover:text-emerald-900 text-[11px] transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Confirm Button */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      className="min-h-[52px] w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[22px]">check_circle</span>
                      <span>Confirmar Cita Médica (Sin Pago Previo)</span>
                    </button>
                    <p className="text-[11px] text-center text-on-surface-variant">
                      🔒 No requerimos tarjeta de crédito para reservar. Puedes cancelar o
                      reprogramar sin penalización vía WhatsApp.
                    </p>
                  </div>
                </form>
              ) : (
                /* Success Confirmation State */
                <div className="p-6 rounded-3xl bg-gradient-to-b from-emerald-50 to-teal-50/50 border border-emerald-200 text-center flex flex-col items-center gap-3 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[32px]">task_alt</span>
                  </div>

                  <h4 className="font-display font-bold text-xl text-emerald-950">
                    ¡Cita Confirmada con Éxito!
                  </h4>
                  <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
                    Hemos reservado tu hora para <strong>{petName}</strong> el{' '}
                    <strong>
                      Jueves {selectedCalendarDay} de Octubre a las {selectedTimeSlot}
                    </strong>
                    . Te hemos enviado un WhatsApp con la confirmación y detalles de acceso.
                  </p>

                  <div className="p-3 rounded-2xl bg-white border border-emerald-200 text-xs font-mono text-emerald-900 font-bold tracking-wider">
                    Código de Cita: #{bookingCode}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Cita añadida a tu calendario en formato iCal / Google',
                          'calendar_add_on'
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                      <span>Agregar a Google Calendar</span>
                    </button>

                    <button
                      type="button"
                      onClick={resetBookingForm}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Agendar para otra mascota</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 4. Portal Clínico (Historial y Exámenes) con MODAL OTP */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">folder_shared</span>
              </span>
              <h2 className="font-display font-bold text-lg sm:text-xl text-emerald-950">
                Portal Clínico del Paciente
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5 ml-10">
              Consulta de forma segura y privada el historial sanitario, vacunas e informes de
              laboratorio
            </p>
          </div>

          {/* Dos Tarjetas (Cards) Visualmente Atractivas con Íconos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tarjeta 1: Descargar Historia Médica */}
            <div
              onClick={() => handleOpenOtp('historial')}
              className="group p-5 rounded-3xl bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

              <div className="relative z-10 flex flex-col gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">description</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-emerald-950 group-hover:text-emerald-700 transition-colors">
                    Descargar Historia Médica
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Accede a la cartilla digital completa, registro de vacunas aplicadas,
                    desparasitaciones, evolución clínica y diagnósticos en formato PDF oficial.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-2 border-t border-surface-container flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Verificación OTP con móvil</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </span>
              </div>
            </div>

            {/* Tarjeta 2: Consultar Resultados de Laboratorio */}
            <div
              onClick={() => handleOpenOtp('laboratorio')}
              className="group p-5 rounded-3xl bg-white border border-sky-100 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-sky-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

              <div className="relative z-10 flex flex-col gap-2">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">biotech</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-emerald-950 group-hover:text-sky-700 transition-colors">
                    Consultar Resultados de Laboratorio
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Consulta analíticas de sangre, bioquímicas, citologías cutáneas y estudios
                    radiográficos digitales PACS de alta resolución sin desplazarte a la clínica.
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-2 border-t border-surface-container flex items-center justify-between text-xs font-semibold text-sky-700">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Verificación OTP con móvil</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-sky-50 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Pie de página (Footer) con Horarios, Mapa y Urgencias */}
      <footer className="mt-12 bg-white border-t border-emerald-100 text-on-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Column 1: Info & Brand */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <VetLogo size={28} className="h-7 w-7 object-contain" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-emerald-950">
                    {currentTenant.name}
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Centro Hospitalario Veterinario
                  </p>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Comprometidos con el bienestar de perros, gatos y pequeñas especies. Cuidado con
                calidez, precisión médica y protocolos libres de estrés.
              </p>

              <div className="text-xs text-on-surface-variant font-mono">
                Reg. Sanitario Autonómico: N° VT-84920
              </div>
            </div>

            {/* Column 2: Horarios de Atención */}
            <div className="md:col-span-4 p-4 rounded-3xl bg-surface-container-low/70 border border-surface-container flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-950">
                <span className="material-symbols-outlined text-[20px] text-emerald-700">
                  access_time
                </span>
                <h4 className="font-display font-bold text-sm">Horarios de Atención</h4>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-surface-container/60">
                  <span className="text-on-surface-variant">Lunes a Viernes:</span>
                  <strong className="text-emerald-950">08:30 - 20:30 hrs</strong>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-surface-container/60">
                  <span className="text-on-surface-variant">Sábados y Domingos:</span>
                  <strong className="text-emerald-950">09:00 - 15:00 hrs</strong>
                </div>
                <div className="flex justify-between items-center pt-1 text-error font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                    Servicio de Urgencias:
                  </span>
                  <span>24 Horas / 365 Días</span>
                </div>
              </div>
            </div>

            {/* Column 3: Mapa Pequeño de Ubicación */}
            <div className="md:col-span-4 p-4 rounded-3xl bg-surface-container-low/70 border border-surface-container flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-emerald-950">
                <span className="material-symbols-outlined text-[20px] text-emerald-700">
                  pin_drop
                </span>
                <h4 className="font-display font-bold text-sm">Nuestra Ubicación</h4>
              </div>

              {/* Styled Mini Map Mockup */}
              <div className="w-full h-24 rounded-2xl bg-emerald-950/5 relative overflow-hidden border border-emerald-100 flex items-center justify-center bg-[radial-gradient(#00685f_1px,transparent_1px)] [background-size:14px_14px]">
                <div className="px-3 py-1.5 rounded-xl bg-white shadow-sm border border-emerald-200 text-xs font-medium text-emerald-950 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                    location_on
                  </span>
                  <span className="text-[11px] truncate max-w-[170px]">{currentSede.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${currentTenant.name} ${currentSede.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[34px] px-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">directions</span>
                  <span>Google Maps</span>
                </a>

                <a
                  href="tel:+34912345678"
                  className="min-h-[34px] px-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">call</span>
                  <span>Llamar Urgencia</span>
                </a>
              </div>
            </div>
          </div>

          {/* Legal and Rights */}
          <div className="pt-6 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-on-surface-variant">
            <p>© 2024 {currentTenant.name}. Plataforma de salud veterinaria VetCare OS.</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  showToast('Cumplimiento de RGPD Sanitario y Protección Animal', 'info')
                }
                className="hover:underline"
              >
                Privacidad de Datos
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => showToast('Consentimiento Médico Quirúrgico', 'info')}
                className="hover:underline"
              >
                Términos Clínicos
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 6. Botón Flotante de Chat Directo a WhatsApp */}
      <aside className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {showWhatsappTooltip && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white shadow-lg border border-emerald-200 text-emerald-950 text-xs animate-fade-in">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">pets</span>
            <span>¿Dudas sobre tu mascota? ¡Escríbenos!</span>
            <button
              type="button"
              onClick={() => setShowWhatsappTooltip(false)}
              className="text-on-surface-variant hover:text-on-surface ml-1"
            >
              ×
            </button>
          </div>
        )}

        <a
          href="https://wa.me/34612345678?text=Hola,%20deseo%20consultar%20sobre%20mi%20mascota"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat directo por WhatsApp"
          className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-108 active:scale-95 transition-all relative group cursor-pointer"
        >
          <span className="material-symbols-outlined text-[30px]">chat</span>
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-white ring-2 ring-[#25D366] flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          </span>
        </a>
      </aside>

      {/* Modal de Seguridad OTP para Historia Médica y Laboratorio */}
      <ClientOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        initialAction={otpModalAction}
      />
    </div>
  );
};
