import React, { useState, useMemo } from 'react';
import { useTenant } from '../../context/TenantContext';
import { ServiceCatalogItem, ServiceCategory } from '../../types';

export const CatalogView: React.FC = () => {
  const {
    services,
    addServiceItem,
    updateServiceItem,
    deleteServiceItem,
    reminderRules,
    toggleReminderRule,
    reminderTemplate,
    updateReminderTemplate,
    currentTenant,
    currentSede,
    showToast,
  } = useTenant();

  // Active Section Navigation: 'catalog' | 'reminders' | 'all'
  const [activeTab, setActiveTab] = useState<'catalog' | 'reminders'>('catalog');

  // Search & Filter in Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ServiceCategory>('all');

  // Channel preference: 'whatsapp' | 'sms'
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms'>('whatsapp');

  // Specific Reminder Toggles state according to requirements:
  // "Próxima Vacunación", "Desparasitación", "Control Médico"
  const [toggleVacunacion, setToggleVacunacion] = useState(true);
  const [toggleDesparasitacion, setToggleDesparasitacion] = useState(true);
  const [toggleControlMedico, setToggleControlMedico] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(true);
  const [channelSms, setChannelSms] = useState(false);

  // Active Template Selector: 'vacunacion' | 'desparasitacion' | 'control'
  const [activeTemplateType, setActiveTemplateType] = useState<'vacunacion' | 'desparasitacion' | 'control'>('vacunacion');

  // Templates dictionary
  const [templates, setTemplates] = useState({
    vacunacion:
      'Hola {nombre_tutor}, le recordamos desde {clinica_nombre} que {nombre_mascota} tiene programada su {tipo_vacuna} para el {fecha_cita}. Por favor confirme su asistencia respondiendo a este mensaje o llamando al {telefono_contacto}. ¡Cuidamos de su salud!',
    desparasitacion:
      'Estimado/a {nombre_tutor}, le informamos que {nombre_mascota} debe recibir su dosis trimestral de desparasitación interna. Puede pasar a retirarla por {clinica_nombre} ({sede_direccion}) de 09:00 a 20:00. Tel: {telefono_contacto}.',
    control:
      'Hola {nombre_tutor}, desde el equipo veterinario de {clinica_nombre} queremos saber cómo evoluciona {nombre_mascota} tras su última consulta. Recuerde que su cita de control y retiro de puntos está fijada para el {fecha_cita}.',
  });

  // Modal: Add Service
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ServiceCategory>('Consulta');
  const [newPrice, setNewPrice] = useState('50.00');
  const [newDuration, setNewDuration] = useState('30');
  const [newSubtext, setNewSubtext] = useState('IVA incl.');

  // Modal: Edit Service
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      // Category filter
      if (categoryFilter !== 'all') {
        if (srv.category !== categoryFilter) {
          // Normalize legacy plurals
          if (categoryFilter === 'Consulta' && srv.category !== 'Consultas') return false;
          if (categoryFilter === 'Cirugía' && srv.category !== 'Cirugías') return false;
          if (categoryFilter === 'Rayos X' && srv.category !== 'Imagen') return false;
          if (categoryFilter === 'Ecografía' && srv.category !== 'Imagen') return false;
          if (categoryFilter === 'Exámenes' && srv.category !== 'Laboratorio') return false;
        }
      }

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        srv.name.toLowerCase().includes(q) ||
        srv.code.toLowerCase().includes(q) ||
        srv.category.toLowerCase().includes(q)
      );
    });
  }, [services, categoryFilter, searchQuery]);

  // Insert Variable into active template
  const handleInsertVariable = (variable: string) => {
    const current = templates[activeTemplateType];
    const updated = current + ' ' + variable;
    setTemplates((prev) => ({ ...prev, [activeTemplateType]: updated }));
    showToast(`Variable ${variable} insertada`, 'variable_add');
  };

  // Live Preview Parser
  const getLivePreviewContent = () => {
    let text = templates[activeTemplateType];
    text = text.replace(/{nombre_tutor}/g, 'Carlos Morales');
    text = text.replace(/{nombre_mascota}/g, 'Max');
    text = text.replace(/{tipo_vacuna}/g, 'Vacuna Antirrábica Obligatoria');
    text = text.replace(/{fecha_cita}/g, '24 de Octubre a las 10:30 AM');
    text = text.replace(/{clinica_nombre}/g, currentTenant.name);
    text = text.replace(/{sede_direccion}/g, currentSede.address);
    text = text.replace(/{telefono_contacto}/g, currentSede.phone);
    return text;
  };

  // Submit Add Service
  const handleCreateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      showToast('Por favor completa el código y nombre del procedimiento', 'error', 'error');
      return;
    }

    addServiceItem({
      code: newCode.toUpperCase(),
      name: newName.trim(),
      category: newCategory,
      price: parseFloat(newPrice) || 0,
      priceSubtext: newSubtext.trim() || 'IVA incl.',
      durationMinutes: parseInt(newDuration, 10) || 30,
      inCatalog: true,
    });

    setNewCode('');
    setNewName('');
    setNewPrice('50.00');
    setNewDuration('30');
    setShowAddServiceModal(false);
  };

  // Submit Edit Service
  const handleEditServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    updateServiceItem(editingService.id, {
      name: editingService.name,
      code: editingService.code,
      category: editingService.category,
      price: editingService.price,
      durationMinutes: editingService.durationMinutes,
      priceSubtext: editingService.priceSubtext,
    });

    setEditingService(null);
  };

  // Delete Service Handler
  const handleDeleteService = (service: ServiceCatalogItem) => {
    if (window.confirm(`¿Estás seguro de eliminar "${service.name}" del catálogo clínico?`)) {
      deleteServiceItem(service.id);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 gap-6 max-w-7xl mx-auto pb-28">
      {/* 1. CABECERA PRINCIPAL: Título del Panel de Administración Técnico */}
      <section className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-surface-container/90 shadow-[0_1px_3px_rgba(11,28,48,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
              <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
              <span>Panel de Configuración Técnica</span>
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              Sede: {currentSede.name}
            </span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Catálogo Clínico & Automatización de Recordatorios
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Mantenimiento de aranceles de procedimientos médicos y motor de alertas automáticas
          </p>
        </div>

        {/* Pestañas Técnicas de Navegación */}
        <div className="p-1 bg-surface-container-low rounded-xl flex items-center border border-surface-container shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">medical_services</span>
            <span>Sección 1: Catálogo Médico</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary">
              {services.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reminders'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            <span>Sección 2: Recordatorios & Bot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: CATÁLOGO MÉDICO DE PROCEDIMIENTOS EDITABLE                    */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <section className="bg-surface-container-lowest rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] p-5 sm:p-6 flex flex-col gap-5">
          {/* Header de la Sección 1 con Botón "+ Añadir Procedimiento" */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
            <div>
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">format_list_bulleted</span>
                <span>Lista Editable de Procedimientos Médicos</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Tarifario oficial, tiempos quirúrgicos estimados y controles de edición / eliminación
              </p>
            </div>

            <button
              onClick={() => setShowAddServiceModal(true)}
              className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Añadir Procedimiento</span>
            </button>
          </div>

          {/* Barra de Filtros por Categoría y Buscador */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Categorías Solicitadas: Consulta, Cirugía, Ecografía, Rayos X, Exámenes */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider shrink-0 mr-1">
                Filtrar:
              </span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'Consulta', label: 'Consulta' },
                { id: 'Cirugía', label: 'Cirugía' },
                { id: 'Ecografía', label: 'Ecografía' },
                { id: 'Rayos X', label: 'Rayos X' },
                { id: 'Exámenes', label: 'Exámenes' },
              ].map((cat) => {
                const isSelected = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-2xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Buscador de procedimientos */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-container-low text-xs sm:text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary border border-surface-container"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Procedimientos Médicos con Nombre, Duración, Precio y Controles */}
          <div className="overflow-x-auto rounded-xl border border-surface-container bg-surface-container-lowest">
            <table className="w-full text-left border-collapse" aria-label="Catálogo de Procedimientos Médicos">
              <thead>
                <tr className="border-b border-surface-container bg-surface-container-low/60 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4 sm:px-5">
                    Código & Procedimiento
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Categoría
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Duración Estimada
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Precio Oficial
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Controles (Editar / Eliminar)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/70 text-xs sm:text-sm">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
                        <p className="font-bold text-sm text-on-surface">No se encontraron procedimientos</p>
                        <p className="text-xs text-on-surface-variant">
                          Prueba con otro término de búsqueda o añade un nuevo procedimiento al catálogo.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((srv) => (
                    <tr
                      key={srv.id}
                      className="group hover:bg-surface-container-low/50 transition-colors"
                    >
                      {/* Columna: Código & Nombre */}
                      <td className="py-3 px-4 sm:px-5 align-middle">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-surface-container-high shrink-0">
                            {srv.code}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                              {srv.name}
                            </span>
                            <span className="text-[11px] text-on-surface-variant">
                              {srv.priceSubtext}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Columna: Categoría */}
                      <td className="py-3 px-4 align-middle">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            srv.category === 'Consulta' || srv.category === 'Consultas'
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : srv.category === 'Cirugía' || srv.category === 'Cirugías'
                              ? 'bg-red-100 text-red-900 border border-red-200'
                              : srv.category === 'Ecografía' || srv.category === 'Rayos X' || srv.category === 'Imagen'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {srv.category}
                        </span>
                      </td>

                      {/* Columna: Duración */}
                      <td className="py-3 px-4 align-middle font-mono">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                          <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                          <span>{srv.durationMinutes} min</span>
                        </div>
                      </td>

                      {/* Columna: Precio */}
                      <td className="py-3 px-4 align-middle font-mono">
                        <span className="font-display font-extrabold text-sm sm:text-base text-primary tabular-nums">
                          {srv.price.toFixed(2)} €
                        </span>
                      </td>

                      {/* Columna: Controles (Editar / Eliminar) */}
                      <td className="py-3 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Botón Editar */}
                          <button
                            type="button"
                            onClick={() => setEditingService(srv)}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                            title={`Editar procedimiento ${srv.name}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          {/* Botón Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv)}
                            className="p-1.5 rounded-lg text-outline hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title={`Eliminar procedimiento ${srv.name}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 2: RECORDATORIOS AUTOMÁTICOS & EDITOR DE PLANTILLAS              */}
      {/* ========================================================================= */}
      {activeTab === 'reminders' && (
        <section className="flex flex-col gap-6">
          {/* Panel de Gestión de Notificaciones a Propietarios con Toggle Switches */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
              <div>
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">toggle_on</span>
                  <span>Panel de Notificaciones Automáticas a Propietarios</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Interruptores de automatización preventiva con feedback visual claro (Verde = Activado, Gris = Desactivado)
                </p>
              </div>

              {/* Selector de Canales Activos: WhatsApp y SMS */}
              <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-xl border border-surface-container self-start sm:self-auto">
                <span className="text-[11px] font-bold text-on-surface-variant px-2 uppercase tracking-wider">
                  Canales:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setChannelWhatsapp(!channelWhatsapp);
                    showToast(
                      channelWhatsapp ? 'Canal WhatsApp pausado' : 'Canal WhatsApp activado',
                      'chat'
                    );
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    channelWhatsapp
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">chat</span>
                  <span>WhatsApp API</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChannelSms(!channelSms);
                    showToast(
                      channelSms ? 'Canal SMS pausado' : 'Canal SMS pasarela activado',
                      'sms'
                    );
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    channelSms
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">sms</span>
                  <span>SMS Twilio</span>
                </button>
              </div>
            </div>

            {/* Listado de las 3 Reglas Específicas Solicitadas con Toggle Switches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alerta 1: "Próxima Vacunación" */}
              <div className="bg-surface-container-low/70 p-4 rounded-2xl border border-surface-container flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">vaccines</span>
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-on-surface">
                        Próxima Vacunación
                      </h3>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                        Vía WhatsApp o SMS
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch: Verde para activado, Gris para desactivado */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={toggleVacunacion}
                    onClick={() => {
                      const next = !toggleVacunacion;
                      setToggleVacunacion(next);
                      showToast(
                        next
                          ? 'Alerta de "Próxima Vacunación" ACTIVADA (Verde)'
                          : 'Alerta de "Próxima Vacunación" DESACTIVADA (Gris)',
                        next ? 'check_circle' : 'block'
                      );
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer shrink-0 p-0.5 ${
                      toggleVacunacion ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white block transition-transform shadow-xs ${
                        toggleVacunacion ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Envío automático 7 días y 24 horas antes del vencimiento de vacunas antirrábicas y polivalentes.
                </p>

                <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs">
                  <span className="font-bold text-[11px] text-on-surface">Estado:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      toggleVacunacion
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {toggleVacunacion ? '● Activado' : '○ Desactivado'}
                  </span>
                </div>
              </div>

              {/* Alerta 2: "Desparasitación" */}
              <div className="bg-surface-container-low/70 p-4 rounded-2xl border border-surface-container flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">medication</span>
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-on-surface">
                        Desparasitación
                      </h3>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                        Vía WhatsApp o SMS
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch: Verde para activado, Gris para desactivado */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={toggleDesparasitacion}
                    onClick={() => {
                      const next = !toggleDesparasitacion;
                      setToggleDesparasitacion(next);
                      showToast(
                        next
                          ? 'Alerta de "Desparasitación" ACTIVADA (Verde)'
                          : 'Alerta de "Desparasitación" DESACTIVADA (Gris)',
                        next ? 'check_circle' : 'block'
                      );
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer shrink-0 p-0.5 ${
                      toggleDesparasitacion ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white block transition-transform shadow-xs ${
                        toggleDesparasitacion ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Recordatorio trimestral preventivo para desparasitación interna y pautas antiparasitarias externas.
                </p>

                <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs">
                  <span className="font-bold text-[11px] text-on-surface">Estado:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      toggleDesparasitacion
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {toggleDesparasitacion ? '● Activado' : '○ Desactivado'}
                  </span>
                </div>
              </div>

              {/* Alerta 3: "Control Médico" */}
              <div className="bg-surface-container-low/70 p-4 rounded-2xl border border-surface-container flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">stethoscope</span>
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-on-surface">
                        Control Médico
                      </h3>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                        Vía WhatsApp o SMS
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch: Verde para activado, Gris para desactivado */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={toggleControlMedico}
                    onClick={() => {
                      const next = !toggleControlMedico;
                      setToggleControlMedico(next);
                      showToast(
                        next
                          ? 'Alerta de "Control Médico" ACTIVADA (Verde)'
                          : 'Alerta de "Control Médico" DESACTIVADA (Gris)',
                        next ? 'check_circle' : 'block'
                      );
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer shrink-0 p-0.5 ${
                      toggleControlMedico ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white block transition-transform shadow-xs ${
                        toggleControlMedico ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Check-in de evolución médica, revisiones post-operatorias a las 48h y seguimiento de patologías crónicas.
                </p>

                <div className="pt-2 border-t border-surface-container flex items-center justify-between text-xs">
                  <span className="font-bold text-[11px] text-on-surface">Estado:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      toggleControlMedico
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {toggleControlMedico ? '● Activado' : '○ Desactivado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ÁREA PARA VISUALIZAR O EDITAR LA PLANTILLA DEL MENSAJE DE TEXTO */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
              <div>
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
                  <span>Editor y Visualizador de Plantillas de Mensajes</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Personaliza el texto que recibirán los propietarios con variables dinámicas y previsualización en vivo
                </p>
              </div>

              {/* Selector de plantilla a editar */}
              <div className="p-1 bg-surface-container-low rounded-xl flex items-center gap-1 border border-surface-container self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTemplateType('vacunacion')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTemplateType === 'vacunacion'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Vacunación
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateType('desparasitacion')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTemplateType === 'desparasitacion'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Desparasitación
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateType('control')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTemplateType === 'control'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Control Médico
                </button>
              </div>
            </div>

            {/* Layout de 2 Columnas: Editor Técnico a la izquierda, Previsualización Móvil a la derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Columna Izquierda: Editor de Plantilla y Variables Dinámicas */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Variables Dinámicas Insertables */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-primary">data_object</span>
                    <span>Variables Dinámicas (Haz clic para insertar en el cursor):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '{nombre_tutor}',
                      '{nombre_mascota}',
                      '{tipo_vacuna}',
                      '{fecha_cita}',
                      '{clinica_nombre}',
                      '{sede_direccion}',
                      '{telefono_contacto}',
                    ].map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => handleInsertVariable(variable)}
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-primary text-xs font-mono font-bold transition-all border border-surface-container-high cursor-pointer shadow-2xs"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea del Mensaje */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <label className="font-bold text-on-surface">Cuerpo de la Plantilla de Texto:</label>
                    <span className="font-mono">
                      {templates[activeTemplateType].length} caracteres · ~{Math.ceil(templates[activeTemplateType].length / 160)} SMS
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={templates[activeTemplateType]}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTemplates((prev) => ({ ...prev, [activeTemplateType]: val }));
                    }}
                    className="w-full p-3.5 rounded-xl bg-surface-container-low text-xs sm:text-sm text-on-surface font-sans leading-relaxed outline-none focus:ring-2 focus:ring-primary border border-surface-container resize-none"
                    placeholder="Escribe la plantilla del mensaje..."
                  />
                </div>

                {/* Botones de Guardar / Restablecer */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTemplates((prev) => ({
                        ...prev,
                        [activeTemplateType]:
                          activeTemplateType === 'vacunacion'
                            ? 'Hola {nombre_tutor}, le recordamos desde {clinica_nombre} que {nombre_mascota} tiene programada su {tipo_vacuna} para el {fecha_cita}. Por favor confirme su asistencia respondiendo a este mensaje o llamando al {telefono_contacto}. ¡Cuidamos de su salud!'
                            : activeTemplateType === 'desparasitacion'
                            ? 'Estimado/a {nombre_tutor}, le informamos que {nombre_mascota} debe recibir su dosis trimestral de desparasitación interna. Puede pasar a retirarla por {clinica_nombre} ({sede_direccion}) de 09:00 a 20:00. Tel: {telefono_contacto}.'
                            : 'Hola {nombre_tutor}, desde el equipo veterinario de {clinica_nombre} queremos saber cómo evoluciona {nombre_mascota} tras su última consulta. Recuerde que su cita de control y retiro de puntos está fijada para el {fecha_cita}.',
                      }));
                      showToast('Plantilla restablecida a valores por defecto', 'history');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  >
                    Restablecer Original
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateReminderTemplate(templates[activeTemplateType]);
                      showToast('Plantilla guardada y sincronizada con el motor de envíos', 'cloud_done');
                    }}
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[17px]">save</span>
                    <span>Guardar Plantilla</span>
                  </button>
                </div>
              </div>

              {/* Columna Derecha: Previsualización en Vivo en WhatsApp / SMS */}
              <div className="lg:col-span-5 flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[#25D366] text-[18px]">phone_iphone</span>
                    <span>Visualización en Tiempo Real</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    Vista Propietario
                  </span>
                </div>

                {/* Marco de Simulación Móvil */}
                <div className="bg-[#ECE5DD] p-4 rounded-2xl border border-[#d4cdc5] shadow-inner flex flex-col justify-between min-h-[300px]">
                  {/* Encabezado de Chat WhatsApp */}
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#ded7cf] mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shadow-xs">
                      VC
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-extrabold text-slate-800 truncate">
                          {currentTenant.name}
                        </span>
                        <span className="material-symbols-outlined text-teal-600 text-[14px]">verified</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Cuenta de empresa oficial</p>
                    </div>
                  </div>

                  {/* Burbuja de Mensaje con Reemplazo de Variables en Vivo */}
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-800 leading-relaxed space-y-2 border border-slate-100 max-w-[95%]">
                    <p className="whitespace-pre-wrap">{getLivePreviewContent()}</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono">
                      <span>10:30 AM</span>
                      <span className="text-teal-600 font-bold">✓✓</span>
                    </div>
                  </div>

                  {/* Footer del Móvil */}
                  <div className="pt-3 border-t border-[#ded7cf] flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Canal: Meta WhatsApp API</span>
                    <span className="text-emerald-700 font-bold">● Enrutado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: AÑADIR PROCEDIMIENTO MÉDICO AL CATÁLOGO                          */}
      {/* ========================================================================= */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-on-surface">
                  Añadir Procedimiento Médico
                </h3>
              </div>
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateServiceSubmit} className="flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Código CUPS *</label>
                  <input
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Ej. C-105, CIR-09"
                    className="p-2.5 rounded-xl bg-surface-container-low font-mono font-bold uppercase outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Categoría *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ServiceCategory)}
                    className="p-2.5 rounded-xl bg-surface-container-low font-bold outline-none focus:ring-1 focus:ring-primary border border-surface-container cursor-pointer"
                  >
                    <option value="Consulta">Consulta</option>
                    <option value="Cirugía">Cirugía</option>
                    <option value="Ecografía">Ecografía</option>
                    <option value="Rayos X">Rayos X</option>
                    <option value="Exámenes">Exámenes</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface">Nombre del Procedimiento *</label>
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Ecografía Cardíaca Doppler, Cirugía Dental"
                  className="p-2.5 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container text-xs sm:text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Duración Estimada (min) *</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="p-2.5 rounded-xl bg-surface-container-low font-mono font-bold outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Precio Oficial (€) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="p-2.5 rounded-xl bg-surface-container-low font-mono font-bold outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface">Nota o Subtexto de Tarifa</label>
                <input
                  value={newSubtext}
                  onChange={(e) => setNewSubtext(e.target.value)}
                  placeholder="Ej. IVA incl., Incluye anestesia inhalatoria..."
                  className="p-2 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold shadow-xs transition-colors"
                >
                  Guardar en Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR PROCEDIMIENTO MÉDICO EXISTENTE                            */}
      {/* ========================================================================= */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">edit</span>
                <h3 className="font-display font-extrabold text-base sm:text-lg text-on-surface">
                  Editar Procedimiento · {editingService.code}
                </h3>
              </div>
              <button
                onClick={() => setEditingService(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditServiceSubmit} className="flex flex-col gap-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Código CUPS</label>
                  <input
                    required
                    value={editingService.code}
                    onChange={(e) =>
                      setEditingService({ ...editingService, code: e.target.value.toUpperCase() })
                    }
                    className="p-2.5 rounded-xl bg-surface-container-low font-mono font-bold uppercase outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Categoría</label>
                  <select
                    value={editingService.category}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        category: e.target.value as ServiceCategory,
                      })
                    }
                    className="p-2.5 rounded-xl bg-surface-container-low font-bold outline-none focus:ring-1 focus:ring-primary border border-surface-container cursor-pointer"
                  >
                    <option value="Consulta">Consulta</option>
                    <option value="Cirugía">Cirugía</option>
                    <option value="Ecografía">Ecografía</option>
                    <option value="Rayos X">Rayos X</option>
                    <option value="Exámenes">Exámenes</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface">Nombre del Procedimiento</label>
                <input
                  required
                  value={editingService.name}
                  onChange={(e) =>
                    setEditingService({ ...editingService, name: e.target.value })
                  }
                  className="p-2.5 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Duración (minutos)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={editingService.durationMinutes}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        durationMinutes: parseInt(e.target.value, 10) || 15,
                      })
                    }
                    className="p-2.5 rounded-xl bg-surface-container-low font-mono font-bold outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-on-surface">Precio Oficial (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={editingService.price}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="p-2.5 rounded-xl bg-surface-container-low font-mono font-bold outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-on-surface">Nota o Subtexto</label>
                <input
                  value={editingService.priceSubtext}
                  onChange={(e) =>
                    setEditingService({ ...editingService, priceSubtext: e.target.value })
                  }
                  className="p-2 rounded-xl bg-surface-container-low outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold shadow-xs transition-colors"
                >
                  Actualizar Procedimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
