import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { VetLogo } from '../common/VetLogo';

export const ClinicalDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    tenants,
    currentTenant,
    setTenantId,
    currentSede,
    setSedeId,
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    showToast,
  } = useTenant();

  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [showSedeSelector, setShowSedeSelector] = useState(false);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop Scrim */}
      <div
        className="fixed inset-0 bg-inverse-surface/40 z-50 transition-opacity duration-300 backdrop-blur-xs"
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-surface-container-lowest z-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between pt-safe pb-safe overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Panel de navegación clínica"
      >
        <div className="flex flex-col p-4 sm:p-5">
          {/* Top Brand & Close */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-container/60">
            <div className="flex items-center gap-2">
              <VetLogo size={32} className="h-8 w-8 object-contain" />
              <div>
                <span className="font-display font-bold text-base text-on-surface block leading-tight">
                  VetCare OS
                </span>
                <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                  Enterprise EMR
                </span>
              </div>
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Cerrar menú"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Multi-Tenant Switcher */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-1">
              <span>Organización / Tenant</span>
              <button
                onClick={() => setShowTenantSelector(!showTenantSelector)}
                className="text-primary hover:underline text-[11px]"
              >
                {showTenantSelector ? 'Ocultar' : 'Cambiar'}
              </button>
            </div>

            {showTenantSelector ? (
              <div className="p-2 bg-surface-container-low rounded-xl flex flex-col gap-1 border border-primary/20">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTenantId(t.id);
                      setSedeId(t.sedes[0].id);
                      setShowTenantSelector(false);
                      showToast(`Organización cambiada a: ${t.name}`, 'domain');
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      t.id === currentTenant.id
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span className="text-[10px] opacity-80">{t.sedes.length} sedes</span>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Sede Seleccionada Card & Dropdown */}
            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex flex-col gap-2">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowSedeSelector(!showSedeSelector)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">domain</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      Sede seleccionada
                    </p>
                    <p className="font-display font-semibold text-sm text-on-surface truncate">
                      {currentSede.name}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[20px]">
                  {showSedeSelector ? 'expand_less' : 'unfold_more'}
                </span>
              </div>

              {/* Sede Options List */}
              {showSedeSelector && (
                <div className="pt-2 border-t border-outline-variant/30 flex flex-col gap-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
                    Sedes de {currentTenant.name}
                  </p>
                  {currentTenant.sedes.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSedeId(s.id);
                        setShowSedeSelector(false);
                        showToast(`Sede activa: ${s.name}`, 'local_hospital');
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        s.id === currentSede.id
                          ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                          : 'text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{s.name}</span>
                        <span className="text-[10px] opacity-75">{s.address}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface shrink-0">
                        {s.tag}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mt-5">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-2 mb-1">
              Módulos Médicos
            </p>

            <button
              onClick={() => {
                setActiveTab('inicio');
                setIsDrawerOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                activeTab === 'inicio'
                  ? 'bg-primary-fixed/40 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="text-sm">Inicio (Dashboard)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('pacientes');
                setIsDrawerOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left ${
                activeTab === 'pacientes' || activeTab === 'expediente'
                  ? 'bg-primary-fixed/40 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">pets</span>
                <span className="text-sm">Directorio de Pacientes</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container font-semibold">
                1,420
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('agenda');
                setIsDrawerOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-left ${
                activeTab === 'agenda'
                  ? 'bg-primary-fixed/40 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                <span className="text-sm">Calendario Médico</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
            </button>

            <button
              onClick={() => {
                setActiveTab('servicios');
                setIsDrawerOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                activeTab === 'servicios'
                  ? 'bg-primary-fixed/40 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">medical_services</span>
              <span className="text-sm">Catálogo & Bot WhatsApp</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('ajustes');
                setIsDrawerOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                activeTab === 'ajustes'
                  ? 'bg-primary-fixed/40 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="text-sm">Configuración y Sedes</span>
            </button>
          </nav>

          {/* Quick Persona Mode Switch */}
          <div className="mt-5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
              Vista del Sistema
            </span>
            <div className="grid grid-cols-2 gap-1.5 bg-surface-container p-1 rounded-lg">
              <button
                onClick={() => {
                  setUserRole('clinical_staff');
                  showToast('Modo Clínico EMR activo', 'stethoscope');
                }}
                className={`py-1 px-2 rounded-md text-xs font-semibold transition-all ${
                  userRole === 'clinical_staff'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Clínica EMR
              </button>
              <button
                onClick={() => {
                  setUserRole('tutor_portal');
                  showToast('Modo Portal Tutor activo', 'pets');
                }}
                className={`py-1 px-2 rounded-md text-xs font-semibold transition-all ${
                  userRole === 'tutor_portal'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Portal Tutor
              </button>
            </div>
          </div>
        </div>

        {/* Clinician Profile Footer */}
        <div className="p-4 bg-surface-container-low/70 border-t border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              alt="Dr. Alejandro Ramos"
              className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0 ring-1 ring-outline-variant/40"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbWqH8b-Tw4zwoJNsUSEZhlqRo0kYTZVSvBSaBsRZeAY4nhhDvT7f6E9TTHTDtsJeeeiLcp-aj-iiOBe9KBsQCfcAd1Sp9hOxlNDQYFXC5FkJfJ7HDNKnldc8rsuBCdRI_1xXhkA7fm5i7t9kO1jxr_5vQvMuXKRT2kQhLvcDY4vblYy-C_sUEuWbUa33jp-YIM_7XBVWHL-x5xTdZMZRb2v_9VrY98h1vSbn6SjHN-X-fdaXVp3qY"
            />
            <div className="min-w-0">
              <p className="font-semibold text-xs text-on-surface truncate">
                Dr. Alejandro Ramos
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">
                Cirujano Veterinario Principal
              </p>
            </div>
          </div>
          <button
            onClick={() => showToast('Sesión de guardia activa sincronizada', 'lock')}
            className="w-9 h-9 flex items-center justify-center text-outline hover:text-error transition-colors rounded-lg hover:bg-surface-container"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
