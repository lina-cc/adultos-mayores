import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Smile, ChevronDown, Send, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { auth, db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export default function Empresas() {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const navigate = useNavigate();

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleDaySelect = (day) => {
    const isPast = day < 5;
    const isWeekend = day % 7 === 4 || day % 7 === 5;
    if (!isPast && !isWeekend) {
      setSelectedDay(day);
    }
  };

  const renderCalendarDays = () => {
    const daysContainer = [];
    const dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    
    // Nombres de los días
    dayNames.forEach(name => {
      daysContainer.push(<div key={`name-${name}`} className="calendar-day-name">{name}</div>);
    });

    // Espacios vacíos por comienzo de mes (Miércoles = 2 días vacíos)
    for (let i = 0; i < 2; i++) {
      daysContainer.push(<div key={`empty-${i}`}></div>);
    }

    // Días del 1 al 31 (Julio 2026)
    for (let day = 1; day <= 31; day++) {
      const isPast = day < 5;
      const isWeekend = (day % 7 === 4 || day % 7 === 5);
      const isInactive = isPast || isWeekend;
      const isSelected = selectedDay === day;

      daysContainer.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isInactive ? 'inactive' : 'active'} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDaySelect(day)}
        >
          {day}
        </div>
      );
    }
    return daysContainer;
  };

  const handleBooking = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Por favor, inicia sesión con tu cuenta de Empresa para agendar una reunión.");
      navigate('/auth');
      return;
    }

    try {
      await addDoc(collection(db, 'reuniones'), {
        userId: user.uid,
        date: `2026-07-${selectedDay < 10 ? '0'+selectedDay : selectedDay}`,
        time: selectedTime,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert(`Hemos agendado su solicitud para el día ${selectedDay} de Julio del 2026 a las ${selectedTime}. Nos pondremos en contacto pronto.`);
      setSelectedDay(null);
      setSelectedTime(null);
    } catch (error) {
      console.error("Error booking: ", error);
      alert("Hubo un error al agendar la reunión.");
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert("Solicitud recibida. Un consultor se contactará a la brevedad.");
    e.target.reset();
  };

  return (
    <section className="view-section active">
      <div className="companies-hero">
        <div className="container">
          <h1>Potencie su empresa con Talento Senior</h1>
          <p>La experiencia no solo resuelve problemas más rápido, también aporta estabilidad, mentoría natural y cohesión a los equipos de trabajo modernos.</p>
        </div>
      </div>

      {/* Sección 1: Propuesta de Valor */}
      <section className="container section-padding">
        <h2 className="text-center" style={{ fontSize: 'var(--font-xxl)', marginBottom: '12px' }}>¿Por qué contratar profesionales mayores de 50 años?</h2>
        <p className="text-center" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 48px' }}>Integrar personas mayores enriquece la cultura corporativa y aumenta los niveles de efectividad organizacional.</p>
        
        <div className="value-grid grid">
          <div className="value-card">
            <div className="icon-wrapper">
              <ShieldCheck />
            </div>
            <h3>Lealtad y Compromiso</h3>
            <p>Los trabajadores senior registran menores tasas de ausentismo y una permanencia promedio un 40% mayor. Aportan estabilidad y constancia al equipo laboral.</p>
          </div>

          <div className="value-card">
            <div className="icon-wrapper">
              <Users />
            </div>
            <h3>Mentoría Intergeneracional</h3>
            <p>Facilitan la transferencia de conocimientos prácticos y actúan como guías naturales para las generaciones jóvenes, reduciendo los tiempos de capacitación.</p>
          </div>

          <div className="value-card">
            <div className="icon-wrapper">
              <Smile />
            </div>
            <h3>Clima Laboral Positivo</h3>
            <p>Poseen alta resiliencia y madurez para resolver conflictos interpersonales. Su presencia suaviza el ambiente de oficina e incrementa el bienestar general.</p>
          </div>
        </div>
      </section>

      {/* Sección 2: Marco Legal, Deberes y Responsabilidades */}
      <section className="section-padding" style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h2 className="text-center" style={{ fontSize: 'var(--font-xxl)', marginBottom: '12px' }}>Marco Legal y Adaptabilidad</h2>
          <p className="text-center" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 48px' }}>Todo lo que su departamento de Recursos Humanos necesita saber sobre contrataciones inclusivas.</p>
          
          <div className="legal-accordion" role="presentation">
            {/* Item 1 */}
            <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`}>
              <button className="accordion-header" onClick={() => toggleAccordion(1)} aria-expanded={activeAccordion === 1}>
                <span>Beneficios tributarios y subsidios por contratación senior</span>
                <ChevronDown className="accordion-icon" />
              </button>
              <div className="accordion-content" style={{ maxHeight: activeAccordion === 1 ? '500px' : '0' }}>
                <div className="accordion-body">
                  <p>Existen incentivos gubernamentales diseñados para fomentar la empleabilidad senior:</p>
                  <ul>
                    <li><strong>Subsidio al Empleo Adulto Mayor:</strong> Bonificación mensual equivalente a un porcentaje del sueldo imponible durante el primer año.</li>
                    <li><strong>Franquicia Tributaria SENCE:</strong> Deducción de impuestos por gastos asociados a la capacitación digital y técnica de trabajadores de más de 55 años.</li>
                    <li><strong>Puntaje adicional en licitaciones:</strong> Enfoque de equidad de edad certificado en el registro de proveedores del Estado.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className={`accordion-item ${activeAccordion === 2 ? 'active' : ''}`}>
              <button className="accordion-header" onClick={() => toggleAccordion(2)} aria-expanded={activeAccordion === 2}>
                <span>Tipos de contratos recomendados (jornadas parciales y flexibilidad)</span>
                <ChevronDown className="accordion-icon" />
              </button>
              <div className="accordion-content" style={{ maxHeight: activeAccordion === 2 ? '500px' : '0' }}>
                <div className="accordion-body">
                  <p>La flexibilidad horaria es clave para el éxito de la contratación de adultos mayores:</p>
                  <ul>
                    <li><strong>Contratos de Jornada Parcial (Part-time):</strong> Permitidos por la ley laboral común, ideales para compatibilizar jubilaciones con ingresos activos adicionales sin perder beneficios previsionales.</li>
                    <li><strong>Teletrabajo y Trabajo Híbrido:</strong> Contratos con cláusula de adaptabilidad geográfica, ideales para seniors con dificultades de movilidad.</li>
                    <li><strong>Asesoría Técnica y Consultoría Externa:</strong> Contratos por proyectos u honorarios específicos, ideales para traspasar conocimientos especializados de alto nivel.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className={`accordion-item ${activeAccordion === 3 ? 'active' : ''}`}>
              <button className="accordion-header" onClick={() => toggleAccordion(3)} aria-expanded={activeAccordion === 3}>
                <span>Responsabilidades de adaptabilidad y ergonomía en el puesto de trabajo</span>
                <ChevronDown className="accordion-icon" />
              </button>
              <div className="accordion-content" style={{ maxHeight: activeAccordion === 3 ? '500px' : '0' }}>
                <div className="accordion-body">
                  <p>Las organizaciones deben asegurar entornos accesibles y seguros:</p>
                  <ul>
                    <li><strong>Puestos de trabajo ergonómicos:</strong> Sillas ajustables, pantallas grandes con filtros antirreflejo y mouse anatómico.</li>
                    <li><strong>Accesibilidad Física:</strong> Entradas y pasillos libres de obstáculos, rampas de acceso e iluminación uniforme en el espacio laboral.</li>
                    <li><strong>Descansos activos y flexibilidad:</strong> Programación de micro-pausas saludables obligatorias para prevenir dolores musculares o fatiga visual.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Conversión (Agendamiento y Contacto) */}
      <section className="container section-padding">
        <h2 className="text-center" style={{ fontSize: 'var(--font-xxl)', marginBottom: '12px' }}>Comience la transformación intergeneracional</h2>
        <p className="text-center" style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 48px' }}>Complete el formulario para que un consultor se contacte con usted, o agende una videollamada de asesoría directamente en nuestro calendario interactivo.</p>
        
        <div className="conversion-split">
          {/* Formulario de Contacto */}
          <div className="contact-card">
            <h3>Solicitar Información</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="company-name" className="form-label">Nombre de la Empresa *</label>
                <input type="text" id="company-name" className="form-control" placeholder="Ej: Innovaciones Ltda" required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="company-email" className="form-label">Correo Electrónico Corporativo *</label>
                <input type="email" id="company-email" className="form-control" placeholder="Ej: contacto@empresa.com" required />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="company-phone" className="form-label">Teléfono de Contacto</label>
                <input type="tel" id="company-phone" className="form-control" placeholder="Ej: +56 9 1234 5678" />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="company-message" className="form-label">¿En qué podemos ayudarle? *</label>
                <textarea id="company-message" className="form-control" placeholder="Escriba su consulta o el perfil de talento que requiere contratar..." required></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Enviar Consulta <Send size={20} />
              </button>
            </form>
          </div>

          {/* Bloque Calendly Simulado */}
          <div className="calendar-card">
            <h3>Agendar Reunión Online</h3>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: '-8px' }}>Agenda una sesión de 20 minutos por Zoom o Meet con un consultor experto en inclusión senior.</p>
            
            <div className="calendar-widget">
              <div className="calendar-header">
                <button aria-label="Mes anterior" style={{ color: '#fff' }}><ChevronLeft /></button>
                <span>Julio 2026</span>
                <button aria-label="Mes siguiente" style={{ color: '#fff' }}><ChevronRight /></button>
              </div>
              <div className="calendar-grid">
                {renderCalendarDays()}
              </div>
              
              <div style={{ padding: '12px 16px 0', borderTop: '1px solid var(--border)' }}>
                <span className="a11y-label">Selecciona una hora disponible:</span>
              </div>
              <div className="time-slots">
                {['09:00', '11:30', '15:00'].map(time => (
                  <button 
                    key={time} 
                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time === '15:00' ? '03:00 PM' : `${time} AM`}
                  </button>
                ))}
              </div>
            </div>
            
            <button 
              className="btn btn-outline-accent btn-lg" 
              disabled={!(selectedDay && selectedTime)}
              onClick={handleBooking}
            >
              Confirmar Reunión <Calendar size={20} />
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
