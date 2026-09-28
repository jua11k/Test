import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { ClientRecord } from '../../types';

interface ClientOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: 'historial' | 'laboratorio' | 'login';
}

export const ClientOtpModal: React.FC<ClientOtpModalProps> = ({
  isOpen,
  onClose,
  initialAction = 'historial',
}) => {
  const { clients, showToast, setActiveTab } = useTenant();

  const [activeTab, setActiveTabLocal] = useState<'historial' | 'laboratorio'>('historial');
  const [step, setStep] = useState<'identify' | 'otp' | 'results'>('identify');
  const [identifier, setIdentifier] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [countdown, setCountdown] = useState(45);
  const [matchedClient, setMatchedClient] = useState<ClientRecord | null>(null);
  const [viewingDicom, setViewingDicom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('identify');
      setOtpDigits(['', '', '', '']);
      setCountdown(45);
      setViewingDicom(false);
      if (initialAction === 'laboratorio') {
        setActiveTabLocal('laboratorio');
      } else {
        setActiveTabLocal('historial');
      }
    }
  }, [isOpen, initialAction]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Search client in database
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      showToast('Por favor ingresa tu DNI o número de teléfono', 'warning', 'warning');
      return;
    }

    // Match with existing mock clients or use default client-1
    const found = clients.find(
      (c) =>
        c.phone.replace(/\s+/g, '').includes(cleanId.replace(/\s+/g, '')) ||
        (c.dni && c.dni.toLowerCase().replace(/-/g, '') === cleanId.replace(/-/g, '')) ||
        c.name.toLowerCase().includes(cleanId)
    );

    const clientToUse = found || clients[0]; // fallback to first client (Carlos Morales - Max)
    setMatchedClient(clientToUse);
    setStep('otp');
    setCountdown(45);
    showToast(
      `Código de seguridad enviado por ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} a ${
        clientToUse.phone
      }`,
      'sms'
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length < 4) {
      showToast('Ingresa el código completo de 4 dígitos', 'warning', 'warning');
      return;
    }

    setStep('results');
    showToast('¡Identidad validada con éxito! Expediente desbloqueado', 'verified_user');
  };

  const fillDemoClient = (phone: string, dni: string) => {
    setIdentifier(phone);
    const found = clients.find((c) => c.phone.includes(phone) || (c.dni && c.dni.includes(dni)));
    if (found) {
      setMatchedClient(found);
    }
  };

  const fillDemoOtp = () => {
    setOtpDigits(['4', '8', '9', '2']);
  };

  const handleDigitChange = (index: number, value: string) => {
    const val = value.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    // Auto-advance focus to next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const activePet = matchedClient?.pets[0] || {
    id: 'patient-max',
    name: 'Max',
    species: 'canino',
    breed: 'Golden Retriever',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ12UwB0nvDxhygfsgTOWKr_GE32va2lyrE_4mefr4cpwjy0CIn14MHczhmet_P44VqW0pzIrN4pi_I4WmbUs-gIMye69PY4hQPYv6DpKgy1trPjboUnxqCNDwfVuaIzXRDTTPpAvj_Cyc57K8jBHn8I_NukozhPjprwwonD97WaaFgtDCpx9z5k24pD_pKzNqwZR6fRcxgXibBbW19tp3xhEXtU1W6N5sSCZMeuRjRKo355iqckwm',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl border border-surface-container overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {activeTab === 'historial' ? 'description' : 'biotech'}
              </span>
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-on-surface">
                {activeTab === 'historial' ? 'Historia Médica Oficial' : 'Resultados de Laboratorio'}
              </h3>
              <p className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
                Portal Seguro de Clientes · Verificación OTP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
            type="button"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col">
          {/* STEP 1: Identification Form */}
          {step === 'identify' && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-surface-container flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
                  security
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Para proteger los datos de salud de tu mascota, introduce tu{' '}
                  <strong className="text-on-surface font-semibold">DNI/Cédula</strong> o{' '}
                  <strong className="text-on-surface font-semibold">número de móvil</strong>{' '}
                  registrado en la clínica. Te enviaremos un código de seguridad.
                </p>
              </div>

              {/* Selector Tabs if user wants to switch between Historial or Lab */}
              <div className="flex rounded-xl bg-surface-container p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTabLocal('historial')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'historial'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span>Historia Médica</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabLocal('laboratorio')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'laboratorio'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">biotech</span>
                  <span>Exámenes & Lab</span>
                </button>
              </div>

              {/* Input Identifier */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>DNI / Cédula o Teléfono Móvil *</span>
                  <span className="text-[11px] text-primary font-normal">Identificación tutor</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[18px]">
                    badge
                  </span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ej. 612 345 678 o 47182940-K"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container-low border border-surface-container focus:border-primary focus:bg-surface-container-lowest text-xs sm:text-sm text-on-surface outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Canal de Envío */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-on-surface">
                  Canal para recibir el código:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      channel === 'whatsapp'
                        ? 'border-[#25D366] bg-[#25D366]/10 text-emerald-800 ring-1 ring-[#25D366]'
                        : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#25D366]">
                      chat
                    </span>
                    <span>Vía WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      channel === 'sms'
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                        : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">sms</span>
                    <span>Mensaje SMS</span>
                  </button>
                </div>
              </div>

              {/* Demo 1-Click Suggestions */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-500">
                    touch_app
                  </span>
                  Atajos rápidos para probar la demo:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoClient('612 345 678', '47182940-K')}
                    className="px-2.5 py-1 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high text-[11px] font-medium border border-surface-container/60 transition-colors"
                  >
                    🐶 Carlos Morales (Max) · 612 345 678
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoClient('654 987 321', '38491029-A')}
                    className="px-2.5 py-1 rounded-xl bg-surface-container text-primary hover:bg-surface-container-high text-[11px] font-medium border border-surface-container/60 transition-colors"
                  >
                    🐱 Lucía Navarro (Simba)
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="mt-2 min-h-[46px] w-full rounded-2xl bg-primary text-on-primary font-display font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-primary-container active:scale-[0.99] transition-all"
              >
                <span>Enviar Código de Seguridad OTP</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          )}

          {/* STEP 2: OTP Entry Form */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="text-center flex flex-col items-center gap-1 py-1">
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-1">
                  <span className="material-symbols-outlined text-[26px]">sms</span>
                </div>
                <h4 className="font-display font-bold text-base text-on-surface">
                  Introduce el código de 4 dígitos
                </h4>
                <p className="text-xs text-on-surface-variant max-w-xs">
                  Te hemos enviado un código de verificación vía{' '}
                  <strong className="text-on-surface font-semibold">
                    {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                  </strong>{' '}
                  al número vinculado a{' '}
                  <span className="font-semibold text-on-surface">
                    {matchedClient?.name || 'tu cuenta'}
                  </span>
                  .
                </p>
              </div>

              {/* OTP 4-Boxes */}
              <div className="flex justify-center items-center gap-3 my-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    className="w-13 h-14 rounded-2xl bg-surface-container-low border-2 border-surface-container focus:border-primary text-center font-display font-bold text-xl text-on-surface outline-none transition-all shadow-xs"
                  />
                ))}
              </div>

              {/* Demo Button to auto-fill OTP */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={fillDemoOtp}
                  className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">magic_button</span>
                  <span>Rellenar código demo: 4892</span>
                </button>
              </div>

              {/* Resend Timer */}
              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setStep('identify')}
                  className="text-primary hover:underline flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                  <span>Cambiar número</span>
                </button>

                {countdown > 0 ? (
                  <span className="text-on-surface-variant">Reenviar en {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCountdown(45);
                      showToast('Nuevo código OTP reenviado con éxito', 'refresh');
                    }}
                    className="text-primary font-bold hover:underline"
                  >
                    Reenviar código
                  </button>
                )}
              </div>

              {/* Submit OTP */}
              <button
                type="submit"
                className="min-h-[46px] w-full rounded-2xl bg-primary text-on-primary font-display font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-primary-container active:scale-[0.99] transition-all"
              >
                <span>Validar y Desbloquear Expediente</span>
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </button>
            </form>
          )}

          {/* STEP 3: Unlocked Results & Downloads */}
          {step === 'results' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Pet Welcome Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-3">
                <img
                  src={activePet.photoUrl}
                  alt={activePet.name}
                  className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-300 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-on-surface">
                      {activePet.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      Verificado
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">
                    Tutor: {matchedClient?.name || 'Carlos Morales'} · {activePet.breed}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-mono mt-0.5">
                    Microchip: 982000341892019 · Paciente Activo
                  </p>
                </div>
              </div>

              {/* Sub-tabs inside results */}
              <div className="flex rounded-xl bg-surface-container p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTabLocal('historial')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'historial'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  <span>Historia Médica (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabLocal('laboratorio')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'laboratorio'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">biotech</span>
                  <span>Resultados de Lab & Rayos X</span>
                </button>
              </div>

              {/* TAB 1: Medical Record View & Download */}
              {activeTab === 'historial' && (
                <div className="flex flex-col gap-3">
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          shield_with_heart
                        </span>
                        Vacunaciones y Desparasitaciones al Día
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Al día
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container">
                        <p className="text-[11px] text-on-surface-variant">Última Vacuna:</p>
                        <p className="font-semibold text-on-surface">DHPPi + Rabia</p>
                        <p className="text-[10px] text-primary">Válida hasta Sep 2025</p>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-container">
                        <p className="text-[11px] text-on-surface-variant">Desparasitación:</p>
                        <p className="font-semibold text-on-surface">Milbemax Interna</p>
                        <p className="text-[10px] text-primary">Próxima: Nov 2024</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary of last consultation */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-on-surface">
                        Última Consulta Médica
                      </span>
                      <span className="text-[11px] text-on-surface-variant">24 Oct 2024</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      <strong>Diagnóstico:</strong> Evolución favorable post-operatoria articular.
                      Sin inflamación ni claudicación. Constantes estables: Tª 38.6°C, FC 102 lpm.
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      Médico veterinario: <strong>Dra. Elena Mendoza</strong> (Col. 2841)
                    </p>
                  </div>

                  {/* Download Action Buttons */}
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setActiveTab('expediente');
                        showToast(
                          'Abriendo Informe Sanitario Oficial listo para imprimir',
                          'description'
                        );
                      }}
                      className="min-h-[44px] w-full rounded-2xl bg-primary text-on-primary font-display font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-primary-container transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      <span>Descargar Historia Médica Oficial (PDF)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Copia enviada por WhatsApp al número del tutor registrado',
                          'chat'
                        )
                      }
                      className="min-h-[40px] w-full rounded-2xl bg-surface-container text-primary font-semibold text-xs flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#25D366]">
                        chat
                      </span>
                      <span>Enviar copia a mi WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Laboratory & Radiology Tests */}
              {activeTab === 'laboratorio' && (
                <div className="flex flex-col gap-3">
                  {/* Test 1 */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">bloodtype</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-xs sm:text-sm text-on-surface">
                            Hemograma & Bioquímica Sanguínea
                          </h5>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                            Normal
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          24 Oct 2024 · Glucosa 94 mg/dL · ALT 32 U/L · Creatinina 1.1 mg/dL
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          'Descargando informe analítico ID-LAB9824 en PDF...',
                          'download'
                        )
                      }
                      className="min-h-[32px] px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>PDF</span>
                    </button>
                  </div>

                  {/* Test 2 */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">radiology</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-xs sm:text-sm text-on-surface">
                            Radiografía Digital Tórax y Codos
                          </h5>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-800">
                            Digital
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          24 Oct 2024 · 2 proyecciones PACS · Sin hallazgos osteolíticos
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingDicom(!viewingDicom)}
                      className="min-h-[32px] px-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>{viewingDicom ? 'Ocultar' : 'Ver Placa'}</span>
                    </button>
                  </div>

                  {/* Visualizer when clicked */}
                  {viewingDicom && (
                    <div className="p-3 rounded-2xl bg-black text-white flex flex-col gap-2 animate-fade-in">
                      <div className="flex items-center justify-between text-xs text-white/80">
                        <span>Visor Radiográfico Digital PACS</span>
                        <span className="font-mono text-[10px]">Paciente: Max · 24/10/2024</span>
                      </div>
                      <div className="relative rounded-xl overflow-hidden h-40 bg-zinc-900 flex items-center justify-center">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzUolJQavzlTfX29b6VoEed0W3iHtnmJMu59C31dphQViUqAwA_2HMN8FOD4kf7kntlduM7u7TUztbfnGoJmP0HqVNQVTw20_n9JjkM49S1CTC2XELnfYpIxE5mNlBTUiDUOU6LRCiHDKGwsJg0RJ8iBFJrnbRXX50kiwcU7yrtQNTGy-sUpuhl3ZyhShdBfl3fMCBZ4VFuPaeUXySd7fkkCd7g9pdb7JEpP1qytSfPHaKuEuyK1Rg"
                          alt="Radiografía digital canina"
                          className="w-full h-full object-cover grayscale contrast-125"
                        />
                        <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white">
                          Proyección Latero-Lateral · Calidad Diagnóstica
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test 3 */}
                  <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">microbiology</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-xs sm:text-sm text-on-surface">
                            Coprología y Citología Cutánea
                          </h5>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                            Negativo
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          15 Oct 2024 · Negativo a parásitos y blastocistos
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        showToast('Descargando informe citológico en PDF...', 'download')
                      }
                      className="min-h-[32px] px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-semibold text-xs flex items-center gap-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>PDF</span>
                    </button>
                  </div>

                  {/* Complete pack download */}
                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        'Descargando paquete comprimido con todas las analíticas',
                        'folder_zip'
                      )
                    }
                    className="mt-1 min-h-[44px] w-full rounded-2xl bg-secondary text-on-secondary font-display font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-secondary/90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">folder_zip</span>
                    <span>Descargar Todos los Resultados (Pack PDF)</span>
                  </button>
                </div>
              )}

              {/* Bottom close / back button */}
              <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('identify')}
                  className="text-xs text-on-surface-variant hover:text-on-surface"
                >
                  Consultar otra mascota
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-semibold text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
