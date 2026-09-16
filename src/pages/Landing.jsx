import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Search } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <section className="view-section active">
      <div className="hero">
        <div className="container">
          <h1>El talento y la experiencia<br/><span>no tienen edad</span></h1>
          <p>Conectamos la sabiduría y confiabilidad de profesionales senior con empresas que valoran la experiencia y buscan construir equipos intergeneracionales más fuertes.</p>
          <div className="flex" style={{ justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/trabajadores')}>
              Soy Adulto Mayor y busco empleo <ArrowRight />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/empresas')}>
              Soy Empresa y busco talento
            </button>
          </div>
        </div>
      </div>

      <div className="container section-padding">
        <h2 className="text-center" style={{ fontSize: 'var(--font-xxl)', marginBottom: '16px' }}>¿Cómo deseas comenzar hoy?</h2>
        <p className="text-center" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 48px' }}>Selecciona tu perfil para mostrarte las opciones de financiamiento, capacitaciones u ofertas laborales correspondientes a tu búsqueda.</p>
        
        <div className="profile-selector">
          <div className="profile-grid">
            <article className="profile-card">
              <div className="profile-img-container">
                <img src="/images/senior_empresa.png" alt="Profesional senior colaborando en oficina moderna" className="profile-img" loading="lazy" />
              </div>
              <div className="profile-body">
                <div>
                  <h3>Soy Empresa</h3>
                  <p>Quiero incorporar el compromiso, lealtad y madurez del talento senior a mi organización. Conozca los beneficios tributarios y agende una asesoría experta.</p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/empresas')} aria-label="Ingresar a sección para Empresas">
                  Incorporar Talento Senior <Briefcase />
                </button>
              </div>
            </article>

            <article className="profile-card">
              <div className="profile-img-container">
                <img src="/images/senior_empleo.png" alt="Mujer senior sonriente frente a computadora" className="profile-img" loading="lazy" />
              </div>
              <div className="profile-body">
                <div>
                  <h3>Busco Empleo</h3>
                  <p>Encuentra ofertas de trabajo flexibles diseñadas para tu estilo de vida. Accede a capacitaciones digitales gratuitas y coaching personalizado.</p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/trabajadores')} aria-label="Ingresar a sección para Adultos Mayores">
                  Encontrar mi Pega <Search />
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
