import React, { useState } from 'react';
import { VetLogo } from '../common/VetLogo';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  error?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <VetLogo size={64} className="h-16 w-16 mb-6" />
        <h2 className="text-center text-3xl font-extrabold text-on-surface font-display">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-on-surface-variant">
          Accede a tu EMR Clínico Seguro
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container-lowest py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-surface-container/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Correo Electrónico</label>
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-outline-variant rounded-lg shadow-sm placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-surface text-on-surface transition-all"
                  placeholder="admin@manila.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">Contraseña</label>
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3.5 py-2.5 border border-outline-variant rounded-lg shadow-sm placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm bg-surface text-on-surface transition-all"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-error text-sm font-medium bg-error-container/50 p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? 'Verificando...' : 'Entrar al EMR'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
