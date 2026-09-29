import React from 'react';
import './index.css';

function App() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--surface-container)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>
            M
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Manila<span style={{ color: 'var(--primary)' }}>SaaS</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Características</a>
          <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 500 }}>Precios</a>
          <a href="http://localhost:3000" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}>
            Iniciar Sesión
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', background: 'radial-gradient(circle at center top, var(--surface-alt), var(--surface))', overflow: 'hidden', position: 'relative' }}>
        <div className="container">
          <div className="fade-in-up">
            <span style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--accent-bg, rgba(16, 185, 129, 0.1))', color: 'var(--accent)', borderRadius: '9999px', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              🚀 La Nueva Era de la Gestión Veterinaria
            </span>
          </div>
          
          <h1 className="fade-in-up delay-100" style={{ fontSize: '4.5rem', color: 'var(--text-main)', letterSpacing: '-2px', marginBottom: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            El Sistema Operativo para <br />
            <span style={{ color: 'var(--primary)' }}>Clínicas Veterinarias</span>
          </h1>
          
          <p className="fade-in-up delay-200" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '1.5rem auto 3rem auto' }}>
            Automatiza expedientes, centraliza tus agendas y fideliza a tus clientes con un software rápido, seguro y fácil de usar.
          </p>
          
          <div className="fade-in-up delay-300" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="http://localhost:3000" className="btn-primary">
              Probar Demo Gratis
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
            <a href="#features" className="btn-secondary">
              Ver Características
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '5rem 0', backgroundColor: 'var(--surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Todo lo que necesitas en un solo lugar</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Diseñado por veterinarios, para veterinarios.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Feature 1 */}
            <div style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: 'var(--surface-container)', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Expediente Electrónico (EMR)</h3>
              <p style={{ color: 'var(--text-muted)' }}>Historial clínico detallado con soporte para múltiples pacientes, notas SOAP, y diagnósticos.</p>
            </div>
            
            {/* Feature 2 */}
            <div style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: 'var(--surface-container)', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Agenda Inteligente</h3>
              <p style={{ color: 'var(--text-muted)' }}>Calendario sincronizado con recordatorios automáticos por WhatsApp y correo para tus clientes.</p>
            </div>
            
            {/* Feature 3 */}
            <div style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: 'var(--surface-container)', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Portal del Tutor</h3>
              <p style={{ color: 'var(--text-muted)' }}>Tus clientes tendrán acceso exclusivo a la cartilla de vacunación y citas de sus mascotas desde su móvil.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0 2rem 0', backgroundColor: 'var(--text-main)', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>¿Listo para modernizar tu clínica?</h2>
          <a href="http://localhost:3000" className="btn-primary" style={{ marginBottom: '3rem' }}>Comenzar Ahora</a>
          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} Manila SaaS Factory. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
