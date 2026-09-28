import React, { useState, useMemo } from 'react';
import { useTenant } from '../../context/TenantContext';
import { ClientRecord, Species } from '../../types';
import { PatientsDirectoryView } from '../patients/PatientsDirectoryView';

export const ClientsDirectoryView: React.FC = () => {
  const {
    clients,
    addClient,
    addPetToClient,
    updateClient,
    setSelectedPatientId,
    setActiveTab,
    setIsAppointmentModalOpen,
    showToast,
  } = useTenant();

  // View mode toggle: 'table' (Data Table) vs 'cards' (Cards view)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'perros' | 'gatos' | 'exoticos' | 'estetica' | 'citas_activas'
  >('all');

  // Active Dropdown menu tracker
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Modal: Añadir Cliente
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientDni, setNewClientDni] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<Species>('canino');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [isEsteticaOnly, setIsEsteticaOnly] = useState(false);

  // Modal: Editar Cliente
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);

  // Modal: Añadir Mascota a Cliente
  const [addingPetToClientId, setAddingPetToClientId] = useState<string | null>(null);

  // Filtering Logic
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Category Filter
      if (activeFilter === 'perros') {
        const hasDog = client.pets.some((p) => p.species === 'canino');
        if (!hasDog) return false;
      } else if (activeFilter === 'gatos') {
        const hasCat = client.pets.some((p) => p.species === 'felino');
        if (!hasCat) return false;
      } else if (activeFilter === 'exoticos') {
        const hasExotic = client.pets.some((p) => p.species === 'exotico');
        if (!hasExotic) return false;
      } else if (activeFilter === 'estetica') {
        if (!client.isEsteticaOnly && !client.pets.some((p) => p.isEsteticaOnly)) return false;
      } else if (activeFilter === 'citas_activas') {
        if (!client.hasActiveAppointment) return false;
      }

      // Search Query (Client Name, Phone, Email, Pet Name, Breed)
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const matchClient =
        client.name.toLowerCase().includes(q) ||
        client.phone.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        (client.dni && client.dni.toLowerCase().includes(q));

      const matchPets = client.pets.some(
        (p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q)
      );

      return matchClient || matchPets;
    });
  }, [clients, activeFilter, searchTerm]);

  // Handler: Add Client
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientPhone.trim() || !newPetName.trim()) {
      showToast('Por favor completa el nombre del cliente, teléfono y nombre de la mascota', 'error', 'error');
      return;
    }

    addClient({
      name: newClientName,
      dni: newClientDni || '40000000-X',
      email: newClientEmail || `${newClientName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      phone: newClientPhone,
      address: newClientAddress || 'Dirección registrada en ficha',
      pets: [
        {
          id: `pet-${Date.now()}`,
          name: newPetName,
          species: newPetSpecies,
          breed: newPetBreed || 'Mestizo',
          isEsteticaOnly: isEsteticaOnly,
        },
      ],
      lastVisitDate: 'Hoy, 24 Oct 2024',
      lastVisitReason: isEsteticaOnly ? 'Alta en estética y peluquería' : 'Apertura de expediente clínico',
      lastVisitDoctor: 'Dra. Elena Mendoza',
      totalVisits: 1,
      hasActiveAppointment: false,
      isEsteticaOnly: isEsteticaOnly,
    });

    // Reset Form
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientDni('');
    setNewClientAddress('');
    setNewPetName('');
    setNewPetBreed('');
    setIsEsteticaOnly(false);
    setShowAddClientModal(false);
  };

  // Handler: Edit Client
  const handleEditClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    updateClient(editingClient.id, {
      name: editingClient.name,
      phone: editingClient.phone,
      email: editingClient.email,
      address: editingClient.address,
      notes: editingClient.notes,
    });

    setEditingClient(null);
  };

  return (
    <div
      className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 gap-5 max-w-7xl mx-auto pb-28"
      onClick={() => {
        if (openDropdownId) setOpenDropdownId(null);
      }}
    >
      {/* 1. Header con Título, Contexto y Botón Destacado "Añadir Cliente" */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-surface-container/90 shadow-[0_1px_3px_rgba(11,28,48,0.03)]">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed text-on-primary-fixed">
              <span className="material-symbols-outlined text-[14px]">groups</span>
              Base de Datos Oficial
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              Directorio de Clientes & Pacientes EMR
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Base de Datos de Clientes y Mascotas
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Gestión centralizada de tutores, historiales médicos asociados y accesos rápidos a consultas
          </p>
        </div>

        {/* Botón Destacado: "Añadir Cliente" y Selector de Vista */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
          {/* Segmented View Mode Switcher */}
          <div className="p-1 bg-surface-container-low rounded-xl flex items-center border border-surface-container">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              <span>Tabla de Clientes</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Fichas Mascotas</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddClientModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all group"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px] transition-transform group-hover:scale-110">
              person_add
            </span>
            <span className="tracking-tight whitespace-nowrap font-display">+ Añadir Cliente</span>
          </button>
        </div>
      </section>

      {viewMode === 'cards' ? (
        <PatientsDirectoryView />
      ) : (
        <>
          {/* 2. Barra de Búsqueda Potente y Botones de Filtros */}
      <section className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container/90 shadow-[0_1px_3px_rgba(11,28,48,0.03)] flex flex-col gap-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Barra de Búsqueda Potente */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de cliente, teléfono, mascota o microchip..."
              className="w-full bg-surface-container-low/70 hover:bg-surface-container-low focus:bg-surface-container-lowest text-on-surface placeholder:text-outline text-xs sm:text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none border border-surface-container focus:border-primary transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-full"
                title="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Registry Counter */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium shrink-0 px-1">
            <span className="font-bold text-on-surface">{filteredClients.length}</span>
            <span>de {clients.length} clientes encontrados</span>
          </div>
        </div>

        {/* Botones de Filtros */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>Todos los Clientes</span>
            <span className="text-[10px] opacity-80 px-1.5 py-0.2 rounded-full bg-black/10">
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('perros')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'perros'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>🐶 Perros</span>
          </button>

          <button
            onClick={() => setActiveFilter('gatos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'gatos'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>🐱 Gatos</span>
          </button>

          <button
            onClick={() => setActiveFilter('exoticos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'exoticos'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
            type="button"
          >
            <span>🐰 Exóticos</span>
          </button>

          <button
            onClick={() => setActiveFilter('estetica')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'estetica'
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'bg-secondary-fixed/40 text-on-secondary-fixed hover:bg-secondary-fixed/70'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">content_cut</span>
            <span>Solo Estética</span>
          </button>

          <button
            onClick={() => setActiveFilter('citas_activas')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'citas_activas'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
            type="button"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Con Citas Activas</span>
          </button>
        </div>
      </section>

      {/* 3. Tabla de Datos Central (Data Table) */}
      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container/90 shadow-[0_1px_4px_rgba(11,28,48,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="Tabla de Directorio de Clientes">
            <thead>
              <tr className="border-b border-surface-container bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th scope="col" className="py-3 px-4 sm:px-5">
                  Nombre del Cliente
                </th>
                <th scope="col" className="py-3 px-4 sm:px-5">
                  Teléfono
                </th>
                <th scope="col" className="py-3 px-4 sm:px-5">
                  Nombre de la Mascota(s)
                </th>
                <th scope="col" className="py-3 px-4 sm:px-5">
                  Última Visita
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container/60 text-xs sm:text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
                      <p className="font-semibold text-sm text-on-surface">No se encontraron clientes</p>
                      <p className="text-xs text-on-surface-variant">
                        Prueba ajustando los filtros o el término de búsqueda
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setActiveFilter('all');
                        }}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold text-primary hover:bg-surface-container-high transition-colors"
                      >
                        Restablecer filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isDropdownOpen = openDropdownId === client.id;

                  return (
                    <tr
                      key={client.id}
                      className="group hover:bg-surface-container-low/50 transition-colors duration-150 cursor-pointer"
                      onClick={() => {
                        // Row click opens the first pet's clinical record and medical history
                        if (client.pets[0]) {
                          setSelectedPatientId(client.pets[0].id);
                          setActiveTab('expediente');
                          showToast(`Abriendo historia clínica de ${client.pets[0].name}`, 'clinical_notes');
                        }
                      }}
                    >
                      {/* Columna 1: Nombre del Cliente */}
                      <td className="py-3.5 px-4 sm:px-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            {client.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                                {client.name}
                              </span>
                              {client.hasActiveAppointment && (
                                <span
                                  className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                                  title="Tiene cita activa en clínica hoy"
                                ></span>
                              )}
                              {client.isEsteticaOnly && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-secondary-fixed text-on-secondary-fixed">
                                  Estética
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-on-surface-variant truncate">
                              {client.email} {client.dni && `· ${client.dni}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Columna 2: Teléfono */}
                      <td className="py-3.5 px-4 sm:px-5 align-middle font-mono" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${client.phone}`}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                            title="Llamar al tutor"
                          >
                            <span className="material-symbols-outlined text-[15px]">call</span>
                            <span>{client.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-6 h-6 rounded-md bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] flex items-center justify-center transition-colors"
                            title="Enviar WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                          </a>
                        </div>
                      </td>

                      {/* Columna 3: Nombre de la Mascota(s) */}
                      <td className="py-3.5 px-4 sm:px-5 align-middle">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {client.pets.map((pet) => (
                            <button
                              key={pet.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatientId(pet.id);
                                setActiveTab('expediente');
                                showToast(`Abriendo expediente médico de ${pet.name}`, 'clinical_notes');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface text-xs font-medium transition-all shadow-2xs border border-surface-container-high/60 group/pet"
                              title={`Ver expediente de ${pet.name} (${pet.breed})`}
                            >
                              <span>
                                {pet.species === 'canino' ? '🐶' : pet.species === 'felino' ? '🐱' : '🐰'}
                              </span>
                              <span className="font-semibold">{pet.name}</span>
                              <span className="text-[10px] opacity-75 hidden sm:inline">
                                ({pet.breed.split(' ')[0]})
                              </span>
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Columna 4: Última Visita */}
                      <td className="py-3.5 px-4 sm:px-5 align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-on-surface">
                            {client.lastVisitDate}
                          </span>
                          <span className="text-[11px] text-on-surface-variant line-clamp-1">
                            {client.lastVisitReason}
                          </span>
                        </div>
                      </td>

                      {/* Columna 5: Acciones (Dropdown de 3 Puntos) */}
                      <td className="py-3.5 px-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(isDropdownOpen ? null : client.id);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                            aria-label={`Acciones para ${client.name}`}
                          >
                            <span className="material-symbols-outlined text-[19px]">more_vert</span>
                          </button>

                          {/* Dropdown Menu */}
                          {isDropdownOpen && (
                            <div
                              className="absolute right-0 top-9 w-44 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xl py-1 z-50 animate-scale-in text-left"
                              role="menu"
                            >
                              {/* 1. Ver Perfil */}
                              <button
                                onClick={() => {
                                  if (client.pets[0]) {
                                    setSelectedPatientId(client.pets[0].id);
                                    setActiveTab('expediente');
                                  }
                                  setOpenDropdownId(null);
                                  showToast(`Abriendo perfil médico de ${client.pets[0]?.name || client.name}`, 'person');
                                }}
                                className="w-full px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2 font-medium transition-colors"
                                role="menuitem"
                              >
                                <span className="material-symbols-outlined text-[16px] text-primary">
                                  account_circle
                                </span>
                                <span>Ver Perfil / Ficha</span>
                              </button>

                              {/* 1.5. Añadir Mascota */}
                              <button
                                onClick={() => {
                                  setAddingPetToClientId(client.id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2 font-medium transition-colors"
                                role="menuitem"
                              >
                                <span className="material-symbols-outlined text-[16px] text-primary">
                                  pets
                                </span>
                                <span>Añadir Mascota</span>
                              </button>

                              {/* 2. Nueva Cita */}
                              <button
                                onClick={() => {
                                  if (client.pets[0]) {
                                    setSelectedPatientId(client.pets[0].id);
                                  }
                                  setIsAppointmentModalOpen(true);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2 font-medium transition-colors"
                                role="menuitem"
                              >
                                <span className="material-symbols-outlined text-[16px] text-secondary">
                                  calendar_add_on
                                </span>
                                <span>Nueva Cita</span>
                              </button>

                              {/* 3. Editar */}
                              <button
                                onClick={() => {
                                  setEditingClient(client);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-on-surface hover:bg-surface-container flex items-center gap-2 font-medium transition-colors"
                                role="menuitem"
                              >
                                <span className="material-symbols-outlined text-[16px] text-outline">
                                  edit
                                </span>
                                <span>Editar</span>
                              </button>

                              <div className="border-t border-surface-container my-1"></div>

                              {/* WhatsApp Direct */}
                              <a
                                href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full px-3 py-1.5 text-xs text-[#25D366] hover:bg-surface-container flex items-center gap-2 font-medium transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">chat</span>
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de Paginación y Resumen */}
        <div className="p-4 bg-surface-container-low/40 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant flex-wrap gap-2">
          <span>
            Mostrando <strong>{filteredClients.length}</strong> de <strong>{clients.length}</strong> clientes registrados
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-2.5 py-1 rounded-lg bg-surface-container text-outline opacity-50 cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="font-semibold text-on-surface">Página 1 de 1</span>
            <button
              onClick={() => showToast('Todos los clientes cargados', 'info')}
              className="px-2.5 py-1 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-colors font-medium"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
      </>
      )}

      {/* 4. Modal: "Añadir Cliente" */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-surface-container flex flex-col gap-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-on-surface">
                    Añadir Nuevo Cliente & Mascota
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Registro de tutor y apertura de ficha clínica
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddClientSubmit} className="flex flex-col gap-3.5">
              {/* Sección Datos del Cliente */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Datos del Cliente (Tutor)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">Nombre y Apellidos *</label>
                    <input
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Ej. Roberto Martínez"
                      className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">Teléfono / Móvil *</label>
                    <input
                      required
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="+34 612 000 111"
                      className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">Correo Electrónico</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">DNI / NIF</label>
                    <input
                      value={newClientDni}
                      onChange={(e) => setNewClientDni(e.target.value)}
                      placeholder="12345678-Z"
                      className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Dirección Postal</label>
                  <input
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    placeholder="Calle, número, piso y ciudad"
                    className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>
              </div>

              {/* Sección Mascota Inicial */}
              <div className="border-t border-surface-container pt-3 flex flex-col gap-2.5">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Mascota Inicial
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">Nombre Mascota *</label>
                    <input
                      required
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      placeholder="Ej. Balto"
                      className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface">Especie</label>
                    <select
                      value={newPetSpecies}
                      onChange={(e) => setNewPetSpecies(e.target.value as Species)}
                      className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                    >
                      <option value="canino">🐶 Canino (Perro)</option>
                      <option value="felino">🐱 Felino (Gato)</option>
                      <option value="exotico">🐰 Exótico / Pequeño mamífero</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-on-surface">Raza</label>
                  <input
                    value={newPetBreed}
                    onChange={(e) => setNewPetBreed(e.target.value)}
                    placeholder="Ej. Husky Siberiano, Mestizo..."
                    className="p-2.5 rounded-xl bg-surface-container-low text-xs sm:text-sm outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  />
                </div>

                <div className="flex items-center gap-2 p-2 bg-surface-container-low rounded-xl">
                  <input
                    type="checkbox"
                    id="chk-estetica"
                    checked={isEsteticaOnly}
                    onChange={(e) => setIsEsteticaOnly(e.target.checked)}
                    className="w-4 h-4 accent-secondary rounded cursor-pointer"
                  />
                  <label htmlFor="chk-estetica" className="text-xs text-on-surface cursor-pointer select-none">
                    Cliente exclusivo de <strong>Peluquería y Estética</strong> (sin historial quirúrgico previo)
                  </label>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface-variant font-medium text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-all shadow-xs"
                >
                  Guardar Cliente en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal: "Editar Cliente" */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-5 shadow-2xl border border-surface-container flex flex-col gap-3.5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-surface-container pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">edit</span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Editar Cliente: {editingClient.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEditClientSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Nombre Completo</label>
                <input
                  required
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Teléfono / WhatsApp</label>
                <input
                  required
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Correo Electrónico</label>
                <input
                  type="email"
                  value={editingClient.email}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Dirección</label>
                <input
                  value={editingClient.address || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Notas del Cliente</label>
                <textarea
                  rows={2}
                  value={editingClient.notes || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-3.5 py-2 rounded-lg bg-surface-container text-on-surface-variant font-medium text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: "Añadir Mascota a Cliente Existente" */}
      {addingPetToClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/50 backdrop-blur-xs p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-5 shadow-2xl border border-surface-container flex flex-col gap-3.5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-surface-container pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">pets</span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Añadir Mascota
                </h3>
              </div>
              <button
                onClick={() => {
                  setAddingPetToClientId(null);
                  setNewPetName('');
                  setNewPetBreed('');
                  setNewPetSpecies('canino');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPetName.trim()) {
                  showToast('El nombre de la mascota es obligatorio', 'error', 'error');
                  return;
                }
                
                const codeRandom = `#MC-${Math.floor(10000 + Math.random() * 90000)}`;
                const microRandom = `98102000${Math.floor(1000000 + Math.random() * 9000000)}`;

                addPetToClient(addingPetToClientId, {
                  code: codeRandom,
                  name: newPetName,
                  species: newPetSpecies,
                  breed: newPetBreed || 'Mestizo',
                  gender: 'macho',
                  neutered: false,
                  age: 'Desconocida',
                  microchip: microRandom,
                  status: 'sano',
                  photoUrl: newPetSpecies === 'canino'
                    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ12UwB0nvDxhygfsgTOWKr_GE32va2lyrE_4mefr4cpwjy0CIn14MHczhmet_P44VqW0pzIrN4pi_I4WmbUs-gIMye69PY4hQPYv6DpKgy1trPjboUnxqCNDwfVuaIzXRDTTPpAvj_Cyc57K8jBHn8I_NukozhPjprwwonD97WaaFgtDCpx9z5k24pD_pKzNqwZR6fRcxgXibBbW19tp3xhEXtU1W6N5sSCZMeuRjRKo355iqckwm'
                    : newPetSpecies === 'felino'
                    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr4vN_zYT5HcX3OsRf7qAlFAlRtSmfuNbDotAi_2KxPRiz3mEx2Dif8LZHxnQ_XakWGqeRZResO9cCzMdDfx6T9Q1sj2JS4KEq6BZxR6u9ic1K8Stif6dTcYpiICj7pI-5wti_ELWiUJUIs52PjL9x4GBLY84v5-igzLWMRvQj3rnqeg7pYDuhkUYl7mKhxl5aMVG0PW3P5RqL34OgaPDhxQPfcBQ3a0AlqKF4Oe5ZbLqF1h-Ec5Kr'
                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-yj-K-hc2sz00pLCIzBhC8SA2Am9KapTkoyewfsRO-IHQtQzvdD1QBlaR9oZ1vtPeYqz6l4w0Eg_eaXFWWExaSImVfVIazRvRSB0uSEGOGqePCouY1hjNVgrSyci0y5irgIozsFefW9SFcoaEcsaOfmnjBNorKOjzrHYyOLgc-TJjtzxFa4nwUiSvSxjwc4c_n5hdPqFspcEUHp-JC93um5pO_MX4NwaHCdXSycuqG5GTFbo2Pb5K',
                  weightKg: 0,
                  bodyConditionScore: '5 / 9 (Ideal)',
                  criticalAlerts: [],
                  chronicConditions: [],
                });

                setAddingPetToClientId(null);
                setNewPetName('');
                setNewPetBreed('');
                setNewPetSpecies('canino');
              }}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Nombre de la Mascota</label>
                <input
                  required
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  placeholder="Ej. Firulais"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-semibold text-on-surface">Especie</label>
                  <select
                    value={newPetSpecies}
                    onChange={(e) => setNewPetSpecies(e.target.value as Species)}
                    className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                  >
                    <option value="canino">Canino (Perro)</option>
                    <option value="felino">Felino (Gato)</option>
                    <option value="exotico">Animal Exótico</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-semibold text-on-surface">Raza</label>
                  <input
                    value={newPetBreed}
                    onChange={(e) => setNewPetBreed(e.target.value)}
                    className="p-2.5 rounded-xl bg-surface-container-low text-xs outline-none focus:ring-1 focus:ring-primary border border-surface-container"
                    placeholder="Ej. Labrador"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => {
                    setAddingPetToClientId(null);
                    setNewPetName('');
                    setNewPetBreed('');
                    setNewPetSpecies('canino');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-surface-container text-on-surface-variant font-medium text-xs hover:bg-surface-container-high transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs transition-colors shadow-xs"
                >
                  Registrar Mascota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
