import React from 'react';
import { Globe, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h4>ExperienciaSenior</h4>
          <p>Promovemos la inclusión laboral senior y el traspaso de conocimientos intergeneracionales en las organizaciones del futuro.</p>
          <div className="flex" style={{ gap: '16px' }}>
            <a href="#" aria-label="Web" style={{ fontSize: '1.4rem', color: 'var(--primary-soft)' }}><Globe /></a>
            <a href="#" aria-label="Comunidad" style={{ fontSize: '1.4rem', color: 'var(--primary-soft)' }}><Users /></a>
            <a href="#" aria-label="Contacto" style={{ fontSize: '1.4rem', color: 'var(--primary-soft)' }}><MessageSquare /></a>
          </div>
        </div>
        <div className="footer-links">
          <h5>Para Candidatos</h5>
          <ul>
            <li><Link to="/trabajadores">Buscador de Empleo</Link></li>
            <li><Link to="/trabajadores">Talleres de Capacitación</Link></li>
            <li><Link to="/trabajadores">Coaching y Mentoría</Link></li>
          </ul>
        </div>
        <div className="footer-links">
          <h5>Para Empresas</h5>
          <ul>
            <li><Link to="/empresas">Beneficios Senior</Link></li>
            <li><Link to="/empresas">Marco de Adaptabilidad</Link></li>
            <li><Link to="/empresas">Agendar Videollamada</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>&copy; 2026 ExperienciaSenior. Desarrollado con accesibilidad universal (WCAG AA).</p>
        <p>Teléfono de ayuda gratuita: <strong>800 400 300</strong></p>
      </div>
    </footer>
  );
}
