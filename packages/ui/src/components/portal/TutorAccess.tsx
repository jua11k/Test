import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { ClientRecord } from '../../types';

interface TutorAccessProps {
  onAccessGranted: (client: ClientRecord) => void;
}

export const TutorAccess: React.FC<TutorAccessProps> = ({ onAccessGranted }) => {
  const { currentTenant, clients, addClient } = useTenant();
  
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginDni, setLoginDni] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDni, setRegDni] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPetName, setRegPetName] = useState('');
  const [regPetSpecies, setRegPetSpecies] = useState('canino');
  
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, dni: loginDni, slug: currentTenant?.slug || 'manila-clinic' })
      });
      const result = await response.json();
      
      if (result.success) {
        onAccessGranted(result.data);
      } else {
        setError(result.error || 'Credenciales inválidas.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/portal/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: regName, 
          email: regEmail, 
          dni: regDni, 
          phone: regPhone, 
          petName: regPetName,
          petSpecies: regPetSpecies,
          slug: currentTenant?.slug || 'manila-clinic'
        })
      });
      const result = await response.json();
      
      if (result.success) {
        onAccessGranted(result.data);
      } else {
        setError(result.error || 'No se pudo crear la cuenta.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest border border-surface-container rounded-2xl shadow-sm p-6 sm:p-8">
        
        {/* Cabecera dinámica de la veterinaria */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full mb-3 flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: currentTenant?.primaryColor || '#00685f' }}>
            {currentTenant?.name?.charAt(0) || 'V'}
          </div>
          <h1 className="text-2xl font-display font-bold text-on-surface">
            Portal del Tutor
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {currentTenant?.name || 'Veterinaria'}
          </p>
        </div>

        {view === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Correo Electrónico</label>
              <input 
                type="email" required
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">DNI o Documento</label>
              <input 
                type="text" required
                value={loginDni} onChange={e => setLoginDni(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
                placeholder="12345678"
              />
            </div>
            
            {error && <p className="text-error text-sm mt-1 bg-error-container/50 p-2 rounded-lg">{error}</p>}
            
            <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white mt-2 transition-all active:scale-95" style={{ backgroundColor: currentTenant?.primaryColor || '#00685f' }}>
              Ingresar a mi Portal
            </button>
            
            <div className="text-center mt-4">
              <span className="text-on-surface-variant text-sm">¿Eres nuevo aquí? </span>
              <button type="button" onClick={() => { setView('register'); setError(''); }} className="text-primary font-semibold text-sm hover:underline">
                Regístrate
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Nombre Completo</label>
              <input 
                type="text" required
                value={regName} onChange={e => setRegName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-surface-container-low focus:border-primary outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">DNI</label>
                <input 
                  type="text" required
                  value={regDni} onChange={e => setRegDni(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-surface-container-low focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">Teléfono</label>
                <input 
                  type="tel" required
                  value={regPhone} onChange={e => setRegPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-surface-container-low focus:border-primary outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Correo Electrónico</label>
              <input 
                type="email" required
                value={regEmail} onChange={e => setRegEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-surface-container-low focus:border-primary outline-none"
              />
            </div>
            <div className="border-t border-surface-container pt-4 mt-2">
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Nombre de tu Mascota (Opcional)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={regPetName} onChange={e => setRegPetName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-surface-container-low focus:border-primary outline-none"
                  placeholder="Ej: Firulais"
                />
                <select 
                  value={regPetSpecies} onChange={e => setRegPetSpecies(e.target.value)}
                  className="w-32 px-2 py-2 rounded-xl bg-surface-container-low focus:border-primary outline-none"
                >
                  <option value="canino">Perro</option>
                  <option value="felino">Gato</option>
                  <option value="exotico">Exótico</option>
                </select>
              </div>
            </div>

            {error && <p className="text-error text-sm mt-1">{error}</p>}

            <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white mt-2 transition-all active:scale-95" style={{ backgroundColor: currentTenant?.primaryColor || '#00685f' }}>
              Crear Cuenta y Entrar
            </button>

            <div className="text-center mt-2">
              <button type="button" onClick={() => { setView('login'); setError(''); }} className="text-on-surface-variant text-sm hover:underline">
                Volver al Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
