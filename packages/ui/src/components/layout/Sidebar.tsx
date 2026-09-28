import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { VetLogo } from '../common/VetLogo';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const {
    activeTab,
    setActiveTab,
    currentTenant,
    currentSede,
    setSedeId,
    setIsAppointmentModalOpen,
    userRole,
    setUserRole,
    showToast,
  } = useTenant();

  const navItems = [
    {
      id: 'inicio' as const,
      label: 'Inicio',
      icon: 'dashboard',
      description: 'Panel operativo y KPIs',
    },
    {
      id: 'pacientes' as const,
      label: 'Pacientes',
      icon: 'pets',
      description: 'Directorio y expedientes',
      badge: '1,420',
    },
    {
      id: 'agenda' as const,
      label: 'Calendario Médico',
      icon: 'calendar_month',
      description: 'Turnos y quirófano',
    },
    {
      id: 'servicios' as const,
      label: 'Catálogo de Servicios',
      icon: 'medical_services',
      description: 'Tarifario y bot recordatorios',
    },
    {
      id: 'portal' as const,
      label: 'Portal del Cliente',
      icon: 'public',
      description: 'Página web pública y citas',
      badge: 'Público',
    },
    {
      id: 'ajustes' as const,
      label: 'Configuración',
      icon: 'settings',
      description: 'Sedes y parámetros',
    },
  ];

  return (
    <aside
      className={`bg-surface-container-lowest border-r border-surface-container/80 flex flex-col justify-between select-none shadow-[1px_0_10px_rgba(11,28,48,0.02)] transition-all ${className}`}
      aria-label="Barra lateral de navegación clínica"
    >
      {/* Top Header & Clinic Brand Identity */}
      <div className="flex flex-col">
        {/* Brand Lockup */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-surface-container/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <VetLogo size={34} className="h-8.5 w-8.5 object-contain shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-[15px] text-on-surface leading-tight truncate">
                {currentTenant.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse"></span>
                <span className="text-[10px] font-bold text-primary tracking-wider uppercase font-mono truncate">
                  {currentSede.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sede / Branch Switcher Card */}
        <div className="p-3 mx-3 my-3 bg-surface-container-low/70 rounded-xl border border-surface-container/70 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Sede Activa EMR
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
              {currentSede.tag}
            </span>
          </div>
          <select
            value={currentSede.id}
            onChange={(e) => {
              setSedeId(e.target.value);
              showToast('Sede clínica cambiada', 'local_hospital');
            }}
            className="w-full bg-surface-container-lowest text-xs font-semibold text-on-surface px-2.5 py-1.5 rounded-lg border border-surface-container outline-none focus:border-primary cursor-pointer transition-colors"
          >
            {currentTenant.sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant px-0.5 pt-0.5">
            <span className="truncate">{currentSede.address}</span>
            <span className="text-primary font-semibold shrink-0">
              {currentSede.occupiedBeds}/{currentSede.totalBeds} camas
            </span>
          </div>
        </div>

        {/* Quick CTA inside Sidebar */}
        <div className="px-3 pb-3">
          <button
            onClick={() => setIsAppointmentModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary py-2.5 px-3 rounded-xl shadow-xs active:scale-[0.98] transition-all text-xs font-semibold"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Nueva Consulta</span>
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex flex-col gap-1 px-3" aria-label="Navegación principal">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 py-1">
            Módulos Médicos
          </p>

          {navItems.map((item) => {
            const isActive =
              activeTab === item.id || (item.id === 'pacientes' && activeTab === 'expediente');

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-on-primary' : 'text-primary'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm leading-tight truncate font-medium">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] truncate ${
                        isActive ? 'text-on-primary/80' : 'text-outline'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge ? (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-on-primary'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Clinician Profile & Multi-Role Action */}
      <div className="p-3 border-t border-surface-container/70 flex flex-col gap-2 bg-surface-container-low/30">
        {/* Role toggle button */}
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-on-surface-variant">
          <span className="font-medium">Modo de acceso:</span>
          <button
            onClick={() => {
              const nextRole = userRole === 'clinical_staff' ? 'tutor_portal' : 'clinical_staff';
              setUserRole(nextRole);
              showToast(
                nextRole === 'tutor_portal' ? 'Vista Portal Tutor' : 'Vista Clínica EMR',
                'sync'
              );
            }}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            {userRole === 'clinical_staff' ? 'Ver Portal Tutor' : 'Ver EMR'}
          </button>
        </div>

        {/* Clinician Card */}
        <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                alt="Dra. Elena Mendoza"
                className="w-9 h-9 rounded-full object-cover ring-1 ring-outline-variant/30"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPdF3OITlUtL05AGmUCvKXbstlVZXU0I5buNBHEXZ2dceiCljuOnUm7HQMXZimOIOJh-tk6G1G3YNdKUUhXL9JaVsDHrZwb1Dwjak3imJ9s-b_d6EojxnmRB-ufEj0TS3g_gCKUiI7egNnF49r6AF2o3s_RIlolIdyYwe0rwQA1JNcFaKxygy597EIx0kJ_axmhoju7-HiT2it0wdxCsBTHI9kMTFvHRczuQp5RvKgmvB3mWj6sTG5"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-xs text-on-surface truncate">Dra. Elena Mendoza</p>
              <p className="text-[10px] text-on-surface-variant truncate">Cirugía & Traumatología</p>
            </div>
          </div>

          <button
            onClick={() => showToast('Sesión médica de guardia sincronizada', 'lock')}
            title="Cerrar sesión"
            className="w-7 h-7 flex items-center justify-center text-outline hover:text-error hover:bg-surface-container rounded-lg transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
