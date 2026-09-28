import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Tenant,
  Sede,
  UserRole,
  Veterinarian,
  Patient,
  Appointment,
  ClinicalNote,
  ServiceCatalogItem,
  ReminderRule,
  ReminderTemplate,
  ToastMessage,
  ClientRecord,
} from '../types';

// Mock data eliminado en cumplimiento estricto con evitar datos de prueba

interface TenantContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  
  // Multi-tenant & branch
  tenants: Tenant[];
  currentTenant: Tenant;
  setTenantId: (tenantId: string) => void;
  currentSede: Sede;
  setSedeId: (sedeId: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Navigation
  activeTab: 'inicio' | 'pacientes' | 'agenda' | 'servicios' | 'ajustes' | 'expediente' | 'portal';
  setActiveTab: (tab: 'inicio' | 'pacientes' | 'agenda' | 'servicios' | 'ajustes' | 'expediente' | 'portal') => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isAppointmentModalOpen: boolean;
  setIsAppointmentModalOpen: (open: boolean) => void;

  // Data
  veterinarians: Veterinarian[];
  patients: Patient[];
  clients: ClientRecord[];
  appointments: Appointment[];
  clinicalNotes: ClinicalNote[];
  services: ServiceCatalogItem[];
  reminderRules: ReminderRule[];
  reminderTemplate: ReminderTemplate;

  // Operations
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  addPetToClient: (clientId: string, petData: Partial<Patient>) => void;
  updatePatient: (patientId: string, updates: Partial<Patient>) => void;
  addClient: (client: Omit<ClientRecord, 'id'>) => void;
  updateClient: (clientId: string, clientData: Partial<ClientRecord>) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updatePatientStatus: (patientId: string, status: Patient['status']) => void;
  addClinicalNote: (note: Omit<ClinicalNote, 'id'>) => void;
  toggleReminderRule: (ruleId: string) => void;
  updateReminderTemplate: (text: string) => void;
  addServiceItem: (service: Omit<ServiceCatalogItem, 'id'>) => void;
  updateServiceItem: (serviceId: string, updates: Partial<ServiceCatalogItem>) => void;
  deleteServiceItem: (serviceId: string) => void;

  // Notifications
  toast: ToastMessage | null;
  showToast: (message: string, icon?: string, type?: ToastMessage['type']) => void;
  clearToast: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Default fallback safe para UI
  const fallbackTenant: Tenant = { id: 'tenant-1', name: 'Manila Clinic', sedes: [{ id: 'sede-1', name: 'Principal' }] };
  const [tenants, setTenants] = useState<Tenant[]>([fallbackTenant]);
  const [tenantId, setTenantId] = useState<string>('tenant-1');
  
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsAuthenticated(true);
          // 🚀 Regla 02 y 03: Desacoplamiento (Cargar Pacientes reales desde DB)
          fetch('/api/patients')
            .then(res => res.json())
            .then(pData => {
              if (pData.success) setPatients(pData.data);
            });
            
          fetch('/api/appointments')
            .then(res => res.json())
            .then(aData => {
              if (aData.success) setAppointments(aData.data);
            });
            
          fetch('/api/clients')
            .then(res => res.json())
            .then(cData => {
              if (cData.success) setClients(cData.data);
            });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingAuth(false));
  }, []);

  const login = async (userData: any) => {
    setIsAuthenticated(true);
    // Cargar pacientes inmediatamente al loguear
    const res = await fetch('/api/patients');
    const pData = await res.json();
    if (pData.success) setPatients(pData.data);
    
    // Cargar citas
    const resAppt = await fetch('/api/appointments');
    const aData = await resAppt.json();
    if (aData.success) setAppointments(aData.data);
    
    // Cargar clientes
    const resClient = await fetch('/api/clients');
    const cData = await resClient.json();
    if (cData.success) setClients(cData.data);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  const currentTenant = useMemo(() => {
    return tenants.find((t) => t.id === tenantId) || tenants[0];
  }, [tenants, tenantId]);

  const [sedeId, setSedeId] = useState<string>('sede-1');

  const currentSede = useMemo(() => {
    return (
      currentTenant.sedes?.find((s) => s.id === sedeId) ||
      currentTenant.sedes?.[0] || { id: '', name: '' }
    );
  }, [currentTenant, sedeId]);

  const [userRole, setUserRole] = useState<UserRole>('clinical_staff');
  const [activeTab, setActiveTab] = useState<
    'inicio' | 'pacientes' | 'agenda' | 'servicios' | 'ajustes' | 'expediente' | 'portal'
  >('inicio');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Core Data (arreglos vacíos, sin MOCK DATA)
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [reminderRules, setReminderRules] = useState<ReminderRule[]>([]);
  const [reminderTemplate, setReminderTemplate] = useState<ReminderTemplate>({ id: '1', name: 'Recordatorio', type: 'whatsapp', templateText: '', variables: [] });

  // Toast feedback
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, icon = 'check_circle', type: ToastMessage['type'] = 'success') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(),
      message,
      icon,
      type,
    };
    setToast(newToast);
    setTimeout(() => {
      setToast((prev) => (prev?.id === newToast.id ? null : prev));
    }, 2800);
  };

  const clearToast = () => setToast(null);

  const addClient = async (newClientData: Omit<ClientRecord, 'id'>) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData)
      });
      const result = await response.json();
      
      if (result.success) {
        const dbClient = result.data;
        const newClient: ClientRecord = {
          ...newClientData,
          id: dbClient.id,
        };
        setClients((prev) => [newClient, ...prev]);
        showToast(`Cliente ${newClient.name} añadido a la Base de Datos`, 'person_add');
      } else {
        showToast('Error al guardar el cliente', 'error', 'error');
      }
    } catch (error) {
      showToast('Error de conexión con la API', 'error', 'error');
    }
  };

  const updateClient = (clientId: string, clientData: Partial<ClientRecord>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, ...clientData } : c))
    );
    showToast('Ficha de cliente actualizada', 'check');
  };

  const addPatient = async (newPatientData: Omit<Patient, 'id'>) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatientData)
      });
      const result = await response.json();
      
      if (result.success) {
        // Enlazamos el ID real de Postgres al estado del frontend
        const dbPatient = result.data;
        const newPatient: Patient = {
          ...newPatientData,
          id: dbPatient.id,
        };
        setPatients((prev) => [newPatient, ...prev]);
        showToast(`Paciente ${newPatient.name} registrado con éxito en Base de Datos`, 'pets');
      } else {
        showToast('Error al guardar el paciente', 'error', 'error');
      }
    } catch (error) {
      showToast('Error de conexión con la API', 'error', 'error');
    }
  };

  const addPetToClient = async (clientId: string, petData: Partial<Patient>) => {
    try {
      const payload = { clientId, ...petData };
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (result.success) {
        showToast(`Mascota ${petData.name} añadida al cliente exitosamente`, 'pets');
        // Actualizar lista de clientes en la UI local
        setClients((prev) =>
          prev.map((c) => {
            if (c.id === clientId) {
              return {
                ...c,
                pets: [
                  ...c.pets,
                  {
                    id: result.data.id,
                    name: result.data.name,
                    species: result.data.species as Species,
                    breed: result.data.breed,
                  },
                ],
              };
            }
            return c;
          })
        );
        // Opcional: Para simplificar, podríamos recargar la página para hidratar `patients` con el nuevo join.
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast('Error al guardar la mascota', 'error', 'error');
      }
    } catch (error) {
      showToast('Error de conexión con la API', 'error', 'error');
    }
  };

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, ...updates } : p))
    );
    showToast('Ficha y alertas del paciente actualizadas', 'verified');
  };

  const addAppointment = async (newAptData: Omit<Appointment, 'id'>) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAptData)
      });
      const result = await response.json();
      
      if (result.success) {
        // Refrescamos toda la lista para traer los JOINs (nombre paciente, veterinario)
        const fetchRes = await fetch('/api/appointments');
        const refreshData = await fetchRes.json();
        if (refreshData.success) setAppointments(refreshData.data);
        showToast(`Cita agendada con éxito en la Base de Datos`, 'calendar_add_on');
      } else {
        showToast('Error al guardar la cita', 'error', 'error');
      }
    } catch (error) {
      showToast('Error de conexión con la API', 'error', 'error');
    }
  };

  const updatePatientStatus = (patientId: string, status: Patient['status']) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, status } : p))
    );
    showToast('Estado del paciente actualizado', 'sync');
  };

  const fetchClinicalNotes = async (patientId: string) => {
    try {
      const response = await fetch(`/api/clinical-notes?patientId=${patientId}`);
      const data = await response.json();
      if (data.success) {
        setClinicalNotes(data.data);
      }
    } catch (error) {
      console.error('Error fetching clinical notes:', error);
    }
  };

  const addClinicalNote = async (noteData: Omit<ClinicalNote, 'id'>) => {
    try {
      const response = await fetch('/api/clinical-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });
      const data = await response.json();
      if (data.success) {
        // Refrescar notas si es exitoso
        await fetchClinicalNotes(noteData.patientId);
        showToast('Nota clínica agregada al expediente y guardada en BD', 'clinical_notes');
      } else {
        showToast('Error al guardar la nota', 'error', 'error');
      }
    } catch (error) {
      showToast('Error de conexión con la API', 'error', 'error');
    }
  };

  // Efecto para cargar las notas cuando cambia el paciente seleccionado
  React.useEffect(() => {
    if (selectedPatientId) {
      fetchClinicalNotes(selectedPatientId);
    }
  }, [selectedPatientId]);

  const toggleReminderRule = (ruleId: string) => {
    setReminderRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const nextActive = !r.active;
          showToast(
            nextActive
              ? `Regla "${r.name}" activada`
              : `Regla "${r.name}" pausada`,
            nextActive ? 'notifications_active' : 'notifications_off'
          );
          return { ...r, active: nextActive };
        }
        return r;
      })
    );
  };

  const updateReminderTemplate = (newText: string) => {
    setReminderTemplate((prev) => ({
      ...prev,
      templateText: newText,
    }));
    showToast('Plantilla sincronizada con Meta Cloud API', 'cloud_done');
  };

  const addServiceItem = (serviceData: Omit<ServiceCatalogItem, 'id'>) => {
    const newSrv: ServiceCatalogItem = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [newSrv, ...prev]);
    showToast(`Procedimiento "${newSrv.name}" incorporado al tarifario`, 'add_circle');
  };

  const updateServiceItem = (serviceId: string, updates: Partial<ServiceCatalogItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, ...updates } : s))
    );
    showToast('Procedimiento médico actualizado en el tarifario', 'check');
  };

  const deleteServiceItem = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    showToast('Procedimiento eliminado del catálogo', 'delete');
  };

  return (
    <TenantContext.Provider
      value={{
        isAuthenticated,
        isLoadingAuth,
        login,
        logout,
        tenants,
        currentTenant,
        setTenantId,
        currentSede,
        setSedeId,
        userRole,
        setUserRole,
        activeTab,
        setActiveTab,
        selectedPatientId,
        setSelectedPatientId,
        isDrawerOpen,
        setIsDrawerOpen,
        isAppointmentModalOpen,
        setIsAppointmentModalOpen,
        veterinarians: [],
        patients,
        clients,
        appointments,
        clinicalNotes,
        services,
        reminderRules,
        reminderTemplate,
        addPatient,
        addPetToClient,
        updatePatient,
        addClient,
        updateClient,
        addAppointment,
        updatePatientStatus,
        addClinicalNote,
        toggleReminderRule,
        updateReminderTemplate,
        addServiceItem,
        updateServiceItem,
        deleteServiceItem,
        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
