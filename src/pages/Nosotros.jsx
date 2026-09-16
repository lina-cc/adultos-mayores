import React from 'react';

export default function Nosotros() {
  return (
    <section className="view-section active">
      <div className="container section-padding">
        <h1 className="text-center" style={{ fontSize: 'var(--font-hero)', marginBottom: '24px' }}>Sobre Nosotros</h1>
        <p className="text-center" style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 48px', fontSize: 'var(--font-lg)' }}>
          Somos una corporación sin fines de lucro que cree en el valor de la madurez y la experiencia laboral. Nuestra misión es acortar la brecha de edad en los equipos de trabajo modernos, brindando herramientas de capacitación digital a adultos mayores y guiando a las empresas en procesos de reclutamiento inclusivos y ergonómicos.
        </p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          <div className="value-card">
            <h3>Nuestra Visión</h3>
            <p>Un mercado laboral donde la edad biológica sea secundaria a la capacidad técnica, la confiabilidad y el valor humano de las personas.</p>
          </div>
          <div className="value-card">
            <h3>Nuestro Compromiso</h3>
            <p>Garantizar que toda oferta en nuestra plataforma cumpla estrictos criterios de trato ético, accesibilidad y condiciones seguras.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
