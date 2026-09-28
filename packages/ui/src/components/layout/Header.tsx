import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { VetLogo } from '../common/VetLogo';

export const Header: React.FC = () => {
  const { currentTenant, currentSede, setIsDrawerOpen, userRole, setUserRole, showToast } =
    useTenant();

  return (
    <header className={`fixed top-0 inset-x-0 z-30 bg-surface-container-lowest/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container/80 transition-all ${
      userRole === 'clinical_staff' ? 'lg:pl-64 xl:pl-72' : ''
    }`}>
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3 w-full">
        {/* Left: Mobile Menu Trigger & Brand Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            aria-label="Abrir menú de navegación"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container transition-colors shrink-0 lg:hidden"
            onClick={() => setIsDrawerOpen(true)}
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div
            className="flex items-center gap-2 cursor-pointer lg:hidden"
            onClick={() => setIsDrawerOpen(true)}
          >
            <VetLogo size={32} className="h-8 w-8 object-contain shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-display font-semibold text-sm sm:text-base text-on-surface truncate leading-tight">
                {currentTenant.name}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-wider text-primary uppercase truncate font-mono">
                  {currentSede.name}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search / Quick Status in Header */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {currentTenant.name} · <strong className="text-on-surface font-bold">{currentSede.name}</strong>
            </span>
            <span className="text-outline-variant">|</span>
            <span className="text-xs text-on-surface-variant font-mono">
              EMR Clínico Central
            </span>
          </div>
        </div>

        {/* Right: Role Switcher & Notifications & Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Multi-role persona toggle (EMR vs Tutor Portal) */}
          <button
            onClick={() => {
              const nextRole = userRole === 'clinical_staff' ? 'tutor_portal' : 'clinical_staff';
              setUserRole(nextRole);
              showToast(
                nextRole === 'tutor_portal'
                  ? 'Cambiado a Modo Tutor / Paciente'
                  : 'Cambiado a Modo Clínico EMR',
                nextRole === 'tutor_portal' ? 'pets' : 'stethoscope'
              );
            }}
            title="Alternar entre interfaz clínica y portal de tutor"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-primary transition-all active:scale-95 border border-surface-container"
          >
            <span className="material-symbols-outlined text-[16px]">
              {userRole === 'clinical_staff' ? 'switch_account' : 'medical_services'}
            </span>
            <span>{userRole === 'clinical_staff' ? 'Portal Tutor' : 'Modo Clínico'}</span>
          </button>

          {/* Notifications button */}
          <button
            aria-label="Notificaciones clínicas"
            className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors relative"
            onClick={() => showToast('Sin alertas críticas pendientes en guardia', 'notifications')}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-white"></span>
          </button>

          {/* Clinician Avatar */}
          <div
            className="flex items-center gap-2 cursor-pointer pl-1"
            onClick={() => setIsDrawerOpen(true)}
            title="Perfil del Doctor"
          >
            <img
              alt="Dra. Elena Mendoza"
              className="w-8 h-8 rounded-full object-cover shadow-2xs ring-1 ring-outline-variant/30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPdF3OITlUtL05AGmUCvKXbstlVZXU0I5buNBHEXZ2dceiCljuOnUm7HQMXZimOIOJh-tk6G1G3YNdKUUhXL9JaVsDHrZwb1Dwjak3imJ9s-b_d6EojxnmRB-ufEj0TS3g_gCKUiI7egNnF49r6AF2o3s_RIlolIdyYwe0rwQA1JNcFaKxygy597EIx0kJ_axmhoju7-HiT2it0wdxCsBTHI9kMTFvHRczuQp5RvKgmvB3mWj6sTG5"
            />
            <span className="hidden md:inline text-xs font-semibold text-on-surface">
              Dra. Mendoza
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
