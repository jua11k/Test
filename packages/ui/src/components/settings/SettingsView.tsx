import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';

export const SettingsView: React.FC = () => {
  const {
    currentTenant,
    currentSede,
    setSedeId,
    userRole,
    setUserRole,
    showToast,
  } = useTenant();

  const [clinicName, setClinicName] = useState(currentTenant.name);
  const [taxId, setTaxId] = useState(currentTenant.taxId);
  const [phone, setPhone] = useState(currentSede.phone);
  const [address, setAddress] = useState(currentSede.address);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Configuración del centro veterinario guardada', 'check_circle');
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 py-4 space-y-4 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-surface-container">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-on-surface">
            Configuración del Sistema EMR
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Gestión multi-tenant, sedes hospitalarias y pasarelas de comunicación
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold font-mono">
          v4.2 EMR
        </span>
      </div>

      {/* Tenant / Organization Card */}
      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-xs border border-surface-container flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">domain</span>
          <h2 className="font-display font-bold text-base text-on-surface">
            Datos de la Organización (Tenant)
          </h2>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Nombre Comercial</label>
            <input
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="p-2.5 rounded-lg bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">NIF / CIF Sanitario</label>
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="p-2.5 rounded-lg bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container font-mono"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Teléfono Sede Activa</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="p-2.5 rounded-lg bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Dirección Principal</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="p-2.5 rounded-lg bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>

      {/* Sedes / Branches Matrix */}
      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-xs border border-surface-container flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">local_hospital</span>
            <h2 className="font-display font-bold text-base text-on-surface">
              Sedes Clínicas Registradas
            </h2>
          </div>
          <button
            onClick={() => showToast('Apertura de formulario de nueva sede', 'add_business')}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Nueva Sede
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {currentTenant.sedes.map((s) => (
            <div
              key={s.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                s.id === currentSede.id
                  ? 'bg-primary-fixed/20 border-primary'
                  : 'bg-surface-container-low border-surface-container'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    s.id === currentSede.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">domain</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-on-surface truncate">
                      {s.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                      {s.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {s.address} • {s.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {s.id === currentSede.id ? (
                  <span className="text-[11px] text-primary font-bold px-2 py-0.5 rounded-full bg-primary-fixed">
                    Sede Activa
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setSedeId(s.id);
                      showToast(`Sede cambiada a: ${s.name}`, 'sync');
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-medium"
                  >
                    Activar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Integrations Card */}
      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-xs border border-surface-container flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">hub</span>
          <h2 className="font-display font-bold text-base text-on-surface">
            Estado de Integraciones & Pasarelas
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">chat</span>
              <div>
                <span className="text-xs font-bold text-on-surface block">Meta WhatsApp Cloud</span>
                <span className="text-[10px] text-on-surface-variant">Webhook Activo • 99.9% uptime</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-blue-600 text-[20px]">sms</span>
              <div>
                <span className="text-xs font-bold text-on-surface block">Twilio SMS Gateway</span>
                <span className="text-[10px] text-on-surface-variant">Ruta Europea Enrutada</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px]">radiology</span>
              <div>
                <span className="text-xs font-bold text-on-surface block">Servidor DICOM PACS</span>
                <span className="text-[10px] text-on-surface-variant">Imágenes Rx y Ecografía</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">biotech</span>
              <div>
                <span className="text-xs font-bold text-on-surface block">Analizador Lab In-House</span>
                <span className="text-[10px] text-on-surface-variant">Sincronización RS232 / TCP</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </div>

      {/* Role Switcher in Settings */}
      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl shadow-xs border border-surface-container flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-on-surface block">Modo de Visualización</span>
          <span className="text-[11px] text-on-surface-variant">
            Alterna entre el entorno clínico para veterinarios y el portal de cara al tutor
          </span>
        </div>
        <button
          onClick={() => {
            const next = userRole === 'clinical_staff' ? 'tutor_portal' : 'clinical_staff';
            setUserRole(next);
            showToast(
              next === 'tutor_portal' ? 'Modo Tutor activado' : 'Modo EMR Clínico activado',
              'switch_account'
            );
          }}
          className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold shadow-xs shrink-0"
        >
          {userRole === 'clinical_staff' ? 'Ver Portal Tutor' : 'Ver EMR Clínico'}
        </button>
      </div>
    </div>
  );
};
