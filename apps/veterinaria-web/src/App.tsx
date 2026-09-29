import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { TenantProvider, useTenant } from '@repo/ui/context/TenantContext';
import { Header } from '@repo/ui/components/layout/Header';
import { Sidebar } from '@repo/ui/components/layout/Sidebar';
import { Navigation } from '@repo/ui/components/layout/Navigation';
import { ClinicalDrawer } from '@repo/ui/components/layout/ClinicalDrawer';
import { DashboardView } from '@repo/ui/components/dashboard/DashboardView';
import { ClientsDirectoryView } from '@repo/ui/components/clients/ClientsDirectoryView';
import { AgendaView } from '@repo/ui/components/agenda/AgendaView';
import { CatalogView } from '@repo/ui/components/catalog/CatalogView';
import { ClinicalRecordView } from '@repo/ui/components/clinical-record/ClinicalRecordView';
import { TutorPortalView } from '@repo/ui/components/portal/TutorPortalView';
import { SettingsView } from '@repo/ui/components/settings/SettingsView';
import { NewAppointmentModal } from '@repo/ui/components/agenda/NewAppointmentModal';
import { Toast } from '@repo/ui/components/common/Toast';
import { LoginView } from '@repo/ui/components/auth/LoginView';

const ClinicalApp: React.FC = () => {
  const { activeTab, userRole, isAuthenticated, isLoadingAuth, login } = useTenant();
  const [authError, setAuthError] = useState('');

  const handleLogin = async (email: string, pass: string) => {
    setAuthError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const result = await response.json();
      if (result.success) {
        await login(result.data.user);
      } else {
        setAuthError(result.error || 'Credenciales inválidas');
      }
    } catch {
      setAuthError('Error de conexión al servidor');
    }
  };

  const isClinical = userRole === 'clinical_staff' || userRole === 'admin';

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-on-surface-variant font-medium">Verificando sesión segura...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} error={authError} />;
  }

  return (
    <div className="flex min-h-screen bg-surface font-sans text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* 1. Desktop Persistent Sidebar */}
      {isClinical && (
        <Sidebar className="hidden lg:flex fixed top-0 bottom-0 left-0 w-64 xl:w-72 z-40" />
      )}

      {/* 2. Main Content Wrapper */}
      <div className={`flex flex-col flex-1 min-w-0 transition-all ${isClinical ? 'lg:pl-64 xl:pl-72' : ''}`}>
        {isClinical && <Header />}

        <main className={`flex-1 w-full bg-surface ${isClinical ? 'pt-16' : ''}`}>
          {activeTab === 'inicio' && <DashboardView />}
          {activeTab === 'pacientes' && <ClientsDirectoryView />}
          {activeTab === 'agenda' && <AgendaView />}
          {activeTab === 'servicios' && <CatalogView />}
          {activeTab === 'portal' && <TutorPortalView isStaffPreview={true} />}
          {activeTab === 'expediente' && <ClinicalRecordView />}
          {activeTab === 'ajustes' && <SettingsView />}
        </main>
      </div>

      <ClinicalDrawer />

      {/* Bottom Navigation */}
      {isClinical ? (
        <div className="lg:hidden">
          <Navigation />
        </div>
      ) : (
        <Navigation />
      )}

      <NewAppointmentModal />
      <Toast />
    </div>
  );
};

const PublicTutorApp: React.FC = () => {
  const { slug } = useParams();
  const { setUserRole } = useTenant();
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Configuramos al usuario como 'tutor_portal' para evitar que se carguen vistas clínicas
    setUserRole('tutor_portal');
    
    // Resolvemos el slug con el backend
    fetch(`/api/tenants/${slug}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setTenantInfo(result.data);
          // Opcionalmente: setTenantId(result.data.id) para configurar el contexto global
        } else {
          setError(result.error || 'Clínica no encontrada');
        }
      })
      .catch(() => setError('Error conectando al servidor'));
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-error mb-2">error</span>
          <h1 className="text-xl font-bold text-on-surface">{error}</h1>
          <p className="text-on-surface-variant mt-2">Verifica la URL proporcionada por tu clínica.</p>
        </div>
      </div>
    );
  }

  if (!tenantInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface font-sans text-on-surface antialiased">
      {/* Pasamos los datos resueltos al componente principal */}
      <TutorPortalView isStaffPreview={false} />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <TenantProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública del Tutor con Slug */}
          <Route path="/p/:slug" element={<PublicTutorApp />} />
          
          {/* Dashboard y App Clínica interna (Cualquier otra ruta) */}
          <Route path="/*" element={<ClinicalApp />} />
        </Routes>
      </BrowserRouter>
    </TenantProvider>
  );
}
