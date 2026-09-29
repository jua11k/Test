import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { VetLogo } from '../common/VetLogo';
import { TutorAccess } from './TutorAccess';
import { AppointmentType } from '../../types';

interface TutorPortalViewProps {
  isStaffPreview?: boolean;
}

export const TutorPortalView: React.FC<TutorPortalViewProps> = ({ isStaffPreview = false }) => {
  const { currentTenant, currentSede, addAppointment, showToast, setUserRole, services, appointments } = useTenant();

  // Auth State
  const [tutorSession, setTutorSession] = useState<any | null>(null);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [consultReason, setConsultReason] = useState('');

  // Add Pet Modal State
  const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('canino');
  const [addPetError, setAddPetError] = useState('');

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet || !selectedService || !selectedDate) {
      showToast('Por favor completa todos los campos', 'warning', 'warning');
      return;
    }

    const serviceObj = services.find(s => s.id === selectedService);
    const serviceName = serviceObj ? serviceObj.name : 'Servicio General';
    const petObj = tutorSession?.pets?.find((p: any) => p.id === selectedPet) || { name: 'Mascota', species: 'canino' };

    addAppointment({
      patientId: selectedPet,
      patientName: petObj.name,
      species: petObj.species,
      breed: petObj.breed || 'Mestizo',
      photoUrl: '',
      tutorName: tutorSession?.name || '',
      tutorPhone: tutorSession?.phone || '',
      time: selectedTime,
      date: selectedDate,
      durationMinutes: 30,
      durationLabel: '30 min',
      type: 'consulta',
      status: 'confirmado',
      statusLabel: 'Confirmado',
      reason: consultReason.trim() ? `${serviceName}: ${consultReason}` : serviceName,
      roomBox: 'Consultorio 1',
      veterinarianName: 'Médico de turno',
      veterinarianId: 'vet-1',
      autoReminder: true,
      sedeId: currentSede.id,
      badgeStyle: 'bg-blue-100 text-blue-900',
    });

    setIsBookingModalOpen(false);
    showToast('¡Cita solicitada exitosamente!', 'task_alt');
    setConsultReason('');
  };

  const handleAddPetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddPetError('');

    if (!newPetName) {
      setAddPetError('El nombre es obligatorio');
      return;
    }

    try {
      const response = await fetch('/api/portal/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petName: newPetName,
          petSpecies: newPetSpecies
        })
      });

      const result = await response.json();
      if (result.success) {
        // Actualizar el estado local para mostrar la nueva mascota inmediatamente
        setTutorSession((prev: any) => ({
          ...prev,
          pets: [...(prev.pets || []), result.data]
        }));
        setIsAddPetModalOpen(false);
        setNewPetName('');
        setNewPetSpecies('canino');
        showToast('Mascota registrada exitosamente', 'pets');
      } else {
        setAddPetError(result.error || 'Error al registrar mascota');
      }
    } catch (err) {
      setAddPetError('Error de conexión');
    }
  };

  // 1. BARRA SAAS COMUN
  const saasBar = (
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
  );

  // 2. BARRERA DE ACCESO PARA CLIENTES
  if (!tutorSession && !isStaffPreview) {
    return (
      <div className="min-h-screen w-full bg-surface flex flex-col font-sans">
        {saasBar}
        <TutorAccess onAccessGranted={setTutorSession} />
      </div>
    );
  }

  // Filtrar citas del usuario
  const myAppointments = appointments.filter(a => a.tutorPhone === tutorSession?.phone);

  // 3. VISTA DEL DASHBOARD DEL TUTOR LOGUEADO (Sin datos dummy)
  return (
    <div className="min-h-screen w-full bg-surface text-on-surface flex flex-col font-sans pb-20">
      {saasBar}
      
      {/* Encabezado */}
      <header className="bg-white border-b border-surface-container px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
              <VetLogo size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{currentTenant.name}</h1>
              <p className="text-xs text-on-surface-variant">{currentSede.address}</p>
            </div>
          </div>
          {tutorSession && (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{tutorSession.name}</p>
                <p className="text-xs text-on-surface-variant cursor-pointer hover:underline" onClick={() => setTutorSession(null)}>Cerrar Sesión</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                {tutorSession.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 mt-8">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-display">Mis Mascotas</h2>
            <button 
              onClick={() => setIsAddPetModalOpen(true)}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-sm font-semibold rounded-lg transition-colors border border-surface-container"
            >
              + Nueva Mascota
            </button>
          </div>
          <button 
            onClick={() => setIsBookingModalOpen(true)}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold shadow-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: currentTenant.primaryColor || '#00685f' }}
          >
            + Agendar Cita
          </button>
        </div>

        {/* Lista de Mascotas (Desde la DB) */}
        {tutorSession?.pets && tutorSession.pets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {tutorSession.pets.map((pet: any) => (
              <div key={pet.id} className="bg-surface-container-lowest border border-surface-container p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-2xl">
                  {pet.species === 'felino' ? '🐱' : pet.species === 'canino' ? '🐶' : '🐾'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{pet.name}</h3>
                  <p className="text-sm text-on-surface-variant capitalize">{pet.species} • {pet.breed}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low p-8 rounded-2xl text-center mb-10 border border-dashed border-surface-container">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">pets</span>
            <p className="text-on-surface-variant">No tienes mascotas registradas aún.</p>
          </div>
        )}

        {/* Lista de Citas (Desde la DB) */}
        <h2 className="text-xl font-bold font-display mb-4">Próximas Citas</h2>
        {myAppointments.length > 0 ? (
          <div className="space-y-3">
            {myAppointments.map(app => (
              <div key={app.id} className="bg-surface-container-lowest border border-surface-container p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{app.reason}</h4>
                  <p className="text-sm text-on-surface-variant">{app.date} a las {app.time} • Paciente: {app.patientName}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${app.badgeStyle}`}>
                  {app.statusLabel}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low p-6 rounded-2xl text-center border border-dashed border-surface-container">
            <p className="text-on-surface-variant">No tienes citas programadas.</p>
          </div>
        )}

      </main>

      {/* Modal de Agendamiento Sencillo */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-surface-container">
              <h3 className="text-xl font-bold">Solicitar Cita</h3>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Mascota</label>
                <select 
                  required
                  value={selectedPet} onChange={e => setSelectedPet(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent outline-none"
                >
                  <option value="">Selecciona tu mascota</option>
                  {tutorSession?.pets?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Servicio</label>
                <select 
                  required
                  value={selectedService} onChange={e => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent outline-none"
                >
                  <option value="">Selecciona un servicio</option>
                  {services.length > 0 ? (
                    services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>
                    ))
                  ) : (
                    <option value="general" disabled>No hay servicios disponibles en la clínica</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Fecha</label>
                  <input 
                    type="date" required
                    value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Hora</label>
                  <input 
                    type="time" required
                    value={selectedTime} onChange={e => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Motivo / Notas</label>
                <textarea 
                  value={consultReason} onChange={e => setConsultReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent outline-none resize-none h-20"
                  placeholder="Ej: Vacunación anual..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: currentTenant.primaryColor || '#00685f' }}
                  disabled={services.length === 0}
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Añadir Mascota */}
      {isAddPetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-surface-container">
              <h3 className="text-xl font-bold">Registrar Mascota</h3>
            </div>
            
            <form onSubmit={handleAddPetSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre</label>
                <input 
                  type="text" required
                  value={newPetName} onChange={e => setNewPetName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent outline-none"
                  placeholder="Ej: Max"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Especie</label>
                <select 
                  value={newPetSpecies} onChange={e => setNewPetSpecies(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent outline-none"
                >
                  <option value="canino">Perro (Canino)</option>
                  <option value="felino">Gato (Felino)</option>
                  <option value="exotico">Exótico / Otros</option>
                </select>
              </div>

              {addPetError && <p className="text-error text-sm">{addPetError}</p>}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" onClick={() => setIsAddPetModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-semibold bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: currentTenant.primaryColor || '#00685f' }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
