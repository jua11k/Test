import React from 'react';
import { useTenant } from '../../context/TenantContext';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, userRole } = useTenant();

  if (userRole === 'tutor_portal') {
    return (
      <nav
        aria-label="Navegación del tutor"
        className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.06)] border-t border-surface-container"
      >
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              activeTab === 'inicio' ? 'text-primary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                activeTab === 'inicio' ? 'fill-1 text-primary' : ''
              }`}
            >
              home
            </span>
            <span className="text-[11px] font-medium mt-0.5">Inicio</span>
          </button>

          <button
            onClick={() => setActiveTab('servicios')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              activeTab === 'servicios' ? 'text-primary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                activeTab === 'servicios' ? 'fill-1 text-primary' : ''
              }`}
            >
              medical_services
            </span>
            <span className="text-[11px] font-medium mt-0.5">Servicios</span>
          </button>

          <button
            onClick={() => setActiveTab('expediente')}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              activeTab === 'expediente' ? 'text-primary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                activeTab === 'expediente' ? 'fill-1 text-primary' : ''
              }`}
            >
              pets
            </span>
            <span className="text-[11px] font-medium mt-0.5">Mi Mascota</span>
          </button>

          <a
            href="tel:+34912345678"
            className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[22px] animate-pulse">
              emergency
            </span>
            <span className="text-[11px] font-bold mt-0.5">Urgencias</span>
          </a>
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Navegación clínica EMR"
      className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.06)] border-t border-surface-container"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {/* Inicio */}
        <button
          onClick={() => setActiveTab('inicio')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'inicio' ? 'text-primary font-semibold' : 'text-on-surface-variant'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${
              activeTab === 'inicio' ? 'fill-1 text-primary' : ''
            }`}
          >
            dashboard
          </span>
          <span className="text-[11px] font-medium mt-0.5">Inicio</span>
        </button>

        {/* Pacientes */}
        <button
          onClick={() => setActiveTab('pacientes')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'pacientes' || activeTab === 'expediente'
              ? 'text-primary font-semibold'
              : 'text-on-surface-variant'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${
              activeTab === 'pacientes' || activeTab === 'expediente'
                ? 'fill-1 text-primary'
                : ''
            }`}
          >
            pets
          </span>
          <span className="text-[11px] font-medium mt-0.5">Pacientes</span>
        </button>

        {/* Agenda */}
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'agenda' ? 'text-primary font-semibold' : 'text-on-surface-variant'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${
              activeTab === 'agenda' ? 'fill-1 text-primary' : ''
            }`}
          >
            calendar_month
          </span>
          <span className="text-[11px] font-medium mt-0.5">Agenda</span>
        </button>

        {/* Servicios */}
        <button
          onClick={() => setActiveTab('servicios')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'servicios' ? 'text-primary font-semibold' : 'text-on-surface-variant'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${
              activeTab === 'servicios' ? 'fill-1 text-primary' : ''
            }`}
          >
            medical_services
          </span>
          <span className="text-[11px] font-medium mt-0.5">Servicios</span>
        </button>

        {/* Ajustes */}
        <button
          onClick={() => setActiveTab('ajustes')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'ajustes' ? 'text-primary font-semibold' : 'text-on-surface-variant'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[24px] ${
              activeTab === 'ajustes' ? 'fill-1 text-primary' : ''
            }`}
          >
            settings
          </span>
          <span className="text-[11px] font-medium mt-0.5">Ajustes</span>
        </button>
      </div>
    </nav>
  );
};
